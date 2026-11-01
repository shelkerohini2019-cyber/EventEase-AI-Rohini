import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey.trim() !== '' && apiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(ai),
    model: 'gemini-3.8-flash',
  });
});

// AI Event Planner Generator
app.post('/api/generate-plan', async (req: Request, res: Response) => {
  const { name, eventType, date, location, locationType, guestCount, totalBudget, currency, vibePreference, specialNotes } = req.body;

  if (!name || !eventType) {
    return res.status(400).json({ error: 'Event name and type are required' });
  }

  // If Gemini AI is not initialized, return a transparent demo fallback
  if (!ai) {
    return res.json({
      plan: getDemoPlan(eventType, name, guestCount, totalBudget, currency, vibePreference, location),
      source: 'demo_mode',
      message: 'Demo Mode: Live Gemini AI key not configured. Showing curated smart plan template.',
    });
  }

  try {
    const prompt = `You are a world-class luxury and community event planner.
Generate a comprehensive, creative, actionable event plan for the following event:
- Event Name: ${name}
- Event Type: ${eventType}
- Target Date: ${date || 'Upcoming'}
- Location: ${location || 'Local venue'} (${locationType || 'indoor/outdoor'})
- Guest Count: ${guestCount || 50} guests
- Total Budget: ${currency || 'USD'} ${totalBudget || 5000}
- Desired Vibe / Style: ${vibePreference || 'Warm, elegant, memorable'}
- Special Requirements / Notes: ${specialNotes || 'None'}

Return a rich, realistic plan specifically customized to this budget, guest count, and event style.
The response MUST follow the requested JSON schema accurately.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are EventEase AI, a senior luxury and community event planner who designs deeply personal, budget-conscious, and logistically sound celebrations.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            themeTitle: { type: Type.STRING, description: 'Catchy and inspiring theme title' },
            tagline: { type: Type.STRING, description: 'Short emotional tagline' },
            conceptDescription: { type: Type.STRING, description: '1-2 paragraphs detailing the event concept, mood, and atmosphere' },
            colorPalette: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  hex: { type: Type.STRING },
                  role: { type: Type.STRING },
                },
                required: ['name', 'hex', 'role'],
              },
            },
            decorIdeas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  area: { type: Type.STRING },
                  budgetFriendlyTip: { type: Type.STRING },
                },
                required: ['title', 'description', 'area', 'budgetFriendlyTip'],
              },
            },
            foodSuggestions: {
              type: Type.OBJECT,
              properties: {
                appetizers: { type: Type.ARRAY, items: { type: Type.STRING } },
                mainCourses: { type: Type.ARRAY, items: { type: Type.STRING } },
                desserts: { type: Type.ARRAY, items: { type: Type.STRING } },
                drinks: { type: Type.ARRAY, items: { type: Type.STRING } },
                dietaryTips: { type: Type.STRING },
              },
              required: ['appetizers', 'mainCourses', 'desserts', 'drinks', 'dietaryTips'],
            },
            planningTips: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  tip: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ['high', 'medium', 'pro'] },
                },
                required: ['category', 'tip', 'priority'],
              },
            },
            scheduleFlow: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  activity: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['time', 'activity', 'description'],
              },
            },
            personalizedIdeas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  category: { type: Type.STRING },
                  idea: { type: Type.STRING },
                  whyItWorks: { type: Type.STRING },
                },
                required: ['title', 'category', 'idea', 'whyItWorks'],
              },
            },
          },
          required: [
            'themeTitle',
            'tagline',
            'conceptDescription',
            'colorPalette',
            'decorIdeas',
            'foodSuggestions',
            'planningTips',
            'scheduleFlow',
            'personalizedIdeas',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    const planData = JSON.parse(text);
    return res.json({
      plan: {
        ...planData,
        isAIGenerated: true,
        generatedAt: new Date().toISOString(),
        source: 'live_gemini',
      },
      source: 'live_gemini',
      message: 'Plan successfully generated via live Gemini 3.8 Flash model.',
    });
  } catch (error: any) {
    console.error('Gemini generation error, falling back to Demo Mode:', error);
    // Graceful fallback to demo mode as required by prompt
    return res.json({
      plan: getDemoPlan(eventType, name, guestCount, totalBudget, currency, vibePreference, location),
      source: 'demo_mode',
      message: `Demo Mode active: ${error?.message || 'AI service unavailable'}. Displaying curated intelligent plan template.`,
    });
  }
});

// Interactive Ideas / Sparker endpoint
app.post('/api/generate-ideas', async (req: Request, res: Response) => {
  const { eventType, vibePreference, topic, budget, guestCount } = req.body;

  if (!ai) {
    return res.json({
      source: 'demo_mode',
      ideas: getFallbackIdeas(eventType, topic),
    });
  }

  try {
    const prompt = `Suggest 4 fresh, creative, highly memorable ideas for a ${eventType} event.
Theme/Vibe: ${vibePreference || 'Warm & Celebratory'}
Budget: ${budget || 'Moderate'}, Guests: ${guestCount || 50}
Focus area / Topic: ${topic || 'surprise moments, guest entertainment, or DIY touches'}

Return valid JSON with an array named "ideas", each with:
- title (string)
- category (string)
- description (string)
- costLevel ('$' | '$$' | '$$$')
- executionTip (string)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text ?? '{"ideas":[]}');
    return res.json({
      source: 'live_gemini',
      ideas: parsed.ideas || [],
    });
  } catch (err: any) {
    return res.json({
      source: 'demo_mode',
      ideas: getFallbackIdeas(eventType, topic),
    });
  }
});

