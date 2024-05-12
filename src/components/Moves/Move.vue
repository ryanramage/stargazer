<template>
  <q-expansion-item
    class="shadow-1 overflow-hidden"
    :label="move.Name"
    :caption="caption"
    :header-class="cardStyle"
    style="border-radius: 4px"
  >
    <q-card class="card-bg">
      <q-card-section v-html="mdToHtml(move.Text)" />
      <q-card-section v-if="move.Oracles" class="q-gutter-md">
        <q-btn
          v-for="(oracleID, index) in move.Oracles"
          :key="index"
          :label="'Roll ' + oracleID.split('/').splice(-1)[0].replace(/_/g, ' ')"
          @click="click(oracleID)"
          outline
        />
        <q-btn label="Clear results" outline @click="results = []" />
        <q-btn icon="save" outline @click="save" />
        <div>
          <span v-for="(res, index) in results" :key="index" class="q-pr-md" v-html="res"></span>
        </div>
      </q-card-section>
    </q-card>
  </q-expansion-item>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed } from 'vue';

import { IMove } from 'dataforged';

import { useCampaign } from 'src/store/campaign';

import { mdToHtml } from 'src/lib/util';

import * as oracle from 'src/lib/oracles';
import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

const llmOptions = { baseUrl: 'http://localhost:11434', model: 'wizardlm2:7b' }
const model = new ChatOllama(llmOptions)

export default defineComponent({
  name: 'Move',
  props: {
    move: {
      type: Object as PropType<IMove>,
      required: true,
    },
    moveType: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const results = ref([] as string[]);

    const click = async (o: string) => {
      if (props.move.Oracles !== undefined) {
        try {
          const roll = oracle.roll(o);
          results.value.push(roll);
          const campaign = useCampaign();
          const {content, title} = campaign.data.journal[0]
          console.log(title, content)
          const prompt = ChatPromptTemplate.fromMessages([
            ['system','"You are a story writer. Give a prompt, you envision a scenario unfolding.'],
            ['user', '{input}'],
          ]);
          const parser = new StringOutputParser();
          const chain = prompt.pipe(model).pipe(parser);
          const stream = await chain.stream({
            input: `${title}, ${content}, ${roll}`
          });
          for await (const chunk of stream) {
            const curr : string = results.value[0]
            const next = !curr ? '' : curr + chunk
            console.log(next)
            results.value[0] = next
          }

        } catch (err) {
          alert('Move data not found');
        }
      }
    };

    const cardStyle = computed((): string => {
      return 'text-h6 move-header ' + props.moveType.split(' ')[0].toLowerCase();
    });

    const caption = computed((): string => {
      return `${props.moveType}: ${props.move.Source.Title} (pg. ${
        props.move.Source.Page ? props.move.Source.Page : '?'
      })`;
    });

    const save = () => {
      const campaign = useCampaign();
      results.value.forEach((v) => {
        campaign.appendToJournal(0, `<div class="note moveoracleroll"><b>[${props.move.Name}: ${v}]</b></div>`);
      });
    };

    return {
      click,
      results,
      save,
      mdToHtml,
      cardStyle,
      caption,
    };
  },
});
</script>

<style lang="sass">
ul
  margin: 0em
  padding: 1.5em

ul li
  margin: 0
  padding: 0

.move-header
  text-shadow: 1px 1px 1px #4C566A

.session
  background-color: $session

.legacy
  background-color: $legacy

.adventure
  background-color: $adventure

.combat
  background-color: $combat

.fate
  background-color: $fate

.quest
  background-color: $quest

.connection
  background-color: $connection

.suffer
  background-color: $suffer

.exploration
  background-color: $exploration

.threshold
 background-color: $threshold

.recover
 background-color: $recover

.scene
  background-color: $scene
</style>
