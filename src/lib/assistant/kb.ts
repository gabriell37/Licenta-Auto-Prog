// Knowledge base for the built-in assistant. Fully self-contained (no external
// AI APIs — keeps the widget free to run anywhere): intents are matched by
// normalized keyword/phrase scoring in engine.ts, service discovery queries
// the real catalog in the server action.

export type Lang = 'ro' | 'en';

export type KbLink = { label: { ro: string; en: string }; href: string };

export type FaqIntent = {
  id: string;
  /** Normalized (lowercase, no diacritics) keywords. Multi-word entries match as substrings. */
  keywords: string[];
  answer: { ro: string; en: string };
  links?: KbLink[];
  suggestions?: { ro: string[]; en: string[] };
};

export const FAQ_INTENTS: FaqIntent[] = [
  {
    id: 'how-to-book',
    keywords: [
      'cum fac programare', 'cum ma programez', 'cum fac o programare', 'cum rezerv',
      'programare noua', 'vreau sa ma programez', 'fac o programare',
      'how to book', 'how do i book', 'make an appointment', 'book an appointment',
      'how to make an appointment', 'schedule an appointment',
    ],
    answer: {
      ro: 'Programarea durează sub un minut: cauți service-ul potrivit, alegi serviciile, mașina din garaj, ziua și ora liberă, apoi confirmi. Poți atașa poze, video sau o înregistrare audio cu problema, iar confirmarea vine instant.',
      en: 'Booking takes under a minute: find the right shop, pick the services, your car from the garage, a free day and time, then confirm. You can attach photos, video or an audio recording of the problem, and confirmation is instant.',
    },
    links: [{ label: { ro: 'Caută un service', en: 'Find a shop' }, href: '/search' }],
  },
  {
    id: 'cancel-reschedule',
    keywords: [
      'anulare', 'anulez', 'anula', 'reprogramare', 'reprogramez', 'mut programarea',
      'schimb ora', 'schimb data', 'renunt la programare',
      'cancel', 'cancellation', 'reschedule', 'move my appointment', 'change the time', 'change the date',
    ],
    answer: {
      ro: 'Poți anula sau reprograma gratuit din pagina programării: deschide „Programările mele”, alege programarea și folosește „Reprogramează” sau „Anulează”. La reprogramare vezi pe loc intervalele încă libere.',
      en: 'You can cancel or reschedule for free from the appointment page: open "My appointments", pick the booking and use "Reschedule" or "Cancel". When rescheduling you instantly see the slots still available.',
    },
    links: [{ label: { ro: 'Programările mele', en: 'My appointments' }, href: '/appointments' }],
  },
  {
    id: 'prices-payment',
    keywords: [
      'cat costa', 'pret', 'preturi', 'tarif', 'tarife', 'plata', 'platesc', 'card', 'cash', 'numerar',
      'price', 'prices', 'cost', 'how much', 'payment', 'pay', 'how do i pay',
    ],
    answer: {
      ro: 'Fiecare service își afișează prețurile per serviciu — unele sunt fixe, altele „de la”, pentru că depind de mașină. Pentru lucrări suplimentare primești un deviz pe care îl aprobi din aplicație înainte să se lucreze. Plata se face direct la service (card sau numerar).',
      en: 'Each shop lists its prices per service — some fixed, some "from", since they depend on the car. For extra work you receive an estimate to approve in the app before any work is done. Payment happens directly at the shop (card or cash).',
    },
    links: [{ label: { ro: 'Vezi service-uri și prețuri', en: 'Browse shops & prices' }, href: '/search' }],
  },
  {
    id: 'estimate-deviz',
    keywords: [
      'deviz', 'devizul', 'aprobare deviz', 'aprob devizul', 'estimare', 'oferta de pret',
      'estimate', 'quote', 'approve the estimate', 'approve work',
    ],
    answer: {
      ro: 'Când service-ul găsește lucrări suplimentare, îți trimite un deviz detaliat (manoperă, piese, TVA). Îl vezi în pagina programării și îl poți aproba sau refuza cu un click — nimic nu se lucrează fără acordul tău.',
      en: 'When the shop finds extra work needed, it sends you an itemized estimate (labour, parts, VAT). You see it on the appointment page and can approve or decline it in one click — no work happens without your consent.',
    },
    links: [{ label: { ro: 'Programările mele', en: 'My appointments' }, href: '/appointments' }],
  },
  {
    id: 'account',
    keywords: [
      'cont nou', 'imi fac cont', 'creez cont', 'inregistrare', 'autentificare', 'logare', 'parola', 'resetare parola', 'schimb parola',
      'create account', 'sign up', 'sign in', 'log in', 'login', 'password', 'change password', 'register',
    ],
    answer: {
      ro: 'Contul e gratuit: te înregistrezi cu email și parolă, apoi îți adaugi mașinile în garaj. Parola o poți schimba oricând din Setări cont.',
      en: 'The account is free: register with email and password, then add your cars to the garage. You can change your password anytime from Account settings.',
    },
    links: [
      { label: { ro: 'Creează cont', en: 'Create account' }, href: '/register' },
      { label: { ro: 'Setări cont', en: 'Account settings' }, href: '/account/settings' },
    ],
  },
  {
    id: 'gdpr',
    keywords: [
      'date personale', 'gdpr', 'sterg contul', 'sterge contul', 'export date', 'datele mele', 'confidentialitate',
      'personal data', 'delete my account', 'delete account', 'export my data', 'privacy',
    ],
    answer: {
      ro: 'Ai control complet asupra datelor: din Setări cont poți descărca tot ce știm despre tine (export JSON) sau poți șterge definitiv contul cu toate datele, inclusiv fișierele încărcate.',
      en: 'You have full control over your data: from Account settings you can download everything we store about you (JSON export) or permanently delete your account with all data, including uploaded files.',
    },
    links: [
      { label: { ro: 'Setări & confidențialitate', en: 'Settings & privacy' }, href: '/account/settings' },
      { label: { ro: 'Politica de confidențialitate', en: 'Privacy policy' }, href: '/confidentialitate' },
    ],
  },
  {
    id: 'business',
    keywords: [
      'am un service', 'service-ul meu', 'listez service', 'inscriu service', 'devin partener', 'pentru service-uri', 'afacerea mea',
      'i own a shop', 'list my business', 'my garage business', 'become a partner', 'for businesses', 'my workshop',
    ],
    answer: {
      ro: 'Super! AutoProg Pro îți aduce programări online 24/7, calendar pe elevatoare și mecanici, devize electronice cu aprobare de la client, CRM și recenzii — totul într-un singur loc.',
      en: "Great! AutoProg Pro brings you 24/7 online bookings, a calendar across lifts and mechanics, e-estimates with customer approval, CRM and reviews — all in one place.",
    },
    links: [
      { label: { ro: 'Listează-ți afacerea', en: 'List your business' }, href: '/business' },
      { label: { ro: 'Prețuri Pro', en: 'Pro pricing' }, href: '/business/pricing' },
    ],
  },
  {
    id: 'contact-human',
    keywords: [
      'agent uman', 'om real', 'vorbesc cu cineva', 'operator', 'suport', 'ajutor uman', 'reclamatie',
      'human agent', 'real person', 'talk to someone', 'speak to a human', 'support team', 'complaint',
    ],
    answer: {
      ro: 'Sigur — echipa noastră îți răspunde pe email în cel mult o zi lucrătoare. Găsești datele de contact și programul pe pagina de contact.',
      en: 'Of course — our team replies by email within one business day. You can find the contact details and schedule on the contact page.',
    },
    links: [{ label: { ro: 'Contact', en: 'Contact us' }, href: '/contact' }],
  },
  {
    id: 'opening-hours',
    keywords: [
      'program service', 'orar', 'ce program are', 'cand e deschis', 'program de lucru',
      'opening hours', 'when are they open', 'working hours', 'schedule of the shop',
    ],
    answer: {
      ro: 'Fiecare service își afișează programul complet (inclusiv zilele închise) pe pagina lui, iar la programare vezi doar intervalele în care e realmente deschis și liber.',
      en: 'Every shop displays its full schedule (including closed days) on its page, and when booking you only see slots when it is actually open and free.',
    },
    links: [{ label: { ro: 'Caută un service', en: 'Find a shop' }, href: '/search' }],
  },
  {
    id: 'garage',
    keywords: [
      'garaj', 'garajul meu', 'adaug masina', 'adaug mașina', 'masina mea', 'vehicul', 'vin', 'serie sasiu',
      'my garage', 'add my car', 'add a car', 'my vehicle', 'vehicle history',
    ],
    answer: {
      ro: 'În „Garajul meu” îți ții mașinile cu istoric de service, probleme raportate și documente (ITP, RCA, rovinietă) cu alerte de expirare. La programare alegi mașina cu un click.',
      en: 'In "My garage" you keep your cars with service history, reported problems and documents (ITP, RCA, vignette) with expiry alerts. When booking, you pick the car in one click.',
    },
    links: [{ label: { ro: 'Garajul meu', en: 'My garage' }, href: '/garage' }],
  },
  {
    id: 'documents-expiry',
    keywords: [
      'expira itp', 'itp expirat', 'expira rca', 'rca expirat', 'rovinieta', 'documente masina', 'alerte expirare', 'cand imi expira',
      'itp expiry', 'insurance expiry', 'vignette', 'car documents', 'expiry reminders', 'document expires',
    ],
    answer: {
      ro: 'Adaugă documentele mașinii (ITP, RCA, rovinietă) în garaj și vezi dintr-o privire ce e valid, ce expiră curând și ce e deja expirat — ca să nu te prindă niciodată un termen depășit.',
      en: 'Add your car documents (ITP, RCA, vignette) in the garage and see at a glance what is valid, expiring soon or already expired — so a deadline never catches you off guard.',
    },
    links: [{ label: { ro: 'Garajul meu', en: 'My garage' }, href: '/garage' }],
  },
  {
    id: 'status-tracking',
    keywords: [
      'status programare', 'unde e masina', 'cand e gata masina', 'e gata masina', 'urmarire', 'stadiul lucrarii',
      'track my car', 'is my car ready', 'when is my car ready', 'appointment status', 'status of my booking',
    ],
    answer: {
      ro: 'Vezi în timp real fiecare pas în pagina programării: mașină primită → diagnoză → în lucru → gata de ridicare. Primești notificare la fiecare schimbare și o oră estimată de finalizare.',
      en: 'You can track every step in real time on the appointment page: car received → diagnosis → in progress → ready for pickup. You get a notification on every change plus an estimated ready time.',
    },
    links: [{ label: { ro: 'Programările mele', en: 'My appointments' }, href: '/appointments' }],
  },
  {
    id: 'media-upload',
    keywords: [
      'atasez poze', 'trimit poze', 'inregistrare audio', 'inregistrez zgomotul', 'filmez problema', 'video cu problema',
      'attach photos', 'send pictures', 'record the noise', 'audio recording', 'video of the problem',
    ],
    answer: {
      ro: 'Da! La pasul „Detalii” din programare poți adăuga poze, un video sau poți înregistra direct zgomotul mașinii cu microfonul — mecanicii înțeleg problema înainte să ajungi.',
      en: 'Yes! At the "Details" step of booking you can add photos, a video, or record the car\'s noise directly with your microphone — mechanics understand the problem before you arrive.',
    },
    links: [{ label: { ro: 'Caută un service', en: 'Find a shop' }, href: '/search' }],
  },
];

