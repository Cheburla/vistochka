---
name: Aurelian Editorial
colors:
  surface: '#fdf9f1'
  surface-dim: '#dddad2'
  surface-bright: '#fdf9f1'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3eb'
  surface-container: '#f1ede6'
  surface-container-high: '#ece8e0'
  surface-container-highest: '#e6e2da'
  on-surface: '#1c1c17'
  on-surface-variant: '#4d463b'
  inverse-surface: '#31302b'
  inverse-on-surface: '#f4f0e8'
  outline: '#7e766a'
  outline-variant: '#cfc5b7'
  surface-tint: '#705b32'
  primary: '#705b32'
  on-primary: '#ffffff'
  primary-container: '#c2a878'
  on-primary-container: '#4f3d17'
  inverse-primary: '#dfc391'
  secondary: '#645d55'
  on-secondary: '#ffffff'
  secondary-container: '#ece1d7'
  on-secondary-container: '#6b635b'
  tertiary: '#765a21'
  on-tertiary: '#ffffff'
  tertiary-container: '#c9a666'
  on-tertiary-container: '#533b03'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#fcdfab'
  primary-fixed-dim: '#dfc391'
  on-primary-fixed: '#261900'
  on-primary-fixed-variant: '#57441d'
  secondary-fixed: '#ece1d7'
  secondary-fixed-dim: '#cfc5bb'
  on-secondary-fixed: '#201b15'
  on-secondary-fixed-variant: '#4c463e'
  tertiary-fixed: '#ffdea5'
  tertiary-fixed-dim: '#e6c17e'
  on-tertiary-fixed: '#271900'
  on-tertiary-fixed-variant: '#5c430a'
  background: '#fdf9f1'
  on-background: '#1c1c17'
  surface-variant: '#e6e2da'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 80px
    fontWeight: '500'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '500'
    lineHeight: '1.1'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 42px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-md-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '300'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.2em
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.1em
spacing:
  base: 8px
  container-max: 1140px
  gutter: 32px
  margin-mobile: 24px
  section-gap: 120px
  section-gap-mobile: 64px
---

## Brand & Style
The design system embodies a "Modern Luxe" aesthetic, blending the prestige of high-end editorial publishing with the intimacy of a premium wedding experience. The visual language is defined by reserved luxury, prioritizing intentionality over excess.

The personality is sophisticated, timeless, and authoritative yet warm. It leverages a "Quiet Luxury" approach—relying on impeccable typography, expansive whitespace, and hairline precision rather than heavy ornamentation. The emotional response should be one of exclusivity and grace, mirroring the feeling of a bespoke invitation printed on heavy vellum. The style is **Minimalist-Editorial**, characterized by sharp corners, delicate gold accents, and a strict adherence to a high-fashion layout grid.

## Colors
The palette is rooted in a warm ivory base, providing a "paper-like" tactile quality. 

- **Primary Canvas**: Use Ivory (#FBF7EF) for main layouts. Champagne (#F4ECDD) serves as a subtle container fill to distinguish secondary sections.
- **Typography**: Primary information is set in Ink (#211C16). For readable gold accents on light backgrounds, use Gold Deep (#9A7B3F) to ensure accessibility.
- **Metallic Accents**: The gold gradient is reserved for high-impact display typography and hairline dividers. Solid Gold Accent (#C2A878) is used for interactive elements to ensure visual weight and clarity.
- **Dark Mode Contexts**: For "Evening" or "After-party" sections, invert the palette using Ink-Dark (#16130F) as the background with Champagne text.

## Typography
The typographic hierarchy is the primary decorative element of the design system.

- **Display Hierarchy**: Use `display-lg` for names and primary titles. These should frequently utilize the `gold-gradient` via `background-clip: text`.
- **Editorial Contrast**: Pair the romantic, high-contrast `Playfair Display` with the utilitarian `Inter`. The body text should feel light and airy, utilizing the 300 weight for a modern, fashion-forward look.
- **Micro-Copy**: Labels and navigational elements must be set in `label-caps`. The wide letter-spacing is critical to maintaining the "boutique" aesthetic.
- **Scaling**: On mobile, drastically reduce the size of display type but maintain the tight line-height to preserve the editorial impact.

## Layout & Spacing
The layout relies on a **Fixed Grid** system that prioritizes generous whitespace (luxury of space).

- **Grid**: Use a 12-column grid for desktop with wide 32px gutters. Elements should often be offset or centered with significant margins to mimic a magazine spread.
- **Vertical Rhythm**: Implement a "breathable" vertical rhythm. Section gaps should be aggressive (120px+) to ensure each piece of content (Ceremony, RSVP, Gallery) feels like a distinct chapter.
- **Mobile Reflow**: Shift to a single-column layout with 24px side margins. Maintain the large vertical gaps between sections to prevent the UI from feeling cluttered.
- **Alignment**: Use asymmetrical layouts on desktop (e.g., text in columns 2-6, imagery in columns 8-12) to create visual interest.

## Elevation & Depth
This design system rejects traditional shadows in favor of **Tonal Layering** and **Hairline Framing**.

- **Surfaces**: Depth is communicated through color shifts between `background`, `surface`, and `surface-low`. No drop shadows should be used on cards or containers.
- **Outlines**: Use 1px solid lines in `line` (#E2D5BD) to define zones.
- **Dividers**: Distinctive horizontal dividers consist of a 1px gold hairline. At the exact center of the line, place a small 4px x 4px diamond shape (rotated 45-degree square) filled with `gold-deep`.
- **Visual Weight**: Interaction is signaled by color fills (Solid Gold) rather than physical lifting or depth.

## Shapes
The shape language is strictly **Sharp**. 

- **Corners**: All buttons, input fields, images, and containers must have 0px border-radius. This reinforces the architectural and editorial nature of the system.
- **Iconography**: Use thin-stroke (1px) linear icons. Avoid rounded terminals; icons should have mitered or square caps to match the sharp-edged UI.
- **Imagery**: Photos should be framed in strict rectangular containers, occasionally using a "matting" effect with a 1px gold border inset by 16px.

## Components
- **Buttons**:
  - **Primary**: Solid `gold-accent` fill with `ink` text. Sharp corners.
  - **Secondary/On-Dark**: 1px `gold-accent` border with `text-on-dark`.
  - **Text**: Always uppercase with 0.1em letter spacing.
- **Input Fields**: 1px bottom-border only using `line` color. Label floats above in `label-caps`. Focus state changes border color to `gold-deep`.
- **Cards**: No shadows or borders by default. Use `surface` color to define the area. If a border is required, use a 1px `line` weight.
- **RSVP Chips**: Rectangular boxes with 1px `line` borders. Selected state uses `gold-accent` border and `gold-deep` text.
- **Navigation**: Minimalist top-bar. Links in `label-caps`. Active state indicated by a 1px gold underline that spans the width of the word.
- **Specialty Component - The Timeline**: A vertical 1px gold line with small diamond markers for events. Text alternates sides on desktop, left-aligned on mobile.