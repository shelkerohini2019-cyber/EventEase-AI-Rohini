import { BudgetCategory, EventType, GuestItem, TimelineMilestone, VendorTask } from '../types/event';

export const DEFAULT_BUDGET_PERCENTAGES: Record<EventType, { id: string; name: string; percentage: number; icon: string }[]> = {
  wedding: [
    { id: 'venue', name: 'Venue & Reception', percentage: 35, icon: 'Castle' },
    { id: 'food', name: 'Catering & Beverages', percentage: 30, icon: 'Utensils' },
    { id: 'decoration', name: 'Decoration & Florals', percentage: 12, icon: 'Sparkles' },
    { id: 'photography', name: 'Photography & Video', percentage: 10, icon: 'Camera' },
    { id: 'entertainment', name: 'Music & Entertainment', percentage: 8, icon: 'Music' },
    { id: 'miscellaneous', name: 'Attire, Stationery & Contingency', percentage: 5, icon: 'ShoppingBag' },
  ],
  birthday: [
    { id: 'food', name: 'Food, Drinks & Cake', percentage: 35, icon: 'Cake' },
    { id: 'venue', name: 'Venue & Space Rental', percentage: 25, icon: 'Building' },
    { id: 'entertainment', name: 'Entertainment & Activities', percentage: 15, icon: 'Smile' },
    { id: 'decoration', name: 'Balloons, Lighting & Decor', percentage: 15, icon: 'Sparkles' },
    { id: 'photography', name: 'Photography & Photo Booth', percentage: 5, icon: 'Camera' },
    { id: 'miscellaneous', name: 'Favors, Invites & Extras', percentage: 5, icon: 'Gift' },
  ],
  anniversary: [
    { id: 'food', name: 'Fine Dining & Champagne', percentage: 35, icon: 'Utensils' },
    { id: 'venue', name: 'Private Room & Venue', percentage: 30, icon: 'Building' },
    { id: 'decoration', name: 'Floral Arrangements & Lighting', percentage: 15, icon: 'Sparkles' },
    { id: 'photography', name: 'Portrait & Retrospective Video', percentage: 10, icon: 'Camera' },
    { id: 'entertainment', name: 'Acoustic Jazz & Audiovisual', percentage: 5, icon: 'Music' },
    { id: 'miscellaneous', name: 'Favors, Monograms & Gifts', percentage: 5, icon: 'Gift' },
  ],
  community: [
    { id: 'venue', name: 'Permits, Park & Venue Rental', percentage: 25, icon: 'Tent' },
    { id: 'food', name: 'Community Meals & Refreshments', percentage: 25, icon: 'UtensilsCrossed' },
    { id: 'entertainment', name: 'Sound, Stage & Performers', percentage: 20, icon: 'Mic' },
    { id: 'decoration', name: 'Signage, Tents & Decor', percentage: 15, icon: 'Flag' },
    { id: 'photography', name: 'Community Coverage & Media', percentage: 5, icon: 'Camera' },
    { id: 'miscellaneous', name: 'Safety, First Aid & Supplies', percentage: 10, icon: 'ShieldAlert' },
  ],
};

export function createDefaultBudgetCategories(eventType: EventType, totalBudget: number): BudgetCategory[] {
  const templates = DEFAULT_BUDGET_PERCENTAGES[eventType] || DEFAULT_BUDGET_PERCENTAGES.wedding;
  return templates.map((cat) => {
    const allocated = Math.round((totalBudget * cat.percentage) / 100);
    const sampleItems = getCategoryDefaultItems(eventType, cat.id, allocated);
    return {
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      percentage: cat.percentage,
      allocatedAmount: allocated,
      items: sampleItems,
    };
  });
}

