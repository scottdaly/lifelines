import type { 
  GeneratedBackground, 
  TraitDefinition, 
  BirthplaceDefinition,
  ParentProfession,
  EraDefinition,
  FamilyBackground,
  FamilyStructure,
  SocioeconomicStatus,
  StatCorrelation
} from '../models/procedural.js';
import type { Stats, NPC, Relationship } from '../models/types.js';
import { TRAITS } from '../data/traits.js';
import { BIRTHPLACES } from '../data/birthplaces.js';
import { PROFESSIONS } from '../data/professions.js';
import { ERAS } from '../data/eras.js';
import { STAT_CORRELATIONS } from '../models/procedural.js';

export function generateProceduralBackground(
  birthYear: number,
  seedValue?: string
): GeneratedBackground {
  const seed = seedValue || Math.random().toString();
  const rng = createSeededRandom(seed);
  
  // Select era based on birth year
  const era = selectEra(birthYear);
  
  // Generate birthplace
  const birthplace = selectBirthplace(rng);
  
  // Generate family background
  const familyBackground = generateFamilyBackground(rng, birthplace, era);
  
  // Generate traits based on all factors
  const traits = generateTraits(rng, birthplace, familyBackground);
  
  // Calculate stat modifiers from all sources
  const startingStatModifiers = calculateStatModifiers(traits, birthplace, familyBackground);
  
  // Generate narrative context
  const narrativeContext = generateNarrativeContext(birthplace, familyBackground, era, traits);
  
  return {
    traits,
    birthplace,
    familyBackground,
    era,
    startingStatModifiers,
    narrativeContext
  };
}

function selectEra(birthYear: number): EraDefinition {
  const era = ERAS.find(e => birthYear >= e.yearRange[0] && birthYear <= e.yearRange[1]);
  return era || ERAS[ERAS.length - 1]; // Default to most recent era
}

