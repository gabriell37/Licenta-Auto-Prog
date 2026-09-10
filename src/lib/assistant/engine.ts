import {
  CATEGORY_KEYWORDS,
  FAQ_INTENTS,
  GREETINGS,
  SEARCH_VERBS,
  SYMPTOMS,
  THANKS,
  type FaqIntent,
  type Lang,
  type Symptom,
} from './kb';

/** Lowercase, strip Romanian diacritics and punctuation — both sides of every match use this. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[șş]/g, 's')
    .replace(/[țţ]/g, 't')
    .replace(/[ăâ]/g, 'a')
    .replace(/î/g, 'i')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const RO_HINTS = new Set([
  'cum', 'ce', 'unde', 'cand', 'vreau', 'caut', 'masina', 'masinii', 'programare', 'programarea', 'pret', 'preturi',
  'buna', 'salut', 'anulare', 'anulez', 'multumesc', 'mersi', 'sa', 'de', 'la', 'imi', 'nu', 'este', 'pentru', 'mea',
  'frana', 'frane', 'ulei', 'cat', 'costa', 'gasesc', 'aproape', 'mine', 'zgomot', 'merge', 'face', 'fac',
]);
const EN_HINTS = new Set([
  'how', 'what', 'where', 'when', 'want', 'need', 'my', 'car', 'appointment', 'price', 'hello', 'the', 'i', 'you',
  'can', 'do', 'does', 'is', 'are', 'cancel', 'thanks', 'find', 'looking', 'for', 'near', 'me', 'much', 'cost',
  'noise', 'change', 'book', 'booking', 'help', 'it', 'not', 'work', 'working',
]);

/** Detect message language from normalized tokens. Romanian wins ties (primary market). */
export function detectLang(message: string, fallback: Lang = 'ro'): Lang {
  if (/[ăâîșțşţ]/i.test(message)) return 'ro';
  const tokens = normalize(message).split(' ');
  let ro = 0;
  let en = 0;
  for (const t of tokens) {
    if (RO_HINTS.has(t)) ro++;
    if (EN_HINTS.has(t)) en++;
  }
  if (ro === en) return ro === 0 ? fallback : 'ro';
  return en > ro ? 'en' : 'ro';
}

function matchKeyword(normalized: string, tokens: Set<string>, keyword: string): boolean {
  return keyword.includes(' ') || keyword.includes('-')
    ? normalized.includes(keyword)
    : tokens.has(keyword);
}

function scoreKeywords(normalized: string, tokens: Set<string>, keywords: string[]): number {
  let score = 0;
  for (const kw of keywords) {
    if (matchKeyword(normalized, tokens, kw)) {
      // phrases are far stronger evidence than single words
      score += kw.includes(' ') ? 3 : 1;
    }
  }
  return score;
}

export type Intent =
  | { type: 'greeting' }
  | { type: 'thanks' }
  | { type: 'faq'; intent: FaqIntent }
  | { type: 'find-service'; categories: string[]; symptom?: Symptom; freeText: string }
  | { type: 'fallback' };

/**
 * Resolve the user's intent. Precedence: short greetings/thanks → symptom
 * (specialized service search with advice) → service search (category and/or
 * search verb) → best-scoring FAQ → fallback.
 */
export function resolveIntent(message: string): Intent {
  const normalized = normalize(message);
  const tokens = new Set(normalized.split(' '));
  const tokenCount = normalized.split(' ').filter(Boolean).length;

  if (tokenCount <= 3) {
    if (GREETINGS.some((g) => matchKeyword(normalized, tokens, g))) return { type: 'greeting' };
    if (THANKS.some((t) => matchKeyword(normalized, tokens, t))) return { type: 'thanks' };
  }

  const symptom = SYMPTOMS.find((s) => s.keywords.some((k) => matchKeyword(normalized, tokens, k)));
  if (symptom) {
    return { type: 'find-service', categories: symptom.categories, symptom, freeText: normalized };
  }

  const categories = Object.entries(CATEGORY_KEYWORDS)
    .map(([slug, kws]) => ({ slug, score: scoreKeywords(normalized, tokens, kws) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);

  const faq = FAQ_INTENTS.map((intent) => ({
    intent,
    score: scoreKeywords(normalized, tokens, intent.keywords),
  }))
    .filter((f) => f.score > 0)
    .sort((a, b) => b.score - a.score)[0];

  const hasSearchVerb = SEARCH_VERBS.some((v) => matchKeyword(normalized, tokens, v));

  // A strong FAQ phrase match ("cum fac programare") beats a stray category word.
  if (faq && faq.score >= 3 && faq.score >= (categories[0]?.score ?? 0)) {
    return { type: 'faq', intent: faq.intent };
  }
  if (categories.length > 0) {
    return {
      type: 'find-service',
      categories: categories.slice(0, 2).map((c) => c.slug),
      freeText: normalized,
    };
  }
  if (faq) return { type: 'faq', intent: faq.intent };
  if (hasSearchVerb) return { type: 'find-service', categories: [], freeText: normalized };
  return { type: 'fallback' };
}

/** Find a known city (normalized) inside the message. Cities come from the live shop list. */
export function findCity(message: string, cities: { normalized: string; display: string }[]): string | null {
  const normalized = normalize(message);
  const hit = cities.find((c) => c.normalized.length > 2 && normalized.includes(c.normalized));
  return hit?.display ?? null;
}
