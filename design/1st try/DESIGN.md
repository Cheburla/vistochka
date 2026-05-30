---
name: Modern Minimalist Wedding
colors:
  surface: '#fbf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#fbf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ef'
  surface-container: '#efeeea'
  surface-container-high: '#eae8e4'
  surface-container-highest: '#e4e2de'
  on-surface: '#1b1c1a'
  on-surface-variant: '#444748'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f0ed'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e1dfdf'
  on-secondary-container: '#626262'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#261900'
  on-tertiary-container: '#988154'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#e4e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#fcdfab'
  tertiary-fixed-dim: '#dfc391'
  on-tertiary-fixed: '#261900'
  on-tertiary-fixed-variant: '#57441d'
  background: '#fbf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2de'
typography:
  display-lg:
    fontFamily: EB Garamond
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: EB Garamond
    fontSize: 36px
    fontWeight: '400'
    lineHeight: '1.1'
  headline-md:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-sm:
    fontFamily: EB Garamond
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: 0.05em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.5'
    letterSpacing: 0.15em
  accent-serif:
    fontFamily: EB Garamond
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1'
spacing:
  container-max: 780px
  gallery-max: 1200px
  section-gap-desktop: 120px
  section-gap-mobile: 80px
  gutter: 24px
  hairline: 1px
---

## Brand & Style

This design system is anchored in an editorial minimalist aesthetic, specifically tailored for a high-end wedding invitation experience. It emphasizes the "luxury of space"—using generous margins and restrained ornamentation to evoke a sense of calm, timeless elegance, and intentionality. 

The visual language is characterized by a "quiet luxury" approach: thin lines, centered compositions, and a focus on high-fidelity typography. The interface should feel more like a physical stationery suite than a digital application. Interactions are fluid and understated, utilizing subtle scroll-triggered reveals to guide the guest through the narrative of the celebration. The emotional response is one of warmth, sophistication, and exclusivity.

## Colors

The palette is a sophisticated exercise in neutrals, designed to let photography and type take center stage. 

- **Primary (Ink):** Used for primary headings and essential information. It provides a sharp, authoritative contrast against the cream background.
- **Secondary (Smoke):** Utilized for secondary details, metadata, and descriptive body text to soften the visual hierarchy.
- **Accent (Muted Gold):** Reserved for special highlights—ampersands, time indicators, and decorative glyphs. It should be used sparingly to maintain its impact as a premium touchpoint.
- **Background (Cream):** A warm, off-white base that feels softer and more organic than pure white, mimicking high-quality paper stock.
- **Lines (Stone):** Used for hairline dividers to structure content without creating harsh boundaries.

## Typography

The typography strategy relies on the tension between the classic, literary feel of **EB Garamond** and the functional, modern clarity of **Inter**. 

All headings are centered by default. The `display-lg` style is used for the names of the couple. Use `label-caps` for navigational elements or small category headers (e.g., "КОЛИ ТА ДЕ"). The `accent-serif` role is specifically for decorative "and" (&) or connecting prepositions in Ukrainian, often rendered in the Muted Gold accent color. 

Full support for Cyrillic characters is mandatory across all weights. Ensure that EB Garamond's ligatures are enabled for a truly editorial feel.

## Layout & Spacing

The layout follows a "centered column" philosophy. On mobile, content is constrained by a 24px side margin. On desktop, the primary text narrative is restricted to a 780px central column to ensure optimal line lengths for reading. 

Galleries and full-width imagery are the only elements allowed to break this column, expanding up to 1200px to create visual "breathing moments." 

Spacing is generous. Vertical rhythm is driven by the `section-gap` units, ensuring that each part of the invitation (Ceremony, Reception, RSVP) feels like a distinct page in a book. Content is separated by `hairline` dividers that do not span the full width, but rather 40-60% of the container, maintaining an airy feel.

## Elevation & Depth

This design system avoids traditional shadows and depth effects to maintain its minimalist integrity. Instead, hierarchy is created through **Tonal Layers** and **Spatial Contrast**.

- **Surface:** The background is entirely flat. There are no "cards" or "raised" containers.
- **Depth through Overlay:** For image galleries, use high-quality transitions where images may slightly overlap or fade in. 
- **Dividers:** Use the `border_color_hex` for thin, horizontal lines. These are the primary tool for structural separation.
- **Interactive States:** Instead of shadows, buttons and links use subtle opacity shifts or color transitions (e.g., Muted Gold to Ink) to signal interactivity.

## Shapes

The design system utilizes a **Sharp (0)** shape language. All containers, buttons, and image frames feature 90-degree corners. This reinforces the architectural and formal nature of a high-end wedding invitation. 

Square or vertically-oriented rectangular frames are preferred for photography to mimic physical film prints or printed invitations. Avoid circles or overly rounded elements, as they detract from the sophisticated, editorial tone.

## Components

### Buttons
Primary actions (like "RSVP") use a transparent background with a 1px solid Ink border. Text is `label-caps`. Hover states should trigger a fill of the Ink color with white text, or a subtle shift to Muted Gold.

### Dividers
Hairline separators (1px) in `border_color_hex`. Often centered with a width of 120px to 200px between sections.

### Input Fields
Minimalist underline style. The label sits above in `label-caps`. The focus state changes the underline color from Stone to Muted Gold. No background fill.

### Image Gallery
Images are displayed in a masonry or fixed-grid layout with sharp edges. On hover, images may experience a slight scale increase (1.02x) or a soft desaturation to focus on the selected photo.

### Scroll Reveal
Elements should fade in and move upwards slightly (20px) as they enter the viewport. This animation must be slow and graceful (duration: 0.8s, easing: cubic-bezier).

### RSVP Card
A centered, focused form within the main column. Use wide letter-spacing for the "RSVP" title to signify importance.