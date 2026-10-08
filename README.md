# 🎵 VinylNation

<p align="center">
  <img src="https://img.shields.io/badge/Nuxt.js-3.13.0-00DC82" alt="Nuxt.js Version">
  <img src="https://img.shields.io/badge/Vue-3.5-4FC08D" alt="Vue Version">
  <img src="https://img.shields.io/badge/Prisma-5.19.0-2D3748" alt="Prisma Version">
  <img src="https://img.shields.io/badge/Stripe-16.9.0-008CDD" alt="Stripe Version">
</p>

## 📋 Overview

VinylNation is a modern e-commerce platform dedicated to vinyl record enthusiasts. Built with Nuxt.js and Vue, this application provides a seamless shopping experience for browsing, purchasing, and managing vinyl records.

## ✨ Features

- 🛒 Full e-commerce functionality with shopping cart
- 💳 Secure payment processing with Stripe integration
- 👤 User authentication and account management
- 📦 Order tracking and history
- 🔍 Product browsing and filtering
- 📱 Responsive design for all devices
- 🎨 Modern UI with smooth animations

## 🛠️ Tech Stack

- **Frontend**: Nuxt.js 3, Vue.js, TailwindCSS
- **State Management**: Pinia with persistence
- **Database**: Prisma ORM
- **Authentication**: Nuxt Supabase
- **Payment Processing**: Stripe
- **Styling**: TailwindCSS
- **Icons**: Nuxt Icon
- **Animations**: Vue3 Lottie

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/vinylnation.git
   cd vinylnation
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   # then fill in DATABASE_URL, SUPABASE_*, STRIPE_* and (optionally) VAPI/KAFKA values
   ```

4. Set up the database
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### Development

Start the development server on `http://localhost:3001`:

```bash
npm run dev
# or
yarn dev
# or
pnpm run dev
# or
bun run dev
```

### Production

Build the application for production:

```bash
npm run build
# or
yarn build
# or
pnpm run build
# or
bun run build
```

Preview the production build locally:

```bash
npm run preview
# or
yarn preview
# or
pnpm run preview
# or
bun run preview
```

## 📝 Code Quality

This project uses ESLint and Prettier for code quality and formatting:

```bash
# Lint the code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## 📁 Project Structure

- `/components` - Reusable Vue components
- `/layouts` - Page layouts
- `/pages` - Application pages and routes
- `/prisma` - Database schema and migrations
- `/public` - Static assets
- `/server/api` - API endpoints (`products`, `address`, `orders`, `stripe`, `vapi`)
- `/server/utils` - Shared server helpers (Prisma client, auth, Stripe, Kafka, search)
- `/scripts` - Manual scripts for exercising the Vapi endpoints against a running dev server
- `/stores` - Pinia state stores
- `/types` - TypeScript type definitions

## 🔗 Useful Links

- [Nuxt.js Documentation](https://nuxt.com/docs)
- [Vue.js Documentation](https://vuejs.org/guide/introduction.html)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Stripe Documentation](https://stripe.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
