/**
 * CONVERSATIONAL ONBOARDING ORCHESTRATOR
 * 
 * Manages conversational flow, adaptive skipping, and data extraction
 */

export interface OnboardingQuestion {
  id: string;
  type: 'postcode' | 'homeType' | 'occupants' | 'heatingType' | 'supplier' | 'tariff' | 'usage' | 'smartMeter' | 'photo';
  message: string;
  secondaryMessage?: string;
  skippable: boolean;
  options?: Array<{
    value: string;
    label: string;
    description?: string;
    icon?: string;
  }>;
  extractableFrom?: Array<'bill' | 'photo' | 'meter'>;
}

export interface OnboardingState {
  currentQuestion: number;
  answers: Record<string, any>;
  skippedQuestions: string[];
  extractedData: Record<string, any>;
  conversationHistory: Array<{
    type: 'assistant' | 'user';
    message: string;
    timestamp: number;
  }>;
}

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'welcome',
    type: 'postcode',
    message: "Hi! I'm here to help you save money on energy. Let's get started! 👋",
    secondaryMessage: "First up — what's your postcode? (e.g., SW1A 1AA)",
    skippable: false,
    extractableFrom: ['bill'],
  },
  {
    id: 'smartMeterPhoto',
    type: 'photo',
    message: "Great! Want to speed things up?",
    secondaryMessage: "Upload your energy bill or smart meter photo, and I'll extract the details automatically.",
    skippable: true,
    extractableFrom: [],
  },
  {
    id: 'homeType',
    type: 'homeType',
    message: "Perfect! Now let me learn about your home.",
    secondaryMessage: "What type of home do you live in?",
    skippable: false,
    options: [
      { value: 'flat', label: 'Flat', description: 'Apartment or flat', icon: '🏢' },
      { value: 'terraced', label: 'Terraced', description: 'Attached on both sides', icon: '🏘️' },
      { value: 'semi-detached', label: 'Semi-Detached', description: 'Attached on one side', icon: '🏠' },
      { value: 'detached', label: 'Detached', description: 'Standalone house', icon: '🏡' },
    ],
    extractableFrom: [],
  },
  {
    id: 'occupants',
    type: 'occupants',
    message: "Nice! That gives us a good baseline.",
    secondaryMessage: "How many people live in your home?",
    skippable: true,
    extractableFrom: [],
  },
  {
    id: 'heatingType',
    type: 'heatingType',
    message: "Perfect!",
    secondaryMessage: "What type of heating do you have?",
    skippable: true,
    options: [
      { value: 'gas', label: 'Gas', description: 'Gas boiler', icon: '🔥' },
      { value: 'electricity', label: 'Electric', description: 'Electric heating', icon: '⚡' },
      { value: 'heat-pump', label: 'Heat Pump', description: 'Air/ground source', icon: '♨️' },
      { value: 'mixed', label: 'Mixed', description: 'Gas + electric', icon: '🔄' },
    ],
    extractableFrom: ['bill'],
  },
  {
    id: 'supplier',
    type: 'supplier',
    message: "Great! Now let's look at your current energy setup.",
    secondaryMessage: "Who's your current energy supplier?",
    skippable: true,
    extractableFrom: ['bill', 'photo'],
  },
  {
    id: 'tariff',
    type: 'tariff',
    message: "Got it!",
    secondaryMessage: "Do you know your tariff name? (You can skip if unsure)",
    skippable: true,
    extractableFrom: ['bill', 'photo'],
  },
  {
    id: 'complete',
    type: 'smartMeter',
    message: "All done! 🎉",
    secondaryMessage: "Let me prepare your personalized dashboard...",
    skippable: false,
  },
];

export class ConversationalOnboardingManager {
    /**
     * Move to previous question
     */
    goToPreviousQuestion() {
      this.state.currentQuestion = Math.max(0, this.state.currentQuestion - 1);
    }

