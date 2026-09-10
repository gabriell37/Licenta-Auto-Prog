import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { CATEGORIES } from '../src/lib/enums';

const prisma = new PrismaClient();

const pw = (s: string) => bcrypt.hashSync(s, 10);

const SHOP_BLUEPRINTS = [
  {
    slug: 'autofix-pro-bucuresti', name: 'AutoFix Pro', primaryCategory: 'repair',
    locality: 'București', county: 'București', addressLine: 'Str. Mihai Bravu 210',
    lat: 44.4378, lng: 26.1213, rating: 4.8, ratingCount: 312,
    amenities: ['waiting_area', 'wifi', 'courtesy_car', 'card', 'efactura'],
    cover: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=1200&q=70',
    services: [
      { cat: 'repair', name: 'Revizie generală', dur: 90, from: 25000 },
      { cat: 'oil', name: 'Schimb ulei + filtru', dur: 45, from: 18000, type: 'FIXED' },
      { cat: 'brakes', name: 'Înlocuire plăcuțe frână față', dur: 60, from: 22000 },
      { cat: 'diagnostics', name: 'Diagnoză computerizată', dur: 30, from: 12000, type: 'FIXED' },
    ],
    resources: [{ name: 'Hala 1 - Lift', type: 'LIFT' }, { name: 'Hala 2 - Lift', type: 'LIFT' }, { name: 'Box diagnoză', type: 'BAY' }],
  },
  {
    slug: 'vulcanizare-rapida-cluj', name: 'Vulcanizare Rapidă', primaryCategory: 'tires',
    locality: 'Cluj-Napoca', county: 'Cluj', addressLine: 'Calea Florești 58',
    lat: 46.7689, lng: 23.5689, rating: 4.6, ratingCount: 198,
    amenities: ['waiting_area', 'card', 'tire_hotel', 'pickup'],
    cover: 'https://images.unsplash.com/photo-1610647752706-3bb12232b3ab?w=1200&q=70',
    services: [
      { cat: 'tires', name: 'Schimb anvelope (4 buc)', dur: 40, from: 8000, type: 'FIXED' },
      { cat: 'tires', name: 'Echilibrare roți', dur: 30, from: 6000, type: 'FIXED' },
      { cat: 'tires', name: 'Hotel anvelope (sezon)', dur: 15, from: 12000, type: 'FIXED' },
    ],
    resources: [{ name: 'Post vulcanizare 1', type: 'BAY' }, { name: 'Post vulcanizare 2', type: 'BAY' }, { name: 'Stand geometrie', type: 'ALIGNMENT' }],
  },
  {
    slug: 'itp-station-bucuresti', name: 'Stație ITP Center', primaryCategory: 'itp',
    locality: 'București', county: 'București', addressLine: 'Bd. Theodor Pallady 40',
    lat: 44.4102, lng: 26.1799, rating: 4.5, ratingCount: 421,
    amenities: ['card', 'efactura', 'waiting_area'],
    cover: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=1200&q=70',
    services: [
      { cat: 'itp', name: 'ITP autoturism', dur: 30, from: 14000, type: 'FIXED' },
      { cat: 'itp', name: 'Pregătire ITP + verificare', dur: 45, from: 9000 },
    ],
    resources: [{ name: 'Linie ITP 1', type: 'BAY' }],
  },
  {
    slug: 'detailing-studio-cluj', name: 'Detailing Studio', primaryCategory: 'detailing',
    locality: 'Cluj-Napoca', county: 'Cluj', addressLine: 'Str. Frunzișului 12',
    lat: 46.7501, lng: 23.5612, rating: 4.9, ratingCount: 156,
    amenities: ['wifi', 'card', 'pickup', 'waiting_area'],
    cover: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=1200&q=70',
    services: [
      { cat: 'detailing', name: 'Spălare premium interior + exterior', dur: 90, from: 20000, type: 'FIXED' },
      { cat: 'detailing', name: 'Polish + ceruire', dur: 180, from: 45000 },
    ],
    resources: [{ name: 'Box detailing 1', type: 'WASH' }, { name: 'Box detailing 2', type: 'WASH' }],
  },
  {
    slug: 'electro-auto-diagnoza', name: 'ElectroAuto Diagnoză', primaryCategory: 'diagnostics',
    locality: 'București', county: 'București', addressLine: 'Șos. Olteniței 105',
    lat: 44.3902, lng: 26.1299, rating: 4.7, ratingCount: 89,
    amenities: ['card', 'efactura', 'courtesy_car'],
    cover: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1200&q=70',
    services: [
      { cat: 'diagnostics', name: 'Diagnoză electrică completă', dur: 60, from: 15000 },
      { cat: 'ac', name: 'Încărcare freon AC', dur: 45, from: 18000, type: 'FIXED' },
    ],
    resources: [{ name: 'Box electrică', type: 'BAY' }, { name: 'Box AC', type: 'BAY' }],
  },
  {
    slug: 'service-complet-timisoara', name: 'Service Complet Timișoara', primaryCategory: 'repair',
    locality: 'Timișoara', county: 'Timiș', addressLine: 'Calea Aradului 22',
    lat: 45.7597, lng: 21.2300, rating: 4.4, ratingCount: 137,
    amenities: ['waiting_area', 'wifi', 'card', 'efactura', 'courtesy_car'],
    cover: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=1200&q=70',
    services: [
      { cat: 'repair', name: 'Reparație suspensie', dur: 120, from: 30000 },
      { cat: 'brakes', name: 'Schimb discuri + plăcuțe', dur: 90, from: 38000 },
      { cat: 'oil', name: 'Schimb ulei', dur: 40, from: 16000, type: 'FIXED' },
    ],
    resources: [{ name: 'Lift 1', type: 'LIFT' }, { name: 'Lift 2', type: 'LIFT' }],
  },
];

