# Languro - Advanced Language Learning Platform

Languro is a cutting-edge language learning platform built with Next.js 16, designed to help users master verb conjugations, vocabulary, reading, and writing through interactive drills and AI-powered feedback.

![Languro Dashboard](https://github.com/NextJSTemplates/play-nextjs/blob/main/nextjs-play.png) *(Replace with actual screenshot)*

## 🚀 Key Features

- **Advanced Conjugation Engine**: Detailed conjugation tables for 300+ verbs across multiple tenses and moods.
- **Spaced Repetition System (SRS)**: Optimized review schedules based on user performance (SM-2 algorithm implementation).
- **Interactive Drills**: Multiple quiz types including flashcards, multiple-choice, and fill-in-the-blank exercises.
- **AI-Powered Writing Practice**: Submit typed or handwritten text (via mobile upload) and receive instant CEFR-aligned corrections and explanations using Gemini 1.5 Pro.
- **Immersive Reading**: Read level-appropriate texts with word-level audio alignment for pronunciation practice.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, Shadcn UI
- **Backend**: Next.js Server Actions, Prisma ORM
- **Database**: PostgreSQL (with specialized views for conjugation data)
- **AI & ML**: Google Gemini 3 Pro (Writing Feedback), Google Cloud TTS (Audio Generation)
- **Data Engineering**: [Airflow Pipeline](https://github.com/Teelon/Airflow_Languro) for batch TTS generation and content management.
- **Storage**: Cloudflare R2 (Audio files, User uploads)
- **Authentication**: NextAuth.js (v5)

---

## 💾 Database Schema & Architecture

The database is designed with modularity in mind, separating core user data from specific learning modules.

### 1. Authentication & User Profile
Manages user identity, preferences, and onboarding state.

- **`User`**: Core identity record.
- **`Account`**: OAuth provider links (Google, GitHub).
- **`Session`**: Active user sessions.
- **`UserPreferences`**: Settings for notifications, privacy, and interface customization.
- **`UserOnboardingProfile`**: Stores user's native/target languages, CEFR level, and learning goals.
- **`OnboardingProgress`**: Tracks completion of the initial setup flow.

### 2. Conjugation Engine (Core)
The heart of the verb learning system. Structured to support any language with complex inflection rules.

- **`Language`**: Supported languages (e.g., English, Spanish, French).
- **`VerbTranslation`**: Maps a verb concept (e.g., "to eat") to its translation in a specific language (e.g., "comer").
- **`TenseCategory`**: High-level grouping (Past, Present, Future).
- **`Tense`**: Specific grammatical tenses (e.g., "Preterite", "Subjunctive Imperfect").
- **`Pronoun`**: Subject pronouns (e.g., "yo", "tú", "nosotros").
- **`Conjugation`**: The actual conjugated form of a verb for a specific tense and pronoun. Includes audio keys and irregularity flags.
- **`VwFullConjugation`**: *Database View* that denormalizes this data for fast read operations in the frontend.

### 3. Learning System (Drills & SRS)
Tracks user progress and schedules reviews.

- **`ContentItem`**: polymorphic container that can represent a Verb, a Vocabulary word, or a Phrase. Acts as the central node for learning.
- **`DrillItem`**: A specific question or exercise derived from a `ContentItem`.
- **`Mastery`**: The user's SRS state for a specific `DrillItem` (score, streak, next review date).
- **`Attempt`**: Log of every answer a user gives, used for analytics and adjusting SRS intervals.
- **`TemplatePack`** & **`TemplatePackItem`**: Curated collections of content (e.g., "Top 50 Verbs", "Travel Essentials") that users can subscribe to.

### 4. Reading Module
Provides reading comprehension content.

- **`ReadingLesson`**: Contains the text, title, difficulty level, and alignment data (timestamps) for audio sync.
- **`ReadingProgress`**: Tracks which lessons a user has started or completed.
- **`UserVocabulary`**: Links users to words they have encountered or saved during reading.

### 5. Writing Practice
Handles user submissions and AI corrections.

- **`WritingImage`**: A pool of shared images used as writing prompts to save storage/generation costs.
- **`WritingPrompt`**: An instance of a user engaging with a specific image prompt.
- **`WritingSubmission`**: The user's essay or sentence. specific fields include:
    - `inputType`: "typed" or "handwritten".
    - `recognizedText`: Output from OCR if handwritten.
    - `corrections`: JSON blob containing AI-generated fixes and explanations.
- **`HandwritingSession`**: Temporary state for linking a mobile camera upload to a desktop session via QR code.

---

## ⚡ Installation & Setup

### Prerequisites
- Node.js v20+
- PostgreSQL Database
- Cloudflare R2 Buckets (one for Audio files, one for Writing Feature images)
- Google Cloud Project (for TTS and Gemini API)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd languro
```

### 2. Configure Environment
Copy the example environment file:
```bash
cp .env.example .env
```
Fill in the following critical variables in `.env`:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
NEXT_PUBLIC_R2_PUBLIC_URL="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_AUDIO="..."
R2_BUCKET_IMAGES="..."
GEMINI_API_KEY="..."
```

### 3. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 4. Database Setup
Push the schema to your database:
```bash
npx prisma db push
```

### 5. Seed Data
Languro requires initial data (Templates, Languages, Tenses) to function. Run the seeding scripts in order:

```bash
# 1. Seed Template Packs (Standard lists like "Top 100 Verbs")
npm run seed:packs

# 2. Generate Smart Packs (Dynamic lists based on difficulty)
npm run generate:smart-packs

# 3. Generate Drill Items (Creates the actual exercises from content)
npm run generate:drills
```

### 6. Run the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🧪 Testing

Run strict validation tests to ensure the learning engine is working correctly:

```bash
# Test SRS Algorithm logic
npm run test:srs

# Test Drill Generation
npm run test:drill-engine

```

## 📄 License

This work is licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-nc-sa/4.0/).
You are free to use, adapt, and share this software for non-commercial purposes, provided you attribute the creator and distribute your contributions under the same license. Commercial use is strictly prohibited without prior permission.