function selectBirthplace(rng: () => number): BirthplaceDefinition {
  // Weight birthplaces by type
  const weights = {
    major_city: 0.3,
    suburb: 0.4,
    small_town: 0.2,
    rural: 0.1
  };
  
  const roll = rng();
  let cumulative = 0;
  let selectedType: keyof typeof weights = 'suburb';
  
  for (const [type, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (roll < cumulative) {
      selectedType = type as keyof typeof weights;
      break;
    }
  }
  
  const availablePlaces = BIRTHPLACES.filter(b => b.type === selectedType);
  return availablePlaces[Math.floor(rng() * availablePlaces.length)];
}

function generateFamilyBackground(
  rng: () => number,
  birthplace: BirthplaceDefinition,
  era: EraDefinition
): FamilyBackground {
  // Determine family structure
  const structureWeights: Record<FamilyStructure, number> = {
    two_parent: 0.65,
    single_parent: 0.20,
    extended_family: 0.08,
    adoptive: 0.05,
    foster: 0.02
  };
  
  const structure = weightedSelect(structureWeights, rng) as FamilyStructure;
  
  // Determine socioeconomic status based on birthplace
  let socioeconomicStatus: SocioeconomicStatus;
  if (birthplace.id === 'wealthy_suburb') {
    socioeconomicStatus = rng() > 0.3 ? 'wealthy' : 'upper_middle';
  } else if (birthplace.type === 'rural') {
    socioeconomicStatus = rng() > 0.7 ? 'middle' : 'working_class';
  } else {
    const sesRoll = rng();
    if (sesRoll < 0.05) socioeconomicStatus = 'wealthy';
    else if (sesRoll < 0.20) socioeconomicStatus = 'upper_middle';
    else if (sesRoll < 0.50) socioeconomicStatus = 'middle';
    else if (sesRoll < 0.80) socioeconomicStatus = 'working_class';
    else socioeconomicStatus = 'poor';
  }
  
  // Generate parent professions
  const availableProfessions = PROFESSIONS.filter(p => 
    p.socioeconomicStatus === socioeconomicStatus ||
    (socioeconomicStatus === 'upper_middle' && p.socioeconomicStatus === 'middle') ||
    (socioeconomicStatus === 'working_class' && p.socioeconomicStatus === 'poor')
  );
  
  const parentProfessions: FamilyBackground['parentProfessions'] = {};
  
  if (structure !== 'single_parent' && structure !== 'foster') {
    parentProfessions.primary = availableProfessions[Math.floor(rng() * availableProfessions.length)];
    if (rng() > 0.3) { // 70% chance of two working parents
      parentProfessions.secondary = availableProfessions[Math.floor(rng() * availableProfessions.length)];
    }
  } else if (structure === 'single_parent') {
    parentProfessions.primary = availableProfessions[Math.floor(rng() * availableProfessions.length)];
  }
  
  // Generate family size
  const familySize = structure === 'foster' ? 0 : Math.floor(rng() * 4); // 0-3 siblings
  
  // Special circumstances
  const specialCircumstances: string[] = [];
  if (rng() < 0.1) specialCircumstances.push('immigrant_family');
  if (rng() < 0.05) specialCircumstances.push('military_family');
  if (rng() < 0.05) specialCircumstances.push('religious_family');
  
  return {
    structure,
    socioeconomicStatus,
    parentProfessions,
    familySize,
    specialCircumstances
  };
}

function generateTraits(
  rng: () => number,
  birthplace: BirthplaceDefinition,
  familyBackground: FamilyBackground
): string[] {
  const selectedTraits: string[] = [];
  
  // Add birthplace starting traits
  selectedTraits.push(...birthplace.modifiers.startingTraits);
  
  // Add background traits based on socioeconomic status
  if (familyBackground.socioeconomicStatus === 'wealthy') {
    selectedTraits.push('privileged');
  } else if (familyBackground.socioeconomicStatus === 'poor') {
    if (rng() > 0.5) selectedTraits.push('underprivileged');
  }
  
  // Personality traits (everyone gets at least one)
  const personalityTraits = TRAITS.filter(t => 
    t.category === 'personality' && 
    !selectedTraits.includes(t.id) &&
    !hasIncompatibleTrait(selectedTraits, t)
  );
  
  if (personalityTraits.length > 0) {
    const trait = personalityTraits[Math.floor(rng() * personalityTraits.length)];
    selectedTraits.push(trait.id);
  }
  
  // Physical traits (50% chance)
  if (rng() > 0.5) {
    const physicalTraits = TRAITS.filter(t => 
      t.category === 'physical' && 
      !selectedTraits.includes(t.id) &&
      !hasIncompatibleTrait(selectedTraits, t)
    );
    
    if (physicalTraits.length > 0) {
      const trait = physicalTraits[Math.floor(rng() * physicalTraits.length)];
      selectedTraits.push(trait.id);
    }
  }
  
  // Inherited traits (based on parent professions)
  if (familyBackground.parentProfessions.primary) {
    const parentStats = familyBackground.parentProfessions.primary.requiredStats;
    if (parentStats.intelligence && parentStats.intelligence >= 75 && rng() > 0.7) {
      selectedTraits.push('gifted');
    }
    if (parentStats.charisma && parentStats.charisma >= 70 && rng() > 0.7) {
      selectedTraits.push('charismatic_genes');
    }
  }
  
  // Lucky/unlucky (10% chance each)
  const luckRoll = rng();
  if (luckRoll < 0.1 && !hasIncompatibleTrait(selectedTraits, TRAITS.find(t => t.id === 'lucky')!)) {
    selectedTraits.push('lucky');
  } else if (luckRoll > 0.9 && !hasIncompatibleTrait(selectedTraits, TRAITS.find(t => t.id === 'unlucky')!)) {
    selectedTraits.push('unlucky');
  }
  
  return [...new Set(selectedTraits)]; // Remove duplicates
}

function hasIncompatibleTrait(currentTraits: string[], newTrait: TraitDefinition): boolean {
  if (!newTrait.incompatibleWith) return false;
  return currentTraits.some(t => newTrait.incompatibleWith!.includes(t));
}

function calculateStatModifiers(
  traitIds: string[],
  birthplace: BirthplaceDefinition,
  familyBackground: FamilyBackground
): Partial<Stats> {
  const modifiers: Partial<Stats> = {};
  
  // Initialize all stats to 0
  const statKeys: (keyof Stats)[] = ['intelligence', 'charisma', 'strength', 'creativity', 'luck', 'health', 'wealth'];
  statKeys.forEach(stat => { modifiers[stat] = 0; });
  
  // Apply birthplace modifiers
  Object.entries(birthplace.modifiers.statModifiers).forEach(([stat, value]) => {
    modifiers[stat as keyof Stats] = (modifiers[stat as keyof Stats] || 0) + value;
  });
  
  // Apply trait modifiers
  traitIds.forEach(traitId => {
    const trait = TRAITS.find(t => t.id === traitId);
    if (trait?.modifiers.statModifiers) {
      Object.entries(trait.modifiers.statModifiers).forEach(([stat, value]) => {
        modifiers[stat as keyof Stats] = (modifiers[stat as keyof Stats] || 0) + value;
      });
    }
  });
  
  // Apply socioeconomic modifiers
  const sesModifiers: Record<SocioeconomicStatus, Partial<Stats>> = {
    wealthy: { wealth: 40, health: 10, intelligence: 5 },
    upper_middle: { wealth: 20, health: 5 },
    middle: { wealth: 0 },
    working_class: { wealth: -10, strength: 5 },
    poor: { wealth: -20, strength: 10, luck: -5 }
  };
  
  const sesStats = sesModifiers[familyBackground.socioeconomicStatus];
  Object.entries(sesStats).forEach(([stat, value]) => {
    modifiers[stat as keyof Stats] = (modifiers[stat as keyof Stats] || 0) + value;
  });
  
  return modifiers;
}

function generateNarrativeContext(
  birthplace: BirthplaceDefinition,
  familyBackground: FamilyBackground,
  era: EraDefinition,
  traits: string[]
): GeneratedBackground['narrativeContext'] {
  // Family story
  let familyStory = '';
  switch (familyBackground.structure) {
    case 'two_parent':
      familyStory = `You're born to ${familyBackground.parentProfessions.primary?.title || 'working'} ${
        familyBackground.parentProfessions.secondary ? `and ${familyBackground.parentProfessions.secondary.title}` : 'parent'
      } in a ${familyBackground.socioeconomicStatus.replace('_', ' ')} household.`;
      break;
    case 'single_parent':
      familyStory = `You're raised by a single ${familyBackground.parentProfessions.primary?.title || 'parent'} who works hard to provide.`;
      break;
    case 'extended_family':
      familyStory = 'You grow up in a bustling household with grandparents and extended family.';
      break;
    case 'adoptive':
      familyStory = 'You\'re lovingly adopted into a family eager to give you opportunities.';
      break;
    case 'foster':
      familyStory = 'You begin life in the foster care system, seeking stability.';
      break;
  }
  
  if (familyBackground.familySize > 0) {
    familyStory += ` You have ${familyBackground.familySize} ${familyBackground.familySize === 1 ? 'sibling' : 'siblings'}.`;
  }
  
  // Environment description
  const environmentDescription = `${birthplace.description} The ${era.name} shape your early experiences with ${
    era.characteristics.technology.level < 5 ? 'limited technology' : 'emerging digital life'
  } and ${era.characteristics.society.values[0].replace('_', ' ')} values.`;
  
  // Cultural context
  let culturalContext = `Growing up ${traits.includes('privileged') ? 'with advantages' : 
    traits.includes('underprivileged') ? 'facing challenges' : 'in modest circumstances'}, `;
  
  if (familyBackground.specialCircumstances && familyBackground.specialCircumstances.length > 0) {
    culturalContext += `your ${familyBackground.specialCircumstances[0].replace('_', ' ')} shapes your worldview. `;
  }
  
  culturalContext += `The ${era.characteristics.society.economicClimate} economy ${
    era.characteristics.society.economicClimate === 'boom' ? 'provides opportunities' : 'creates uncertainty'
  } for your family.`;
  
  return {
    familyStory,
    environmentDescription,
    culturalContext
  };
}

export function generateParentsFromBackground(
  familyBackground: FamilyBackground,
  birthYear: number,
  rng: () => number
): Relationship[] {
  const parents: Relationship[] = [];
  const parentAge = 25 + Math.floor(rng() * 15); // Parents are 25-40 when child is born
  
  if (familyBackground.structure === 'foster') {
    // No permanent parent relationships for foster children initially
    return [];
  }
  
  // Generate primary parent (mother figure)
  if (familyBackground.parentProfessions.primary) {
    const mother = generateParentNPC(
      'female',
      familyBackground.parentProfessions.primary,
      parentAge,
      birthYear,
      rng
    );
    
    parents.push({
      npc: mother,
      relType: 'parent',
      relStats: {
        intimacy: 85 + Math.floor(rng() * 15),
        trust: 90 + Math.floor(rng() * 10),
        attraction: 0,
        conflict: Math.floor(rng() * 15)
      },
      history: [],
      status: 'active'
    });
  }
  
  // Generate secondary parent (father figure) if applicable
  if (familyBackground.structure === 'two_parent' || familyBackground.structure === 'extended_family') {
    const fatherProfession = familyBackground.parentProfessions.secondary || 
                           familyBackground.parentProfessions.primary ||
                           PROFESSIONS[0];
    
    const father = generateParentNPC(
      'male',
      fatherProfession,
      parentAge + Math.floor(rng() * 5),
      birthYear,
      rng
    );
    
    parents.push({
      npc: father,
      relType: 'parent',
      relStats: {
        intimacy: 80 + Math.floor(rng() * 15),
        trust: 85 + Math.floor(rng() * 15),
        attraction: 0,
        conflict: Math.floor(rng() * 20)
      },
      history: [],
      status: 'active'
    });
  }
  
  return parents;
}

function generateParentNPC(
  gender: string,
  profession: ParentProfession,
  age: number,
  childBirthYear: number,
  rng: () => number
): NPC {
  const PARENT_NAMES = {
    male: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles'],
    female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Nancy']
  };
  
  const names = PARENT_NAMES[gender as keyof typeof PARENT_NAMES] || PARENT_NAMES.female;
  const name = names[Math.floor(rng() * names.length)];
  
  // Generate stats based on profession requirements
  const stats: Partial<Stats> = {};
  const baseStats = {
    intelligence: 30 + Math.floor(rng() * 40),
    charisma: 30 + Math.floor(rng() * 40),
    strength: 30 + Math.floor(rng() * 40),
    creativity: 30 + Math.floor(rng() * 40),
    luck: 30 + Math.floor(rng() * 40),
    health: 40 + Math.floor(rng() * 40),
    wealth: 20 + Math.floor(rng() * 60)
  };
  
  // Ensure parent meets profession requirements
  Object.entries(profession.requiredStats).forEach(([stat, minValue]) => {
    stats[stat as keyof Stats] = Math.max(baseStats[stat as keyof Stats], minValue);
  });
  
  // Fill in remaining stats
  Object.entries(baseStats).forEach(([stat, value]) => {
    if (!(stat in stats)) {
      stats[stat as keyof Stats] = value;
    }
  });
  
  return {
    id: `npc_parent_${gender}_${Date.now()}_${Math.floor(rng() * 1000)}`,
    name,
    age: age + (new Date().getFullYear() - childBirthYear),
    gender,
    traits: profession.benefits.knowledge,
    stats
  };
}

export function applyCorrelatedStats(
  childStats: Stats,
  parentStats: Partial<Stats>[],
  rng: () => number
): Stats {
  const correlatedStats = { ...childStats };
  
  STAT_CORRELATIONS.forEach(correlation => {
    // Calculate average parent stat
    const parentValues = parentStats
      .map(p => p[correlation.parentStat])
      .filter(v => v !== undefined) as number[];
    
    if (parentValues.length === 0) return;
    
    const avgParentStat = parentValues.reduce((a, b) => a + b, 0) / parentValues.length;
    
    // Apply correlation
    const inheritedValue = avgParentStat * correlation.correlationStrength;
    const variance = (rng() - 0.5) * correlation.variance * 100;
    
    const currentValue = correlatedStats[correlation.childStat];
    const newValue = Math.round(currentValue + inheritedValue * 0.3 + variance);
    
    // Clamp between 0 and 100
    correlatedStats[correlation.childStat] = Math.max(0, Math.min(100, newValue));
  });
  
  return correlatedStats;
}

// Utility functions
function createSeededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  let x = hash;
  return () => {
    x = Math.sin(x++) * 10000;
    return x - Math.floor(x);
  };
}

function weightedSelect<T extends string>(
  weights: Record<T, number>,
  rng: () => number
): T {
  const entries = Object.entries(weights) as [T, number][];
  const totalWeight = entries.reduce((sum, [_, weight]) => sum + weight, 0);
  
  let roll = rng() * totalWeight;
  for (const [value, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return value;
  }
  
  return entries[0][0]; // Fallback
}