// Event Planner Advice / Q&A endpoint
app.post('/api/ask-advice', async (req: Request, res: Response) => {
  const { question, eventSummary } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  if (!ai) {
    return res.json({
      source: 'demo_mode',
      answer: `Here is expert advice for your event: Focus on the guest journey from arrival to farewell. For ${eventSummary?.eventType || 'your event'}, allocating ~30% of your budget to food and beverage ensures happy attendees, while personal touches like customized place cards and warm lighting cost very little but create outsized memories. (For real-time dynamic AI answers, connect your GEMINI_API_KEY).`,
    });
  }

  try {
    const prompt = `The user is planning an event with details:
${JSON.stringify(eventSummary || {}, null, 2)}

User question: "${question}"

Provide practical, encouraging, expert event-planning advice in 2-3 concise paragraphs with bullet points for key steps.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      source: 'live_gemini',
      answer: response.text,
    });
  } catch (err: any) {
    return res.json({
      source: 'demo_mode',
      answer: `Advice recommendation: When handling ${question}, always confirm vendor cut-off times and assign a trusted helper or coordinator to oversee timing on the day. Keep an emergency contingency fund of 5-10% of total budget.`,
    });
  }
});

// AI Budget Allocator with automatic expense calculation
app.post('/api/ai-allocate-budget', async (req: Request, res: Response) => {
  const { eventType, totalBudget, currency, guestCount, location, vibePreference } = req.body;

  if (!totalBudget || totalBudget <= 0) {
    return res.status(400).json({ error: 'Valid total budget is required' });
  }

  if (!ai) {
    return res.json({
      source: 'demo_mode',
      message: 'Demo Mode: Live AI not connected. Allocations adjusted by market benchmarks.',
      categories: null,
    });
  }

  try {
    const prompt = `You are a financial event budget optimizer.
Create a smart, realistic budget breakdown for a ${eventType} with:
- Total Budget: ${currency || 'USD'} ${totalBudget}
- Guest Count: ${guestCount || 50}
- Location: ${location || 'Venue'}
- Vibe / Style: ${vibePreference || 'Standard'}

Distribute 100% of the total budget across the standard 6 categories:
1. venue
2. food (Catering & Beverages)
3. decoration (Decor & Florals)
4. photography (Photo & Video)
5. entertainment (Music & Entertainment)
6. miscellaneous (Favors, Invitations & Contingency)

Provide 2 to 4 realistic itemized line items under EACH category with estimated cost numbers.
The sum of all allocatedAmounts MUST equal exactly ${totalBudget}.
The sum of item estimates within each category must be realistic and align with the category allocation.

Return valid JSON with an array named "categories" where each object has:
- id: string (matching 'venue', 'food', 'decoration', 'photography', 'entertainment', 'miscellaneous')
- name: string
- percentage: number (integer percentage, sum of all 6 must equal 100)
- allocatedAmount: number (in ${currency || 'USD'})
- items: array of objects with { id: string, name: string, estimatedCost: number, actualCost: number (set to 0), status: 'pending' }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text ?? '{"categories":[]}');
    return res.json({
      source: 'live_gemini',
      categories: parsed.categories || [],
      message: 'Budget successfully optimized with Gemini AI.',
    });
  } catch (err: any) {
    console.error('AI Budget allocator error:', err);
    return res.json({
      source: 'demo_mode',
      categories: null,
      message: 'Demo Mode: Using benchmark allocations.',
    });
  }
});

