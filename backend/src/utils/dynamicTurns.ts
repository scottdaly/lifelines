import type { GameState, DynamicTurnContext, StageConfig, LifeEvent } from '../models/types.js';
import { getStageConfig } from './stageUtils.js';
import { STAGES } from '../models/types.js';

export class DynamicTurnCalculator {
  private gameState: GameState;
  private stageConfig: StageConfig;
  
  constructor(gameState: GameState) {
    if (!gameState || !gameState.character || !gameState.character.dob) {
      throw new Error('Invalid game state provided to DynamicTurnCalculator');
    }
    this.gameState = gameState;
    this.stageConfig = getStageConfig(gameState);
  }
  
  calculateNextTurn(): DynamicTurnContext {
    const currentAge = this.getCurrentAge();
    const recentEvents = this.getRecentEvents();
    const narrativePressure = this.calculateNarrativePressure(recentEvents);
    
    // Special handling for early life stages with time block progression
    if (currentAge === 0) {
      // If starting game, check for special early life choice
      if (this.gameState.events.length === 0 && !this.gameState.timeBlockAllocations) {
        // This is the very first turn - let LLM generate early life choices
        return {
          isMilestone: false,
          isSubTurn: false,
          subTurnName: undefined,
          yearsProgressed: 0, // Don't progress time on first turn
          narrativePressure: 0,
          triggeredBy: 'early_life_start'
        };
      }
      // Time blocks allocated or game has started, progress to age 8
      return {
        isMilestone: false,
        isSubTurn: false,
        subTurnName: undefined,
        yearsProgressed: 8, // Jump straight to age 8
        narrativePressure: 0,
        triggeredBy: undefined
      };
    } else if (currentAge === 8) {
      // Progress from 8 to 12
      return {
        isMilestone: true, // Age 8 is a milestone
        isSubTurn: false,
        subTurnName: undefined,
        yearsProgressed: 4,
        narrativePressure: 0,
        triggeredBy: undefined
      };
    }
    
    // Normal turn calculation for ages 12+
    // Check if we're at a milestone age
    const isMilestone = this.isAtMilestone(currentAge);
    
    // Check if we should trigger a sub-turn
    const subTurnTrigger = this.checkSubTurnTriggers(recentEvents);
    
    // Calculate years to progress
    let yearsProgressed = this.calculateYearsToProgress(
      isMilestone,
      subTurnTrigger,
      narrativePressure
    );
    
    // Ensure we don't skip milestones
    yearsProgressed = this.enforceNextMilestone(currentAge, yearsProgressed);
    
    return {
      isMilestone,
      isSubTurn: !!subTurnTrigger,
      subTurnName: subTurnTrigger?.subTurnName,
      yearsProgressed,
      narrativePressure,
      triggeredBy: subTurnTrigger?.triggeredBy
    };
  }
  
  private getCurrentAge(): number {
    return this.gameState.currentYear - parseInt(this.gameState.character.dob.split('-')[0]);
  }
  
  private getRecentEvents(): LifeEvent[] {
    // Get events from the last 5 years
    const fiveYearsAgo = this.gameState.currentYear - 5;
    return this.gameState.events.filter(e => e.year >= fiveYearsAgo);
  }
  
  private calculateNarrativePressure(recentEvents: LifeEvent[]): number {
    // Start with base pressure based on event density
    let pressure = this.gameState.narrativePressure || 0;
    
    // Increase pressure if few significant events recently
    const significantEvents = recentEvents.filter(e => 
      e.statChanges && Object.values(e.statChanges).some(d => Math.abs(d) >= 10)
    );
    
    if (significantEvents.length === 0) {
      pressure += 0.2;
    } else if (significantEvents.length < 2) {
      pressure += 0.1;
    }
    
    // Adjust based on stage event density
    switch (this.stageConfig.eventDensity) {
      case 'sparse':
        pressure *= 0.7;
        break;
      case 'dense':
        pressure *= 1.3;
        break;
    }
    
    // Add randomness
    pressure += (Math.random() - 0.5) * 0.2;
    
    return Math.max(0, Math.min(1, pressure));
  }
  
  private isAtMilestone(currentAge: number): boolean {
    // Check stage-specific milestones
    if (this.stageConfig.milestoneAges?.includes(currentAge)) {
      return true;
    }
    
    // Check global milestones
    const globalMilestones = [8, 12, 13, 16, 18, 21, 30, 40, 50, 65, 70, 80];
    return globalMilestones.includes(currentAge);
  }
  
  private checkSubTurnTriggers(recentEvents: LifeEvent[]): { 
    subTurnName: string; 
    triggeredBy: string;
  } | null {
    if (!this.stageConfig.dynamicSubTurnTriggers) return null;
    
    // Check recent events for trigger tags
    for (const event of recentEvents) {
      if (event.tags) {
        for (const tag of event.tags) {
          if (this.stageConfig.dynamicSubTurnTriggers.includes(tag)) {
            return {
              subTurnName: this.generateSubTurnName(tag),
              triggeredBy: tag
            };
          }
        }
      }
    }
    
    return null;
  }
  
