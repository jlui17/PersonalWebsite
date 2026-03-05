# AGENTS.md - Website2.0

This is Justin Lui's personal portfolio website — a minimal, warm-themed single-page React app with casual, personality-driven content.

## Tech Stack

- **Framework:** React 19 + Vite (SWC plugin for fast builds)
- **Styling:** Tailwind CSS 3.4 + CSS custom properties (theme system)
- **Language:** JSX + TypeScript (mixed usage)
- **Build Tool:** Vite 7.x
- **Icons:** react-icons (AiFillGithub, AiFillLinkedin)

## Design System

### Theme System (Warm Palette)
Four interchangeable themes via CSS classes on body:
- **theme-sage** (default) — Sage & Clay, muted greens
- **theme-terracotta** — Terracotta Cream, warm oranges  
- **theme-coffee** — Coffee (Light), warm browns
- **theme-dark-coffee** — Dark Coffee, dark browns

### Color Variables (CSS Custom Properties)
- `--bg-main` — Main background
- `--bg-secondary` — Secondary/cards
- `--text-main` — Primary text
- `--text-muted` — Body/descriptions
- `--text-subtle` — Hints/secondary
- `--accent-primary` — Accent color (links, buttons)
- `--accent-primary-hover` — Accent hover state

### Typography
- **Headings:** Quicksand (Google Fonts) — rounded, friendly sans-serif
- **Body:** Work Sans (Google Fonts) — clean, readable sans-serif
- **Scale:** 
  - H1: 2.5rem (mobile) / 3.25rem (desktop)
  - H4: 1.25rem (mobile) / 1.5rem (desktop) — section labels in accent color
  - Body: 1.125rem, font-normal

### Components

**Link Button (`Link.tsx`)**
- Accent-colored pill-shaped buttons (`rounded-xl`)
- Icon + text layout, horizontal flex
- Hover: bg transition to accent-hover
- External links open in new tab (`target="_blank"`)

**Project Links**
- Plain text links with hover underline
- Linked to GitHub repos
- Title in `--text-main`, description in `--text-muted`

### Layout
- Min full viewport height (`min-h-screen`)
- Narrow centered content with max-width 600px
- Vertical stack layout (no side-by-side)
- Generous vertical padding (`py-8`)

### Content Sections

| Section | Style |
|---------|-------|
| Header | Name in accent highlight + pronunciation tagline |
| Links | GitHub + LinkedIn pill buttons |
| Now | Bulleted list of current activities |
| Stack | Inline list of tools |
| Fun fact | Short paragraph |
| Recent rabbit hole | Short paragraph |
| Projects | Two project cards with linked titles + descriptions |

### Patterns
- **Tone:** Casual, conversational, minimal corporate speak
- **Section labels:** Accent-colored H4s
- **Body text:** Muted color for readable gray
- **Spacing:** Section margins via `mb-8`, final section `mb-4`
- **Lists:** Simple `space-y-2` vertical spacing

## File Structure

```
Website2.0/
├── index.html              # Entry HTML with Google Fonts preload
├── vite.config.js          # Vite + SWC React plugin
├── tailwind.config.cjs     # Tailwind with custom fontFamily
├── postcss.config.cjs      # PostCSS + autoprefixer
├── package.json            # React 19, Vite, Tailwind deps
├── dist/                   # Production build output
├── public/
│   └── images/             # Headshot, favicon, thumbnail
└── src/
    ├── index.jsx           # React mount point
    ├── index.css           # Tailwind + theme CSS variables
    ├── App.jsx             # Main page component
    └── components/
        └── Link.tsx        # Reusable external link button
```

## Development

```bash
npm start       # Vite dev server (localhost:5173)
npm run build   # Production build
npm run serve   # Preview production build
```

## Conventions

- Tailwind classes preferred, `@layer base` for element resets
- CSS custom properties for theming (not Tailwind config)
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
- Warm theme system — easy to swap vibes
- Links only to GitHub/LinkedIn for people who want the professional stuff
- Projects section at bottom — casual descriptions, not resume achievements
- Minimal dependencies — keep it lightweight
