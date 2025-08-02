import type { ParentProfession } from '../models/procedural.js';

export const PROFESSIONS: ParentProfession[] = [
  // Wealthy Professions
  {
    id: 'doctor',
    title: 'Doctor',
    requiredStats: { intelligence: 80, charisma: 50 },
    socioeconomicStatus: 'wealthy',
    benefits: {
      connections: ['medical', 'healthcare', 'hospital'],
      knowledge: ['health', 'biology', 'medicine'],
      opportunities: ['medical_mentorship', 'health_awareness', 'college_prep']
    }
  },
  {
    id: 'lawyer',
    title: 'Lawyer',
    requiredStats: { intelligence: 75, charisma: 70 },
    socioeconomicStatus: 'wealthy',
    benefits: {
      connections: ['legal', 'government', 'business'],
      knowledge: ['law', 'debate', 'critical_thinking'],
      opportunities: ['debate_club', 'internships', 'ivy_league_prep']
    }
  },
  {
    id: 'ceo',
    title: 'CEO',
    requiredStats: { intelligence: 70, charisma: 80, wealth: 70 },
    socioeconomicStatus: 'wealthy',
    benefits: {
      connections: ['business', 'executive', 'investor'],
      knowledge: ['business', 'leadership', 'strategy'],
      opportunities: ['business_mentorship', 'networking', 'entrepreneurship']
    }
  },

  // Upper Middle Class
  {
    id: 'engineer',
    title: 'Engineer',
    requiredStats: { intelligence: 75, creativity: 50 },
    socioeconomicStatus: 'upper_middle',
    benefits: {
      connections: ['tech', 'engineering', 'innovation'],
      knowledge: ['math', 'science', 'problem_solving'],
      opportunities: ['stem_programs', 'robotics', 'science_fairs']
    }
  },
  {
    id: 'professor',
    title: 'Professor',
    requiredStats: { intelligence: 80, charisma: 40 },
    socioeconomicStatus: 'upper_middle',
    benefits: {
      connections: ['academic', 'research', 'university'],
      knowledge: ['research', 'critical_thinking', 'specialized_field'],
      opportunities: ['academic_enrichment', 'library_access', 'intellectual_culture']
    }
  },
  {
    id: 'small_business_owner',
    title: 'Small Business Owner',
    requiredStats: { charisma: 60, creativity: 60 },
    socioeconomicStatus: 'upper_middle',
    benefits: {
      connections: ['local_business', 'community', 'chamber_of_commerce'],
      knowledge: ['entrepreneurship', 'customer_service', 'finance'],
      opportunities: ['work_experience', 'business_skills', 'community_involvement']
    }
  },

  // Middle Class
  {
    id: 'teacher',
    title: 'Teacher',
    requiredStats: { intelligence: 60, charisma: 60 },
    socioeconomicStatus: 'middle',
    benefits: {
      connections: ['education', 'school', 'pta'],
      knowledge: ['education', 'child_development', 'subject_expertise'],
      opportunities: ['educational_support', 'homework_help', 'school_connections']
    }
  },
  {
    id: 'nurse',
    title: 'Nurse',
    requiredStats: { charisma: 60, health: 60 },
    socioeconomicStatus: 'middle',
    benefits: {
      connections: ['healthcare', 'hospital', 'medical'],
      knowledge: ['health', 'caregiving', 'medical_basics'],
      opportunities: ['health_awareness', 'caregiving_skills', 'medical_interest']
    }
  },
  {
    id: 'accountant',
    title: 'Accountant',
    requiredStats: { intelligence: 65 },
    socioeconomicStatus: 'middle',
    benefits: {
      connections: ['finance', 'business', 'tax'],
      knowledge: ['math', 'finance', 'organization'],
      opportunities: ['financial_literacy', 'math_skills', 'business_basics']
    }
  },
  {
    id: 'police_officer',
    title: 'Police Officer',
    requiredStats: { strength: 60, charisma: 50 },
    socioeconomicStatus: 'middle',
    benefits: {
      connections: ['law_enforcement', 'community', 'safety'],
      knowledge: ['law', 'safety', 'community_service'],
      opportunities: ['discipline', 'physical_fitness', 'community_service']
    }
  },

  // Working Class
  {
    id: 'mechanic',
    title: 'Mechanic',
    requiredStats: { strength: 60, intelligence: 40 },
    socioeconomicStatus: 'working_class',
    benefits: {
      connections: ['automotive', 'trades', 'local_business'],
      knowledge: ['mechanical', 'problem_solving', 'hands_on'],
      opportunities: ['practical_skills', 'work_ethic', 'trade_apprenticeship']
    }
  },
  {
    id: 'construction_worker',
    title: 'Construction Worker',
    requiredStats: { strength: 70 },
    socioeconomicStatus: 'working_class',
    benefits: {
      connections: ['construction', 'trades', 'union'],
      knowledge: ['building', 'physical_work', 'teamwork'],
      opportunities: ['physical_development', 'work_ethic', 'trade_skills']
    }
  },
  {
    id: 'retail_manager',
    title: 'Retail Manager',
    requiredStats: { charisma: 55 },
    socioeconomicStatus: 'working_class',
    benefits: {
      connections: ['retail', 'customer_service', 'local_business'],
      knowledge: ['sales', 'customer_service', 'inventory'],
      opportunities: ['people_skills', 'work_experience', 'responsibility']
    }
  },
  {
    id: 'factory_worker',
    title: 'Factory Worker',
    requiredStats: { strength: 50 },
    socioeconomicStatus: 'working_class',
    benefits: {
      connections: ['manufacturing', 'union', 'blue_collar'],
      knowledge: ['production', 'teamwork', 'routine'],
      opportunities: ['work_ethic', 'stability', 'union_benefits']
    }
  },

  // Poor/Struggling
  {
    id: 'unemployed',
    title: 'Unemployed',
    requiredStats: {},
    socioeconomicStatus: 'poor',
    benefits: {
      connections: ['community_support', 'social_services'],
      knowledge: ['survival', 'resourcefulness'],
      opportunities: ['resilience', 'community_support', 'government_programs']
    }
  },
  {
    id: 'minimum_wage_worker',
    title: 'Service Worker',
    requiredStats: {},
    socioeconomicStatus: 'poor',
    benefits: {
      connections: ['service_industry', 'community'],
      knowledge: ['customer_service', 'multitasking', 'persistence'],
      opportunities: ['work_ethic', 'people_skills', 'hustle']
    }
  },

  // Creative/Alternative
  {
    id: 'artist',
    title: 'Artist',
    requiredStats: { creativity: 80 },
    socioeconomicStatus: 'working_class',
    benefits: {
      connections: ['art_community', 'galleries', 'creative'],
      knowledge: ['art', 'creativity', 'self_expression'],
      opportunities: ['creative_development', 'artistic_exposure', 'unconventional_thinking']
    }
  },
  {
    id: 'musician',
    title: 'Musician',
    requiredStats: { creativity: 75, charisma: 60 },
    socioeconomicStatus: 'working_class',
    benefits: {
      connections: ['music_industry', 'performers', 'venues'],
      knowledge: ['music', 'performance', 'creativity'],
      opportunities: ['musical_training', 'performance_skills', 'artistic_expression']
    }
  },

  // Military
  {
    id: 'military_officer',
    title: 'Military Officer',
    requiredStats: { strength: 60, intelligence: 60, charisma: 50 },
    socioeconomicStatus: 'middle',
    benefits: {
      connections: ['military', 'government', 'veterans'],
      knowledge: ['leadership', 'discipline', 'strategy'],
      opportunities: ['discipline', 'leadership_training', 'travel', 'military_benefits']
    }
  }
];