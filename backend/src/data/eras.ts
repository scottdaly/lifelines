import type { EraDefinition } from '../models/procedural.js';

export const ERAS: EraDefinition[] = [
  {
    id: 'era_1980s',
    name: 'The 1980s',
    yearRange: [1980, 1989],
    description: 'The decade of excess, Cold War tensions, and the birth of personal computing',
    characteristics: {
      technology: {
        level: 4,
        availableDevices: ['landline', 'radio', 'television', 'vcr', 'walkman', 'early_computers'],
        communication: ['phone_calls', 'letters', 'face_to_face']
      },
      society: {
        values: ['material_success', 'individualism', 'traditional_family', 'patriotism'],
        majorEvents: ['cold_war', 'reagan_era', 'mtv_launch', 'berlin_wall'],
        economicClimate: 'boom'
      },
      education: {
        style: 'traditional classroom learning with rigid structure',
        accessibility: 7,
        costFactor: 0.8
      }
    },
    eventModifiers: {
      enabledEvents: ['arcade_events', 'mall_events', 'cold_war_events'],
      disabledEvents: ['social_media_events', 'smartphone_events', 'internet_events'],
      eventWeights: {
        'outdoor_play': 1.5,
        'family_time': 1.3,
        'community_events': 1.4
      }
    }
  },
  {
    id: 'era_1990s',
    name: 'The 1990s',
    yearRange: [1990, 1999],
    description: 'The dawn of the internet age and the last decade before smartphones',
    characteristics: {
      technology: {
        level: 6,
        availableDevices: ['computer', 'early_internet', 'cell_phone', 'game_console', 'cd_player'],
        communication: ['email', 'instant_messaging', 'cell_calls', 'pagers']
      },
      society: {
        values: ['optimism', 'globalization', 'diversity', 'tech_enthusiasm'],
        majorEvents: ['fall_of_ussr', 'dot_com_boom', 'y2k_fears', 'clinton_era'],
        economicClimate: 'boom'
      },
      education: {
        style: 'transitioning to include computer literacy',
        accessibility: 8,
        costFactor: 1.0
      }
    },
    eventModifiers: {
      enabledEvents: ['early_internet_events', 'grunge_events', 'mall_culture_events'],
      disabledEvents: ['social_media_events', 'smartphone_events', 'streaming_events'],
      eventWeights: {
        'tech_discovery': 1.5,
        'pop_culture': 1.4,
        'outdoor_play': 1.2
      }
    }
  },
  {
    id: 'era_2000s',
    name: 'The 2000s',
    yearRange: [2000, 2009],
    description: 'Social media emerges, terrorism fears, and the digital revolution accelerates',
    characteristics: {
      technology: {
        level: 7,
        availableDevices: ['computer', 'internet', 'flip_phone', 'ipod', 'digital_camera', 'early_smartphone'],
        communication: ['email', 'texting', 'social_media', 'video_chat']
      },
      society: {
        values: ['connectivity', 'security_consciousness', 'environmental_awareness', 'individual_expression'],
        majorEvents: ['9/11', 'iraq_war', 'social_media_rise', 'housing_crisis'],
        economicClimate: 'recession'
      },
      education: {
        style: 'computer integration with standardized testing focus',
        accessibility: 7,
        costFactor: 1.3
      }
    },
    eventModifiers: {
      enabledEvents: ['social_media_events', 'emo_culture_events', 'online_gaming_events'],
      disabledEvents: ['no_internet_events', 'pre_digital_events'],
      eventWeights: {
        'digital_life': 1.6,
        'security_concerns': 1.3,
        'online_social': 1.4
      }
    }
  },
  {
    id: 'era_2010s',
    name: 'The 2010s',
    yearRange: [2010, 2019],
    description: 'The smartphone era transforms daily life and social interaction',
    characteristics: {
      technology: {
        level: 9,
        availableDevices: ['smartphone', 'tablet', 'laptop', 'smart_tv', 'fitness_tracker', 'streaming'],
        communication: ['texting', 'social_media', 'video_calls', 'messaging_apps']
      },
      society: {
        values: ['social_justice', 'entrepreneurship', 'wellness', 'authenticity'],
        majorEvents: ['arab_spring', 'occupy_movement', 'social_movements', 'trump_era'],
        economicClimate: 'stable'
      },
      education: {
        style: 'digital learning with collaborative focus',
        accessibility: 6,
        costFactor: 1.8
      }
    },
    eventModifiers: {
      enabledEvents: ['social_media_drama', 'gig_economy_events', 'influencer_events'],
      disabledEvents: ['no_tech_events', 'pre_internet_events'],
      eventWeights: {
        'online_life': 2.0,
        'social_pressure': 1.5,
        'mental_health': 1.4
      }
    }
  },
  {
    id: 'era_2020s',
    name: 'The 2020s',
    yearRange: [2020, 2029],
    description: 'Pandemic reshapes society, remote everything, AI emergence',
    characteristics: {
      technology: {
        level: 10,
        availableDevices: ['smartphone', 'vr_headset', 'smart_home', 'ai_assistants', 'wearables'],
        communication: ['video_calls', 'social_media', 'messaging', 'virtual_reality']
      },
      society: {
        values: ['flexibility', 'mental_health_awareness', 'sustainability', 'digital_natives'],
        majorEvents: ['covid_pandemic', 'remote_work_revolution', 'ai_boom', 'climate_crisis'],
        economicClimate: 'recession'
      },
      education: {
        style: 'hybrid and remote learning normalized',
        accessibility: 8,
        costFactor: 2.0
      }
    },
    eventModifiers: {
      enabledEvents: ['pandemic_events', 'remote_events', 'ai_events', 'climate_events'],
      disabledEvents: ['pre_digital_events', 'traditional_only_events'],
      eventWeights: {
        'isolation': 1.6,
        'digital_dependency': 2.0,
        'health_anxiety': 1.5,
        'virtual_social': 1.8
      }
    }
  }
];