function getCategoryDefaultItems(eventType: EventType, categoryId: string, allocated: number) {
  if (categoryId === 'venue') {
    return [
      { id: 'v-1', name: 'Main Venue Rental', estimatedCost: Math.round(allocated * 0.8), actualCost: 0, status: 'pending' as const },
      { id: 'v-2', name: 'Security & Cleanup Deposit', estimatedCost: Math.round(allocated * 0.2), actualCost: 0, status: 'pending' as const },
    ];
  }
  if (categoryId === 'food') {
    return [
      { id: 'f-1', name: 'Buffet or Plated Meal Service', estimatedCost: Math.round(allocated * 0.65), actualCost: 0, status: 'pending' as const },
      { id: 'f-2', name: 'Beverages & Signature Drinks', estimatedCost: Math.round(allocated * 0.25), actualCost: 0, status: 'pending' as const },
      { id: 'f-3', name: 'Custom Cake / Dessert Bar', estimatedCost: Math.round(allocated * 0.10), actualCost: 0, status: 'pending' as const },
    ];
  }
  if (categoryId === 'decoration') {
    return [
      { id: 'd-1', name: 'Floral Arrangements & Centerpieces', estimatedCost: Math.round(allocated * 0.5), actualCost: 0, status: 'pending' as const },
      { id: 'd-2', name: 'Ambient Lighting & Draping', estimatedCost: Math.round(allocated * 0.3), actualCost: 0, status: 'pending' as const },
      { id: 'd-3', name: 'Welcome Signage & Photo Backdrop', estimatedCost: Math.round(allocated * 0.2), actualCost: 0, status: 'pending' as const },
    ];
  }
  if (categoryId === 'photography') {
    return [
      { id: 'p-1', name: 'Full-Day Photographer Coverage', estimatedCost: Math.round(allocated * 0.7), actualCost: 0, status: 'pending' as const },
      { id: 'p-2', name: 'Highlight Video / Drone Shots', estimatedCost: Math.round(allocated * 0.3), actualCost: 0, status: 'pending' as const },
    ];
  }
  if (categoryId === 'entertainment') {
    return [
      { id: 'e-1', name: 'DJ & Sound System Equipment', estimatedCost: Math.round(allocated * 0.75), actualCost: 0, status: 'pending' as const },
      { id: 'e-2', name: 'Emcee & Special Activity Props', estimatedCost: Math.round(allocated * 0.25), actualCost: 0, status: 'pending' as const },
    ];
  }
  return [
    { id: 'm-1', name: 'Invitations & Guest Favors', estimatedCost: Math.round(allocated * 0.5), actualCost: 0, status: 'pending' as const },
    { id: 'm-2', name: 'Emergency Contingency Reserve', estimatedCost: Math.round(allocated * 0.5), actualCost: 0, status: 'pending' as const },
  ];
}