    /**
     * Move to next question
     */
    goToNextQuestion() {
      this.state.currentQuestion = Math.min(this.state.currentQuestion + 1, ONBOARDING_QUESTIONS.length - 1);
    }
  private state: OnboardingState;

  constructor(initialState?: Partial<OnboardingState>) {
    this.state = {
      currentQuestion: 0,
      answers: {},
      skippedQuestions: [],
      extractedData: {},
      conversationHistory: [],
      ...initialState,
    };
  }

  /**
   * Get current question, auto-skip if answer already exists
   */
  getCurrentQuestion(): OnboardingQuestion | null {
    while (this.state.currentQuestion < ONBOARDING_QUESTIONS.length) {
      const question = ONBOARDING_QUESTIONS[this.state.currentQuestion];
      
      // Skip if answer already exists (from extraction or previous answer)
      if (this.shouldSkipQuestion(question)) {
        this.state.currentQuestion++;
        continue;
      }

      return question;
    }

    return null; // All questions answered
  }

  /**
   * Check if question should be auto-skipped
   */
  private shouldSkipQuestion(question: OnboardingQuestion): boolean {
    const answerId = question.id;
    
    // Has user answer?
    if (this.state.answers[answerId] !== undefined) {
      return true;
    }

    // Has extracted data?
    if (this.state.extractedData[answerId] !== undefined) {
      this.state.answers[answerId] = this.state.extractedData[answerId];
      return true;
    }

    return false;
  }

  /**
   * Record answer and move to next question
   */
  answerQuestion(questionId: string, answer: any) {
    this.state.answers[questionId] = answer;
    
    // Add to conversation history
    const question = ONBOARDING_QUESTIONS.find(q => q.id === questionId);
    if (question && question.options) {
      const option = question.options.find(opt => opt.value === answer);
      if (option) {
        this.state.conversationHistory.push({
          type: 'user',
          message: option.label,
          timestamp: Date.now(),
        });
      }
    }

    this.state.currentQuestion++;
  }

  /**
   * Skip current question
   */
  skipQuestion() {
    const question = this.getCurrentQuestion();
    if (question && question.skippable) {
      this.state.skippedQuestions.push(question.id);
      this.state.currentQuestion++;
    }
  }

  /**
   * Process extracted data from photo/bill upload
   */
  processExtractedData(data: Record<string, any>) {
    this.state.extractedData = { ...this.state.extractedData, ...data };
    
    // Auto-fill answers from extracted data
    Object.keys(data).forEach(key => {
      if (this.state.answers[key] === undefined) {
        this.state.answers[key] = data[key];
      }
    });
  }

  /**
   * Get completion percentage
   */
  getProgress(): number {
    const totalQuestions = ONBOARDING_QUESTIONS.length;
    const answeredCount = Object.keys(this.state.answers).length;
    return Math.round((answeredCount / totalQuestions) * 100);
  }

  /**
   * Get all answers (for saving)
   */
  getAnswers() {
    return { ...this.state.answers };
  }

  /**
   * Get questions that can be completed later
   */
  getSkippedQuestions(): OnboardingQuestion[] {
    return ONBOARDING_QUESTIONS.filter(q => 
      this.state.skippedQuestions.includes(q.id)
    );
  }

  /**
   * Check if onboarding is complete (essential questions answered)
   */
  isComplete(): boolean {
    const essentialQuestions = ONBOARDING_QUESTIONS.filter(q => !q.skippable);
    return essentialQuestions.every(q => 
      this.state.answers[q.id] !== undefined
    );
  }

  /**
   * Get state (for persistence)
   */
  getState(): OnboardingState {
    return { ...this.state };
  }

  /**
   * Add to conversation history
   */
  addMessage(type: 'assistant' | 'user', message: string) {
    this.state.conversationHistory.push({
      type,
      message,
      timestamp: Date.now(),
    });
  }
}
