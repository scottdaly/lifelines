import type { BirthplaceDefinition } from '../models/procedural.js';

export const BIRTHPLACES: BirthplaceDefinition[] = [
  // Major Cities
  {
    id: 'new_york_city',
    name: 'New York City',
    type: 'major_city',
    population: '8+ million',
    description: 'The city that never sleeps, full of opportunity and chaos',
    modifiers: {
      statModifiers: { intelligence: 5, charisma: 5, wealth: -10 },
      startingTraits: ['urban_native'],
      eventPools: ['city_events', 'diverse_events', 'cultural_events']
    },
    characteristics: {
      costOfLiving: 9,
      educationQuality: 7,
      diversity: 10,
      opportunities: ['arts', 'finance', 'tech', 'fashion', 'media']
    }
  },
  {
    id: 'los_angeles',
    name: 'Los Angeles',
    type: 'major_city',
    population: '4+ million',
    description: 'The entertainment capital with endless summers',
    modifiers: {
      statModifiers: { charisma: 10, creativity: 10, health: 5 },
      startingTraits: ['urban_native'],
      eventPools: ['city_events', 'entertainment_events', 'outdoor_events']
    },
    characteristics: {
      costOfLiving: 8,
      educationQuality: 6,
      diversity: 9,
      opportunities: ['entertainment', 'tech', 'arts', 'sports']
    }
  },
  {
    id: 'chicago',
    name: 'Chicago',
    type: 'major_city',
    population: '2.7+ million',
    description: 'The Windy City, tough but full of heart',
    modifiers: {
      statModifiers: { strength: 5, intelligence: 5, charisma: 5 },
      startingTraits: ['urban_native'],
      eventPools: ['city_events', 'midwest_events', 'weather_events']
    },
    characteristics: {
      costOfLiving: 7,
      educationQuality: 7,
      diversity: 8,
      opportunities: ['business', 'arts', 'sports', 'education']
    }
  },

  // Small Towns
  {
    id: 'small_town_midwest',
    name: 'Small Town, Midwest',
    type: 'small_town',
    population: '5,000-25,000',
    description: 'Where everybody knows your name and traditions run deep',
    modifiers: {
      statModifiers: { health: 10, strength: 5, wealth: 5 },
      startingTraits: [],
      eventPools: ['small_town_events', 'community_events', 'traditional_events']
    },
    characteristics: {
      costOfLiving: 3,
      educationQuality: 5,
      diversity: 3,
      opportunities: ['agriculture', 'small_business', 'community_service']
    }
  },
  {
    id: 'small_town_south',
    name: 'Small Town, South',
    type: 'small_town',
    population: '5,000-25,000',
    description: 'Southern hospitality and close-knit community values',
    modifiers: {
      statModifiers: { charisma: 10, health: 5, creativity: 5 },
      startingTraits: [],
      eventPools: ['small_town_events', 'southern_events', 'religious_events']
    },
    characteristics: {
      costOfLiving: 2,
      educationQuality: 4,
      diversity: 4,
      opportunities: ['agriculture', 'hospitality', 'small_business']
    }
  },
  {
    id: 'small_town_new_england',
    name: 'Small Town, New England',
    type: 'small_town',
    population: '5,000-25,000',
    description: 'Historic charm with four distinct seasons',
    modifiers: {
      statModifiers: { intelligence: 10, health: 5, creativity: 5 },
      startingTraits: [],
      eventPools: ['small_town_events', 'academic_events', 'seasonal_events']
    },
    characteristics: {
      costOfLiving: 5,
      educationQuality: 8,
      diversity: 4,
      opportunities: ['education', 'tourism', 'crafts', 'small_business']
    }
  },

  // Rural Areas
  {
    id: 'rural_farm',
    name: 'Rural Farm',
    type: 'rural',
    population: '<5,000',
    description: 'Wide open spaces and hard-working values',
    modifiers: {
      statModifiers: { strength: 15, health: 15, intelligence: -5 },
      startingTraits: ['rural_native'],
      eventPools: ['rural_events', 'farm_events', 'nature_events']
    },
    characteristics: {
      costOfLiving: 1,
      educationQuality: 3,
      diversity: 2,
      opportunities: ['agriculture', 'livestock', 'outdoor_work']
    }
  },
  {
    id: 'rural_mountain',
    name: 'Mountain Community',
    type: 'rural',
    population: '<5,000',
    description: 'Isolated beauty and self-reliant living',
    modifiers: {
      statModifiers: { strength: 10, health: 10, creativity: 10, wealth: -10 },
      startingTraits: ['rural_native'],
      eventPools: ['rural_events', 'outdoor_events', 'isolation_events']
    },
    characteristics: {
      costOfLiving: 2,
      educationQuality: 3,
      diversity: 2,
      opportunities: ['outdoor_recreation', 'crafts', 'tourism', 'forestry']
    }
  },

  // Suburbs
  {
    id: 'wealthy_suburb',
    name: 'Wealthy Suburb',
    type: 'suburb',
    population: '25,000-100,000',
    description: 'Manicured lawns and excellent schools',
    modifiers: {
      statModifiers: { intelligence: 10, wealth: 20, health: 5 },
      startingTraits: ['privileged'],
      eventPools: ['suburb_events', 'privileged_events', 'academic_events']
    },
    characteristics: {
      costOfLiving: 8,
      educationQuality: 9,
      diversity: 5,
      opportunities: ['education', 'professional', 'networking']
    }
  },
  {
    id: 'middle_class_suburb',
    name: 'Suburban Neighborhood',
    type: 'suburb',
    population: '25,000-100,000',
    description: 'The American Dream in a cul-de-sac',
    modifiers: {
      statModifiers: { intelligence: 5, charisma: 5, health: 5 },
      startingTraits: [],
      eventPools: ['suburb_events', 'family_events', 'school_events']
    },
    characteristics: {
      costOfLiving: 5,
      educationQuality: 6,
      diversity: 6,
      opportunities: ['education', 'sports', 'community', 'retail']
    }
  },
  {
    id: 'working_class_suburb',
    name: 'Working Class Suburb',
    type: 'suburb',
    population: '25,000-100,000',
    description: 'Blue collar values in a changing world',
    modifiers: {
      statModifiers: { strength: 10, health: 5, wealth: -5 },
      startingTraits: [],
      eventPools: ['suburb_events', 'working_class_events', 'community_events']
    },
    characteristics: {
      costOfLiving: 4,
      educationQuality: 5,
      diversity: 7,
      opportunities: ['trades', 'service', 'community', 'small_business']
    }
  },

  // Special/International
  {
    id: 'military_base',
    name: 'Military Base',
    type: 'small_town',
    population: 'Varies',
    description: 'A transient life of discipline and service',
    modifiers: {
      statModifiers: { strength: 10, health: 10, intelligence: 5, charisma: -5 },
      startingTraits: [],
      eventPools: ['military_events', 'moving_events', 'discipline_events']
    },
    characteristics: {
      costOfLiving: 3,
      educationQuality: 6,
      diversity: 8,
      opportunities: ['military', 'athletics', 'leadership', 'travel']
    }
  }
];