export function generateDefaultTimeline(eventDateStr: string, eventType: EventType): TimelineMilestone[] {
  const eventDate = new Date(eventDateStr);
  const isValidDate = !isNaN(eventDate.getTime());

  const calculateTargetDate = (daysBefore: number) => {
    if (!isValidDate) return undefined;
    const target = new Date(eventDate.getTime() - daysBefore * 24 * 60 * 60 * 1000);
    return target.toISOString().split('T')[0];
  };

  const weddingMilestones: Omit<TimelineMilestone, 'id' | 'isCompleted'>[] = [
    {
      phase: '6_plus_months',
      phaseLabel: '6+ Months Before',
      title: 'Lock In Venue & Date',
      description: 'Tour and reserve the ceremony and reception locations. Confirm guest capacity and deposits.',
      targetDaysBefore: 180,
      category: 'Venue',
    },
    {
      phase: '6_plus_months',
      phaseLabel: '6+ Months Before',
      title: 'Book Primary Photographer & Caterer',
      description: 'Review portfolio galleries, schedule food tastings, and secure high-demand vendors.',
      targetDaysBefore: 160,
      category: 'Vendors',
    },
    {
      phase: '3_to_6_months',
      phaseLabel: '3 to 6 Months Before',
      title: 'Send Save-the-Dates & Theme Palette',
      description: 'Finalize invitation design, set up wedding website, and collect guest addresses.',
      targetDaysBefore: 120,
      category: 'Guests',
    },
    {
      phase: '3_to_6_months',
      phaseLabel: '3 to 6 Months Before',
      title: 'Finalize Floral & Decor Concept',
      description: 'Meet with florist for centerpiece samples, ceremony arch styling, and lighting arrangements.',
      targetDaysBefore: 90,
      category: 'Decor',
    },
    {
      phase: '1_to_2_months',
      phaseLabel: '1 to 2 Months Before',
      title: 'RSVP Deadline & Seating Chart',
      description: 'Tally dietary restrictions, lock in headcount with caterer, and map table assignments.',
      targetDaysBefore: 45,
      category: 'Planning',
    },
    {
      phase: '2_to_4_weeks',
      phaseLabel: '2 to 4 Weeks Before',
      title: 'Final Vendor Walkthrough & Timeline',
      description: 'Distribute minute-by-minute run of show to DJ, coordinator, venue manager, and photo team.',
      targetDaysBefore: 21,
      category: 'Logistics',
    },
    {
      phase: 'week_of',
      phaseLabel: 'Week of Event',
      title: 'Rehearsal & Final Payments Packets',
      description: 'Walk through processionals, prepare vendor tip envelopes, and pack bridal/groom emergency kits.',
      targetDaysBefore: 4,
      category: 'Final Prep',
    },
    {
      phase: 'event_day',
      phaseLabel: 'Event Day',
      title: 'Celebrate and Cherish Every Moment!',
      description: 'Let vendors follow the schedule, enjoy with loved ones, and create lifelong memories.',
      targetDaysBefore: 0,
      category: 'Execution',
    },
  ];

  const anniversaryMilestones: Omit<TimelineMilestone, 'id' | 'isCompleted'>[] = [
    {
      phase: '3_to_6_months',
      phaseLabel: '3 to 4 Months Before',
      title: 'Reserve Intimate Venue & Date',
      description: 'Secure private dining room, winery terrace, or garden courtyard and draft guest list.',
      targetDaysBefore: 100,
      category: 'Venue',
    },
    {
      phase: '3_to_6_months',
      phaseLabel: '2 to 3 Months Before',
      title: 'Curate Photo Retrospective & Memories',
      description: 'Digitize legacy wedding photos and prepare video tribute or memory wall display.',
      targetDaysBefore: 75,
      category: 'Retrospective',
    },
    {
      phase: '1_to_2_months',
      phaseLabel: '6 Weeks Before',
      title: 'Send Foil/Monogram Invitations',
      description: 'Distribute elegant invitations with RSVP deadline and dietary requests.',
      targetDaysBefore: 42,
      category: 'Guests',
    },
    {
      phase: '2_to_4_weeks',
      phaseLabel: '3 Weeks Before',
      title: 'Finalize Chef Tasting & Champagne Toast',
      description: 'Confirm multi-course gourmet menu, vintage champagne pairings, and anniversary cake.',
      targetDaysBefore: 21,
      category: 'Catering',
    },
    {
      phase: 'week_of',
      phaseLabel: '1 Week Before',
      title: 'Vow Renewal & Toast Speech Order',
      description: 'Coordinate family toast speakers, background acoustic playlist, and silver/gold accents.',
      targetDaysBefore: 7,
      category: 'Program',
    },
    {
      phase: 'event_day',
      phaseLabel: 'Anniversary Celebration',
      title: 'Raise a Toast to Lasting Love!',
      description: 'Celebrate years of togetherness with dear family and cherished friends.',
      targetDaysBefore: 0,
      category: 'Execution',
    },
  ];

  const birthdayMilestones: Omit<TimelineMilestone, 'id' | 'isCompleted'>[] = [
    {
      phase: '3_to_6_months',
      phaseLabel: '6 to 8 Weeks Before',
      title: 'Pick Theme & Reserve Venue or Space',
      description: 'Select celebration vibe, book party hall or park pavilion, and draft initial guest list.',
      targetDaysBefore: 50,
      category: 'Venue & Concept',
    },
    {
      phase: '1_to_2_months',
      phaseLabel: '4 Weeks Before',
      title: 'Send Digital/Paper Invitations',
      description: 'Share RSVP deadline, party theme attire, and gift registry or charity preference.',
      targetDaysBefore: 28,
      category: 'Guests',
    },
    {
      phase: '2_to_4_weeks',
      phaseLabel: '2 Weeks Before',
      title: 'Order Custom Cake & Order Decor',
      description: 'Confirm flavor and design with bakery. Order balloons, tableware, and lighting.',
      targetDaysBefore: 14,
      category: 'Food & Decor',
    },
    {
      phase: 'week_of',
      phaseLabel: '1 Week Before',
      title: 'Playlist & Party Games Schedule',
      description: 'Curate high-energy music playlist, wrap prizes, and confirm menu portions.',
      targetDaysBefore: 7,
      category: 'Entertainment',
    },
    {
      phase: 'week_of',
      phaseLabel: 'Day Before',
      title: 'Decorate Space & Chill Beverages',
      description: 'Inflate balloon arches, arrange party stations, and test audio speakers.',
      targetDaysBefore: 1,
      category: 'Setup',
    },
    {
      phase: 'event_day',
      phaseLabel: 'Party Day',
      title: 'Welcome Guests & Blow the Candles!',
      description: 'Capture fun photos, host party games, cut the cake, and enjoy the party.',
      targetDaysBefore: 0,
      category: 'Execution',
    },
  ];

  const communityMilestones: Omit<TimelineMilestone, 'id' | 'isCompleted'>[] = [
    {
      phase: '6_plus_months',
      phaseLabel: '3 to 6 Months Before',
      title: 'Permits, City Approvals & Venue Booking',
      description: 'Submit park/street closure applications, sound permits, and secure liability insurance.',
      targetDaysBefore: 90,
      category: 'Legal & Permits',
    },
    {
      phase: '3_to_6_months',
      phaseLabel: '2 Months Before',
      title: 'Vendor & Food Truck Recruitment',
      description: 'Invite local food vendors, craft artisans, and community partner booths.',
      targetDaysBefore: 60,
      category: 'Vendors',
    },
    {
      phase: '1_to_2_months',
      phaseLabel: '1 Month Before',
      title: 'Marketing & Volunteer Mobilization',
      description: 'Distribute posters, launch community social campaign, and assign volunteer shifts.',
      targetDaysBefore: 30,
      category: 'Marketing',
    },
    {
      phase: '2_to_4_weeks',
      phaseLabel: '2 Weeks Before',
      title: 'Equipment, Stages & Waste Management',
      description: 'Confirm portable restrooms, trash & recycling bins, generators, and stage AV setup.',
      targetDaysBefore: 14,
      category: 'Logistics',
    },
    {
      phase: 'week_of',
      phaseLabel: 'Week of Event',
      title: 'Volunteer Briefing & Safety Inspection',
      description: 'Conduct emergency protocol run-through, place directional yard signs, and prepare check-in desk.',
      targetDaysBefore: 3,
      category: 'Operations',
    },
    {
      phase: 'event_day',
      phaseLabel: 'Event Day',
      title: 'Gate Opening & Community Celebration',
      description: 'Coordinate live performers, oversee crowd flow, and celebrate community spirit.',
      targetDaysBefore: 0,
      category: 'Execution',
    },
  ];

  let selectedList = weddingMilestones;
  if (eventType === 'birthday') selectedList = birthdayMilestones;
  else if (eventType === 'anniversary') selectedList = anniversaryMilestones;
  else if (eventType === 'community') selectedList = communityMilestones;

  return selectedList.map((m, idx) => ({
    ...m,
    id: `milestone-${idx + 1}`,
    calculatedDate: calculateTargetDate(m.targetDaysBefore),
    isCompleted: false,
  }));
}

