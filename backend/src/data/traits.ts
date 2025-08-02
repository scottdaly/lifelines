import type { TraitDefinition } from '../models/procedural.js';

export const TRAITS: TraitDefinition[] = [
  // Personality Traits
  {
    id: 'introverted',
    name: 'Introverted',
    category: 'personality',
    description: 'Prefers solitude and small groups over large social gatherings',
    modifiers: {
      statModifiers: { charisma: -5, intelligence: 5, creativity: 5 },
      choiceWeights: { social: 0.7, introspective: 1.3, solo: 1.5 },
      narrativeTags: ['quiet', 'thoughtful', 'observant']
    },
    incompatibleWith: ['extroverted'],
    evolvesInto: [
      {
        traitId: 'quietly_confident',
        conditions: { minAge: 16, minStats: { charisma: 60 } }
      }
    ]
  },
  {
    id: 'extroverted',
    name: 'Extroverted',
    category: 'personality',
    description: 'Energized by social interaction and thrives in groups',
    modifiers: {
      statModifiers: { charisma: 10, intelligence: -5 },
      choiceWeights: { social: 1.5, group: 1.3, leadership: 1.2 },
      narrativeTags: ['outgoing', 'social', 'energetic']
    },
    incompatibleWith: ['introverted']
  },
  {
    id: 'curious',
    name: 'Curious',
    category: 'personality',
    description: 'Always asking questions and exploring new things',
    modifiers: {
      statModifiers: { intelligence: 5, creativity: 5 },
      choiceWeights: { explore: 1.5, learn: 1.5, experiment: 1.3 },
      narrativeTags: ['inquisitive', 'explorative', 'questioning']
    }
  },
  {
    id: 'cautious',
    name: 'Cautious',
    category: 'personality',
    description: 'Thinks carefully before acting, avoids unnecessary risks',
    modifiers: {
      statModifiers: { luck: 5, health: 5 },
      choiceWeights: { risky: 0.5, safe: 1.5, planned: 1.3 },
      narrativeTags: ['careful', 'prudent', 'thoughtful']
    },
    incompatibleWith: ['reckless']
  },
  {
    id: 'creative',
    name: 'Creative',
    category: 'personality',
    description: 'Sees the world differently and loves artistic expression',
    modifiers: {
      statModifiers: { creativity: 15, intelligence: 5 },
      choiceWeights: { artistic: 1.8, unconventional: 1.5, imaginative: 1.5 },
      narrativeTags: ['artistic', 'imaginative', 'original']
    }
  },

  // Physical Traits
  {
    id: 'athletic',
    name: 'Athletic',
    category: 'physical',
    description: 'Naturally gifted in physical activities and sports',
    modifiers: {
      statModifiers: { strength: 15, health: 10, charisma: 5 },
      choiceWeights: { physical: 1.8, competitive: 1.5, outdoor: 1.3 },
      narrativeTags: ['sporty', 'active', 'competitive']
    },
    incompatibleWith: ['bookish'],
    evolvesInto: [
      {
        traitId: 'star_athlete',
        conditions: { minAge: 14, minStats: { strength: 70 } }
      }
    ]
  },
  {
    id: 'bookish',
    name: 'Bookish',
    category: 'physical',
    description: 'Prefers reading and intellectual pursuits over physical activities',
    modifiers: {
      statModifiers: { intelligence: 15, strength: -10, creativity: 5 },
      choiceWeights: { academic: 1.8, intellectual: 1.5, study: 1.5 },
      narrativeTags: ['studious', 'intellectual', 'scholarly']
    },
    incompatibleWith: ['athletic']
  },
  {
    id: 'healthy',
    name: 'Naturally Healthy',
    category: 'physical',
    description: 'Blessed with a strong constitution and rarely gets sick',
    modifiers: {
      statModifiers: { health: 20, strength: 5 },
      choiceWeights: { active: 1.2, risky_health: 1.1 },
      narrativeTags: ['robust', 'vigorous', 'resilient']
    },
    incompatibleWith: ['sickly']
  },
  {
    id: 'sickly',
    name: 'Sickly',
    category: 'physical',
    description: 'Prone to illness and requires extra care',
    modifiers: {
      statModifiers: { health: -15, intelligence: 5, creativity: 5 },
      choiceWeights: { risky_health: 0.5, indoor: 1.3, careful: 1.5 },
      narrativeTags: ['fragile', 'delicate', 'vulnerable']
    },
    incompatibleWith: ['healthy']
  },

  // Background Traits
  {
    id: 'privileged',
    name: 'Privileged',
    category: 'background',
    description: 'Born into wealth and opportunity',
    modifiers: {
      statModifiers: { wealth: 30, charisma: 5, health: 5 },
      choiceWeights: { expensive: 1.5, exclusive: 1.8, networking: 1.3 },
      narrativeTags: ['wealthy', 'connected', 'advantaged']
    },
    incompatibleWith: ['underprivileged']
  },
  {
    id: 'underprivileged',
    name: 'Underprivileged',
    category: 'background',
    description: 'Faced early hardships but developed resilience',
    modifiers: {
      statModifiers: { wealth: -20, strength: 10, luck: -5 },
      choiceWeights: { resourceful: 1.8, struggle: 1.5, community: 1.5 },
      narrativeTags: ['struggling', 'resilient', 'resourceful']
    },
    incompatibleWith: ['privileged']
  },
  {
    id: 'urban_native',
    name: 'City Kid',
    category: 'background',
    description: 'Grew up in the hustle and bustle of city life',
    modifiers: {
      statModifiers: { charisma: 5, intelligence: 5 },
      choiceWeights: { urban: 1.5, tech: 1.3, diverse: 1.5 },
      narrativeTags: ['streetwise', 'connected', 'modern']
    },
    incompatibleWith: ['rural_native']
  },
  {
    id: 'rural_native',
    name: 'Country Kid',
    category: 'background',
    description: 'Raised in rural areas with nature and simplicity',
    modifiers: {
      statModifiers: { strength: 5, health: 10, creativity: 5 },
      choiceWeights: { nature: 1.8, simple: 1.5, traditional: 1.3 },
      narrativeTags: ['grounded', 'natural', 'traditional']
    },
    incompatibleWith: ['urban_native']
  },

  // Inherited Traits
  {
    id: 'gifted',
    name: 'Gifted',
    category: 'inherited',
    description: 'Exceptional intellectual abilities from birth',
    modifiers: {
      statModifiers: { intelligence: 20, creativity: 10 },
      choiceWeights: { academic: 2.0, complex: 1.8, innovative: 1.5 },
      narrativeTags: ['brilliant', 'exceptional', 'prodigy']
    }
  },
  {
    id: 'charismatic_genes',
    name: 'Natural Charisma',
    category: 'inherited',
    description: 'Inherited charm and magnetism from charismatic parents',
    modifiers: {
      statModifiers: { charisma: 20 },
      choiceWeights: { social: 1.5, leadership: 1.8, performance: 1.5 },
      narrativeTags: ['charming', 'magnetic', 'appealing']
    }
  },
  {
    id: 'lucky',
    name: 'Born Lucky',
    category: 'inherited',
    description: 'Things just seem to work out in your favor',
    modifiers: {
      statModifiers: { luck: 25 },
      choiceWeights: { risky: 1.3, opportunity: 1.5 },
      narrativeTags: ['fortunate', 'blessed', 'serendipitous']
    },
    incompatibleWith: ['unlucky']
  },
  {
    id: 'unlucky',
    name: 'Unlucky',
    category: 'inherited',
    description: 'If something can go wrong, it probably will',
    modifiers: {
      statModifiers: { luck: -20, strength: 5 },
      choiceWeights: { cautious: 1.5, prepared: 1.3 },
      narrativeTags: ['unfortunate', 'jinxed', 'hapless']
    },
    incompatibleWith: ['lucky']
  },

  // Special/Evolved Traits
  {
    id: 'quietly_confident',
    name: 'Quietly Confident',
    category: 'personality',
    description: 'Developed confidence without losing introspective nature',
    modifiers: {
      statModifiers: { charisma: 10, intelligence: 10, creativity: 5 },
      choiceWeights: { leadership: 1.3, thoughtful: 1.5, strategic: 1.5 },
      narrativeTags: ['confident', 'thoughtful', 'composed']
    }
  },
  {
    id: 'star_athlete',
    name: 'Star Athlete',
    category: 'physical',
    description: 'Exceptional athletic ability recognized by all',
    modifiers: {
      statModifiers: { strength: 10, charisma: 15, health: 5 },
      choiceWeights: { sports: 2.0, competitive: 1.8, leadership: 1.5 },
      narrativeTags: ['champion', 'athletic', 'popular']
    }
  }
];