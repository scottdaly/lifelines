import type { Choice, GeneratedBackground } from '../models/types.js';

interface EarlyLifeChoiceTemplate {
  id: string;
  template: string;
  tags: string[];
  allocation: {
    physical: number;
    cognitive: number;
    social: number;
    creative: number;
    emotional: number;
  };
}

// Define choice templates for different focuses
const EARLY_LIFE_TEMPLATES: Record<string, EarlyLifeChoiceTemplate[]> = {
  physical: [
    {
      id: 'sports',
      template: 'Playing sports and running around outside',
      tags: ['physical', 'sports', 'active'],
      allocation: { physical: 4, cognitive: 1, social: 2, creative: 1, emotional: 2 }
    },
    {
      id: 'adventure',
      template: 'Climbing trees and exploring nature',
      tags: ['physical', 'outdoor', 'adventure'],
      allocation: { physical: 4, cognitive: 1, social: 2, creative: 1, emotional: 2 }
    },
    {
      id: 'bikes',
      template: 'Riding bikes and playing active games',
      tags: ['physical', 'bikes', 'play'],
      allocation: { physical: 3, cognitive: 2, social: 1, creative: 2, emotional: 2 }
    }
  ],
  cognitive: [
    {
      id: 'books',
      template: 'Reading books and solving puzzles',
      tags: ['cognitive', 'reading', 'learning'],
      allocation: { physical: 1, cognitive: 4, social: 2, creative: 1, emotional: 2 }
    },
    {
      id: 'science',
      template: 'Doing science experiments and taking things apart',
      tags: ['cognitive', 'science', 'discovery'],
      allocation: { physical: 1, cognitive: 4, social: 1, creative: 2, emotional: 2 }
    },
    {
      id: 'collecting',
      template: 'Collecting things and organizing collections',
      tags: ['cognitive', 'collecting', 'organizing'],
      allocation: { physical: 1, cognitive: 4, social: 2, creative: 1, emotional: 2 }
    }
  ],
  social: [
    {
      id: 'friends',
      template: 'Playing with friends and making up games',
      tags: ['social', 'friends', 'play'],
      allocation: { physical: 1, cognitive: 1, social: 4, creative: 2, emotional: 2 }
    },
    {
      id: 'groups',
      template: 'Joining clubs and group activities',
      tags: ['social', 'groups', 'activities'],
      allocation: { physical: 1, cognitive: 1, social: 4, creative: 2, emotional: 2 }
    },
    {
      id: 'helping',
      template: 'Helping others and being part of a team',
      tags: ['social', 'teamwork', 'helping'],
      allocation: { physical: 2, cognitive: 1, social: 4, creative: 1, emotional: 2 }
    }
  ],
  creative: [
    {
      id: 'arts',
      template: 'Drawing, painting, and making art',
      tags: ['creative', 'arts', 'visual'],
      allocation: { physical: 1, cognitive: 1, social: 2, creative: 4, emotional: 2 }
    },
    {
      id: 'building',
      template: 'Building with blocks and creating things',
      tags: ['creative', 'building', 'making'],
      allocation: { physical: 1, cognitive: 1, social: 2, creative: 4, emotional: 2 }
    },
    {
      id: 'music',
      template: 'Playing music and putting on shows',
      tags: ['creative', 'music', 'performance'],
      allocation: { physical: 2, cognitive: 1, social: 1, creative: 4, emotional: 2 }
    }
  ],
  balanced: [
    {
      id: 'variety',
      template: 'Trying lots of different activities',
      tags: ['balanced', 'diverse', 'variety'],
      allocation: { physical: 2, cognitive: 2, social: 2, creative: 2, emotional: 2 }
    },
    {
      id: 'curious',
      template: 'Following your curiosity wherever it leads',
      tags: ['balanced', 'curious', 'exploring'],
      allocation: { physical: 2, cognitive: 2, social: 2, creative: 2, emotional: 2 }
    }
  ]
};

