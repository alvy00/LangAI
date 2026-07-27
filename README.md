# 🎙️ AsyncLangAI

### AI-Powered English Speaking Practice Platform

Practice speaking English with a live AI voice agent, get instant feedback on how you did, and know exactly what to work on next — no scheduling a tutor, no scripted text-chat drills.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Vapi AI](https://img.shields.io/badge/Vapi-Voice_AI-8B5CF6)](https://vapi.ai/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Redis](https://img.shields.io/badge/Redis-Job_Queue-DC382D?logo=redis&logoColor=white)](https://redis.io/)

[Live Demo](https://asynclangai.vercel.app/) · [Report Bug](https://github.com/alvy00/LangAI/issues) · [Request Feature](https://github.com/alvy00/LangAI/issues)

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [How It Works](#-how-it-works)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Available Scripts](#-available-scripts)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 About

Most self-taught English learners hit the same wall: there's no one to actually *talk to*. Grammar apps and flashcards teach vocabulary, but fluency needs live, unscripted conversation — and that's expensive and hard to schedule.

AsyncLangAI puts a real-time AI voice agent in that gap. Learners create a custom mock interview or conversation scenario tailored to their goals, speak naturally with the AI in real time, and get instant, structured feedback on their performance — with heavier analysis handled asynchronously so the live conversation never lags.

## ✨ Features

- 🎙️ **Live AI Voice Conversations** — real-time, natural spoken practice via the Vapi AI Web SDK, not scripted text-based chat
- 🧠 **Custom Virtual Interviews** — generate mock interviews and conversation scenarios tailored to a specific role or goal, powered by Google Gemini through the Vercel AI SDK
- ⚡ **Instant Performance Feedback** — structured, detailed feedback surfaced immediately after each session
- 🎯 **Targeted Improvement Tips** — actionable, personalized guidance on what to practice next
- 🔁 **Asynchronous Feedback Pipeline** — Redis-backed Bull job queue processes scoring and feedback generation in the background, keeping the live session responsive
- 🔐 **Secure Authentication** — Firebase Authentication on the client, verified server-side via the Firebase Admin SDK
- 🧾 **Type-Safe Forms & Validation** — `react-hook-form` + Zod schemas validate every user input and AI response end-to-end
- 🌗 **Light/Dark Theming** — `next-themes` for a persistent, system-aware theme
- 📈 **Usage Insights** — Vercel Analytics baked in
- 🧩 **Accessible UI Primitives** — built on Radix UI (`select`, `label`, `slot`) with `class-variance-authority`-driven variants

## 🧠 How It Works

1. **Scenario Setup** — the user defines a role, goal, or topic for the practice session.
2. **AI Prompting** — the app builds a structured prompt and sends it to Gemini via `@ai-sdk/google` / `ai` (Vercel AI SDK).
3. **Live Voice Session** — a real-time voice conversation runs through the Vapi AI Web SDK, with natural back-and-forth dialogue.
4. **Background Scoring** — once the session ends, transcript analysis and feedback generation are pushed onto a Redis-backed Bull queue instead of blocking the UI.
5. **Feedback & Guidance** — the user receives instant performance insights and targeted tips on what to improve for next time.

## 🛠 Tech Stack

| Layer                 | Technology                                                                 |
| ---------------------- | --------------------------------------------------------------------------- |
| **Framework**          | Next.js 15 (Turbopack)                                                     |
| **Language**           | TypeScript 5, React 19                                                     |
| **Voice AI**           | [Vapi AI](https://vapi.ai/) (`@vapi-ai/web`)                               |
| **Conversational AI**  | Google Gemini via `@ai-sdk/google` and the Vercel `ai` SDK                 |
| **Auth**               | Firebase Authentication (client) + Firebase Admin SDK (server)             |
| **Background Jobs**    | Redis + Bull (async feedback/scoring queue)                                |
| **Forms & Validation** | `react-hook-form`, `@hookform/resolvers`, Zod                              |
| **UI Components**      | Radix UI (`select`, `label`, `slot`), `class-variance-authority`, `clsx`   |
| **Icons**               | Lucide React                                                                |
| **Notifications**      | Sonner                                                                     |
| **Styling**             | Tailwind CSS 4, `tailwind-merge`, `tailwindcss-animate`                    |
| **Theming**             | `next-themes`                                                              |
| **Utilities**           | `dayjs`                                                                    |
| **Analytics**           | Vercel Analytics                                                            |
| **Deployment**          | Vercel                                                                     |

## 🏗 Architecture

AsyncLangAI runs as a single unified Next.js application, with the async workload split out from the request/response cycle:

```
Client (Next.js) ⇄ Vapi Voice Session (real-time audio)
       ⇄ API Routes ⇄ Gemini (AI SDK)   — scenario/prompt generation
       ⇄ Bull Queue ⇄ Redis             — background scoring & feedback
       ⇄ Firebase (Auth + Admin SDK)    — session/user verification
```

- **Live layer** — Vapi handles the real-time voice conversation directly with the client, keeping latency low.
- **Generation layer** — API routes call Gemini through the Vercel AI SDK to build scenarios and process transcripts.
- **Async layer** — post-session feedback and scoring are queued via Bull/Redis so the app stays responsive under load instead of blocking on AI response time.
- **Auth layer** — Firebase Authentication on the client, verified server-side through Firebase Admin for protected routes.

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18.18+ (v20+ recommended for Next.js 15 / Tailwind CSS 4)
- **npm**, **pnpm**, or **yarn**
- **Git**
- A [Firebase](https://firebase.google.com/) project (Auth + Admin SDK credentials)
- A [Google AI Studio](https://ai.google.dev/) API key (Gemini)
- A [Vapi AI](https://vapi.ai/) account (public + private API keys)
- A [Redis](https://redis.io/) instance (local or hosted, e.g. Upstash/Redis Cloud)

### Installation

Clone the repository:

```bash
git clone https://github.com/alvy00/LangAI.git
cd LangAI
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```bash
# Firebase (client)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

# Firebase (server / Admin SDK)
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY=your_service_account_private_key

# AI — Gemini
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# Voice AI — Vapi
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_public_key
VAPI_API_KEY=your_vapi_private_key

# Background Jobs
REDIS_URL=your_redis_connection_string
```

### Running Locally

Start the dev server (Turbopack-powered):

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## ⚡ Available Scripts

| Command         | Purpose                                     |
| --------------- | -------------------------------------------- |
| `npm install`   | Install all project dependencies             |
| `npm run dev`   | Start the Next.js dev server with Turbopack  |
| `npm run build` | Create an optimized production build         |
| `npm run start` | Start the production build                   |
| `npm run lint`  | Run ESLint across the project                |

## 📁 Project Structure

```
LangAI/
├── app/            # Next.js App Router pages & API routes
├── components/     # Shared UI components
├── constants/       # App-wide constants and config
├── firebase/        # Firebase client/admin setup
├── lib/             # AI, queue, and utility logic
├── types/            # Shared TypeScript types
├── public/           # Static assets
├── .env.local         # Local environment variables (not committed)
└── package.json        # Project dependencies & scripts
```

## 🤝 Contributing

Contributions are welcome! Please check existing [issues](https://github.com/alvy00/LangAI/issues) for good first tasks before opening a PR.

1. Fork the repository and create a feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes, then stage and commit:

   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

3. Push your branch and open a **Pull Request** against `main`, with a clear description of what changed and why.

**Guidelines:**

- Keep commits and PRs small and focused
- Write clear, descriptive commit messages
- Run `npm run lint` before pushing

## 🩺 Troubleshooting

| Problem                        | Solution                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------ |
| `npm install` fails             | Confirm Node.js (v18.18+) and npm are installed and up to date                |
| Vapi session fails to start     | Confirm microphone permissions and that the public Vapi token is exposed via `NEXT_PUBLIC_` |
| Gemini API errors               | Verify your API key and check Google AI Studio quota/usage limits             |
| Feedback never appears          | Confirm `REDIS_URL` is correct and the Redis instance is reachable            |
| Firebase auth errors            | Double-check `.env.local` values match your Firebase project config exactly   |
| Port already in use             | Stop the conflicting process or run `next dev -p <port>`                     |

## 🔮 Roadmap

- [ ] Multi-language support beyond English
- [ ] Group/peer practice sessions
- [ ] Downloadable session transcripts & feedback reports
- [ ] Progress dashboard with historical performance trends
- [ ] Mobile app companion

## 📄 License

Distributed under the MIT License.

## 📬 Contact

Maintained by [@alvy00](https://github.com/alvy00). For questions or support, please open an [issue](https://github.com/alvy00/LangAI/issues).