export function generateDefaultVendors(eventType: EventType): VendorTask[] {
  const commonVendors: VendorTask[] = [
    {
      id: 'ven-1',
      category: 'venue',
      categoryLabel: 'Venue',
      task: 'Tour and sign rental agreement with venue',
      status: 'shortlisted',
      quoteAmount: 0,
      isCompleted: false,
      notes: 'Check parking capacity, curfews, and included tables/chairs',
    },
    {
      id: 'ven-2',
      category: 'caterer',
      categoryLabel: 'Catering',
      task: 'Select caterer and finalize menu tasting',
      status: 'contacted',
      quoteAmount: 0,
      isCompleted: false,
      notes: 'Include vegetarian, vegan, and gluten-free options',
    },
    {
      id: 'ven-3',
      category: 'decorator',
      categoryLabel: 'Decor & Florals',
      task: 'Finalize decoration contract and floral vision board',
      status: 'contacted',
      quoteAmount: 0,
      isCompleted: false,
      notes: 'Include entrance arch, table runners, and ambient fairy lights',
    },
    {
      id: 'ven-4',
      category: 'photographer',
      categoryLabel: 'Photo & Video',
      task: 'Book professional photographer and shot list',
      status: 'not_started',
      quoteAmount: 0,
      isCompleted: false,
      notes: 'Specify golden hour portraits and candid guest moments',
    },
    {
      id: 'ven-5',
      category: 'entertainment',
      categoryLabel: 'Music & Entertainment',
      task: 'Book DJ / live band & confirm audio gear',
      status: 'not_started',
      quoteAmount: 0,
      isCompleted: false,
      notes: 'Provide must-play and do-not-play tracklist',
    },
    {
      id: 'ven-6',
      category: 'logistics',
      categoryLabel: 'Logistics & Rentals',
      task: 'Arrange guest transportation / valet & signage',
      status: 'not_started',
      quoteAmount: 0,
      isCompleted: false,
      notes: 'Prepare directional boards and accessibility ramps',
    },
  ];

  return commonVendors;
}