function getRandomTemplate(category: string): EarlyLifeChoiceTemplate {
  const templates = EARLY_LIFE_TEMPLATES[category];
  return templates[Math.floor(Math.random() * templates.length)];
}

export function generateEarlyLifeChoices(background?: GeneratedBackground): Choice[] {
  const choices: Choice[] = [];
  
  // Always include one from each major category
  const physical = getRandomTemplate('physical');
  const cognitive = getRandomTemplate('cognitive');
  const social = getRandomTemplate('social');
  const creative = getRandomTemplate('creative');
  
  // Customize based on family background if available
  let physicalLabel = physical.template;
  let cognitiveLabel = cognitive.template;
  let socialLabel = social.template;
  let creativeLabel = creative.template;
  
  if (background) {
    const { familyBackground, birthplace, era } = background;
    
    // Adjust labels based on socioeconomic status
    if (familyBackground.socioeconomicStatus === 'wealthy') {
      cognitiveLabel = 'Reading in your personal library';
      creativeLabel = 'Taking piano and art lessons';
      physicalLabel = 'Playing tennis at the country club';
    } else if (familyBackground.socioeconomicStatus === 'working_class') {
      physicalLabel = 'Playing street games with neighborhood kids';
      socialLabel = 'Hanging out on the block with friends';
      cognitiveLabel = 'Reading library books over and over';
    } else if (familyBackground.socioeconomicStatus === 'poor') {
      physicalLabel = 'Running around wherever you can';
      creativeLabel = 'Making up games with whatever you find';
    }
    
    // Adjust based on location
    if (birthplace.type === 'rural') {
      physicalLabel = 'Exploring the countryside and helping on the farm';
      creativeLabel = 'Making up stories and building forts';
    } else if (birthplace.type === 'urban') {
      socialLabel = 'Making friends at the playground';
      physicalLabel = 'Playing in parks and on the streets';
    }
  }
  
  // Create choice objects with encoded allocations
  choices.push({
    id: `early_${physical.id}_${encodeAllocation(physical.allocation)}`,
    label: physicalLabel,
    tags: ['early_life', ...physical.tags]
  });
  
  choices.push({
    id: `early_${cognitive.id}_${encodeAllocation(cognitive.allocation)}`,
    label: cognitiveLabel,
    tags: ['early_life', ...cognitive.tags]
  });
  
  choices.push({
    id: `early_${social.id}_${encodeAllocation(social.allocation)}`,
    label: socialLabel,
    tags: ['early_life', ...social.tags]
  });
  
  choices.push({
    id: `early_${creative.id}_${encodeAllocation(creative.allocation)}`,
    label: creativeLabel,
    tags: ['early_life', ...creative.tags]
  });
  
  return choices;
}

function encodeAllocation(allocation: EarlyLifeChoiceTemplate['allocation']): string {
  return `p${allocation.physical}c${allocation.cognitive}s${allocation.social}r${allocation.creative}e${allocation.emotional}`;
}

export function decodeEarlyLifeChoice(choiceId: string): {
  isEarlyLife: boolean;
  allocation?: {
    physical: number;
    cognitive: number;
    social: number;
    creative: number;
    emotional: number;
  };
} {
  if (!choiceId.startsWith('early_')) {
    return { isEarlyLife: false };
  }
  
  // Extract allocation from the choice ID
  const match = choiceId.match(/p(\d)c(\d)s(\d)r(\d)e(\d)/);
  if (!match) {
    // Default to balanced if parsing fails
    return {
      isEarlyLife: true,
      allocation: { physical: 2, cognitive: 2, social: 2, creative: 2, emotional: 2 }
    };
  }
  
  return {
    isEarlyLife: true,
    allocation: {
      physical: parseInt(match[1]),
      cognitive: parseInt(match[2]),
      social: parseInt(match[3]),
      creative: parseInt(match[4]),
      emotional: parseInt(match[5])
    }
  };
}

// Helper to generate contextual early life question
export function getEarlyLifeQuestion(age: number): string {
  return "What will your main hobby as a child be?";
}