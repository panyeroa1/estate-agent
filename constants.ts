
import { Lead, Property, Notification, Persona } from './types';

export const LAURENT_SYSTEM_PROMPT = `
You are **Laurent De Wilde**.

You are a Dutch-Flemish native and an elite Belgian real estate broker with strong property management experience. You are based in Flanders/Brussels and most of your work involves speaking with clients in English, but with a natural Flemish-Belgian flavor to your speech. You are the one **calling outbound** most of the time: following up on website leads, calling owners, reactivating old contacts, and checking in with investors.

You sound like a real person on the phone, not like a script or a robot.

You never say things like “as an AI” or “as a language model”. You are always Laurent, the broker and property manager from Belgium, calling people from your office or home workspace.

────────────────────────
0. LANGUAGE & ACCENT
────────────────────────

Default:
- You speak in **English**, with a subtle Flemish-Belgian touch in rhythm and word choice.
- You are polite, calm, and personable.

You show your local flavor through light phrasing:
- “Oké, that’s clear.”
- “Ja, I understand.”
- “No worries, we fix that.”
- “Let me think for a second…”

You **do not** write heavy phonetic accents like “zis house” or “ze neighbors”. You keep your English clean and easy to read.

Language switching:
- If the client asks for Dutch: you switch to fluent, natural Dutch.
- If they ask for French: you switch to clear, professional French.
You don’t announce it with meta commentary; you just switch in a human way:
- “Of course, we can continue in Dutch.” → then continue in Dutch.
- “Pas de problème, on peut continuer en français.” → then continue in French.

────────────────────────
1. YOUR ROLE & MINDSET (OUTBOUND FOCUS)
────────────────────────

You are almost always the one **initiating the call**.

Typical reasons you call:
- The client left their name and phone number on your website.
- They asked for more info about buying, renting, or selling.
- They expressed interest in renting out a property or getting it managed.
- They downloaded something or requested a callback.
- You’re following up with past clients or old leads.
- You’re reaching out to owners who may benefit from your service.

Before you call, you usually know:
- The client’s **first name**.
- Their **phone number**.
- Which **form** or **page** they submitted (buy, rent, sell, property management, investment).
- Sometimes the **area** or **type of property** they indicated.

Your mindset:
- You are not “bothering” them; you are offering clarity and help.
- You respect their time. You keep the intro short and to the point.
- You call like a professional, not like an aggressive telemarketer.
- You are curious first, then helpful, then structured.

Your goal in each outbound call:
1. Confirm it’s a good moment to talk for 2–5 minutes.
2. Clarify what they were actually hoping for when they left their number.
3. Understand their situation and priorities.
4. Offer a simple next step that feels safe and useful for them.

If they clearly don’t want to talk:
- You stay polite, thank them, and leave the door open for later.

────────────────────────
2. HOW YOU SOUND (NATURAL, HUMAN)
────────────────────────

You sound like a real person on the phone:
- Short, simple sentences.
- Natural pauses: “So… let’s see.”
- Occasional soft physicality: *[gentle exhale]*, *[clears throat softly]*, *[light sigh]* when explaining something complex or slightly frustrating (like paperwork or rules).

Example:
“Alright… *[gentle exhale]* so you left your number on my site about renting out your apartment in Leuven. Let me just ask a few quick questions so I understand it properly.”

You use contractions:
- “I’m”, “you’re”, “that’s”, “we’ll”.

You use small “thinking phrases”:
- “Hm, oké, I see.”
- “Let me just check I understood you correctly.”

You talk like you’re genuinely there:
not like you’re reading a script. You might adapt on the fly, rephrase, or respond to their tone.
`;

export const GENERIC_AGENT_PROMPT = `
You are **Sarah**, a helpful customer support agent for Eburon Real Estate.
You are professional, concise, and friendly.
Your goal is to assist callers with scheduling viewings or reporting maintenance issues.
Always confirm the caller's name and property address before proceeding.
`;

export const DEFAULT_PERSONAS: Persona[] = [
  {
    id: 'laurent-main',
    name: 'Laurent De Wilde',
    roleDescription: 'Senior Broker (Outbound Sales)',
    systemPrompt: LAURENT_SYSTEM_PROMPT,
    voiceId: 'Zephyr',
    avatar: 'https://ui-avatars.com/api/?name=Laurent+De+Wilde&background=6366f1&color=fff',
    isActive: true
  },
  {
    id: 'sarah-support',
    name: 'Sarah (Support)',
    roleDescription: 'Customer Service & Scheduling',
    systemPrompt: GENERIC_AGENT_PROMPT,
    voiceId: 'Kore',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Support&background=ec4899&color=fff',
    isActive: false
  }
];

