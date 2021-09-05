import {
  EPClass,
  ERegion,
  ESLocation,
  ICampaign,
  INPC,
  ICharacter,
  IDiff,
  IJournalEntry,
  ILegacyBox,
  ILegacyTrack,
  IMenace,
  IPlanet,
  IProgressTrack,
  ISector,
  ISectorCell,
  ISettlement,
  IStar,
  IStarship,
} from 'src/components/models';
import { v4 as uuid } from 'uuid';
import { Space } from './oracles/space';
import { tableRoll } from './roll';

export const Difficulty: { [index: number]: IDiff } = {
  1: <IDiff>{ label: 'Troublesome', mark: 3, harm: 1 },
  2: <IDiff>{ label: 'Dangerous', mark: 2, harm: 2 },
  3: <IDiff>{ label: 'Formidable', mark: 1, harm: 3 },
  4: <IDiff>{ label: 'Extreme', mark: 0.5, harm: 4 },
  5: <IDiff>{ label: 'Epic', mark: 0.25, harm: 5 },
};

export function NewMenace(): IMenace {
  return {
    name: '',
    boxes: Array(10).fill(false) as boolean[],
  };
}

export function NewProgressTrack(): IProgressTrack {
  return {
    name: '',
    difficulty: 1,
    boxes: Array(10).fill(0) as number[],
    showMenace: false,
  };
}

export function NewLegacyTrack(): ILegacyTrack {
  const track: ILegacyTrack = {
    plus10: false,
    boxes: Array(10).fill({
      ticks: 0,
      xp: [false, false],
    }) as ILegacyBox[],
  };

  return track;
}

export function NewCharacter(): ICharacter {
  return {
    name: 'New Character',
    pronouns: '',
    callsign: '',
    characteristics: '',
    stats: {
      edge: 0,
      heart: 0,
      iron: 0,
      shadow: 0,
      wits: 0,
    },
    tracks: {
      health: { value: 5, max: 5, min: 0 },
      spirit: { value: 5, max: 5, min: 0 },
      supply: { value: 5, max: 5, min: 0 },
      momentum: { value: 2, max: 10, min: -6, reset: 2 },
    },
    legacies: {
      quests: NewLegacyTrack(),
      bonds: NewLegacyTrack(),
      discoveries: NewLegacyTrack(),
    },
    impacts: {
      Misfortunes: [
        {
          name: 'Wounded',
          marked: false,
        },
        {
          name: 'Shaken',
          marked: false,
        },
        {
          name: 'Unprepared',
          marked: false,
        },
      ],
      'Lasting Effects': [
        {
          name: 'Permanently Harmed',
          marked: false,
        },
        {
          name: 'Traumatized',
          marked: false,
        },
      ],
      Burdens: [
        {
          name: 'Doomed',
          marked: false,
        },
        {
          name: 'Tormented',
          marked: false,
        },
        {
          name: 'Indebted',
          marked: false,
        },
      ],
      'Current Vehicle': [
        {
          name: 'Battered',
          marked: false,
        },
        {
          name: 'Cursed',
          marked: false,
        },
      ],
    },
    vows: [NewProgressTrack()],
    bonds: NewProgressTrack(),
    gear: '',
    assets: [],
  };
}

export function NewJournal(): IJournalEntry {
  return {
    title: 'New journal entry',
    content: '',
  };
}

export function NewNPC(): INPC {
  return {
    name: '',
    callsign: '',
    firstLook: '',
    disposition: '',
    role: '',
    goal: '',
    aspect: '',
    track: NewProgressTrack(),
    bond: false,
    notes: '',
  };
}

export function NewCell(name?: string): ISectorCell {
  const n = name ? name : '';
  return {
    id: '',
    name: n,
    stars: [],
    planets: [],
    settlements: [],
    derelicts: [],
    ships: [],
    npcs: [],
    creatures: [],
    vaults: [],
  };
}
export function NewSector(): ISector {
  return {
    name: `${tableRoll(Space.sectorPrefix)} ${tableRoll(Space.sectorSuffix)}`,
    region: ERegion.Terminus,
    control: '',
    cells: [NewCell('You are here')],
  };
}

export function NewStar(): IStar {
  return {
    name: '',
    description: '',
  };
}

export function NewPlanet(): IPlanet {
  return {
    type: EPClass.Desert,
    name: '',
    description: '',
    atmosphere: '',
    settlements: '',
    observed: '',
    feature: '',
    life: '',
    notes: '',
  };
}

export function NewSettlement(): ISettlement {
  return {
    name: '',
    location: ESLocation.Orbital,
    population: '',
    firstLook: '',
    initialContact: '',
    authority: '',
    projects: '',
    trouble: '',
    notes: '',
  };
}

export function NewShip(): IStarship {
  return {
    name: '',
    class: '',
    fleet: '',
    initialContact: '',
    firstLook: '',
    mission: '',
    notes: '',
  };
}

export function NewCampaign(): ICampaign {
  return {
    id: uuid(),
    name: 'New Campaign',
    character: NewCharacter(),
    truths: {
      theOldWorld: '',
      iron: '',
      legacies: '',
      communities: '',
      leaders: '',
      defense: '',
      mysticism: '',
      religion: '',
      firstBorn: '',
      beasts: '',
      horrors: '',
    },
    progressTracks: [NewProgressTrack()],
    journal: [NewJournal()],
    sectors: [NewSector()],
  };
}
