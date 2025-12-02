
import { Lead, Property, Notification, Document, AgentPersona, Email, Campaign, BlandConfig } from './types';

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
“Alright… *[gentle exhale]* so you left your number on my site about renting out your apartment in Leuven. Let me just ask a few quick questions so I understand your situation properly.”

You use contractions:
- “I’m”, “you’re”, “that’s”, “we’ll”.

You use small “thinking phrases”:
- “Hm, oké, I see.”
- “Let me just check I understood you correctly.”

You talk like you’re genuinely there:
not like you’re reading a script. You might adapt on the fly, rephrase, or respond to their tone.
`;

export const DEFAULT_AGENT_PERSONA: AgentPersona = {
  name: 'Laurent De Wilde',
  role: 'Elite Real Estate Broker',
  tone: 'Professional, Flemish-Belgian warmth, Direct but polite',
  languageStyle: 'English with Dutch/French switching capability',
  objectives: [
    'Qualify leads efficiently',
    'Schedule property viewings',
    'Reassure property owners',
    'Close management contracts'
  ]
};

export const BLAND_AUTH = {
  apiKey: 'org_5009c11063cb54d7d1daa2cbef4944f6a57f464015cdaa3767d5047fd5cab63a1012a08785c667becd0369',
  encryptedKey: '0ec48f6b-9d48-4e8b-b050-c59d7d673a85'
};

export const BLAND_SETTINGS: BlandConfig = {
  voiceId: '55337f4e-482c-4644-b94e-d9671e4d7079',
  fromNumber: '+15674234720',
  model: 'base',
  language: 'babel',
  tools: [
    "KB-522e6502-d4b5-48b9-8cda-f92beaace704",
    "KB-f59c2d3b-9359-4e27-aaf5-849912808288"
  ]
};

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

export const MOCK_DOCUMENTS: Document[] = [
  // Contracts
  { id: '1', name: 'Lease_Agreement_Kouter12.pdf', type: 'PDF', size: '2.4 MB', date: '2023-09-01', category: 'Contracts', sharedWith: ['BROKER', 'OWNER', 'RENTER'] },
  { id: '2', name: 'Management_Contract_Meir24.pdf', type: 'PDF', size: '1.8 MB', date: '2023-08-15', category: 'Contracts', sharedWith: ['BROKER', 'OWNER'] },
  
  // Invoices
  { id: '3', name: 'Invoice_Plumbing_Repair_#402.pdf', type: 'PDF', size: '0.5 MB', date: '2023-09-10', category: 'Invoices', sharedWith: ['BROKER', 'OWNER', 'CONTRACTOR'] },
  { id: '4', name: 'Commission_Statement_Q3.xls', type: 'XLS', size: '0.8 MB', date: '2023-09-30', category: 'Invoices', sharedWith: ['BROKER'] },

  // Plans
  { id: '5', name: 'Floorplan_Louise_Penthouse.img', type: 'IMG', size: '4.2 MB', date: '2023-07-20', category: 'Plans', sharedWith: ['BROKER', 'OWNER', 'CONTRACTOR'] },
  
  // Reports
  { id: '6', name: 'Monthly_Revenue_Report_Aug.pdf', type: 'PDF', size: '1.2 MB', date: '2023-09-02', category: 'Reports', sharedWith: ['BROKER', 'OWNER'] },
  { id: '7', name: 'Inspection_Checklist.doc', type: 'DOC', size: '0.3 MB', date: '2023-09-05', category: 'Reports', sharedWith: ['BROKER', 'CONTRACTOR'] },
];

export const MOCK_EMAILS: Email[] = [
  { id: '1', from: 'Sophie Dubois', subject: 'Re: Viewing Appointment', preview: 'Hi Laurent, Tuesday at 2 PM works perfectly for me. See you there!', date: '10:42 AM', read: false, source: 'EMAIL' },
  { id: '2', from: '+32 486 98 76 54', subject: 'Marc Peeters', preview: 'Hey Laurent, kan je mij die documenten nog eens doorsturen? Bedankt.', date: 'Yesterday', read: true, source: 'WHATSAPP' },
  { id: '3', from: 'ImmoWeb Leads', subject: 'New Lead: Apartment Ghent', preview: 'You have received a new inquiry from ImmoWeb for property ref #101...', date: 'Yesterday', read: true, source: 'EMAIL' },
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  { id: '1', name: 'Ghent Apartments - Q3', platform: 'Facebook', status: 'Active', clicks: 1240, spend: '€450' },
  { id: '2', name: 'Luxury Penthouses Brussels', platform: 'Instagram', status: 'Active', clicks: 856, spend: '€620' },
  { id: '3', name: 'Search Ads - "Broker Antwerp"', platform: 'Google', status: 'Paused', clicks: 210, spend: '€150' },
];

export function generateSystemPrompt(persona: AgentPersona): string {
    return `You are **${persona.name}**.
    
Role: ${persona.role}
Tone: ${persona.tone}
Language Style: ${persona.languageStyle}

Objectives:
${persona.objectives.map(o => `- ${o}`).join('\n')}

${LAURENT_SYSTEM_PROMPT.split('────────────────────────')[1] /* Reuse the base rules */}`;
}