  private generateSubTurnName(triggerTag: string): string {
    const subTurnNames: Record<string, string[]> = {
      // Early Life (0-8)
      'major_childhood_event': ['Building Up', 'The Moment', 'Looking Back'],
      'family_crisis': ['Crisis Unfolds', 'Dealing With It', 'Aftermath'],
      'formative_moment': ['Before', 'During', 'After'],
      'health_scare': ['Emergency', 'Hospital Stay', 'Recovery'],
      'first_day_school': ['First Week', 'Settling In', 'New Routines'],
      
      // Tween
      'first_crush': ['Butterflies', 'Getting to Know Them', 'What Happens Next'],
      'major_conflict': ['Tensions Rise', 'Confrontation', 'Resolution'],
      'identity_moment': ['Questioning', 'Exploring', 'Finding Yourself'],
      'school_transition': ['Last Days', 'The Change', 'New Beginning'],
      'friendship_drama': ['Tensions Build', 'The Fallout', 'Moving Forward'],
      
      // High School
      'relationship_start': ['Early Days', 'Getting Closer', 'Defining Moments'],
      'college_prep': ['Applications', 'Waiting', 'Decisions'],
      'major_decision': ['Weighing Options', 'Making the Choice', 'Living With It'],
      
      // Young Adult
      'graduation': ['Final Semester', 'Graduation Day', 'Next Steps'],
      'first_job': ['First Day', 'Learning Period', 'Finding Your Place'],
      'engagement': ['The Proposal', 'Planning', 'Big Day Approaches'],
      'career_change': ['Contemplating', 'Making the Leap', 'New Beginning'],
      
      // Adult
      'marriage': ['Wedding Day', 'Honeymoon', 'Settling In'],
      'childbirth': ['Pregnancy', 'Birth', 'First Months'],
      'divorce': ['Growing Apart', 'The Decision', 'Moving On'],
      'career_milestone': ['Building Up', 'Achievement', 'What\'s Next'],
      'loss': ['The News', 'Grieving', 'Moving Forward'],
      
      // Senior
      'retirement': ['Final Year', 'Retirement Day', 'New Chapter'],
      'grandchild': ['Announcement', 'Birth', 'Bonding'],
      'health_crisis': ['Diagnosis', 'Treatment', 'Recovery'],
      'loss_of_spouse': ['Final Days', 'Saying Goodbye', 'Life After']
    };
    
    const names = subTurnNames[triggerTag] || ['Beginning', 'Middle', 'Resolution'];
    const subIndex = this.gameState.stageLocalIndex % names.length;
    return names[subIndex];
  }
  
  private calculateYearsToProgress(
    isMilestone: boolean,
    subTurnTrigger: any,
    narrativePressure: number
  ): number {
    // Milestones always advance by 1 year
    if (isMilestone) return 1;
    
    // Sub-turns don't advance years
    if (subTurnTrigger && this.gameState.stageLocalIndex < 2) return 0;
    
    // Base turn span
    let years = this.stageConfig.turnSpan;
    
    // Apply variance
    if (this.stageConfig.turnSpanVariance) {
      const variance = Math.floor(
        (Math.random() - 0.5) * 2 * this.stageConfig.turnSpanVariance
      );
      years += variance;
    }
    
    // High narrative pressure can shorten turns
    if (narrativePressure > 0.7) {
      years = Math.max(1, years - 1);
    }
    
    // Ensure minimum of 1 year
    return Math.max(1, years);
  }
  
  private enforceNextMilestone(currentAge: number, proposedYears: number): number {
    const targetAge = currentAge + proposedYears;
    
    // Find all milestones between current and target age
    const allMilestones = [
      ...(this.stageConfig.milestoneAges || []),
      8, 12, 13, 16, 18, 21, 30, 40, 50, 65, 70, 80
    ].filter((age, index, self) => self.indexOf(age) === index); // Remove duplicates
    
    const upcomingMilestones = allMilestones.filter(
      age => age > currentAge && age <= targetAge
    ).sort((a, b) => a - b);
    
    // If we would skip a milestone, stop at the first one
    if (upcomingMilestones.length > 0) {
      return upcomingMilestones[0] - currentAge;
    }
    
    return proposedYears;
  }
  
}

export function shouldTriggerSubTurn(event: LifeEvent, stageConfig: StageConfig): boolean {
  if (!stageConfig.dynamicSubTurnTriggers || !event.tags) return false;
  
  return event.tags.some(tag => stageConfig.dynamicSubTurnTriggers!.includes(tag));
}