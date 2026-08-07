# BuildSignal Design System

**Version:** 1.0  
**Status:** Active  
**Last Updated:** 2026-08-07

---

## Overview

This document defines the official BuildSignal design language. Every future UI component should follow this design system to ensure consistency across the product.

---

## Official Palette

| Name | Hex | Usage |
|------|-----|-------|
| Deep Navy | `#0B1F33` | Primary backgrounds, dark surfaces |
| Signal Blue | `#1F5EFF` | Primary accent, CTAs, links, active states |
| Insight Teal | `#18A999` | Secondary accent, success states, insights |
| Opportunity Amber | `#F4A261` | Warnings, opportunities, attention highlights |
| Cloud White | `#F7F9FC` | Light backgrounds, primary text on dark |
| Slate Charcoal | `#2F3A45` | Card backgrounds, elevated surfaces |

### Supporting Colors

| Name | Hex | Usage |
|------|-----|-------|
| Positive | `#2ECC71` | Success, accepted, high-confidence |
| Negative | `#FF5A5A` | Errors, rejections, high-risk alerts |
| Warning | `#F5A623` | Moderate risk, pending |
| Information | `#4A90E2` | Info states, neutral highlights |

---

## Typography

### Font Families

| Token | Font | Usage |
|-------|------|-------|
| `font-sans` | Inter | Body text, UI elements, navigation |
| `font-serif` | Playfair Display | Headlines, display text |
| `font-mono` | IBM Plex Mono | Code, data labels, metrics |

### Type Scale

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `text-hero` | `clamp(2.5rem, 5vw, 4rem)` | 700 | 1.1 | Page titles |
| `text-h1` | `clamp(2rem, 4vw, 3rem)` | 700 | 1.2 | Section headers |
| `text-h2` | `clamp(1.5rem, 3vw, 2.25rem)` | 600 | 1.3 | Subsection headers |
| `text-h3` | `1.25rem` | 600 | 1.4 | Card titles |
| `text-body` | `1rem` | 400 | 1.6 | Paragraphs |
| `text-body-sm` | `0.875rem` | 400 | 1.5 | Secondary text |
| `text-caption` | `0.75rem` | 500 | 1.4 | Labels, metadata |
| `text-mono` | `0.875rem` | 400 | 1.5 | Data values |

---

## Buttons

### Primary Button
- Background: `Signal Blue` (`#1F5EFF`)
- Text: `Cloud White`
- Border radius: `9999px` (pill)
- Padding: `0.75rem 1.5rem`
- Font: `font-sans`, `text-body-sm`, weight 600
- Hover: Brighten background, add subtle glow
- Active: Scale 0.98

### Secondary Button
- Background: transparent
- Border: 1px solid `Cloud White` at 30% opacity
- Text: `Cloud White`
- Hover: Background `Cloud White` at 5% opacity

### Ghost Button
- Background: `Cloud White` at 5% opacity
- Text: `Cloud White`
- No border
- Hover: Background increases to 10% opacity

### Destructive Button
- Background: `Negative` (`#FF5A5A`)
- Text: `Cloud White`
- Hover: Darken background

---

## Cards

### Standard Card
- Background: `Slate Charcoal` (`#2F3A45`)
- Border radius: `12px`
- Border: 1px solid `Cloud White` at 8% opacity
- Padding: `1.5rem`
- Hover: Border opacity increases to 15%, subtle shadow

### Insight Card
- Same as standard card
- Left border: 3px solid `Insight Teal`
- Header: Insight type icon + label in `Insight Teal`

### Metric Card
- Background: `Slate Charcoal`
- Border radius: `12px`
- Padding: `1.5rem`
- Label: `text-caption`, muted
- Value: `text-h1`, `font-mono`
- Change indicator: Color-coded arrow + percentage

---

## Tables

- Header: Background `Deep Navy`, text muted, `text-caption`, uppercase
- Row: Background `Slate Charcoal`, border bottom 1px solid muted at 5%
- Row hover: Background `Cloud White` at 3% opacity
- Cell padding: `0.75rem 1rem`
- Sortable header: Cursor pointer, hover text brightens

---

## Alerts

| Type | Background | Border | Icon |
|------|-----------|--------|------|
| Success | `Positive` at 10% | `Positive` | Checkmark |
| Error | `Negative` at 10% | `Negative` | X |
| Warning | `Opportunity Amber` at 10% | `Opportunity Amber` | Exclamation |
| Info | `Information` at 10% | `Information` | Info circle |

---

## Forms

### Text Input
- Background: `Slate Charcoal`
- Border: 1px solid `Cloud White` at 12% opacity
- Border radius: `8px`
- Padding: `0.75rem 1rem`
- Text: `Cloud White`
- Placeholder: Muted text
- Focus: Border `Signal Blue`, subtle glow
- Error: Border `Negative`, error message below

### Select
- Same styling as text input
- Dropdown: Background `Slate Charcoal`, border muted at 15%
- Selected: Background `Signal Blue` at 15%
- Hover: Background `Cloud White` at 5%

### Checkbox / Radio
- Size: 20x20px
- Border: 1px solid muted
- Checked: Background `Signal Blue`, white checkmark
- Focus: Ring 2px `Signal Blue`

---

## Navigation

### Header
- Background: `Deep Navy` at 95% opacity, backdrop blur
- Height: 64px
- Border bottom: 1px solid muted at 5%
- Links: `text-body-sm`, muted, hover brightens
- Active link: Bright text, underline 2px `Signal Blue`

### Mobile Navigation
- Full-screen overlay, background `Deep Navy`
- Links: `text-h2`, stacked vertically
- Active: `Signal Blue`
- Animation: Slide in from right, 300ms ease-out

---

## Motion

### Transitions
- Default: `200ms ease`
- Hover: `150ms ease`
- Modal: `200ms ease-out`

### Animations
- Entrance: Fade in + translate Y (20px to 0), 500ms ease-out
- Stagger: 100ms between sibling elements
- Loading: Spinner, 1s linear infinite
- Skeleton: Shimmer left to right, 1.5s ease-in-out infinite

### Respect `prefers-reduced-motion`
- Disable non-essential animations for users who prefer reduced motion

---

## Accessibility

- All text meets WCAG AA (4.5:1 for normal, 3:1 for large)
- Focus ring: 2px solid `Signal Blue`, offset 2px
- Interactive elements: Minimum 44x44px touch target
- Screen reader: Proper landmarks, headings hierarchy, alt text
- Keyboard: Full keyboard navigation support

---

## Dark Mode

BuildSignal uses a dark-first design. The palette above is optimized for dark backgrounds.

| Token | Dark Mode |
|-------|-----------|
| Background | `Deep Navy` (`#0B1F33`) |
| Surface | `Slate Charcoal` (`#2F3A45`) |
| Text primary | `Cloud White` (`#F7F9FC`) |
| Text secondary | `Cloud White` at 60% opacity |
| Accent | `Signal Blue` (`#1F5EFF`) |

---

## Component Examples

### Status Chip
```
Background: color at 15% opacity
Text: color at full opacity
Border radius: 9999px
Padding: 0.25rem 0.75rem
Font: text-caption, weight 600
```

### Tab Navigation
```
Container: Border bottom 1px solid muted at 10%
Tab: text-body-sm, muted, padding 0.75rem horizontal
Active: bright text, border bottom 2px solid Signal Blue
Hover: bright text at 70%
```

---

## References

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture
- [MAINTENANCE_GUIDE.md](./MAINTENANCE_GUIDE.md) — Operational procedures
