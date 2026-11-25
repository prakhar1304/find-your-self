# Find Yourself

Adaptive career self-report. Black theme, Astro, fully static: answers never leave the browser.

    npm install
    npm run dev
    npm test
    npm run build

Deploy: import this repo in Vercel. It detects Astro; no settings needed.

- `src/lib/questions.ts` question bank and branching
- `src/lib/careers.ts` careers, outlook notes and sources (review yearly)
- `src/lib/score.ts` scoring
- `src/lib/report.ts` radar chart and AI-ready Markdown

Interest items are original, based on the RIASEC framework. Personality items: Mini-IPIP (Donnellan et al., 2006), public domain via ipip.ori.org. Scores are not normed or validated; this is guidance, not a diagnosis.