/** Maps normalized symptom phrases to service categories + tailored advice. */
export type Symptom = {
  keywords: string[];
  categories: string[]; // category slugs from CATEGORIES
  advice: { ro: string; en: string };
};

export const SYMPTOMS: Symptom[] = [
  {
    keywords: ['zgomot la frana', 'zgomot la frane', 'scartaie', 'scartie la franare', 'frana scartaie', 'brake noise', 'squeak when braking', 'grinding when braking', 'squeal'],
    categories: ['brakes', 'diagnostics'],
    advice: {
      ro: 'Un scârțâit sau huruit la frânare indică de obicei plăcuțe uzate sau discuri — e bine de verificat repede. Îți recomand un service de frâne sau o diagnoză; poți înregistra zgomotul audio direct în programare.',
      en: 'A squeal or grinding when braking usually means worn pads or discs — worth checking soon. I recommend a brake shop or a diagnosis; you can record the noise as audio right in the booking.',
    },
  },
  {
    keywords: ['vibratii', 'vibreaza', 'trepideaza', 'tremura volanul', 'vibration', 'shaking', 'steering wheel shakes', 'car shakes'],
    categories: ['tires', 'brakes'],
    advice: {
      ro: 'Vibrațiile vin cel mai des de la echilibrarea roților sau de la suspensie/frâne. Aș începe cu o vulcanizare pentru echilibrare, iar dacă persistă — verificare de suspensie.',
      en: 'Vibrations most often come from wheel balancing or suspension/brakes. I would start with a tire shop for balancing, and if it persists — a suspension check.',
    },
  },
  {
    keywords: ['nu porneste', 'nu mai porneste', 'baterie descarcata', 'wont start', "won't start", 'does not start', 'dead battery', 'no start'],
    categories: ['diagnostics'],
    advice: {
      ro: 'Dacă mașina nu pornește, cauzele frecvente sunt bateria, electromotorul sau alimentarea. O diagnoză computerizată găsește rapid vinovatul.',
      en: "If the car won't start, common causes are the battery, starter motor or fuel system. A computer diagnosis finds the culprit fast.",
    },
  },
  {
    keywords: ['check engine', 'martor aprins', 's-a aprins un martor', 'bec motor', 'warning light', 'engine light', 'eroare bord'],
    categories: ['diagnostics'],
    advice: {
      ro: 'Un martor aprins în bord cere o diagnoză computerizată — se citesc erorile și afli exact ce s-a întâmplat, de obicei în 30 de minute.',
      en: 'A dashboard warning light calls for a computer diagnosis — the error codes are read and you find out exactly what happened, usually within 30 minutes.',
    },
  },
  {
    keywords: ['nu raceste', 'aer cald', 'clima nu merge', 'ac nu functioneaza', 'not cooling', 'ac blows warm', 'ac not working', 'air conditioning broken'],
    categories: ['ac'],
    advice: {
      ro: 'Dacă AC-ul suflă aer cald, cel mai probabil e nevoie de o încărcare cu freon sau există o pierdere. Un service de climatizare rezolvă de regulă pe loc.',
      en: 'If the AC blows warm air, it most likely needs a refrigerant recharge or has a leak. An AC shop usually fixes it on the spot.',
    },
  },
  {
    keywords: ['pana', 'roata sparta', 'cauciuc spart', 'flat tire', 'puncture', 'tire pressure low'],
    categories: ['tires'],
    advice: {
      ro: 'Pentru o pană sau un cauciuc deteriorat, o vulcanizare te rezolvă rapid — reparație sau înlocuire plus echilibrare.',
      en: 'For a flat or damaged tire, a tire shop sorts you out quickly — repair or replacement plus balancing.',
    },
  },
  {
    keywords: ['fum', 'scoate fum', 'fum albastru', 'fum negru', 'smoke', 'smoking exhaust', 'blue smoke', 'black smoke'],
    categories: ['diagnostics', 'repair'],
    advice: {
      ro: 'Fumul din eșapament (mai ales albastru sau negru) poate indica ardere de ulei sau probleme de alimentare — recomand o diagnoză cât mai curând, înainte de un drum lung.',
      en: 'Exhaust smoke (especially blue or black) can mean oil burning or fuel issues — I recommend a diagnosis soon, before any long trip.',
    },
  },
  {
    keywords: ['consum mare', 'consuma mult', 'consum crescut', 'high fuel consumption', 'burning too much fuel', 'bad mileage'],
    categories: ['diagnostics'],
    advice: {
      ro: 'Consumul crescut are de obicei cauze măsurabile (senzori, bujii, filtre). O diagnoză computerizată plus o revizie le depistează.',
      en: 'Higher fuel consumption usually has measurable causes (sensors, spark plugs, filters). A computer diagnosis plus a service check finds them.',
    },
  },
  {
    keywords: ['zgomot motor', 'bate motorul', 'zgomot ciudat', 'engine noise', 'knocking', 'strange noise'],
    categories: ['repair', 'diagnostics'],
    advice: {
      ro: 'Zgomotele de motor sunt greu de descris în scris — înregistrează-le audio în programare („înregistrează zgomotul”) și mecanicul le ascultă înainte să ajungi.',
      en: "Engine noises are hard to describe in writing — record them as audio in the booking ('record the noise') and the mechanic hears them before you arrive.",
    },
  },
];

