# Play Next.js - SaaS Boilerplate & Starter Kit

**Play Next.js** is a free and open-source SaaS starter kit and boilerplate, designed and built for SaaS startups, apps, businesses, and more. It comes with premium design, essential UI components, and fully integrated Authentication, Database, and Payment systems.

[![Play Next.js](https://github.com/NextJSTemplates/play-nextjs/blob/main/nextjs-play.png)](https://play.nextjstemplates.com)

## 🚀 Features

- **Framework**: Built with [Next.js 16](https://nextjs.org/) (App Router).
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/).
- **Authentication**: Secure user management with [NextAuth.js](https://next-auth.js.org/).
- **Payments**: Subscription payments with [Stripe](https://stripe.com/).
- **Styling**: Tailwind CSS for rapid and responsive UI design.
- **Blog**: MDX-powered blog system.
- **Email**: Email delivery system integrated.

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v20 or higher)
- [PostgreSQL](https://www.postgresql.org/) (local or cloud instance)

## 🏁 Getting Started

Follow these steps to set up the project locally:

### 1. Clone the repository

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Install dependencies

```bash
npm install --legacy-peer-deps
```
*Note: The `--legacy-peer-deps` flag is currently required due to some peer dependency conflicts with React 19.*

### 3. Setup Environment Variables

Copy the example environment file to create your own local `.env` file:

```bash
cp .env.example .env
```

Open `.env` and fill in the required variables:

- **Database**: Set `DATABASE_URL` to your PostgreSQL connection string.
- **NextAuth**: 
  - Set `NEXTAUTH_URL=http://localhost:3000`
  - Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
  - Generate a `SECRET` (e.g., using `openssl rand -base64 32`).
- **OAuth Providers**: Add Client IDs and Secrets for Google/GitHub if using social login.

### 4. Setup Database

Generate the Prisma Client and push the schema to your database:

```bash
npx prisma generate
npx prisma db push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🚀 Deployment

You can deploy this project easily on [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FNextJSTemplates%2Fplay-nextjs)

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