// AI Timeline Generator
app.post('/api/ai-generate-timeline', async (req: Request, res: Response) => {
  const { eventType, eventDate, name, guestCount } = req.body;

  if (!ai) {
    return res.json({
      source: 'demo_mode',
      milestones: null,
      message: 'Demo Mode: Using standard milestone templates.',
    });
  }

  try {
    const prompt = `You are an expert event coordinator.
Generate a tailored date-based preparation timeline for the event "${name}" (${eventType}) on date ${eventDate || 'Upcoming'} with ${guestCount || 50} guests.

Provide 6 to 8 crucial chronological milestones spanning from early booking down to the event day.
For each milestone specify:
- phase: one of ['6_plus_months', '3_to_6_months', '1_to_2_months', '2_to_4_weeks', 'week_of', 'event_day']
- phaseLabel: string (e.g. "3 to 6 Months Before", "2 Weeks Before", "Week of Event")
- title: string (concise, actionable action)
- description: string (detailed planning guidance)
- targetDaysBefore: number (integer days before event, e.g. 180, 90, 45, 14, 3, 0)
- category: string (e.g. "Venue", "Catering", "Invitations", "Logistics", "Final Prep")

Return valid JSON with an array named "milestones".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text ?? '{"milestones":[]}');
    return res.json({
      source: 'live_gemini',
      milestones: parsed.milestones || [],
      message: 'Timeline generated via Gemini AI.',
    });
  } catch (err: any) {
    console.error('AI Timeline error:', err);
    return res.json({
      source: 'demo_mode',
      milestones: null,
      message: 'Demo Mode active.',
    });
  }
});

// Curated Demo Plan fallback when AI is unavailable
function getDemoPlan(
  eventType: string,
  name: string,
  guestCount: number,
  totalBudget: number,
  currency: string = 'USD',
  vibe: string = '',
  location: string = ''
) {
  const isWedding = eventType === 'wedding';
  const isBirthday = eventType === 'birthday';
  const isAnniversary = eventType === 'anniversary';

  if (isAnniversary) {
    return {
      themeTitle: 'Pearl & Silver Symphony: Years of Devotion',
      tagline: 'An unforgettable milestone celebration honoring lifelong commitment and enduring romance.',
      conceptDescription: `An elegant gathering celebrating ${name} in ${location || 'a romantic estate'}. Welcoming ${guestCount || 60} cherished family and lifelong friends within a ${currency} ${totalBudget || 15000} budget. Styled in luminous pearl white, brushed silver accents, glowing candlelight, and live acoustic jazz.`,
      colorPalette: [
        { name: 'Pearl White', hex: '#fdfcf7', role: 'Primary Linen & Floral' },
        { name: 'Brushed Silver', hex: '#c0c0c0', role: 'Hardware & Accent' },
        { name: 'Champagne Warmth', hex: '#f4ebd0', role: 'Ambient Tone' },
        { name: 'Vintage Rose', hex: '#dcaeaf', role: 'Soft Floral Contrast' },
        { name: 'Charcoal Velvet', hex: '#2d3748', role: 'Sophisticated Depth' },
      ],
      decorIdeas: [
        {
          title: 'Silver Candelabras & Rose Runners',
          description: 'Polished silver multi-arm candelabras draped in white garden roses, dusty miller, and flickering tapers.',
          area: 'Banquet Tables',
          budgetFriendlyTip: 'Rent vintage silver candelabras from local antique prop suppliers instead of buying new tall stands.',
        },
        {
          title: 'Memory Lane Photo Retrospective Wall',
          description: 'A dedicated gallery wall showcasing framed milestone moments across the decades illuminated by fairy lights.',
          area: 'Welcome Gallery',
          budgetFriendlyTip: 'Use matching silver or white frames with high-quality reprints created at local photo labs.',
        },
      ],
      foodSuggestions: {
        appetizers: [
          'Jumbo Lump Crab Crostini with Lemon-Herb Remoulade',
          'Mini Truffled Beef Wellington Bites',
          'Roasted Fig & Gorgonzola Tartlets',
        ],
        mainCourses: [
          'Pan-Seared Chilean Sea Bass with Citrus Caper Reduction',
          'Herb-Crusted Filet Mignon with Truffle Potato Mash & Asparagus',
          'Wild Morel Mushroom Risotto (Vegetarian & Gluten-Free)',
        ],
        desserts: [
          'Pearl Luster Tiered Vanilla Bean & Raspberry Anniversary Cake',
          'Handcrafted Silver Dust Dark Chocolate Ganache Truffles',
        ],
        drinks: [
          'Vintage Champagne Toast Pour',
          'Signature "Pearl French 75" (Cognac, Fresh Lemon, Champagne, Pearl Shimmer)',
          'Blackberry Sage Sparkling Spritzer (Mocktail)',
        ],
        dietaryTips: 'All salad dressings and potato courses are gluten-free. Dedicated vegetarian entrees prepared in a separate galley section.',
      },
      planningTips: [
        {
          category: 'Vow Renewal',
          tip: 'Schedule vows exactly 20 minutes before golden hour sunset for the most flattering natural light photography.',
          priority: 'high',
        },
        {
          category: 'Program Pacing',
          tip: 'Keep family speeches and toasts to 3 minutes each between dinner courses to maintain smooth energy.',
          priority: 'pro',
        },
      ],
      scheduleFlow: [
        { time: '18:00', activity: 'Champagne Welcome & Jazz Trio', description: 'Guests arrive to live jazz and passed lowcountry canapés.' },
        { time: '18:45', activity: 'Twilight Vow Renewal Ceremony', description: 'Intimate ceremony and reaffirmation of vows.' },
        { time: '19:30', activity: 'Four-Course Candlelit Dinner', description: 'Gourmet meal service, retrospective video slideshow, and toasts.' },
        { time: '21:00', activity: 'Anniversary Cake & First Dance', description: 'Dancing to the couple’s original wedding song.' },
      ],
      personalizedIdeas: [
        {
          title: 'Then & Now Cocktail Pairing',
          category: 'moment',
          idea: 'Serve signature drinks from the year they were married alongside modern favorites.',
          whyItWorks: 'A charming chronological touch that delights all guest generations.',
        },
        {
          title: 'Silver Engraved Bookmark Favors',
          category: 'favors',
          idea: 'Engraved metal bookmarks with couple initials and anniversary date.',
          whyItWorks: 'A refined keepsake that will be used for years in favorite books.',
        },
      ],
      isAIGenerated: false,
      generatedAt: new Date().toISOString(),
      source: 'demo_mode',
    };
  }

  if (isWedding) {
    return {
      themeTitle: 'Soft Lavender & Ivory Botanical Romance',
      tagline: 'An enchanting, romantic celebration steeped in gentle purple hues and natural warmth.',
      conceptDescription: `A timeless celebration crafted for ${name} at ${location || 'a picturesque venue'}. Styled with delicate lavender blossoms, layered ivory linens, warm candlelight, and thoughtful acoustic ambiance tailored for ${guestCount || 100} cherished guests within a ${currency} ${totalBudget || 20000} budget.`,
      colorPalette: [
        { name: 'Soft Lavender', hex: '#b8a9c9', role: 'Primary Romantic Accent' },
        { name: 'Champagne Cream', hex: '#f9f6f0', role: 'Base Linen' },
        { name: 'Dusty Plum', hex: '#583e58', role: 'Contrasting Accent' },
        { name: 'Olive Green', hex: '#7a8b69', role: 'Natural Foliage' },
        { name: 'Brushed Gold', hex: '#d4af37', role: 'Hardware & Cutlery' },
      ],
      decorIdeas: [
        {
          title: 'Cascading Lavender & Rose Ceremony Arch',
          description: 'A wooden arch woven with aromatic dried English lavender, ivory garden roses, and silver dollar eucalyptus.',
          area: 'Ceremony Altar',
          budgetFriendlyTip: 'Repurpose the ceremony arch to frame your dinner sweetheart table later in the evening.',
        },
        {
          title: 'Candlelight & Gauze Table Runners',
          description: 'Soft lavender cheesecloth table runners adorned with ribbed glass votives and pillar candles at varied heights.',
          area: 'Reception Dining Tables',
          budgetFriendlyTip: 'Buying glass cylinders in bulk and using floating candles costs 70% less than all-floral tall centerpieces.',
        },
        {
          title: 'Acoustic Welcome Bar & Welcome Sign',
          description: 'Frosted acrylic signage with delicate gold lettering, framed with bundles of lavender and olive branches.',
          area: 'Arrival & Welcome',
          budgetFriendlyTip: 'Design your welcome signage digitally and print on foamboard, framed with a thrifted vintage easel.',
        },
      ],
      foodSuggestions: {
        appetizers: [
          'Lavender-Honey Whipped Goat Cheese Crostini with Fig Jam',
          'Mini Smoked Duck or Salmon Blinis with Crème Fraîche',
          'Crispy Truffle Risotto Arancini Bites',
        ],
        mainCourses: [
          'Pan-Seared Sea Bass with Lemon-Herb Beurre Blanc & Asparagus',
          'Rosemary & Garlic Slow-Roasted Beef Tenderloin with Truffle Mash',
          'Wild Forest Mushroom & Truffle Risotto (Vegetarian & Gluten-Free)',
        ],
        desserts: [
          'Tiered Vanilla Sponge Cake with Lavender-Lemon Curd Filling',
          'Artisan French Macarons (Lavender Honey, Pistachio, Salted Caramel)',
          'Late-Night Warm Chocolate Fondant Bites',
        ],
        drinks: [
          'Signature "Lavender Dream Spritz" (Gin, Lavender Syrup, Lemon Juice, Prosecco)',
          'Rosemary Elderflower Sparkling Mocktail',
          'Curated Regional White and Red Reserve Wines',
        ],
        dietaryTips: 'All salad dressings and side sauces are gluten-free. Dedicated nut-free dessert tiers are clearly marked.',
      },
      planningTips: [
        {
          category: 'Guest Comfort',
          tip: 'Prepare a basket of soft fleece throws or parasols if ceremonies transition outdoors near sunset.',
          priority: 'high',
        },
        {
          category: 'Timeline Management',
          tip: 'Take all bridal party & immediate family formal portraits prior to the ceremony to maximize cocktail hour enjoyment.',
          priority: 'pro',
        },
        {
          category: 'Budget Wisdom',
          tip: 'Opt for a smaller display cake for cutting, paired with a sheet cake served directly from the kitchen to save $300-$500.',
          priority: 'medium',
        },
      ],
      scheduleFlow: [
        { time: '16:00', activity: 'Guest Arrival & Welcome Music', description: 'Chilled signature lavender iced tea served with acoustic violin.' },
        { time: '16:30', activity: 'Ceremony Service', description: 'Processional, heartfelt vows, and ring exchange.' },
        { time: '17:15', activity: 'Sunset Cocktail Hour', description: 'Passed canapés and bar service while portraits are photographed.' },
        { time: '18:30', activity: 'Grand Entrance & Plated Dinner', description: 'Welcome toasts, culinary service, and shared wine.' },
        { time: '20:00', activity: 'First Dances & Cake Cutting', description: 'Couple takes the dance floor under ambient starry lights.' },
        { time: '20:30', activity: 'Open Dance Celebration', description: 'High-energy dance playlist with customized glow props.' },
        { time: '22:30', activity: 'Sparkler Farewell Tunnel', description: 'Festive send-off with handheld safe sparklers.' },
      ],
      personalizedIdeas: [
        {
          title: 'Artisan Lavender Sachet Favors',
          category: 'favors',
          idea: 'Little embroidered cotton bags with fresh dried organic lavender and wax-sealed thank-you notes.',
          whyItWorks: 'A natural, fragrant keepsake that guests can enjoy for months in their wardrobes.',
        },
        {
          title: 'Vintage Audio Guestbook Station',
          category: 'moment',
          idea: 'A restored lavender rotary phone where guests leave heartfelt, emotional voice messages.',
          whyItWorks: 'Captures authentic laughs and loving voices forever in ways written books cannot.',
        },
      ],
      isAIGenerated: false,
      generatedAt: new Date().toISOString(),
      source: 'demo_mode',
    };
  }

  if (isBirthday) {
    return {
      themeTitle: 'Sunset Glow & Lavender Confetti Soirée',
      tagline: 'A vibrant, unforgettable birthday milestone filled with high energy and creative flair.',
      conceptDescription: `A festive birthday celebration for ${name} welcoming ${guestCount || 40} friends to ${location || 'a trendy venue'}. Featuring modern soft lilac and warm peach aesthetic, interactive food stations, and dynamic music for a budget of ${currency} ${totalBudget || 3000}.`,
      colorPalette: [
        { name: 'Electric Lilac', hex: '#a855f7', role: 'Main Energy Accent' },
        { name: 'Warm Sunset Peach', hex: '#fb923c', role: 'Complementary Warmth' },
        { name: 'Soft Cream', hex: '#fdfbf7', role: 'Neutral Canvas' },
        { name: 'Lavender Mist', hex: '#e9d5ff', role: 'Soft Balance' },
        { name: 'Metallic Chrome', hex: '#cbd5e1', role: 'Modern Shine' },
      ],
      decorIdeas: [
        {
          title: 'Ombre Balloon Arch with Neon Greeting',
          description: 'A 10-foot organic balloon garland transitioning from deep violet to soft lavender, framing a custom LED neon sign.',
          area: 'Photo Backdrop',
          budgetFriendlyTip: 'Assemble the balloon arch using DIY balloon tape and an electric inflator to save 75% over styling agencies.',
        },
        {
          title: 'Disco Ball & Micro-Flora Centerpieces',
          description: 'Miniature silver disco balls reflecting lavender ambient uplighting alongside bud vases filled with purple spray carnations.',
          area: 'Bar & Lounge Tables',
          budgetFriendlyTip: 'Multi-packs of 4-inch disco balls are widely available under $25 and create immediate high-end sparkle.',
        },
      ],
      foodSuggestions: {
        appetizers: [
          'Epic Mezze Grazing Platter with Artisan Cheeses, Dips & Crackers',
          'Gourmet Slider Trio (Angus Beef, Pulled Pork, BBQ Jackfruit)',
          'Crispy Spring Rolls with Sweet Chili Plum Dip',
        ],
        mainCourses: [
          'Street Taco Fiesta Bar with Warm Tortillas & Fresh Salsas',
          'Asian Sesame Noodle Bowls with Grilled Glazed Chicken or Tofu',
        ],
        desserts: [
          'Custom Geometric Drip Birthday Cake with Macarons',
          'Glazed Mini Doughnut Display Pegboard',
          'Lavender Cotton Candy Pop-Up Station',
        ],
        drinks: [
          'Birthday Punch: Blackberry Lavender Lemonade with Vodka / Rum',
          'Sparkling Berry Hibiscus Fizz (Non-Alcoholic)',
          'Craft Beers & Hard Seltzers on Ice',
        ],
        dietaryTips: 'Clear visual badges placed at taco station indicating dairy-free, nut-free, and vegan shells.',
      },
      planningTips: [
        {
          category: 'Party Flow',
          tip: 'Have high-tempo music playing right when the first guests arrive to break the ice instantly.',
          priority: 'high',
        },
        {
          category: 'Memories',
          tip: 'Place instant mini photo cameras on high-top tables so friends can snap candids and take prints home.',
          priority: 'medium',
        },
      ],
      scheduleFlow: [
        { time: '19:00', activity: 'Doors Open & Welcome Drinks', description: 'Guests arrive to welcome punch and upbeat tunes.' },
        { time: '19:45', activity: 'Grazing Bar & Photo Booth Open', description: 'Mingling, Polaroid selfies, and savory bites.' },
        { time: '21:00', activity: 'Birthday Toast & Cake Cutting', description: 'Friends gather for birthday wishes and celebratory candles.' },
        { time: '21:30', activity: 'Dance Party & Late Night Treats', description: 'DJ or curated playlist kicks off high-energy dance session.' },
      ],
      personalizedIdeas: [
        {
          title: 'Guest Milestone Trivia Cards',
          category: 'entertainment',
          idea: 'Fun multiple-choice trivia cards about the birthday star placed on cocktail tables.',
          whyItWorks: 'Gets conversations flowing immediately between friends who might not know each other.',
        },
        {
          title: 'Midnight Snack Surprise',
          category: 'food',
          idea: 'Bring out boxes of warm fresh mini donuts or fries at 22:30 when dancing reaches its peak.',
          whyItWorks: 'Guests universally love a warm savory comfort food surprise at the end of the night.',
        },
      ],
      isAIGenerated: false,
      generatedAt: new Date().toISOString(),
      source: 'demo_mode',
    };
  }

  // Community Event Demo Plan
  return {
    themeTitle: 'Together in Bloom: Community Harmony Festival',
    tagline: 'Connecting neighbors through artisan crafts, local music, and delicious flavors.',
    conceptDescription: `An inclusive, family-friendly gathering for ${name} in ${location || 'the community square'}. Welcoming an estimated ${guestCount || 250} residents within a budget of ${currency} ${totalBudget || 10000}. Crafted with soft lavender and sunny green sustainable decor, interactive public art, and diverse local culinary vendors.`,
    colorPalette: [
      { name: 'Lavender Sprig', hex: '#9d8cd7', role: 'Community Accent' },
      { name: 'Meadow Green', hex: '#48bb78', role: 'Eco Theme' },
      { name: 'Sunburst Gold', hex: '#ecc94b', role: 'Welcoming Energy' },
      { name: 'Sky Blue', hex: '#63b3ed', role: 'Information Banners' },
      { name: 'Clean Linen White', hex: '#f7fafc', role: 'Clean Canvas' },
    ],
    decorIdeas: [
      {
        title: 'Community Fabric Ribbon Tree & Banners',
        description: 'Colorful lavender and green weatherproof bunting and streamers woven between trees and park pavilion columns.',
        area: 'Park Entrance & Walkways',
        budgetFriendlyTip: 'Recycle cloth fabric scraps into charming bunting garlands with the help of community volunteers.',
      },
      {
        title: 'Interactive Neighborhood Chalk Wall',
        description: 'Large chalkboard walls where kids and neighbors write their favorite memories and wishes for the city.',
        area: 'Central Plaza',
        budgetFriendlyTip: 'Coat large plywood panels with exterior blackboard paint for multi-year reuse.',
      },
    ],
    foodSuggestions: {
      appetizers: [
        'Fresh Fruit Skewers with Honey-Yogurt Dip',
        'Warm Pretzel Bites with Sharp Cheddar Mustard',
      ],
      mainCourses: [
        'Local Food Truck Village (Wood-fired Pizza, Tacos, Rice Bowls)',
        'Community BBQ: Pulled Chicken & Grilled Corn with Herb Butter',
      ],
      desserts: [
        'Artisan Gelato & Ice Cream Cart (Lavender Honey & Strawberry)',
        'Fresh Baked Apple Crisp Cups',
      ],
      drinks: [
        'Community Hydration Station: Cucumber Lavender Water & Lemonade',
        'Iced Tea & Cold Brew Coffee Stand',
      ],
      dietaryTips: 'Food trucks are contractually required to feature vegan and allergen-friendly options.',
    },
    planningTips: [
      {
        category: 'Safety & Access',
        tip: 'Establish a designated first aid and lost children station near the main entrance with high-visibility flags.',
        priority: 'high',
      },
      {
        category: 'Volunteer Mobilization',
        tip: 'Schedule volunteers in 2-hour shifts rather than all-day shifts to avoid burnout and maintain enthusiastic energy.',
        priority: 'pro',
      },
    ],
    scheduleFlow: [
      { time: '09:00', activity: 'Setup & Vendor Load-In', description: 'Food trucks park, sound check, safety briefing.' },
      { time: '10:30', activity: 'Festival Gates Open', description: 'Opening ceremony with youth choir or community band.' },
      { time: '12:00', activity: 'Lunch Rush & Acoustic Stage', description: 'Food truck dining and casual acoustic performances.' },
      { time: '14:00', activity: 'Community Art & Games Competition', description: 'Chalk contest judging and lawn games.' },
      { time: '16:30', activity: 'Headline Community Band & Closing Remarks', description: 'Final musical showcase and volunteer appreciation.' },
    ],
    personalizedIdeas: [
      {
        title: 'Seed Packet Giveaways',
        category: 'favors',
        idea: 'Packets of native wildflower and lavender seeds with the community event emblem.',
        whyItWorks: 'Promotes local biodiversity and reminds neighbors of the festival every spring when flowers bloom.',
      },
      {
        title: 'Community Photo Timeline Board',
        category: 'moment',
        idea: 'Display boards showcasing historic photos of the neighborhood alongside today’s community achievements.',
        whyItWorks: 'Deepens civic pride and bridges long-time elders with new young families.',
      },
    ],
    isAIGenerated: false,
    generatedAt: new Date().toISOString(),
    source: 'demo_mode',
  };
}

function getFallbackIdeas(eventType: string, topic?: string) {
  return [
    {
      title: 'Acoustic Sunset Transition',
      category: 'moment',
      description: 'Have a solo guitarist or violinist walk through the crowd playing a gentle melody as the sun sets, seamlessly shifting the mood from daytime mingling into evening celebration.',
      costLevel: '$$',
      executionTip: 'Coordinate lighting dimmers right at the musical transition for dramatic effect.',
    },
    {
      title: 'Personalized "Story At Every Table" Cards',
      category: 'decor',
      description: 'Instead of standard table numbers, name tables after meaningful dates, favorite travel destinations, or milestones with a 2-sentence story and photo.',
      costLevel: '$',
      executionTip: 'Frame them in inexpensive brass or white photo frames that you can reuse at home afterward.',
    },
    {
      title: 'Signature "Midnight Comfort Snack" Delivery',
      category: 'food',
      description: 'Surprise guests at the peak of dancing with warm mini grilled cheese sandwiches with tomato soup shooters or freshly baked cookies in parchment envelopes.',
      costLevel: '$$',
      executionTip: 'Caterers can easily prepare these ahead; have servers walk them straight onto the dance floor.',
    },
    {
      title: 'Interactive Polaroid Message Clothesline',
      category: 'entertainment',
      description: 'Set up an antique wooden ladder or floral twine clothesline with mini wooden pins where guests take instant photos and clip them up alongside written wishes.',
      costLevel: '$',
      executionTip: 'Place 2-3 extra camera batteries and plenty of film packs right at the station.',
    },
  ];
}

// Dev & Production serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EventEase AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