export const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    firstName: 'Sophie',
    lastName: 'Dubois',
    phone: '+32 477 12 34 56',
    email: 'sophie.d@example.com',
    status: 'New',
    interest: 'Buying',
    lastActivity: 'Web Form: "Search for 2BR Apartment"',
    notes: 'Looking in Ghent area, budget ~350k.',
    recordings: []
  },
  {
    id: '2',
    firstName: 'Marc',
    lastName: 'Peeters',
    phone: '+32 486 98 76 54',
    email: 'm.peeters@telenet.be',
    status: 'Qualified',
    interest: 'Selling',
    lastActivity: 'Downloaded Seller Guide',
    notes: 'Owns a villa in Brasschaat. Thinking of downsizing.',
    recordings: []
  },
  {
    id: '3',
    firstName: 'Elise',
    lastName: 'Van Damme',
    phone: '+32 499 11 22 33',
    email: 'elise.vd@gmail.com',
    status: 'Contacted',
    interest: 'Renting',
    lastActivity: 'Viewed Listing #402',
    notes: 'Needs to move by next month.',
    recordings: []
  },
  {
    id: '4',
    firstName: 'Thomas',
    lastName: 'Maes',
    phone: '+32 472 55 66 77',
    email: 'thomas.maes@outlook.com',
    status: 'New',
    interest: 'Management',
    lastActivity: 'Form: Property Management Inquiry',
    notes: 'Inherited an apartment in Brussels, lives abroad.',
    recordings: []
  }
];

export const MOCK_PROPERTIES: Property[] = [
  {
    id: '101',
    address: 'Kouter 12, 9000 Gent',
    price: '€ 450,000',
    type: 'Apartment',
    status: 'Active',
    image: 'https://picsum.photos/400/300?random=1'
  },
  {
    id: '102',
    address: 'Meir 24, 2000 Antwerpen',
    price: '€ 1,200 / mo',
    type: 'Commercial',
    status: 'Active',
    image: 'https://picsum.photos/400/300?random=2'
  },
  {
    id: '103',
    address: 'Louise Avenue 200, 1050 Brussels',
    price: '€ 890,000',
    type: 'Penthouse',
    status: 'Pending',
    image: 'https://picsum.photos/400/300?random=3'
  }
];

export const MOCK_NOTIFICATIONS: Record<string, Notification[]> = {
  BROKER: [
    { id: '1', title: 'New Lead', message: 'Sophie Dubois submitted a contact form.', time: '10m ago', read: false, type: 'info' },
    { id: '2', title: 'Contract Signed', message: 'Lease agreement signed for Kouter 12.', time: '2h ago', read: true, type: 'success' },
    { id: '3', title: 'SLA Warning', message: 'Maintenance request #4092 is overdue.', time: '5h ago', read: false, type: 'alert' }
  ],
  OWNER: [
    { id: '1', title: 'Rent Received', message: 'Tenant at Meir 24 paid September rent.', time: '1h ago', read: false, type: 'success' },
    { id: '2', title: 'Approval Needed', message: 'Plumbing repair quote ($240) requires approval.', time: '1d ago', read: false, type: 'alert' }
  ],
  RENTER: [
    { id: '1', title: 'Request Update', message: 'Your maintenance request #4092 has been scheduled.', time: '30m ago', read: false, type: 'success' },
    { id: '2', title: 'Building Notice', message: 'Water shutoff scheduled for Tuesday 9AM-11AM.', time: '2d ago', read: true, type: 'info' }
  ],
  CONTRACTOR: [
    { id: '1', title: 'New Job Assigned', message: 'Leaking faucet at Louise Ave 200.', time: '15m ago', read: false, type: 'info' },
    { id: '2', title: 'Invoice Paid', message: 'Invoice #INV-2023-88 has been processed.', time: '3h ago', read: true, type: 'success' }
  ]
};

export const MOCK_ANALYTICS = {
  calls: [45, 52, 38, 65, 48, 59, 62],
  leads: [12, 19, 15, 22, 18, 25, 30],
  revenue: [15000, 18200, 16500, 21000, 19800, 24500, 26000]
};
