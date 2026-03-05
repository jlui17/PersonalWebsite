# AGENTS.md - Website2.0

This is Justin Lui's personal portfolio website — a minimal, dark-themed single-page React app with casual, personality-driven content.

## Tech Stack

- **Framework:** React 17 + Vite (SWC plugin for fast builds)
- **Styling:** Tailwind CSS 3.3 + custom CSS variables
- **Language:** JSX + TypeScript (mixed usage)
- **Build Tool:** Vite 5.x
- **Icons:** react-icons (AiFillGithub, AiFillLinkedin)
- **UI Components:** @headlessui/react, hamburger-react

## Design System

### Colors
- **Background:** `#121212` (neutral-900) — dark charcoal
- **Accent:** `#FFE7B3` (orange-200) / `#FFD271` (orange-300 hover)
- **Text:** `#F5F5F5` (white/off-white)
- **Secondary:** `#1E1E1E` (background2), `#696969` (dates), `#7B7B7B` (scrollbar)

### Typography
- **Headings:** Quicksand (Google Fonts) — rounded, friendly sans-serif
- **Body:** Work Sans (Google Fonts) — clean, readable sans-serif
- **Scale:** 
  - H1: 2rem with highlight mark
  - H4: 1.075rem (section labels in orange-200)
  - Body: 1rem, font-light in neutral-300/400

### Components

**Link Button (`Link.tsx`)**
- Orange pill-shaped buttons (`rounded-xl`)
- Icon + text layout, horizontal flex
- Hover: bg-orange-300 transition
- External links open in new tab (`target="_blank"`)

**Layout**
- Min full viewport height (`min-h-screen`)
- Narrow centered content with max-width 600px
- Vertical stack layout (no side-by-side)
- Generous vertical padding (`py-12`)

### Content Sections

| Section | Style |
|---------|-------|
| Header | Name in orange mark + short tagline |
| Now | Bulleted list of current activities |
| Stack | Inline list of tools |
| Fun fact | Short paragraph |
| Recent rabbit hole | Short paragraph |
| Links | GitHub + LinkedIn only |

### Patterns
- **Tone:** Casual, conversational, minimal corporate speak
- **Section labels:** Orange-200 H4s
- **Body text:** Neutral-300 for readable gray
- **Spacing:** Section margins via `mb-8`, final section `mb-10`
- **Lists:** Simple `space-y-2` vertical spacing

## File Structure

```
Website2.0/
├── index.html              # Entry HTML with Google Fonts preload
├── vite.config.js          # Vite + SWC React plugin
├── tailwind.config.cjs     # Tailwind with custom fontFamily
├── postcss.config.cjs      # PostCSS + autoprefixer
├── package.json            # React 17, Vite, Tailwind deps
├── public/
│   └── images/             # Headshot, favicon, thumbnail
└── src/
    ├── index.jsx           # React mount point
    ├── index.css           # Tailwind + custom base styles
    ├── App.jsx             # Main page component
    └── components/
        └── Link.tsx        # Reusable external link button
```

## Development

```bash
npm start       # Vite dev server
npm run build   # Production build
npm run serve   # Preview production build
```

## Conventions

- Tailwind classes preferred, `@layer base` for element resets
- `!important` used heavily in CSS (legacy from CRA migration)
- Mixed JSX/TSX — new components can be either
- Icons from react-icons only
- Keep copy casual and personality-forward
- No resume PDF, no Medium, no "open to work" banners

## Deployment

- **Platform:** Netlify (connected to GitHub repo)
- **Auto-deploy:** Pushes to `main` branch trigger automatic deployment
- **Live URL:** https://justinlui.dev

## Notes

- Single-page landing — no routing
- Content over credentials — shows personality, not just job history
- No dark mode toggle (dark is the only mode)
- Links only to GitHub/LinkedIn for people who want the professional stuff
- Minimal dependencies — keep it lightweight
