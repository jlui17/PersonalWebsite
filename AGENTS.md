# AGENTS.md - Website2.0

Personal portfolio — café vibes with dev undertones. Warm, conversational, minimal corporate speak.

## Tech Stack
React 19 + Vite + Tailwind CSS 3.4. Single-page landing.

## Design System
**Theme:** Warm café palette only (`--bg-main: #faf8f5`, `--text-main: #3d3833`, `--accent-primary: #b8956f`)
**Typography:** Quicksand (headings) + Inter (body). No monospace fonts.
**Layout:** Narrow centered content (max-width 600px), vertical stack, generous padding.

## Voice & Tone
- **Casual over professional** — write like you're chatting at a coffee shop
- **Dev identity through subtle hints** — playful tech references ("beeping and booping"), not jargon
- **Personal details** — relationships, hobbies, quirks are first-class content
- **No resume speak** — avoid "leveraging", "optimized", "driving results"
- **Show, don't tell** — Projects speak through stories ("helped my friends get into classes") not metrics

## Content Patterns
- Section headers: Accent-colored H4s
- Lists: `space-y-2` vertical spacing
- Project links: Plain text with hover underline, casual descriptions
- Spacing: `mb-8` between sections, `mb-4` for last

## What to Avoid
- Monospace fonts, code blocks, terminal styling
- Corporate buzzwords, resume formatting
- "Tools I use" sections with tech stack lists
- Timeline/career progression layouts
- Photos (unless adding illustrative drawings instead)

## Commands
```bash
npm start       # Dev server (localhost:5173)
npm run build   # Production build
git push        # Auto-deploys to Netlify
```
