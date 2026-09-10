'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { detectLang, findCity, normalize, resolveIntent } from '@/lib/assistant/engine';
import { REPLIES, type Lang } from '@/lib/assistant/kb';
import { formatRON } from '@/lib/utils';

export type AssistantLink = { label: string; href: string };
export type AssistantReply = {
  text: string;
  links?: AssistantLink[];
  suggestions?: string[];
};

const askSchema = z.object({
  message: z.string().trim().min(1).max(500),
  clientId: z.string().min(8).max(64),
});

// The shop cities change rarely — cache the normalized list briefly so every
// chat message doesn't re-query them.
let cityCache: { at: number; cities: { normalized: string; display: string }[] } | null = null;
async function getCities() {
  if (cityCache && Date.now() - cityCache.at < 5 * 60 * 1000) return cityCache.cities;
  const shops = await prisma.shop.findMany({
    where: { status: 'VERIFIED' },
    select: { locality: true, county: true },
  });
  const seen = new Map<string, string>();
  for (const s of shops) {
    for (const name of [s.locality, s.county]) {
      if (name && !seen.has(normalize(name))) seen.set(normalize(name), name);
    }
  }
  cityCache = { at: Date.now(), cities: [...seen.entries()].map(([normalized, display]) => ({ normalized, display })) };
  return cityCache.cities;
}

async function searchCatalog(categorySlugs: string[], city: string | null, freeText: string) {
  const shopWhere = {
    status: 'VERIFIED',
    ...(city ? { OR: [{ locality: { contains: city } }, { county: { contains: city } }] } : {}),
  } as const;

  if (categorySlugs.length > 0) {
    const categories = await prisma.category.findMany({ where: { slug: { in: categorySlugs } } });
    const services = await prisma.service.findMany({
      where: {
        active: true,
        categoryId: { in: categories.map((c) => c.id) },
        shop: shopWhere,
      },
      include: { shop: { select: { name: true, slug: true, locality: true } } },
      orderBy: { priceFromBani: 'asc' },
      take: 8,
    });
    return { services, categoryName: categories[0]?.nameRo ?? null };
  }

  // No category — try matching service names on the meaningful words.
  const words = freeText.split(' ').filter((w) => w.length > 3).slice(0, 4);
  if (words.length === 0) return { services: [], categoryName: null };
  const services = await prisma.service.findMany({
    where: {
      active: true,
      shop: shopWhere,
      OR: words.map((w) => ({ name: { contains: w } })),
    },
    include: { shop: { select: { name: true, slug: true, locality: true } } },
    take: 8,
  });
  return { services, categoryName: null };
}

export async function askAssistantAction(input: { message: string; clientId: string }): Promise<AssistantReply> {
  const parsed = askSchema.safeParse(input);
  if (!parsed.success) {
    return { text: REPLIES.fallback.ro, suggestions: [...REPLIES.defaultSuggestions.ro] };
  }
  const { message, clientId } = parsed.data;
  const lang: Lang = detectLang(message);

  if (!rateLimit(`assistant:${clientId}`, 20, 60_000)) {
    return {
      text:
        lang === 'ro'
          ? 'Îmi scrii foarte repede 😅 Așteaptă câteva secunde și încearcă din nou.'
          : "You're typing very fast 😅 Wait a few seconds and try again.",
    };
  }

  const intent = resolveIntent(message);

  if (intent.type === 'greeting') {
    return { text: REPLIES.greeting[lang], suggestions: [...REPLIES.defaultSuggestions[lang]] };
  }
  if (intent.type === 'thanks') {
    return { text: REPLIES.thanks[lang] };
  }
  if (intent.type === 'faq') {
    const { intent: faq } = intent;
    return {
      text: faq.answer[lang],
      links: faq.links?.map((l) => ({ label: l.label[lang], href: l.href })),
    };
  }

  if (intent.type === 'find-service') {
    const cities = await getCities();
    const city = findCity(message, cities);
    const { services } = await searchCatalog(intent.categories, city, intent.freeText);

    const advice = intent.symptom ? intent.symptom.advice[lang] : null;

    if (services.length === 0) {
      const searchHref = city ? `/search?city=${encodeURIComponent(city)}` : '/search';
      return {
        text: [advice, REPLIES.noServices[lang]].filter(Boolean).join('\n\n'),
        links: [{ label: lang === 'ro' ? 'Deschide căutarea' : 'Open search', href: searchHref }],
        suggestions: [...REPLIES.defaultSuggestions[lang]],
      };
    }

    // One link per shop (best-priced service first), then a "see all" search link.
    const seenShops = new Set<string>();
    const links: AssistantLink[] = [];
    for (const s of services) {
      if (seenShops.has(s.shop.slug) || links.length >= 3) continue;
      seenShops.add(s.shop.slug);
      const price = s.priceFromBani > 0 ? ` · ${formatRON(s.priceFromBani, { from: s.priceType !== 'FIXED' })}` : '';
      links.push({
        label: `${s.shop.name} (${s.shop.locality}) — ${s.name}${price}`,
        href: `/shop/${s.shop.slug}`,
      });
    }
    const q = intent.categories.length > 0 ? '' : intent.freeText;
    const searchHref = `/search?${new URLSearchParams({
      ...(q ? { q } : {}),
      ...(city ? { city } : {}),
    }).toString()}`.replace(/\?$/, '');
    links.push({ label: lang === 'ro' ? 'Vezi toate rezultatele' : 'See all results', href: searchHref });

    const found = city
      ? REPLIES.foundServicesCity[lang](city)
      : REPLIES.foundServices[lang];
    return { text: [advice, found].filter(Boolean).join('\n\n'), links };
  }

  return {
    text: REPLIES.fallback[lang],
    links: [{ label: lang === 'ro' ? 'Contact' : 'Contact us', href: '/contact' }],
    suggestions: [...REPLIES.defaultSuggestions[lang]],
  };
}
