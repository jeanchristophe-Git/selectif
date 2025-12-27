# Selectif

Plateforme de recrutement assistée par IA pour l'Afrique.

## Stack Technique

- **Framework**: Next.js 16 (App Router)
- **Base de données**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Auth**: Better Auth + JWT
- **IA**: Groq (LLaMA 3.3)
- **Paiements**: GeniusPay
- **Email**: Resend
- **Styling**: Tailwind CSS + shadcn/ui

## Installation

1. Cloner le repo:
```bash
git clone [repo-url]
cd selectif
```

2. Installer les dépendances:
```bash
npm install --legacy-peer-deps
```

3. Configurer les variables d'environnement:
```bash
cp .env.example .env
```
Puis remplir les valeurs dans `.env`

4. Setup de la base de données:
```bash
npx prisma generate
npx prisma db push
```

5. Lancer en dev:
```bash
npm run dev
```

## Configuration

Voir `.env.example` pour toutes les variables d'environnement requises.

## Déploiement

Déployer sur Vercel avec un clic:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/[your-repo])

N'oubliez pas de configurer toutes les variables d'environnement dans les settings Vercel.
