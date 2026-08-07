# BuildSignal Design System v1.0 — Consume + Refine

**Status:** ARCHIVED — Moved to release-history in Build 121  
**Original Status:** BACKLOG — Queued for post-maintenance implementation  
**Created:** 2026-08-07  
**Archived:** 2026-08-07 (Build 121)

---

> **Archive Note:** This document was the original comprehensive design system specification created during Build 120. It was archived in Build 121 as part of repository governance finalization. The active design system documentation is now in `DESIGN_SYSTEM.md` at repository root, which reflects the current production standard.
>
> This archived copy is retained for historical reference and for future implementation when BuildSignal exits maintenance mode.

---

A comprehensive design system for BuildSignal's Consume + Refine interface, covering Tailwind tokens, typography, components, cards, data display, navigation, modals, grid systems, patterns, animation, dark mode, responsive strategy, accessibility, and a sample Insights Dashboard page.

**This document is a specification only. Implementation is deferred until BuildSignal exits maintenance mode.**

---

## 1. Tailwind Design Tokens

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `obsidian` | `#0A0A0F` | Primary background, nav background |
| `obsidian-light` | `#12121A` | Card backgrounds, elevated surfaces |
| `warm-ivory` | `#F5F1EB` | Primary text on dark, light mode background |
| `warm-ivory-muted` | `#8A8278` | Secondary text, timestamps, metadata |
| `electric-cyan` | `#00E5CC` | Primary accent, CTAs, active states, highlights |
| `electric-cyan-dim` | `#00E5CC33` | Hover backgrounds, subtle accents |
| `deep-navy` | `#0D1B2A` | Light mode backgrounds, secondary surfaces |
| `deep-navy-light` | `#1B2838` | Light mode cards, borders |
| `negative` | `#FF5A5A` | Errors, rejections, high-risk alerts |
| `positive` | `#2ECC71` | Success, accepted, high-confidence |
| `warning` | `#F5A623` | Moderate risk, pending, attention |
| `information` | `#4A90E2` | Info states, links, neutral highlights |

### Spacing Scale

