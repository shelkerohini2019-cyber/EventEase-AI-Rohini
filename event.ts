export type EventType = 'wedding' | 'birthday' | 'anniversary' | 'community';

export type RSVPStatus = 'attending' | 'declined' | 'pending' | 'maybe';

export interface GuestItem {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  rsvpStatus: RSVPStatus;
  plusOnes: number;
  dietaryRequirement: string; // e.g. "None", "Vegetarian", "Vegan", "Gluten-Free", "Nut Allergy", "Halal"
  tableNumber?: string;
  group: 'family' | 'friends' | 'vip' | 'colleagues' | 'neighbors' | 'other';
  notes?: string;
}

export interface ColorPaletteItem {
  name: string;
  hex: string;
  role: string; // e.g. "Primary", "Accent", "Base", "Highlight"
}

export interface DecorIdea {
  title: string;
  description: string;
  area: string; // e.g., "Entrance & Welcome", "Tables & Centerpieces", "Stage / Focal Point", "Lighting"
  budgetFriendlyTip: string;
}

export interface FoodSuggestions {
  appetizers: string[];
  mainCourses: string[];
  desserts: string[];
  drinks: string[];
  dietaryTips: string;
}

export interface PlanningTip {
  category: string;
  tip: string;
  priority: 'high' | 'medium' | 'pro';
}

export interface ScheduleItem {
  time: string;
  activity: string;
  description: string;
}

export interface PersonalizedIdea {
  title: string;
  category: 'decor' | 'entertainment' | 'food' | 'favors' | 'moment';
  idea: string;
  whyItWorks: string;
}

export interface AIEventPlan {
  themeTitle: string;
  tagline: string;
  conceptDescription: string;
  colorPalette: ColorPaletteItem[];
  decorIdeas: DecorIdea[];
  foodSuggestions: FoodSuggestions;
  planningTips: PlanningTip[];
  scheduleFlow: ScheduleItem[];
  personalizedIdeas: PersonalizedIdea[];
  isAIGenerated: boolean;
  generatedAt: string;
  source: 'live_gemini' | 'demo_mode';
}

export interface BudgetLineItem {
  id: string;
  name: string;
  estimatedCost: number;
  actualCost: number;
  status: 'pending' | 'quoted' | 'booked' | 'paid';
  notes?: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  percentage: number; // default allocation %
  allocatedAmount: number;
  items: BudgetLineItem[];
}

export interface TimelineMilestone {
  id: string;
  phase: '6_plus_months' | '3_to_6_months' | '1_to_2_months' | '2_to_4_weeks' | 'week_of' | 'event_day' | 'post_event';
  phaseLabel: string;
  title: string;
  description: string;
  targetDaysBefore: number; // days before event
  calculatedDate?: string;
  isCompleted: boolean;
  category: string;
  isCustom?: boolean;
}

export type VendorCategoryType = 'caterer' | 'decorator' | 'photographer' | 'venue' | 'entertainment' | 'logistics' | 'other';
export type VendorStatus = 'not_started' | 'contacted' | 'shortlisted' | 'booked' | 'completed';

export interface VendorTask {
  id: string;
  category: VendorCategoryType;
  categoryLabel: string;
  task: string;
  vendorName?: string;
  contactInfo?: string;
  quoteAmount?: number;
  status: VendorStatus;
  notes?: string;
  isCompleted: boolean;
}

export interface EventData {
  id: string;
  name: string;
  eventType: EventType;
  subtype?: string;
  date: string; // YYYY-MM-DD
  time?: string;
  location: string;
  locationType: 'indoor' | 'outdoor' | 'hybrid' | 'destination';
  guestCount: number;
  totalBudget: number;
  currency: string;
  vibePreference: string;
  specialNotes?: string;
  createdAt: string;
  updatedAt: string;

  // Embedded modules
  plan?: AIEventPlan;
  budgetCategories: BudgetCategory[];
  timeline: TimelineMilestone[];
  vendors: VendorTask[];
  guests: GuestItem[];
}
