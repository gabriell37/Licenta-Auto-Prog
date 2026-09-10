# AutoProg

Aplicație web pentru programări online la service-uri auto. Proiectul este realizat
ca o platformă cu două fețe: una pentru clienți (care își caută un service și fac o
programare) și una pentru service-uri (care își gestionează programările, clienții și
serviciile oferite). Ideea de bază este similară cu platforme precum MERO, dar adaptată
pentru domeniul auto din România.

## Ce poate face aplicația

Aplicația are trei tipuri de utilizatori:

**Client**
- caută service-uri auto după categorie, oraș sau cuvinte cheie
- își adaugă mașinile în „garajul" personal (cu serie de șasiu / număr, istoric, documente)
- face o programare printr-un formular pas cu pas, cu posibilitatea de a atașa
  poze, video sau chiar o înregistrare audio cu zgomotul mașinii
- urmărește în timp real statusul reparației și poate discuta cu service-ul
- lasă recenzii după ce reparația este gata

**Service (cont de business)**
- are un calendar cu programările pe zile și pe resurse (lift, box, mecanic)
- gestionează programările: primire în service (check-in), deviz de cost, fișă de
  inspecție (DVI), schimbarea statusului lucrării
- își administrează lista de servicii și prețurile
- vede clienții și recenziile primite

**Administrator**
- verifică și moderează service-urile înscrise pe platformă
- moderează recenziile și gestionează utilizatorii

## Tehnologii folosite

- **Next.js 15** (App Router) cu React 19 și TypeScript
- **Tailwind CSS** pentru interfață (cu temă deschisă / întunecată)
- **Prisma ORM** pentru baza de date
- **SQLite** pentru rulare locală simplă (în producție se poate trece pe PostgreSQL)
- autentificare proprie cu token JWT salvat în cookie securizat (`jose`, `bcryptjs`)

## Cum se rulează local

Sunt necesare Node.js (versiunea 18 sau mai nouă) și npm.

```bash
npm install              # instalează dependențele
cp .env.example .env     # creează fișierul de configurare
npx prisma db push       # creează baza de date locală (SQLite)
npm run db:seed          # adaugă date de test (service-uri, conturi, programări)
npm run dev              # pornește aplicația pe http://localhost:3000
```

Pentru varianta de producție:

```bash
npm run build
npm start
```

## Conturi de test

După rularea comenzii de seed, pe pagina de autentificare există butoane pentru
logare rapidă cu aceste conturi:

| Rol     | Email                  | Parolă        |
|---------|------------------------|---------------|
| Client  | `client@autoprog.ro`   | `client1234`  |
| Service | `service@autoprog.ro`  | `service1234` |
| Admin   | `admin@autoprog.ro`    | `admin1234`   |

## Structura proiectului

```
src/
  app/
    (consumer)/   paginile pentru client (acasă, căutare, garaj, programări, cont)
    (pro)/        panoul service-ului (calendar, programări, clienți, servicii)
    (admin)/      panoul de administrare
    actions/      logica de server (autentificare, programări, mașini etc.)
    api/          încărcare fișiere media, export date
  components/     componentele de interfață, grupate pe secțiuni
  lib/            funcții utile (baza de date, autentificare, calcul intervale, validări)
prisma/
  schema.prisma   structura bazei de date
  seed.ts         datele de test
```

## Observații

- Sumele de bani sunt păstrate în bani (numere întregi), nu în valori cu virgulă, ca
  să se evite erorile de rotunjire.
- Calculul intervalelor orare este făcut pe fusul orar al României (`Europe/Bucharest`).
- Fișierul `.env` (cu cheile reale) nu este inclus în proiect; se pornește de la
  `.env.example`.
