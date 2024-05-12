import { ICampaign } from 'src/components/models';
import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
const llmOptions = { baseUrl: 'http://localhost:11434', model: 'wizardlm2:7b' }
const model = new ChatOllama(llmOptions)

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