Base unit: `0.25rem` (4px)

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | `0.25rem` (4px) | Tight internal padding, icon gaps |
| `space-2` | `0.5rem` (8px) | Button padding, small gaps |
| `space-3` | `0.75rem` (12px) | Component internal padding |
| `space-4` | `1rem` (16px) | Standard padding, card gaps |
| `space-6` | `1.5rem` (24px) | Section gaps, modal padding |
| `space-8` | `2rem` (32px) | Card padding, major section breaks |
| `space-12` | `3rem` (48px) | Page sections, hero gaps |
| `space-16` | `4rem` (64px) | Major layout breaks |
| `space-24` | `6rem` (96px) | Hero sections, large vertical rhythm |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | `4px` | Tags, chips, small elements |
| `radius-md` | `8px` | Buttons, inputs, cards |
| `radius-lg` | `12px` | Modals, panels, large cards |
| `radius-xl` | `16px` | Feature cards, hero containers |
| `radius-full` | `9999px` | Pills, avatars, circular buttons |

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1)` | Cards, dropdowns |
| `shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1)` | Modals, floating panels |
| `shadow-glow` | `0 0 20px rgba(0,229,204,0.15)` | Active states, highlights |
| `shadow-glow-strong` | `0 0 30px rgba(0,229,204,0.3)` | Primary CTAs, hero emphasis |

### Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `z-base` | `0` | Default layer |
| `z-dropdown` | `100` | Dropdowns, tooltips |
| `z-sticky` | `200` | Sticky headers, floating elements |
| `z-modal` | `300` | Modals, dialogs |
| `z-toast` | `400` | Notifications, toasts |
| `z-overlay` | `500` | Full-screen overlays |

---

## 2. Typography

### Font Families

| Token | Font | Usage |
|-------|------|-------|
| `font-sans` | Inter | Body text, UI elements, navigation |
| `font-serif` | Playfair Display | Headlines, display text, editorial quotes |
| `font-mono` | IBM Plex Mono | Code, data labels, technical specs, metadata |

### Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `text-hero` | `clamp(2.5rem, 5vw, 4rem)` | 700 | 1.1 | `-0.02em` | Page titles, major headlines |
| `text-h1` | `clamp(2rem, 4vw, 3rem)` | 700 | 1.2 | `-0.01em` | Section headers |
| `text-h2` | `clamp(1.5rem, 3vw, 2.25rem)` | 600 | 1.3 | `0` | Subsection headers |
| `text-h3` | `1.25rem` (20px) | 600 | 1.4 | `0` | Card titles, feature names |
| `text-body` | `1rem` (16px) | 400 | 1.6 | `0` | Paragraphs, descriptions |
| `text-body-sm` | `0.875rem` (14px) | 400 | 1.5 | `0` | Secondary text, captions |
| `text-caption` | `0.75rem` (12px) | 500 | 1.4 | `0.02em` | Labels, metadata, timestamps |
| `text-mono` | `0.875rem` (14px) | 400 | 1.5 | `0` | Data values, technical text |

---

## 3. Button System

### Primary Button
- Background: `electric-cyan`
- Text: `obsidian`
- Border radius: `radius-full`
- Padding: `space-3` horizontal, `space-2` vertical
- Font: `font-sans`, `text-body-sm`, weight 600
- Hover: Background brightens, `shadow-glow`
- Active: Scale 0.98, darker background

### Ghost Button
- Background: transparent
- Border: 1px solid `warm-ivory-muted` at 30% opacity
- Text: `warm-ivory`
- Hover: Background `warm-ivory` at 5% opacity, border brightens

### Subtle Button
- Background: `warm-ivory` at 5% opacity
- Text: `warm-ivory`
- No border
- Hover: Background increases to 10% opacity

### Icon Button
- Size: 40x40px
- Background: transparent or `warm-ivory` at 5% opacity
- Icon color: `warm-ivory-muted`
- Hover: Icon color transitions to `electric-cyan`, background to 10% opacity
- Border radius: `radius-md`

### CTA Button (Large)
- Background: `electric-cyan`
- Text: `obsidian`
- Padding: `space-4` horizontal, `space-3` vertical
- Font: `font-sans`, `text-body`, weight 700
- Border radius: `radius-full`
- Hover: `shadow-glow-strong`, slight scale up

---

## 4. Input Components

### Text Field
- Background: `obsidian-light`
- Border: 1px solid `warm-ivory-muted` at 15% opacity
- Border radius: `radius-md`
- Padding: `space-3`
- Text: `warm-ivory`
- Placeholder: `warm-ivory-muted`
- Focus: Border color transitions to `electric-cyan`, subtle `shadow-glow`
- Error: Border color `negative`, error message below in `negative` at `text-caption`

### Text Area
- Same as text field but with min-height of 120px
- Resize: vertical only

### Select/Dropdown
- Background: `obsidian-light`
- Border: 1px solid `warm-ivory-muted` at 15% opacity
- Border radius: `radius-md`
- Dropdown list: Background `obsidian-light`, border `warm-ivory-muted` at 20% opacity, `shadow-md`
- Selected item: Background `electric-cyan-dim`
- Hover item: Background `warm-ivory` at 5% opacity

### Date Range Picker
- Two text fields side by side with a hyphen separator
- Calendar dropdown: Background `obsidian-light`, selected date `electric-cyan`, hover `warm-ivory` at 5% opacity

### Search Input
- Background: `obsidian-light`
- Border radius: `radius-full`
- Left icon: Search icon in `warm-ivory-muted`
- Right element: Optional clear button (X icon)
- Focus: Border `electric-cyan`, `shadow-glow`

---

## 5. Card System

### Article Card
- Background: `obsidian-light`
- Border radius: `radius-lg`
- Border: 1px solid `warm-ivory-muted` at 10% opacity
- Padding: `space-6`
- Hover: Border opacity increases to 20%, subtle lift (`shadow-md`)
- Image (if present): Top of card, border radius top `radius-lg`, aspect ratio 16:9
- Title: `text-h3`, `font-serif`, `warm-ivory`
- Body: `text-body-sm`, `warm-ivory-muted`, 2-3 lines max with ellipsis
- Footer: `text-caption`, `warm-ivory-muted`, space between source and timestamp

### Summary Card
- Background: `obsidian-light`
- Border radius: `radius-lg`
- Padding: `space-6`
- Header: Category label in `text-caption`, `electric-cyan`, uppercase
- Title: `text-h3`, `font-sans`, `warm-ivory`
- Summary: `text-body-sm`, `warm-ivory-muted`
- Actions: Row of subtle buttons (Accept, Reject, Save)

### Insight Card
- Background: `obsidian-light`
- Border radius: `radius-lg`
- Left border: 3px solid `electric-cyan`
- Padding: `space-6`
- Header: Insight type icon + label in `text-caption`, `electric-cyan`
- Title: `text-h3`, `font-sans`, `warm-ivory`
- Description: `text-body-sm`, `warm-ivory-muted`
- Confidence score: Progress bar or percentage in `text-caption`, color-coded (high: `positive`, medium: `warning`, low: `negative`)
- Source badge: Pill-shaped, `radius-full`, background `warm-ivory` at 5% opacity, `text-caption`

### Provider Card
- Background: `obsidian-light`
- Border radius: `radius-lg`
- Padding: `space-6`
- Layout: Horizontal flex, logo/icon left, content right
- Provider name: `text-h3`, `font-sans`
- Status: Indicator dot (green: active, yellow: warning, red: error) + status text in `text-caption`
- Metrics: Grid of 2-3 key metrics, label in `text-caption` muted, value in `text-mono`, `warm-ivory`
- Last updated: `text-caption`, `warm-ivory-muted`

### Metric Card
- Background: `obsidian-light`
- Border radius: `radius-lg`
- Padding: `space-6`
- Label: `text-caption`, `warm-ivory-muted`, uppercase
- Value: `text-h1`, `font-mono`, `warm-ivory`
- Change indicator: Arrow + percentage in `positive` or `negative`, `text-body-sm`
- Sparkline: Optional mini chart below value

### Feature Card (Large)
- Background: `obsidian-light`
- Border radius: `radius-xl`
- Padding: `space-8`
- Icon: Large (48px), `electric-cyan`
- Title: `text-h2`, `font-serif`, `warm-ivory`
- Description: `text-body`, `warm-ivory-muted`
- CTA: Primary button
- Hover: Subtle `shadow-glow`, border opacity increase

---

## 6. Data Display Components

### Table
- Header row: Background `obsidian`, text `warm-ivory-muted`, `text-caption`, uppercase, font weight 600
- Row: Background `obsidian-light`, border bottom 1px solid `warm-ivory-muted` at 5% opacity
- Row hover: Background `warm-ivory` at 3% opacity
- Cell padding: `space-3` vertical, `space-4` horizontal
- Sortable header: Cursor pointer, hover text `warm-ivory`, sort indicator icon
- Selected row: Background `electric-cyan-dim`
- Empty state: Centered message, `text-body-sm`, `warm-ivory-muted`, with icon

### Status Chip
- Background: Color at 15% opacity
- Text: Color at full opacity
- Border radius: `radius-full`
- Padding: `space-1` vertical, `space-3` horizontal
- Font: `text-caption`, weight 600
- Colors: `positive` (green), `negative` (red), `warning` (orange), `information` (blue), `electric-cyan` (active)

### Tab Navigation
- Container: Border bottom 1px solid `warm-ivory-muted` at 10% opacity
- Tab: `text-body-sm`, `warm-ivory-muted`, padding `space-3` horizontal, `space-2` vertical
- Active tab: `warm-ivory`, border bottom 2px solid `electric-cyan`
- Hover: `warm-ivory` at 70% opacity

### Pagination
- Container: Flex, centered, gap `space-2`
- Page number: Size 40x40px, centered, `text-body-sm`, `warm-ivory-muted`, border radius `radius-md`
- Active page: Background `electric-cyan`, text `obsidian`
- Hover: Background `warm-ivory` at 5% opacity
- Previous/Next: Icon buttons, disabled state at 30% opacity

### Load State (Skeleton)
- Background: `warm-ivory` at 5% opacity
- Animation: Shimmer effect, subtle pulse
- Border radius: Matches the component it is replacing

---

## 7. Navigation Components

### Header
- Background: `obsidian` at 95% opacity, backdrop blur
- Height: 64px
- Layout: Flex, space between, items centered
- Left: Logo (text or icon) + navigation links
- Center: Optional search bar (collapsed on mobile)
- Right: User menu, notifications, action buttons
- Border bottom: 1px solid `warm-ivory-muted` at 5% opacity
- Navigation link: `text-body-sm`, `warm-ivory-muted`, hover `warm-ivory`
- Active link: `warm-ivory`, underline 2px `electric-cyan`

### Footer
- Background: `obsidian`
- Border top: 1px solid `warm-ivory-muted` at 10% opacity
- Padding: `space-12` vertical
- Layout: Grid, 4 columns on desktop, 1 on mobile
- Column header: `text-caption`, `warm-ivory-muted`, uppercase, weight 600
- Links: `text-body-sm`, `warm-ivory-muted`, hover `warm-ivory`
- Bottom bar: Copyright, legal links, social icons

### Mobile Navigation
- Trigger: Hamburger icon button
- Menu: Full-screen overlay, background `obsidian`
- Links: `text-h2`, `font-serif`, `warm-ivory`, stacked vertically
- Active link: `electric-cyan`
- Close: X icon button, top right
- Animation: Slide in from right, 300ms ease-out

### Breadcrumbs
- Container: Flex, items center, gap `space-2`
- Item: `text-caption`, `warm-ivory-muted`
- Separator: Chevron icon, `warm-ivory-muted` at 50% opacity
- Active item: `warm-ivory`
- Hover (clickable): `warm-ivory`, underline

---

## 8. Modal System

### Standard Modal
- Overlay: Background `obsidian` at 80% opacity, `z-modal`
- Container: Background `obsidian-light`, border radius `radius-lg`, `shadow-lg`
- Max width: 600px, centered
- Padding: `space-8`
- Header: Title `text-h2`, close button top right
- Body: `text-body`, `warm-ivory-muted`
- Footer: Action buttons, right-aligned, gap `space-3`
- Animation: Fade in overlay, scale up container (0.95 to 1), 200ms ease-out

### Confirmation Modal
- Same as standard but with prominent action buttons
- Destructive action: Button uses `negative` background
- Primary action: Rightmost button
- Cancel: Ghost button, leftmost

### Overlay Panel (Slide-out)
- Trigger: Button or edge swipe
- Panel: Background `obsidian-light`, width 400px (desktop), 100% (mobile)
- Position: Fixed right, top 0, bottom 0
- Shadow: `shadow-lg` on left side
- Header: Title + close button
- Content: Scrollable
- Animation: Slide in from right, 300ms ease-out
- Backdrop: `obsidian` at 50% opacity, clickable to close

---

## 9. Grid Systems

### Simple Grid
- Container: max-width 1200px, centered
- Columns: 1 (mobile), 2 (tablet), 3 (desktop), 4 (large desktop)
- Gap: `space-6`

### Sidebar + Content
- Layout: Flex row
- Sidebar: Width 280px, fixed left, background `obsidian-light`
- Content: Flex 1, padding `space-8`
- Mobile: Sidebar becomes overlay panel

### Split View
- Layout: Flex row, 50/50 split
- Left: Content area, padding `space-8`
- Right: Detail panel, background `obsidian-light`, padding `space-8`
- Divider: 1px solid `warm-ivory-muted` at 10% opacity, draggable
- Mobile: Stack vertically, detail panel below

### Dashboard Grid
- Layout: CSS Grid
- Columns: 1 (mobile), 2 (tablet), 3 (desktop), 4 (large)
- Rows: Auto
- Gap: `space-6`
- Featured item: Span 2 columns on desktop

### Feed Layout
- Layout: Single column, max-width 800px, centered
- Items: Stacked vertically, gap `space-6`
- Each item: Full width card

### Masonry Grid
- Layout: CSS columns or masonry grid
- Columns: 1 (mobile), 2 (tablet), 3 (desktop)
- Gap: `space-6`
- Items: Break inside avoid, margin bottom `space-6`

---

## 10. Pattern Library

### Hero Pattern A (Text + CTA)
- Background: `obsidian` with subtle gradient or abstract pattern
- Layout: Centered text, max-width 800px
- Title: `text-hero`, `font-serif`, `warm-ivory`
- Subtitle: `text-h2`, `font-sans`, `warm-ivory-muted`
- CTA: Primary button, centered below text
- Padding: `space-24` vertical

### Hero Pattern B (Text + Image)
- Layout: Flex row, 50/50
- Left: Title `text-hero`, description `text-body`, CTA button
- Right: Image or illustration, border radius `radius-xl`
- Mobile: Stack vertically, image first

### Hero Pattern C (Dark with Glow)
- Background: `obsidian` with radial gradient `electric-cyan-dim` centered behind text
- Title: `text-hero`, `warm-ivory`
- CTA: Primary button with `shadow-glow-strong`
- Padding: `space-24` vertical

### Content Section (Text + Cards)
- Header: Section title `text-h1`, optional description `text-body`
- Grid: 3-4 cards below
- Gap: `space-8` between header and grid

### Split View (Text + Image)
- Layout: Flex row, 50/50, items centered
- Left: Title `text-h1`, body text, CTA
- Right: Image, border radius `radius-xl`
- Alternating: Every other section flips left/right
- Mobile: Stack vertically

### Sidebar Content
- Layout: Sidebar + Content grid
- Sidebar: Navigation or filters, background `obsidian-light`
- Content: Main information, cards, or table
- Mobile: Sidebar collapses to top filter bar or overlay

### Full-Width Feature
- Background: `obsidian-light` or gradient
- Content: Centered, max-width 1000px
- Title: `text-h1`
- Description: `text-body`
- CTA: Primary button
- Padding: `space-16` vertical

### Feature Grid
- Layout: 2x2 or 3x3 grid
- Each item: Icon, title `text-h3`, description `text-body-sm`
- Icon: 48px, `electric-cyan`
- Hover: Subtle background change, icon scale up

### Sticky Navigation + Scrollable Content
- Header: Sticky top, `z-sticky`
- Content: Scrollable below
- Active section: Highlighted in nav
- Smooth scroll to sections

### Tabbed Content
- Tabs: Horizontal, border bottom
- Content: Panel below, animated fade transition
- Mobile: Tabs become dropdown or scrollable horizontal

### Card Grid with Filter
- Filter bar: Horizontal row of dropdowns and search
- Grid: Responsive card grid below
- Active filter: Pill-shaped badge with X to remove
- Empty state: Message when no results

### Article Feed
- Layout: Single column, max-width 800px
- Items: Article cards stacked
- Each card: Image, title, excerpt, metadata
- Load more: Button at bottom

### Detail View
- Layout: Full width, max-width 1200px centered
- Header: Back button, title, actions
- Body: Multi-column on desktop (main content + sidebar)
- Sidebar: Related items, metadata, actions
- Mobile: Single column, sidebar below

---

## 11. Animation Specifications

### Scroll-Triggered Entrance
- Trigger: Element enters viewport (IntersectionObserver)
- Animation: Fade in + translate Y (20px to 0)
- Duration: 600ms
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo)
- Stagger: 100ms between sibling elements

### Staggered Card Entrance
- Trigger: Section enters viewport
- Animation: Each card fades in + translate Y
- Stagger: 150ms between cards
- Duration: 500ms per card

### Smooth Scroll
- Behavior: `scroll-behavior: smooth`
- Anchor links: Smooth scroll to target
- Offset: Account for sticky header height (64px)

### Button Hover
- Background: Color transition, 200ms ease
- Shadow: `shadow-glow` appears, 200ms ease
- Transform: Scale 1.02, 150ms ease

### Card Hover
- Border: Opacity transition, 200ms ease
- Shadow: `shadow-md` appears, 200ms ease
- Transform: Translate Y (-4px), 200ms ease

### Modal Open
- Overlay: Opacity 0 to 1, 200ms ease
- Container: Scale 0.95 to 1, opacity 0 to 1, 200ms ease-out

### Modal Close
- Container: Scale 1 to 0.95, opacity 1 to 0, 150ms ease-in
- Overlay: Opacity 1 to 0, 150ms ease-in

### Tab Switch
- Content: Opacity crossfade, 200ms ease
- Indicator: Width/position transition, 200ms ease

### Loading Spinner
- SVG circle: Stroke dasharray animation
- Duration: 1s linear infinite
- Color: `electric-cyan`

### Skeleton Shimmer
- Background: Linear gradient animation
- Animation: Shimmer left to right, 1.5s ease-in-out infinite

---

## 12. Dark Mode

### Toggle
- Position: Header, right side
- Icon: Sun (light) / Moon (dark)
- Animation: Icon rotates and morphs, 300ms ease

### Token Variants

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| Background | `deep-navy` | `obsidian` |
| Surface | `deep-navy-light` | `obsidian-light` |
| Text primary | `obsidian` | `warm-ivory` |
| Text secondary | `warm-ivory-muted` (on light) | `warm-ivory-muted` |
| Accent | `electric-cyan` | `electric-cyan` |
| Border | `warm-ivory-muted` at 20% | `warm-ivory-muted` at 10% |

### System Preference
- Default: Respect `prefers-color-scheme`
- Override: User toggle stores preference in localStorage

---

## 13. Responsive Strategy

### Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |

### Progressive Disclosure
- Mobile: Show essential content, hide secondary behind "Show more" or tabs
- Tablet: Intermediate layout, 2-column grids
- Desktop: Full layout, all features visible

### Navigation Collapse
- Mobile: Hamburger menu, full-screen overlay
- Tablet: Condensed nav, possibly sidebar
- Desktop: Full horizontal nav

### Touch Targets
- Minimum size: 44x44px for all interactive elements
- Spacing: Minimum 8px between touch targets

---

## 14. Accessibility

### Color Contrast
- All text meets WCAG AA (4.5:1 for normal, 3:1 for large)
- `warm-ivory` on `obsidian`: ~18:1
- `electric-cyan` on `obsidian`: ~10:1
- `warm-ivory-muted` on `obsidian-light`: ~5:1

### Keyboard Navigation
- All interactive elements focusable
- Focus ring: 2px solid `electric-cyan`, offset 2px
- Tab order: Logical, top to bottom, left to right
- Escape: Closes modals, dropdowns, overlays
- Enter/Space: Activates buttons, toggles checkboxes

### Screen Reader
- Landmarks: Header, main, footer, nav, aside
- Headings: Proper hierarchy (h1 > h2 > h3)
- Images: Alt text for all informative images, empty alt for decorative
- Icons: `aria-hidden="true"` or `aria-label` if interactive
- Live regions: `aria-live="polite"` for dynamic content updates
- Buttons: Descriptive labels, not just "Click here"

### Motion Preferences
- Respect `prefers-reduced-motion`
- Disable animations: Instant state changes
- Essential animations: Instant or very subtle

---

## 15. Sample Page — Insights Dashboard

### Layout
- Header: Sticky, logo, nav links, search, user menu, dark mode toggle
- Main content area:
  - Top row: 4 metric cards (grid, 4 columns)
  - Middle section: Tab navigation (All Insights, Opportunities, Risks, Saved)
  - Content below tabs: Card grid (3 columns desktop, 2 tablet, 1 mobile)
  - Right sidebar (desktop only): Filters, quick actions, recent activity
- Footer: Minimal, links, copyright

### Component Usage
- Metric cards: Metric Card component
- Tabs: Tab Navigation component
- Insight cards: Insight Card component
- Filters: Sidebar with checkboxes, sliders, date picker
- Search: Search Input component
- Load more: Primary Button

### Animations
- Metric cards: Staggered entrance on page load
- Insight cards: Staggered entrance when tab switches
- Tab switch: Content fade transition
- Card hover: Lift + border glow

### Responsive
- Mobile: Single column, tabs become dropdown, sidebar becomes filter button + overlay panel
- Tablet: 2-column grid, condensed sidebar
- Desktop: Full layout as described

---

## Status

**This specification is complete and ready for implementation when BuildSignal exits maintenance mode.**

- [x] All 15 sections documented
- [x] All tokens defined with values
- [x] All components specified with variants
- [x] Animation specs with timing and easing
- [x] Accessibility requirements documented
- [x] Sample page provided as implementation reference

**Implementation blocked by:** BuildSignal Ecosystem Directive (Build 119) — Architecture frozen

**Archived in:** Build 121 — Repository Finalization
