# AI Voice & Text Translator

[![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4.1-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma_Postgres-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Groq Cloud](https://img.shields.io/badge/AI_Engine-Groq_Cloud-F55036?style=flat)](https://groq.com/)

A full-stack, AI-driven multilingual translation web application supporting five major languages: **English**, **Telugu**, **Hindi**, **Tamil**, and **Malayalam**. The system features real-time voice recording, high-fidelity automatic speech recognition, semantic language detection (including Romanized and code-mixed inputs), cross-lingual translation, and client-side synthesized speech response.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Supported Languages](#supported-languages)
- [Technology Stack](#technology-stack)
- [Application Workflow](#application-workflow)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Usage Guide](#usage-guide)
- [Speech-to-Text & Text-to-Speech Architecture](#speech-to-text--text-to-speech-architecture)
- [Troubleshooting](#troubleshooting)
- [Security & Privacy](#security--privacy)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Overview

The **AI Voice & Text Translator** is designed to bridge regional and linguistic divides across South Asian languages. Traditional translation tools often struggle with code-mixed vernaculars (e.g., mixing regional words with English) and Indian languages typed in Romanized/Latin characters. 

This platform addresses those challenges by coupling low-latency automatic speech-to-text (STT) models with large language models (LLMs) configured for linguistic detection. Users can speak naturally into their microphone or type text in either native script or phonetic Latin script. The system automatically identifies the underlying language, translates it into the desired target language, renders the output in its authentic script, and offers voice playback via the browser's speech synthesis engine.

---

## Key Features

- **Five-Language Multilingual Core**: Full translation support across English, Telugu, Hindi, Tamil, and Malayalam.
- **Voice Recording & Speech-to-Text**: Browser-based microphone capture using the MediaRecorder API, transcribed server-side via Groq Whisper models with Indic script priming and verification.
- **Automatic Language Detection**: Intelligent semantic detection capable of identifying native scripts, Romanized Indian languages (e.g., *"nenu bagunnanu"* &rarr; Telugu), and code-mixed sentences without manual source-language selection.
- **Bi-Directional Translation**: High-accuracy translations powered by Groq Llama 3.3 models with strict output schema validation and preservation of proper nouns and punctuation.
- **Text-to-Speech (TTS) Voice Response**: Audio playback using the browser's Web Speech API with BCP-47 locale matching, complete with Play, Pause, Resume, and Stop controls.
- **Native-Voice Fallback Guard**: Detects missing OS voice packs for Indic languages and notifies the user instead of incorrectly reading native scripts in an English accent.
- **Authentication & User Management**: Secure registration and login system with bcrypt password hashing, stateless signed JWT sessions stored in HTTP-only cookies, and Next.js route middleware.
- **Light, Dark & System Theme Modes**: Theme toggle supporting Light, Dark, and System preferences with CSS custom properties and instant flash-free loading.
- **Desktop 50/50 Workspace**: Clean, responsive side-by-side split layout with character counters, real-time status indicators, and one-click clipboard copying.

---

## Supported Languages

The application provides end-to-end support for five languages across text input, speech recognition, translation, and voice response:

| Language | Native Name / Script | ISO 639-1 Code | TTS BCP-47 Locale | Indic Script Unicode Block |
|:---|:---|:---:|:---:|:---:|
| **English** | English | `en` | `en-US` | Basic Latin (`\u0020-\u007F`) |
| **Telugu** | తెలుగు | `te` | `te-IN` | Telugu (`\u0C00-\u0C7F`) |
| **Hindi** | हिन्दी | `hi` | `hi-IN` | Devanagari (`\u0900-\u097F`) |
| **Tamil** | தமிழ் | `ta` | `ta-IN` | Tamil (`\u0B80-\u0BFF`) |
| **Malayalam** | മലയാളം | `ml` | `ml-IN` | Malayalam (`\u0D00-\u0D7F`) |

---

## Technology Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server & Client Components)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with PostCSS
- **Design System**: Vanilla CSS Variables (Tokens for light/dark surfaces, borders, and typography)
- **Iconography**: [Lucide React](https://lucide.dev/)

### Backend & AI Infrastructure
- **Server Framework**: Next.js App Router API Routes (`src/app/api/`)
- **AI Cloud Engine**: [Groq Cloud SDK](https://github.com/groq/groq-typescript) (`groq-sdk`)
  - **Speech-to-Text Model**: `whisper-large-v3-turbo` (or `whisper-large-v3`)
  - **Translation & Detection Model**: `llama-3.3-70b-versatile`
- **Validation**: [Zod 3](https://zod.dev/)

### Database & Authentication
- **Database**: PostgreSQL (Prisma Postgres / Vercel Postgres integration)
- **ORM**: [Prisma ORM 6](https://www.prisma.io/) (`@prisma/client`)
- **Authentication**: Stateless JSON Web Tokens (JWT) signed via [jose](https://github.com/panva/jose)
- **Password Security**: [bcryptjs](https://github.com/dcodeIO/bcrypt.js) (12 salt rounds)
- **Route Guard**: Next.js Edge Middleware (`src/middleware.ts`)

### Browser APIs
- **Audio Capture**: `navigator.mediaDevices.getUserMedia` & `MediaRecorder` API
- **Speech Synthesis**: `window.speechSynthesis` & `SpeechSynthesisUtterance`

---

## Application Workflow

```mermaid
flowchart TD
    subgraph Client ["Client Browser"]
        A[User Input] -->|Option A: Typed Text| B[Input Panel]
        A -->|Option B: Voice Recording| C[MediaRecorder API]
        C -->|Audio Blob| D[POST /api/speech-to-text]
    end

    subgraph Server ["Next.js Server API"]
        D -->|FormData Buffer| E[Groq Whisper STT]
        E -->|Indic Script Priming & Verification| F[Transcribed Text]
        F -->|Populate Input Textarea| B

        B -->|Click PROCEED / Auto-Trigger| G[POST /api/translate]
        G --> H[Groq Llama 3.3 Translation Engine]

        subgraph GroqLLM ["Groq LLM Pipeline"]
            H --> I[Linguistic Analysis]
            I -->|Detect Script: Native / Romanized / Code-Mixed| J[Identify Source Language]
            J -->|Validate Supported Languages| K[Translate to Target Language]
        end

        K -->|JSON Response| L[Output Panel]
    end

    subgraph OutputAction ["Translation Output & Voice Response"]
        L --> M[Display Translated Text & Detected Source]
        L -->|Copy to Clipboard| N[Clipboard API]
        L -->|Voice Output Enabled| O[Browser Web Speech Synthesis]
        O -->|Match BCP-47 Voice| P[Audio Playback: Play / Pause / Resume / Stop]
    end
```

### Detailed Execution Steps:
1. **Input Submission**:
   - **Text Mode**: The user types up to 5,000 characters in English or any supported Indic language (in native script, Romanized letters, or mixed).
   - **Voice Mode**: The user clicks **Record Voice**. The browser records audio chunks in real time. Upon clicking **Stop Recording**, the captured audio blob is transmitted to `/api/speech-to-text`.
2. **Transcription (STT)**:
   - The audio buffer is sent to the Groq Whisper model with multilingual script prompts (`English, తెలుగు, हिन्दी, தமிழ், മലയാളം.`).
   - If an Indic language is recognized, a script verification step validates that the transcription matches the authentic Unicode script block without cross-script pollution. The resulting text is placed in the input area.
3. **Translation & Detection**:
   - The text and selected target language are dispatched to `/api/translate`.
   - The Groq Llama 3.3 model analyzes syntax, vocabulary, and grammar to determine the true source language (even when Romanized or code-mixed) and translates it into the target language.
   - A 15-second server timeout safeguards against network latency.
4. **Display & Synthesis (TTS)**:
   - The translated text and detected source language are displayed on the right panel.
   - If **Voice ON** is enabled, the browser's `SpeechSynthesis` automatically speaks the translated text using the matching regional voice (`te-IN`, `hi-IN`, `ta-IN`, `ml-IN`, or `en-US`).
   - Users can manually trigger, pause, resume, or stop speech playback at any time.

---

## Project Structure

```text
ai-voice-translator/
├── prisma/
│   ├── dev.db                      # Preserved local SQLite database backup
│   ├── dev.db.backup               # Preserved raw database backup
│   └── schema.prisma               # Prisma schema configured with PostgreSQL provider and User model
├── public/                         # Public static assets (icons, favicon)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts       # POST: Verifies password and sets HTTP-only session cookie
│   │   │   │   ├── logout/route.ts      # POST: Clears the session cookie
│   │   │   │   ├── me/route.ts          # GET: Returns the currently authenticated user session
│   │   │   │   └── register/route.ts    # POST: Validates input, hashes password, creates user
│   │   │   ├── speech-to-text/route.ts  # POST: Handles audio upload and calls Groq Whisper
│   │   │   └── translate/route.ts       # POST: Validates payload and calls Groq LLM for translation
│   │   ├── auth/
│   │   │   ├── login/page.tsx           # Login page with validation and theme support
│   │   │   ├── register/page.tsx        # Registration page with validation and theme support
│   │   │   └── forgot-password/page.tsx # Password reset request placeholder page
│   │   ├── privacy/page.tsx        # Privacy policy documentation page
│   │   ├── terms/page.tsx          # Terms of service documentation page
│   │   ├── translator/page.tsx     # Protected translator interface page
│   │   ├── globals.css             # Tailwind CSS v4 directives and CSS custom color tokens
│   │   ├── layout.tsx              # Root HTML layout with ThemeProvider and font configuration
│   │   └── page.tsx                # Index route: redirects authenticated users to /translator or /auth/login
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Footer.tsx          # Shared application footer with navigation and copyright
│   │   │   └── Navbar.tsx          # Navigation header with brand icon, user dropdown, and theme toggle
│   │   ├── theme/
│   │   │   ├── ThemeProvider.tsx   # React context provider managing Light, Dark, and System themes
│   │   │   └── ThemeToggle.tsx     # Dropdown menu to switch between color schemes
│   │   └── translator/
│   │       ├── InputPanel.tsx          # 50% split panel: text input, mic controls, character count, submit
│   │       ├── OutputPanel.tsx         # 50% split panel: translated text, target selector, TTS playback, copy
│   │       └── TranslatorWorkspace.tsx # Main state coordinator for translation, recording, and audio
│   ├── lib/
│   │   ├── ai/
│   │   │   └── groq.ts             # Groq SDK wrapper with Whisper STT and Llama 3.3 translation logic
│   │   ├── speech/
│   │   │   ├── audioRecorder.ts    # Client-side MediaRecorder wrapper with MIME detection and error handling
│   │   │   ├── stt.ts              # Web Speech API recognition helper
│   │   │   └── tts.ts              # Web Speech API SpeechSynthesis manager with BCP-47 locale matching
│   │   ├── auth.ts                 # JWT signing, verification, and HTTP-only cookie management
│   │   └── db.ts                   # PrismaClient singleton instance setup
│   ├── middleware.ts               # Next.js route protection middleware for /translator and auth routes
│   └── types/
│       └── index.ts                # TypeScript types, interfaces, and SUPPORTED_LANGUAGES constants
├── .env.example                    # Template for required environment variables
├── .gitignore                      # Git ignore rules for node_modules, build outputs, and env files
├── next.config.ts                  # Next.js runtime configuration
├── package.json                    # Project dependencies and npm scripts
├── postcss.config.mjs              # PostCSS plugins configuration
├── README.md                       # Comprehensive project documentation
└── tsconfig.json                   # TypeScript compiler configuration
```

---

## Prerequisites

Before setting up the project locally, verify that your environment meets the following requirements:

- **Node.js**: `v18.18.0` or higher (Node.js `v20.x` or `v24.x` LTS recommended)
- **Package Manager**: `npm` (v9.x or higher)
- **Groq API Key**: An active API key from the [Groq Console](https://console.groq.com/keys)
- **Web Browser**: A modern browser with support for the `MediaRecorder` API and the `Web Speech API` (Google Chrome, Microsoft Edge, Brave, or Mozilla Firefox)

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/saleemmalik0229/ai-voice-translator.git
cd ai-voice-translator
```

> **Note**: If your remote was migrated to the extended repository name, you can also use:
> ```bash
> git clone https://github.com/saleemmalik0229/AI-Based-Multimodal-Language-Conversion-and-Voice-Response-System.git
> cd AI-Based-Multimodal-Language-Conversion-and-Voice-Response-System
> ```

### 2. Install Dependencies

Install all required production and development dependencies:

```bash
npm install
```

### 3. Configure Environment Variables

Create your local `.env` configuration by copying the provided `.env.example` file:

```bash
# On Windows (PowerShell)
Copy-Item .env.example .env

# On Linux / macOS
cp .env.example .env
```

Open `.env` and fill in your values (see [Environment Variables](#environment-variables) below).

### 4. Initialize the PostgreSQL Database Schema

To push the Prisma schema and create the tables (`User` model) in your PostgreSQL database:

```bash
npx prisma db push
```

> **Note**: For production deployments, Prisma Client is automatically generated on install via the `postinstall` script (`prisma generate`).

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The application will automatically redirect you to `/auth/login`.

---

## Environment Variables

All sensitive credentials and model identifiers are configured via environment variables. These are read strictly on the server and are never exposed to the client bundle.

| Variable Name | Required | Default Value | Description |
|:---|:---:|:---|:---|
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string (provided automatically by Vercel / Prisma Postgres). |
| `JWT_SECRET` | **Yes** | — | High-entropy secret key used to sign and verify user session JWTs. |
| `GROQ_API_KEY` | **Yes** | — | API key obtained from [Groq Console](https://console.groq.com/keys). |
| `GROQ_STT_MODEL` | No | `"whisper-large-v3"` | Groq Whisper model ID for speech-to-text. |
| `GROQ_TRANSLATION_MODEL` | **Yes** | `"llama-3.3-70b-versatile"` | Groq LLM model ID for translation & language detection. |

### `.env.example` Template

```env
# Server-side Database Configuration (PostgreSQL / Prisma Postgres)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

# JWT Authentication Secret
JWT_SECRET="your-secure-jwt-secret-key-here"

# Groq Cloud API Configuration (Server-Side ONLY)
GROQ_API_KEY="gsk_your_groq_api_key_here"
GROQ_STT_MODEL="whisper-large-v3"
GROQ_TRANSLATION_MODEL="llama-3.3-70b-versatile"
```

### How to Obtain Credentials:
1. **Groq API Key**:
   - Visit [console.groq.com](https://console.groq.com/).
   - Sign up or log in.
   - Navigate to **API Keys** and click **Create API Key**.
   - Copy the key prefix starting with `gsk_` and assign it to `GROQ_API_KEY`.
2. **JWT Secret**:
   - Generate a secure random string (e.g., using `openssl rand -hex 32` in your terminal or any secure password generator) and assign it to `JWT_SECRET`.

---

## Running the Application

### Development Mode
Starts the Next.js development server with Turbopack / Hot Module Replacement:
```bash
npm run dev
```

### Production Build
Compiles the application, checks TypeScript types, and creates an optimized production bundle:
```bash
npm run build
```

### Production Server
Runs the compiled Next.js application in production mode:
```bash
npm run start
```

### Code Linting
Runs ESLint against all source files to verify code quality and style adherence:
```bash
npm run lint
```

---

## Usage Guide

### 1. User Authentication
1. Navigate to `/auth/register` to create a new user account with your Name, Email, and Password (minimum 6 characters).
2. After registration, you are automatically logged in and redirected to `/translator`.
3. If returning, log in via `/auth/login`. Unauthenticated requests to `/translator` are redirected automatically.

### 2. Translating Written Text
1. Navigate to the main workspace.
2. Type or paste your text into the **Input Panel** (left side).
3. Select your desired **Target Language** from the dropdown in the **Output Panel** (right side).
4. Click **PROCEED**.
5. The detected source language will appear above the translated text, and the translation will be rendered in authentic script.

### 3. Translating Spoken Voice
1. Click the **Record Voice** button in the **Input Panel**.
2. Allow browser microphone access when prompted.
3. Speak clearly in English, Telugu, Hindi, Tamil, or Malayalam. A live recording timer will display the elapsed time.
4. Click **Stop Recording**.
5. The application converts your speech to text, places the transcription in the input box, and immediately triggers translation into the chosen target language.

### 4. Listening to Audio Output (Text-to-Speech)
- **Automatic Playback**: Toggle the **Voice OFF** button in the top right of the Output Panel to **Voice ON**. After each translation, the system automatically reads out the translated text.
- **Manual Controls**: Click the **Play** button at the bottom of the Output Panel to listen. Use **Pause**, **Resume**, and **Stop** to manage playback.

### 5. Copying the Output
- Click the **Copy** button at the bottom of the Output Panel to copy the translated text directly to your clipboard.

### 6. Changing Themes
- Click the Theme Toggle icon (Sun / Moon / Monitor) in the top-right corner of the navigation bar to toggle between **Light**, **Dark**, and **System** color themes.

---

## Speech-to-Text & Text-to-Speech Architecture

### Speech-to-Text (STT) Details
- **Audio Capture**: Browser `MediaRecorder` queries supported container formats dynamically (`audio/webm;codecs=opus`, `audio/mp4`, `audio/ogg`, or `audio/wav`).
- **Server Audio Handling**: Up to 25 MB audio blobs are processed via multipart form data in `src/app/api/speech-to-text/route.ts`.
- **Multilingual Script Priming**: Whisper models can occasionally map regional phonetic speech into Latin characters or adjacent scripts. To prevent this, the backend injects multilingual priming tokens (`English, తెలుగు, हिन्दी, தமிழ், മലയാളം.`).
- **Script Verification & Correction**: If Whisper detects an Indic language, the system checks whether the output contains characters from the authentic Unicode block. If cross-script pollution is detected, a secondary transcription pass is performed with explicit language constraints (`te`, `hi`, `ta`, `ml`) to ensure native script integrity.

### Text-to-Speech (TTS) Details
- **Browser Synthesis Engine**: Built on the native Web Speech API (`window.speechSynthesis`).
- **Asynchronous Voice Initialization**: Listens to the browser `voiceschanged` event to ensure voice lists are completely loaded before invoking speech.
- **Case-Insensitive Locale Matching**: Matches BCP-47 identifiers (`te-IN`, `hi-IN`, `ta-IN`, `ml-IN`, `en-US`) using exact and base-prefix comparisons.
- **Missing Voice Pack Notification**: If a user requests speech output for an Indian language (e.g., Telugu) on an OS that lacks that language pack, the application displays a friendly banner guiding the user to install the language pack in OS settings, rather than attempting to read Indian script using an English voice.

---

## Troubleshooting

### 1. Microphone Access Denied or Fails to Start
- **Cause**: Browser microphone permissions are blocked, or another program is holding exclusive access to the microphone.
- **Solution**: Click the lock/settings icon in your browser's address bar, set **Microphone** to **Allow**, refresh the page, and ensure no other application (e.g., Zoom, Teams) is using the microphone.

### 2. "No [Language] voice is installed on this device"
- **Cause**: The operating system lacks a Text-to-Speech voice engine for that regional Indic language.
- **Solution**: 
  - **Windows**: Go to *Settings &rarr; Time & Language &rarr; Language & Region &rarr; Add a language* (e.g., Telugu, Tamil, Malayalam, Hindi) and ensure the "Speech" component is checked.
  - **macOS**: Go to *System Settings &rarr; Accessibility &rarr; Spoken Content &rarr; System Voice &rarr; Manage Voices* and download the corresponding language voice.
  - *Note*: Even without a voice pack, written translations function normally.

### 3. "Groq service is not properly configured" / Translation Timeout
- **Cause**: `GROQ_API_KEY` is missing or invalid in your `.env` file, or the network request exceeded the 15-second timeout.
- **Solution**: Check that `.env` contains a valid key starting with `gsk_`. Verify your connection to the Groq Cloud API and restart the development server (`npm run dev`).

### 4. Database / Prisma Client Errors (`User` table not found)
- **Cause**: The PostgreSQL database schema has not been initialized.
- **Solution**: Run `npx prisma db push` followed by `npx prisma generate` to create and synchronize tables with your PostgreSQL database.

### 5. Next.js Build Fails on Route Checks
- **Cause**: Cached build artifacts or outdated TypeScript declarations.
- **Solution**: Delete the `.next` directory and run:
  ```bash
  npm run build
  ```

---

## Security & Privacy

- **Server-Side API Secrets**: The Groq API key and JWT secret are never passed to the browser or prefixed with `NEXT_PUBLIC_`. All AI model operations occur inside server-side Next.js route handlers.
- **Stateless Protected Sessions**: Authentication is handled via signed JWTs using `HS256` and stored in `HttpOnly`, `SameSite=Lax`, and `Secure` (in production) cookies.
- **Password Protection**: Passwords are never stored in plaintext. They are salted and hashed using `bcryptjs` with 12 rounds before storage in PostgreSQL.
- **Environment Isolation**: `.env` and `.env.*` files containing live keys are ignored by `.gitignore` to prevent accidental commits to public repositories.
- **Input Sanitization**: Payloads sent to translation routes are type-checked, trimmed, and capped at a maximum of 5,000 characters to prevent denial-of-service and model overflow.

---

## Future Improvements

The following features represent potential enhancements for future iterations of the project:

- [ ] **Translation History**: Store past user translations in SQLite via Prisma for easy retrieval across sessions.
- [ ] **Audio Export**: Enable downloading synthesized speech output as `.mp3` or `.wav` files.
- [ ] **Cloud TTS Fallback**: Integrate cloud-based neural text-to-speech APIs to provide guaranteed high-quality voice output on devices lacking local OS Indic voices.
- [ ] **Document Translation**: Add support for uploading `.pdf`, `.docx`, or `.txt` files for direct document-level translation.
- [ ] **Additional Indic Languages**: Expand the model configuration and TTS locales to support Bengali, Kannada, Marathi, and Gujarati.

---

## License

No license has been specified for this project. All rights are reserved by the repository owner.
