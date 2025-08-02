import type { TimeBlockAllocation, TimeBlockEffect, Stats, TimeBlockCategory } from '../models/types.js';

export const TIME_BLOCK_DESCRIPTIONS: Record<TimeBlockCategory, {
  name: string;
  description: string;
  examples: string[];
}> = {
  physical: {
    name: "Physical Development",
    description: "Focus on motor skills, health, and active play",
    examples: ["Playing sports", "Learning to ride a bike", "Dance classes", "Outdoor adventures"]
  },
  cognitive: {
    name: "Cognitive Growth",
    description: "Emphasis on learning, problem-solving, and curiosity",
    examples: ["Reading together", "Educational games", "Science experiments", "Museum visits"]
  },
  social: {
    name: "Social Skills",
    description: "Building relationships and interpersonal skills",
    examples: ["Playdates", "Family gatherings", "Team activities", "Community involvement"]
  },
  creative: {
    name: "Creative Expression",
    description: "Nurturing imagination, arts, and self-expression",
    examples: ["Art projects", "Music lessons", "Storytelling", "Imaginative play"]
  },
  emotional: {
    name: "Emotional Security",
    description: "Building confidence, attachment, and emotional intelligence",
    examples: ["Quality time", "Emotional validation", "Consistent routines", "Building self-esteem"]
  }
};

export function calculateTimeBlockEffects(allocation: TimeBlockAllocation): TimeBlockEffect {
  const statModifiers: Partial<Stats> = {};
  const traitProbabilities: { trait: string; probability: number }[] = [];
  const narrativeThemes: string[] = [];

  // Physical allocation effects
  if (allocation.physical >= 3) {
    statModifiers.strength = 15;
    statModifiers.health = 10;
    traitProbabilities.push({ trait: 'athletic', probability: 0.7 });
    traitProbabilities.push({ trait: 'energetic', probability: 0.6 });
    narrativeThemes.push('athletic_childhood', 'physical_prowess');
  } else if (allocation.physical >= 2) {
    statModifiers.strength = 8;
    statModifiers.health = 5;
    traitProbabilities.push({ trait: 'active', probability: 0.4 });
  } else {
    statModifiers.strength = -5;
    traitProbabilities.push({ trait: 'bookish', probability: 0.3 });
  }

  // Cognitive allocation effects
  if (allocation.cognitive >= 3) {
    statModifiers.intelligence = 20;
    statModifiers.creativity = 5;
    traitProbabilities.push({ trait: 'brilliant', probability: 0.6 });
    traitProbabilities.push({ trait: 'curious', probability: 0.8 });
    narrativeThemes.push('academic_excellence', 'early_genius');
  } else if (allocation.cognitive >= 2) {
    statModifiers.intelligence = 10;
    traitProbabilities.push({ trait: 'inquisitive', probability: 0.5 });
  } else {
    statModifiers.intelligence = -5;
    statModifiers.creativity = 5;
  }

  // Social allocation effects
  if (allocation.social >= 3) {
    statModifiers.charisma = 20;
    traitProbabilities.push({ trait: 'charismatic', probability: 0.7 });
    traitProbabilities.push({ trait: 'empathetic', probability: 0.6 });
    narrativeThemes.push('social_butterfly', 'natural_leader');
  } else if (allocation.social >= 2) {
    statModifiers.charisma = 10;
    traitProbabilities.push({ trait: 'friendly', probability: 0.5 });
  } else {
    statModifiers.charisma = -5;
    traitProbabilities.push({ trait: 'shy', probability: 0.4 });
  }

  // Creative allocation effects
  if (allocation.creative >= 3) {
    statModifiers.creativity = 25;
    statModifiers.intelligence = 5;
    traitProbabilities.push({ trait: 'artistic', probability: 0.8 });
    traitProbabilities.push({ trait: 'imaginative', probability: 0.7 });
    narrativeThemes.push('artistic_prodigy', 'creative_spirit');
  } else if (allocation.creative >= 2) {
    statModifiers.creativity = 12;
    traitProbabilities.push({ trait: 'creative', probability: 0.5 });
  } else {
    statModifiers.creativity = -5;
    traitProbabilities.push({ trait: 'practical', probability: 0.3 });
  }

  // Emotional allocation effects
  if (allocation.emotional >= 3) {
    statModifiers.luck = 15;
    statModifiers.health = 5;
    traitProbabilities.push({ trait: 'confident', probability: 0.7 });
    traitProbabilities.push({ trait: 'resilient', probability: 0.6 });
    narrativeThemes.push('emotional_stability', 'secure_attachment');
  } else if (allocation.emotional >= 2) {
    statModifiers.luck = 8;
    traitProbabilities.push({ trait: 'optimistic', probability: 0.4 });
  } else {
    statModifiers.luck = -10;
    traitProbabilities.push({ trait: 'anxious', probability: 0.4 });
    traitProbabilities.push({ trait: 'sensitive', probability: 0.5 });
  }

  // Balanced allocation bonus
  const values = Object.values(allocation);
  const isBalanced = Math.max(...values) - Math.min(...values) <= 1;
  if (isBalanced) {
    statModifiers.luck = (statModifiers.luck || 0) + 10;
    traitProbabilities.push({ trait: 'well-rounded', probability: 0.8 });
    narrativeThemes.push('balanced_upbringing');
  }

  return {
    statModifiers,
    traitProbabilities,
    narrativeThemes
  };
}

export function validateTimeBlockAllocation(allocation: TimeBlockAllocation): boolean {
  const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);
  if (total !== 10) return false;
  
  for (const value of Object.values(allocation)) {
    if (value < 1 || value > 4) return false;
  }
  
  return true;
}

export function generateTimeBlockChoices(): {
  preset: string;
  name: string;
  description: string;
  allocation: TimeBlockAllocation;
}[] {
  return [
    {
      preset: 'balanced',
      name: 'Balanced Development',
      description: 'Equal focus across all areas',
      allocation: { physical: 2, cognitive: 2, social: 2, creative: 2, emotional: 2 }
    },
    {
      preset: 'academic',
      name: 'Academic Focus',
      description: 'Emphasis on learning and cognitive development',
      allocation: { physical: 1, cognitive: 4, social: 2, creative: 1, emotional: 2 }
    },
    {
      preset: 'athletic',
      name: 'Athletic Focus',
      description: 'Strong emphasis on physical development and health',
      allocation: { physical: 4, cognitive: 1, social: 2, creative: 1, emotional: 2 }
    },
    {
      preset: 'creative',
      name: 'Creative Focus',
      description: 'Nurturing artistic expression and imagination',
      allocation: { physical: 1, cognitive: 1, social: 2, creative: 4, emotional: 2 }
    },
    {
      preset: 'social',
      name: 'Social Focus',
      description: 'Building strong relationships and social skills',
      allocation: { physical: 1, cognitive: 1, social: 4, creative: 2, emotional: 2 }
    }
  ];
}

export function applyTimeBlockEffects(
  baseStats: Stats,
  allocation: TimeBlockAllocation
): { stats: Stats; traits: string[] } {
  const effects = calculateTimeBlockEffects(allocation);
  
  // Apply stat modifiers
  const stats: Stats = { ...baseStats };
  for (const [stat, modifier] of Object.entries(effects.statModifiers)) {
    const key = stat as keyof Stats;
    stats[key] = Math.max(0, Math.min(100, stats[key] + modifier));
  }
  
  // Determine traits based on probabilities
  const traits: string[] = [];
  for (const { trait, probability } of effects.traitProbabilities) {
    if (Math.random() < probability) {
      traits.push(trait);
    }
  }
  
  return { stats, traits };
}