async function main() {
  console.log('🌱 Seeding AutoProg…');

  // categories
  for (const [i, c] of CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { nameRo: c.nameRo, nameEn: c.nameEn, icon: c.icon, sortOrder: i },
      create: { slug: c.slug, nameRo: c.nameRo, nameEn: c.nameEn, icon: c.icon, sortOrder: i },
    });
  }
  const cats = await prisma.category.findMany();
  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  // demo users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@autoprog.ro' },
    update: {},
    create: { email: 'admin@autoprog.ro', name: 'Admin AutoProg', role: 'ADMIN', passwordHash: pw('admin1234'), phone: '+40700000000' },
  });
  const customer = await prisma.user.upsert({
    where: { email: 'client@autoprog.ro' },
    update: {},
    create: { email: 'client@autoprog.ro', name: 'Andrei Popescu', role: 'CUSTOMER', passwordHash: pw('client1234'), phone: '+40711111111' },
  });
  const owner = await prisma.user.upsert({
    where: { email: 'service@autoprog.ro' },
    update: {},
    create: { email: 'service@autoprog.ro', name: 'Mihai Ionescu', role: 'STAFF', passwordHash: pw('service1234'), phone: '+40722222222' },
  });

  // vehicles for the demo customer
  const existingVehicles = await prisma.vehicle.count({ where: { userId: customer.id } });
  let vehicleId: string | undefined;
  if (existingVehicles === 0) {
    const v1 = await prisma.vehicle.create({
      data: {
        userId: customer.id, make: 'Dacia', model: 'Logan', year: 2018, fuel: 'diesel',
        engine: '1.5 dCi', mileage: 124000, plate: 'B 123 ABC', color: 'Gri', nickname: 'Mașina de oraș',
      },
    });
    const v2 = await prisma.vehicle.create({
      data: {
        userId: customer.id, make: 'Volkswagen', model: 'Golf 7', year: 2016, fuel: 'petrol',
        engine: '1.4 TSI', mileage: 98000, plate: 'B 99 VWG', color: 'Negru',
      },
    });
    vehicleId = v1.id;
    await prisma.problemLog.create({
      data: { vehicleId: v1.id, userId: customer.id, text: 'Zgomot la frânare în față, mai ales dimineața.' },
    });
    // Documents covering all three expiry badge states: amber (soon), default (valid), red (expired).
    const day = 1000 * 60 * 60 * 24;
    await prisma.vehicleDocument.create({
      data: { vehicleId: v1.id, type: 'ITP', expiresAt: new Date(Date.now() + 21 * day) },
    });
    await prisma.vehicleDocument.create({
      data: { vehicleId: v1.id, type: 'RCA', number: 'RO/22/H22/DD0042', expiresAt: new Date(Date.now() + 180 * day) },
    });
    await prisma.vehicleDocument.create({
      data: { vehicleId: v2.id, type: 'ROVINIETA', expiresAt: new Date(Date.now() - 7 * day) },
    });
  }

  // shops
  let firstShopId: string | undefined;
  for (const bp of SHOP_BLUEPRINTS) {
    const shop = await prisma.shop.upsert({
      where: { slug: bp.slug },
      // Ratings start at 0 and are computed from REAL reviews (recomputed at the end).
      update: { coverUrl: bp.cover, status: 'VERIFIED' },
      create: {
        slug: bp.slug, name: bp.name, legalName: `${bp.name} SRL`, cui: 'RO12345678',
        status: 'VERIFIED', primaryCategory: bp.primaryCategory, description: `${bp.name} — service auto profesionist în ${bp.locality}.`,
        coverUrl: bp.cover, phone: '+40733000000', email: `contact@${bp.slug}.ro`,
        addressLine: bp.addressLine, locality: bp.locality, county: bp.county, postalCode: '010101',
        lat: bp.lat, lng: bp.lng,
        amenities: JSON.stringify(bp.amenities),
        openingHours: JSON.stringify([
          { day: 1, open: '08:00', close: '18:00' }, { day: 2, open: '08:00', close: '18:00' },
          { day: 3, open: '08:00', close: '18:00' }, { day: 4, open: '08:00', close: '18:00' },
          { day: 5, open: '08:00', close: '17:00' }, { day: 6, open: '09:00', close: '14:00' },
        ]),
      },
    });
    if (!firstShopId) firstShopId = shop.id;

    const svcCount = await prisma.service.count({ where: { shopId: shop.id } });
    if (svcCount === 0) {
      for (const [i, s] of bp.services.entries()) {
        await prisma.service.create({
          data: {
            shopId: shop.id, categoryId: catBySlug[s.cat] ?? null, name: s.name,
            durationMin: s.dur, priceFromBani: s.from, priceType: (s as any).type ?? 'FROM', sortOrder: i,
          },
        });
      }
      for (const [i, r] of bp.resources.entries()) {
        await prisma.resource.create({ data: { shopId: shop.id, name: r.name, type: r.type, sortOrder: i } });
      }
      await prisma.subscription.upsert({
        where: { shopId: shop.id },
        update: {},
        create: { shopId: shop.id, plan: 'MERO', status: 'ACTIVE' },
      });
    }
  }

  // make the demo owner a member of the first shop
  if (firstShopId) {
    await prisma.membership.upsert({
      where: { userId_shopId: { userId: owner.id, shopId: firstShopId } },
      update: {},
      create: { userId: owner.id, shopId: firstShopId, role: 'OWNER', title: 'Proprietar' },
    });

    // a demo appointment for the customer at the first shop
    const apptCount = await prisma.appointment.count({ where: { shopId: firstShopId } });
    if (apptCount === 0 && vehicleId) {
      const svc = await prisma.service.findFirst({ where: { shopId: firstShopId } });
      const res = await prisma.resource.findFirst({ where: { shopId: firstShopId } });
      // Next weekday at least 2 days out, 10:00 — inside every seeded shop's opening hours.
      // The seed runs on the dev machine (Romania timezone), so setHours pins 10:00 local RO time.
      const start = new Date();
      start.setDate(start.getDate() + 2);
      while (start.getDay() === 0 || start.getDay() === 6) start.setDate(start.getDate() + 1);
      start.setHours(10, 0, 0, 0);
      const appt = await prisma.appointment.create({
        data: {
          shopId: firstShopId, userId: customer.id, vehicleId, resourceId: res?.id,
          startAt: start, endAt: new Date(start.getTime() + (svc?.durationMin ?? 60) * 60000),
          status: 'CONFIRMED', mode: 'DROP_OFF', problemText: 'Zgomot la frânare în față.',
          estimateBani: svc?.priceFromBani ?? 0,
          readyByAt: new Date(start.getTime() + (svc?.durationMin ?? 60) * 60000),
          items: { create: [{ serviceId: svc?.id, name: svc?.name ?? 'Serviciu', priceBani: svc?.priceFromBani ?? 0, durationMin: svc?.durationMin ?? 60 }] },
        },
      });
      // a past, delivered appointment + review for history
      const past = new Date(Date.now() - 1000 * 60 * 60 * 24 * 40);
      const pastAppt = await prisma.appointment.create({
        data: {
          shopId: firstShopId, userId: customer.id, vehicleId,
          startAt: past, endAt: new Date(past.getTime() + 60 * 60000),
          status: 'DELIVERED', mode: 'DROP_OFF', problemText: 'Schimb ulei periodic.',
          items: { create: [{ name: 'Schimb ulei + filtru', priceBani: 18000, durationMin: 45 }] },
        },
      });
      // No seeded review — the past DELIVERED appointment is left review-able so a real
      // review can be added from the UI and the shop rating auto-computed.
      console.log('   created demo appointments', appt.id, pastAppt.id, '(past one is review-able)');
    }
  }

  // Recompute every shop's rating from REAL published reviews (all 0 on a fresh seed).
  const allShops = await prisma.shop.findMany({ select: { id: true } });
  for (const s of allShops) {
    const agg = await prisma.review.aggregate({ where: { shopId: s.id, status: 'PUBLISHED' }, _avg: { rating: true }, _count: true });
    await prisma.shop.update({ where: { id: s.id }, data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count } });
  }
  console.log('   ratings recomputed from real reviews (0 on fresh seed)');

  console.log('✅ Seed complete.');
  console.log('   Accounts: client@autoprog.ro / client1234 · service@autoprog.ro / service1234 · admin@autoprog.ro / admin1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