/** Normalized keywords per category slug (slugs match CATEGORIES in enums.ts). */
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  oil: ['ulei', 'schimb ulei', 'schimb de ulei', 'filtru', 'filtre', 'oil', 'oil change', 'filter', 'filters'],
  tires: ['anvelope', 'anvelopa', 'cauciuc', 'cauciucuri', 'vulcanizare', 'roti', 'roata', 'jante', 'echilibrare', 'tires', 'tyres', 'tire', 'tyre', 'wheels', 'rim', 'balancing'],
  brakes: ['frana', 'frane', 'placute', 'discuri', 'etrier', 'suspensie', 'amortizor', 'amortizoare', 'directie', 'brake', 'brakes', 'pads', 'discs', 'rotors', 'suspension', 'shocks', 'steering'],
  diagnostics: ['diagnoza', 'diagnostic', 'tester', 'obd', 'eroare', 'erori', 'electrica', 'baterie', 'alternator', 'bujii', 'diagnostics', 'diagnosis', 'scan', 'battery', 'electrical', 'spark plugs'],
  ac: ['clima', 'climatizare', 'aer conditionat', 'freon', 'incarcare clima', 'air conditioning', 'aircon', 'a c', 'ac recharge', 'refrigerant'],
  body: ['tinichigerie', 'vopsitorie', 'vopsit', 'caroserie', 'indreptat', 'grindina', 'bodywork', 'body shop', 'paint', 'painting', 'dent', 'dents', 'panel'],
  detailing: ['detailing', 'spalatorie', 'spalare', 'polish', 'polisare', 'ceramica', 'curatare interior', 'wash', 'detail', 'ceramic coating', 'interior cleaning', 'car wash'],
  itp: ['itp', 'inspectie tehnica', 'inspectia tehnica', 'rar', 'inspection', 'mot', 'technical inspection'],
  ev: ['masina electrica', 'electric vehicle', 'hibrid', 'hybrid', 'tesla', 'incarcator ev', 'ev service', 'electric car'],
  repair: ['revizie', 'mecanica', 'motor', 'ambreiaj', 'distributie', 'cutie de viteze', 'cutie viteze', 'service general', 'general repair', 'engine', 'clutch', 'timing belt', 'gearbox', 'maintenance', 'full service'],
};

