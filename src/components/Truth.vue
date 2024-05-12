<template>
  <div class="q-mb-md">
    <div class="row text-h4 items-baseline">
      <q-avatar :icon="icon.truth(label)" />
      <div class="col-shrink sf-header q-mr-sm">{{ label }}</div>
    </div>

    <div class="row items-center no-wrap">
      <q-select
        class="col-grow"
        label="Select one, write your own, or roll..."
        v-model="optSelect"
        map-options
        emit-value
        :options="opts()"
        dense
        borderless
      />
      <q-btn class="col-shrink" icon="mdi-account-star" flat dense @click="rollMain" />
    </div>

    <div class="row items-center" v-if="subOpts.length > 0">
      <q-select class="col-grow" label="Select" v-model="subOptSelect" :options="subOpts" dense borderless />
      <q-btn class="col-shrink" icon="mdi-dice-6" flat dense @click="rollSub" />
    </div>

    <q-input label="Text" v-model="campaign.data.truths[id]" dense outlined autogrow />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

import { ISelectOpt } from 'src/components/models';

import { useCampaign } from 'src/store/campaign';

import { icon } from 'src/lib/icons';
import { starforged } from 'dataforged';
import * as oracle from 'src/lib/oracles';
import { generateTruth } from 'src/lib/ai'

export default defineComponent({
  name: 'Truths',
  props: {
    label: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const campaign = useCampaign();

    const truth = starforged['Setting Truths'].find((t) => t.Name === props.label);
    if (!truth) alert(`No truth found for ${props.label}`);

    const subOptSelect = ref('');
    let subOpts = ref([] as string[]);

    // I'm going to be doing this a few times
    const truncate = (s: string): string => s.substring(0, 30) + '...';

    const optSelect = ref('');
    const optID = ref(0);
    const opts = (): ISelectOpt[] => {
      const out: ISelectOpt[] = [];
      truth?.Table.forEach((t) => {
        out.push({ label: truncate(t.Result), value: `${t.Result} ${t.Description}` });
      });
      return out;
    };

    watch(
      () => optSelect.value,
      () => {
        subOpts.value = [];
        truth?.Table.forEach((t, i) => {
          const r = new RegExp(`^${truncate(t.Result)}`);
          if (r.test(optSelect.value)) {
            campaign.data.truths[props.id] = `${t.Result} ${t.Description}`;
            console.log(t);
            if (t.Subtable) {
              optID.value = i;
              t.Subtable.forEach((i) => {
                subOpts.value.push(i.Result);
              });
            }
          }
        });
      }
    );

    watch(
      () => subOptSelect.value,
      () => {
        campaign.data.truths[props.id] += '\n\n' + subOptSelect.value;
      }
    );

    const rollMain = async () => {
      const notePrompt = campaign.data.truths[props.id]
      const examples = opts().map((i) => i.value);
      const currentCampain = useCampaign().data
      const onStreamItem = (val: string) => {
        campaign.data.truths[props.id] ? campaign.data.truths[props.id] += val : campaign.data.truths[props.id] = val
      }
      const smallSummary = await generateTruth(currentCampain, truth?.$id, examples, notePrompt, onStreamItem)
      console.log(smallSummary)

    }

    const rollSub = () => {
      console.log('rolling sub')
      subOptSelect.value = oracle.truth(truth?.$id as string, optID.value).Result
    }

    return {
      campaign,
      truth,
      optSelect,
      opts,
      optID,
      subOptSelect,
      subOpts,
      rollSub,
      rollMain,
      icon,
    };
  },
});
</script>
