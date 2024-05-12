import { ICampaign } from 'src/components/models';
import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
const llmOptionsHot = { baseUrl: 'http://localhost:11434', model: 'wizardlm2:7b', temperature: 0.79 }
const llmOptionsCold = { baseUrl: 'http://localhost:11434', model: 'wizardlm2:7b', temperature: 0 }
const model = new ChatOllama(llmOptionsHot)
const summaryModel = new ChatOllama(llmOptionsCold)

const setting = 'The Forge is a globular cluster orbiting the people’s home galaxy, situated 1,700 light years above the galactic plane. It’s a chaotic and perilous environment filled with interstellar nebulae, vibrant dust clouds, and unstable energies. Two centuries ago, the people fled here from a cataclysm in their original home, finding both opportunities and dangers in this new world. The Forge is a place of ancient relics holding forbidden powers, where settlements are established on new planets but rarely offer true safety. The galaxy is divided into four regions: the settled Terminus with competing factions and charted space paths; the Outlands, a more recent exploration frontier with scarce settlements and uncharted navigation routes; the Expanse, home to isolated pioneer outposts; and finally, the Void, where only a few stars exist amidst vast emptinesses, beyond which travel is nearly impossible. This setting is rich with adventure, conflict, and the unknown.'

export const generateFactionNotes = async (
  currentCampaign: ICampaign,
  currentFactionData: {[key: string]: string | undefined},
  onStreamItem: (item: string) => void) => {
  console.log(currentCampaign)
  console.log(currentFactionData)
  let currentInfo = ''
  Object.keys(currentFactionData).forEach(key => {
    if (key === 'notes') return // recursive
    const value = currentFactionData[key]
    if (value) {
      currentInfo += `${key}: ${value}\n`
    }
  })

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are a sci-fi pulp fiction writer.'],
    ['user', 'the setting: {setting}'],
    ['user', 'Describe a faction in the universe. Generate a leader, the organization style, what motivates them.Generate a leader, the organization style, what motivates them. Here are some touchstones to guide what the faction is: {currentInfo}'],
  ]);
  const parser = new StringOutputParser();
  const chain = prompt.pipe(model).pipe(parser);
  const stream = await chain.stream({
    currentInfo, setting
 });
  for await (const chunk of stream) {
    onStreamItem(chunk)
  }
}

const truthPrompts : {[key: string]: string | undefined} = {
  'cataclysm': 'what cataclysm caused the exodus to the Forge?',
  'exodus': 'the exodus - how did the survivors of the cataclysm arrive at the Forge?',
  'communities': 'communities - what sizes of communities are there? what are some limiting factors to the size? are they diverse or homogenous?',
  'iron': 'how iron in used in rituals to swear vows. What for does the iron take? is it a simple jewellery item or a complex artifact?',
  'laws': 'how laws are enforced in the Forge? is it lawless or heavily governed? is it democratic or authoritarian? are there any laws that are unique to the Forge?',
  'religion': 'religion - how the facets of the religion are practiced in the Forge? are there any unique rituals or ceremonies? what are the beliefs of the people?',
  'magic': 'magic - does magic exist? who and what has access to it? is it rare or abundant?',
  'communication_and_data': 'communication and data - how do people communicate in the Forge? is it instantaneous or delayed? is it secure or easily intercepted?',
  'medicine': 'medicine - how is medicine practiced in the Forge? are there any unique treatments or cures? is it advanced or primitive?',
  'artificial_intelligence': 'ai - is it abandoned or active in the Forge? what are the roles of ai in the society?',
  'war': 'war - how is war fought in the Forge? are there any unique weapons or tactics? are there any rules of engagement?',
  'lifeforms': 'lifeforms - what are the lifeforms in the Forge? are they unique or similar to other galaxies?',
  'precursors': 'precursors - are there any precursors in the Forge? what are their relics and how are they used?',
  'horrors': 'horrors - are there any horrors in the Forge? what are they and how are they dealt with?',
}


export const generateTruth = async (
  currentCampaign: ICampaign,
  truth: string | undefined,
  examples: (string | number) [],
  notePrompt: string | undefined,
  onStreamItem: (item: string) => void) => {

  if (!truth) truth = ''
  const truthKey = truth.split('/').pop() || ''
  console.log(truthKey)
  const truthPrompt = truthPrompts[truthKey.toLowerCase()] || ''

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are a sci-fi writer, prized for brevity and clarity.'],
    ['human', 'the setting is <setting>{setting}</setting>'],
    ['human', 'you need to generate a truth about the universe that revolves around {truth}.'],
    ['human', 'Here is an example, that you may optionaly rebrand : <example>{example}.</example>'],
    ['user', 'I very much want you to remember: <userNotes>{notePrompt}</userNotes>'],
    ['human', 'If you generate any names for things, be very creative.'],
    ['user', 'Generate the truth. Keep it short, around two or three very short and direct sentences.']
  ]);
  const parser = new StringOutputParser();
  const chain = prompt.pipe(model).pipe(parser);
  const example = examples[Math.floor(Math.random() * examples.length)];
  const values = {
    setting,
    truth: truthPrompt,
    example,
    notePrompt
  }
  const stream = await chain.stream(values);
  const fullText = []
  for await (const chunk of stream) {
    onStreamItem(chunk)
    fullText.push(chunk)
  }
  const summary = await generateTinySummary(fullText.join(''))
  return summary

}

const generateTinySummary = async (text: string) => {

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are a techincal writer. Condensing information is your forte.'],
    ['human', 'summarize the following into the smallest possible text: <text>{text}</text>'],
  ]);
  const chain = prompt.pipe(summaryModel)
  return await chain.invoke({text})
}