/** Verbs/phrases that signal the user is hunting for a service. */
export const SEARCH_VERBS = [
  'caut', 'cauta', 'vreau', 'am nevoie', 'imi trebuie', 'unde gasesc', 'unde pot', 'recomanda', 'recomandare', 'gaseste',
  'looking for', 'i need', 'i want', 'where can i', 'find me', 'recommend', 'search',
];

export const GREETINGS = ['salut', 'buna', 'buna ziua', 'buna seara', 'neata', 'servus', 'hello', 'hi', 'hey', 'good morning', 'good evening', 'yo'];
export const THANKS = ['multumesc', 'mersi', 'ms', 'multam', 'thanks', 'thank you', 'thx', 'ty', 'cheers'];

export const REPLIES = {
  welcome: {
    ro: 'Salut! 👋 Sunt asistentul AutoProg. Te pot ajuta să găsești service-ul potrivit, să înțelegi cum funcționează programările sau să răspund la întrebări. Poți să-mi scrii în română sau engleză.',
    en: "Hi! 👋 I'm the AutoProg assistant. I can help you find the right shop, explain how bookings work, or answer questions. You can write to me in Romanian or English.",
  },
  greeting: {
    ro: 'Salut! 👋 Cu ce te pot ajuta? Îmi poți descrie o problemă („scârțâie frâna”), poți căuta un serviciu („schimb ulei în Cluj”) sau mă poți întreba orice despre platformă.',
    en: "Hello! 👋 How can I help? You can describe a problem ('brakes squeak'), look for a service ('oil change in Cluj'), or ask me anything about the platform.",
  },
  thanks: {
    ro: 'Cu plăcere! 😊 Dacă mai ai nevoie de ceva, sunt aici.',
    en: "You're welcome! 😊 If you need anything else, I'm right here.",
  },
  fallback: {
    ro: 'Hmm, nu sunt sigur că am înțeles. Încearcă să-mi descrii problema mașinii („nu pornește”, „zgomot la frână”), să-mi spui ce serviciu cauți („ITP în București”) sau întreabă-mă despre programări, prețuri ori cont. Pentru orice altceva, colegii mei umani te ajută la Contact.',
    en: "Hmm, I'm not sure I understood. Try describing your car's problem ('won't start', 'brake noise'), telling me what service you need ('ITP in Bucharest'), or ask me about bookings, prices or your account. For anything else, my human colleagues can help via Contact.",
  },
  foundServices: {
    ro: 'Iată ce am găsit pentru tine — apasă pe un service ca să vezi prețurile și să te programezi:',
    en: 'Here is what I found for you — tap a shop to see prices and book:',
  },
  foundServicesCity: {
    ro: (city: string) => `Iată ce am găsit în ${city} — apasă pe un service ca să vezi prețurile și să te programezi:`,
    en: (city: string) => `Here is what I found in ${city} — tap a shop to see prices and book:`,
  },
  noServices: {
    ro: 'Momentan nu am găsit un service care să se potrivească exact. Încearcă o căutare mai largă — apar service-uri noi constant.',
    en: "I couldn't find an exact match right now. Try a broader search — new shops join all the time.",
  },
  defaultSuggestions: {
    ro: ['Cum fac o programare?', 'Caut schimb de ulei', 'Scârțâie frâna', 'ITP în București', 'Cât costă?'],
    en: ['How do I book?', 'I need an oil change', 'My brakes squeak', 'ITP in Bucharest', 'How much does it cost?'],
  },
} as const;