export function generateDefaultGuests(eventType: EventType): GuestItem[] {
  if (eventType === 'wedding') {
    return [
      { id: 'g-1', name: 'Eleanor & Charles Vance', email: 'eleanor.v@example.com', phone: '(555) 234-8901', rsvpStatus: 'attending', plusOnes: 1, dietaryRequirement: 'None', tableNumber: 'Table 1', group: 'family', notes: 'Parents of the bride' },
      { id: 'g-2', name: 'Marcus Sterling', email: 'marcus.s@example.com', phone: '(555) 345-6789', rsvpStatus: 'attending', plusOnes: 1, dietaryRequirement: 'Gluten-Free', tableNumber: 'Table 2', group: 'vip', notes: 'Best Man' },
      { id: 'g-3', name: 'Chloe Dubois', email: 'chloe.d@example.com', phone: '(555) 456-7890', rsvpStatus: 'attending', plusOnes: 0, dietaryRequirement: 'Vegetarian', tableNumber: 'Table 2', group: 'friends', notes: 'Maid of Honor' },
      { id: 'g-4', name: 'Dr. Arthur Pendelton', email: 'arthur.p@example.com', phone: '(555) 567-8901', rsvpStatus: 'pending', plusOnes: 1, dietaryRequirement: 'None', tableNumber: 'Table 3', group: 'family' },
      { id: 'g-5', name: 'Hannah & David Kim', email: 'hannah.k@example.com', phone: '(555) 678-9012', rsvpStatus: 'attending', plusOnes: 1, dietaryRequirement: 'Nut Allergy', tableNumber: 'Table 4', group: 'friends' },
      { id: 'g-6', name: 'Liam Gallagher', email: 'liam.g@example.com', phone: '(555) 789-0123', rsvpStatus: 'declined', plusOnes: 0, dietaryRequirement: 'None', group: 'colleagues', notes: 'Sending wedding gift' },
    ];
  }
  if (eventType === 'anniversary') {
    return [
      { id: 'g-1', name: 'Robert & Patricia Hayes', email: 'robert.hayes@example.com', phone: '(555) 111-2233', rsvpStatus: 'attending', plusOnes: 0, dietaryRequirement: 'None', tableNumber: 'Head Table', group: 'family', notes: 'Celebrating 30 years!' },
      { id: 'g-2', name: 'James Hayes & Guest', email: 'james.h@example.com', phone: '(555) 222-3344', rsvpStatus: 'attending', plusOnes: 1, dietaryRequirement: 'Vegetarian', tableNumber: 'Table 1', group: 'family', notes: 'Giving family toast' },
      { id: 'g-3', name: 'Clara Jenkins', email: 'clara.j@example.com', phone: '(555) 333-4455', rsvpStatus: 'attending', plusOnes: 1, dietaryRequirement: 'Gluten-Free', tableNumber: 'Table 1', group: 'friends', notes: 'Original maid of honor' },
      { id: 'g-4', name: 'Gerald Foster', email: 'gerald.f@example.com', phone: '(555) 444-5566', rsvpStatus: 'pending', plusOnes: 0, dietaryRequirement: 'None', group: 'colleagues' },
    ];
  }
  if (eventType === 'birthday') {
    return [
      { id: 'g-1', name: 'Lucas Scott', email: 'lucas@example.com', phone: '(555) 888-9999', rsvpStatus: 'attending', plusOnes: 0, dietaryRequirement: 'None', tableNumber: 'Lounge A', group: 'vip', notes: 'Birthday VIP' },
      { id: 'g-2', name: 'Serena Miller', email: 'serena@example.com', phone: '(555) 777-6666', rsvpStatus: 'attending', plusOnes: 1, dietaryRequirement: 'Vegan', tableNumber: 'Lounge A', group: 'friends', notes: 'Brought board games' },
      { id: 'g-3', name: 'Jordan Rivera', email: 'jordan@example.com', phone: '(555) 666-5555', rsvpStatus: 'maybe', plusOnes: 0, dietaryRequirement: 'None', group: 'friends' },
      { id: 'g-4', name: 'Aaliyah Khan', email: 'aaliyah@example.com', phone: '(555) 555-4444', rsvpStatus: 'attending', plusOnes: 1, dietaryRequirement: 'Halal', tableNumber: 'Lounge B', group: 'colleagues' },
    ];
  }
  return [
    { id: 'g-1', name: 'Mayor Evelyn Ross', email: 'mayor@oakridge.gov', phone: '(555) 900-1122', rsvpStatus: 'attending', plusOnes: 1, dietaryRequirement: 'None', tableNumber: 'VIP Stage', group: 'vip', notes: 'Delivering opening welcome speech' },
    { id: 'g-2', name: 'Chief Thomas Bell', email: 'tbell@oakridgefire.gov', phone: '(555) 900-3344', rsvpStatus: 'attending', plusOnes: 0, dietaryRequirement: 'None', group: 'vip', notes: 'Safety coordination' },
    { id: 'g-3', name: 'Rosa Gomez (Artisan Lead)', email: 'rosa.g@example.com', phone: '(555) 900-5566', rsvpStatus: 'attending', plusOnes: 2, dietaryRequirement: 'Vegetarian', group: 'neighbors' },
    { id: 'g-4', name: 'Green Earth Student Club', email: 'students@greenearth.example', phone: '(555) 900-7788', rsvpStatus: 'attending', plusOnes: 4, dietaryRequirement: 'Vegan', group: 'friends', notes: 'Volunteering for recycling stations' },
  ];
}
