# Sctory Product Design Guideline — AI Brief

> Concise English rewrite of the [source Confluence page](https://sctory.atlassian.net/wiki/x/NYAB).  
> Document version: 2.0 · Confluence revision: 8 · Last revised: 2026-08-16 · Author: Tâm Lê

## Product identity

**Sctory** is a private web platform for Da Nang Soft Skills Club (SClub). It stores club activities, achievements, internal knowledge, and shared resources while acting as a trusted member information portal.
The product should feel:

- Clear and organized.
- Trustworthy and practical.
- Warm and youthful.
  Primary users are current members, club leaders and organizers, alumni, and new members learning about SClub.

## Core design principles

1. **Modular by default:** Give each module one clear purpose, content set, and action set.
2. **Connected, not cluttered:** Connect modules with links, filters, references, and shared metadata instead of mixing unrelated content.
3. **Clarity before decoration:** Visual choices must improve understanding.
4. **Easy to scan and act:** Make the page meaning and next action immediately clear.
5. **Consistent patterns:** Similar content and actions use the same layouts, terms, and components.
6. **Responsive by default:** Every experience must work on mobile, tablet, and desktop.

## Information architecture

Organize content into recognizable product areas:

- Activities
- Achievements
- Knowledge Base
- Members
- Events
- Resources
- Announcements
- Club Documents
  Navigation must consistently answer:
- Where am I?
- What can I find here?
- What can I do next?
  Keep primary navigation short, predictable, and consistent.

## Page and module rules

A page may contain sections, panels, lists, card groups, tables, timelines, forms, or detail blocks. Every module must define:
| Property | Question |
| ------------- | ------------------------------------------ |
| Purpose | Why does this module exist? |
| Content | What information does it show? |
| Actions | What can the user do here? |
| Relationships | Which modules or pages does it connect to? |
Important actions must be visible and use explicit verb labels, such as **Create activity**, **Edit profile**, **Save resource**, **View timeline**, **Search knowledge**, or **Submit update**.
Empty states must explain both the missing content and the next available action. Example: “No activities have been added yet. Create the first activity to start building the club archive.”

### Voice and microcopy

Use a warm, encouraging, straightforward, youthful, and trustworthy voice.
Do:

- Speak like a fellow club member, not a system.
- Use active verbs, name the next action explicitly, and keep sentences short.
- In Vietnamese, use “mình” or “chúng mình” to refer to the system and call the user “bạn”, “các bạn”, “nhà mình” or “cả nhà mình”
- In some cases, we can use the term “SC-ers” to refer to Sctory users as well as all members of SClub.
  Don't:
- Sound corporate or robotic.
- Use guilt or pressure language, over-explain obvious actions, or overuse exclamation marks.
  Examples:
- “Chưa có hoạt động nào cả - tạo ngay hoạt động đầu tiên cho nhà mình nào”
- “SC-ers ơi, cả nhà mình đã đăng ký tham gia sự kiện này chưa?”
- “Lỗi gì đó rồi, bạn ơi”
- “Thành công rồi nhé bạn ơi”

## Layout and components

### Layout

Use clear spacing, consistent alignment, readable content widths, independent modules, and responsive layouts.
Avoid:

- Decorative layouts without functional value.
- Excessive card nesting.
- Dense screens without visual hierarchy.
- Unrelated content inside the same block.
  Prefer spacing, headings, dividers, or subtle surfaces for grouping before adding another card.

### Layout rhythm

Use the standard modular grid by default. Only the following page types may use a distinct hero layout:

- Achievements or timeline views.
- Leaderboard or ranking views.
- Dashboard or home views.
  Each page may use at most one fully contrast-inverted section with a dark background and light text. Reserve it for one high-identity module, not as a repeating visual treatment. Settings, forms, and table-heavy admin screens must keep the standard grid; predictability takes priority there.

### Core components

- Buttons and inputs
- Search and filters
- Tabs and tables
- Cards and modals
- Toasts and status labels
- Profile elements
  Reuse the same component and interaction pattern for the same job across the product.

### Motion and interaction

| Item              | Rule                                                                                                                                                                    |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Duration          | `100ms` micro-interactions such as toggles and checkboxes; `200ms` standard hover and button feedback; `300ms` panels and modals; `450ms` page-level transitions.       |
| Easing            | Use `ease-out` for entrances, `ease-in` for exits, and `cubic-bezier(0.4, 0, 0.2, 1)` as the standard curve.                                                            |
| Loading feedback  | Use skeletons for content-shaped loading in lists, cards, and tables. Use spinners only for short, indeterminate actions such as a button submit or small inline fetch. |
| Hover and press   | Shift subtly to the relevant `-soft` token over `200ms` on hover. Use scale `0.98` over `100ms` on press.                                                               |
| Routes and panels | Use a simple fade with a slight upward slide of about `300ms`; avoid full-screen wipes.                                                                                 |
| Celebration       | Use a slightly richer scale-in, soft bounce, or brief highlight only for genuine milestones, never routine actions.                                                     |
| Reduced motion    | Respect `prefers-reduced-motion`; replace scale and bounce with opacity-only fades.                                                                                     |

### Component states

| Component | Default                                                        | Hover / pressed                                                                  | Disabled                                                            | Loading                                                                      | Error                                                          | Empty                                                                       |
| --------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Button    | Semantic action background and action text.                    | Relevant soft/strong token on hover; scale `0.98` on press.                      | Muted, non-interactive, with no hover or press feedback.            | Preserve label width, show an inline spinner, and prevent duplicate actions. | Show an adjacent actionable error; do not rely on color alone. | Not applicable.                                                             |
| Input     | Surface, visible label, and border.                            | Subtle border/surface emphasis; clear focus ring when active.                    | Muted surface and text while keeping its value readable.            | Inline spinner only for asynchronous suggestions or validation.              | Error border plus supporting message and text/icon indication. | Concise placeholder or instruction; a placeholder never replaces the label. |
| Card      | Surface with clear content hierarchy and grouping.             | Interactive cards get a subtle soft-surface shift and may scale `0.98` on press. | Remove the action and reduce emphasis without reducing readability. | Content-shaped skeleton.                                                     | In-context error with retry where relevant.                    | Explain what is missing and name the next action.                           |
| Table     | Readable headers and rows with a responsive overflow strategy. | Subtly highlight interactive rows; pressed feedback only for interactive rows.   | Disable unavailable row actions individually.                       | Table-shaped skeleton.                                                       | In-context error above or within the table with retry.         | State the missing dataset and provide the primary next action.              |
| Modal     | Focused dialog with clear title, content, and actions.         | Controls inside follow their own states.                                         | Make unavailable actions visibly disabled.                          | Preserve context; load only the affected action or content area.             | Actionable error inside the dialog.                            | Explain the absence and provide a clear close or next action.               |

### Icons

Icons clarify familiar actions such as search, edit, delete, add, save, upload, filter, and settings. Do not use icons as decoration or as the only indication of an unfamiliar action.

#### Concept glyphs

Concept glyphs are a separate tier from functional icons. Use a small set of abstract geometric shapes, such as squares, circles, and diamonds, to label ideas or categories on cards, section headers, and feature highlights. Never use a concept glyph for a clickable action.
Each glyph may carry one accent color from the token palette to reinforce a category. A related decorative marks kit may use dots, plus signs, rings, and stars around avatars, badges, or celebratory moments. Use these sparingly: no more than two or three marks per element.

#### Texture and expressive surfaces

Use texture to add a youthful, creative, and distinctive SClub character without reducing clarity. Preferred texture keywords:

- `subtle paper grain`
- `risograph ink texture`
- `geometric confetti`
- `soft halftone dots`
- `hand-drawn doodles`
- `rough brush stroke`
- `scribble line`
- `sticker collage`
- `photocopy noise`
  The primary texture set is `subtle paper grain`, `risograph ink texture`, and `geometric confetti`. Use texture only for hero sections, campaigns, recognition moments, and public-facing content. Keep background texture opacity between `4–12%`; do not place it behind tables, forms, modals, or long-form text. Use no more than two texture styles on a screen, and never use texture to replace hierarchy, interaction feedback, or sufficient color contrast.

## Design tokens

### Light mode

#### Brand colors

Use one shared color system across public and authenticated experiences. The palette uses the stronger SClub yellow, blue, and red brand hues for memorability while retaining soft and muted variants for readable long-form product work.
| Name | Hex color |
| --- | --- |
| `primary` | `#FBD00C` |
| `primary-soft` | `#FFF7CC` |
| `primary-muted` | `#FFEA80` |
| `primary-strong` | `#D9A900` |
| `secondary` | `#1E66B1` |
| `secondary-soft` | `#E8F1FB` |
| `secondary-muted` | `#B8D7F2` |
| `secondary-strong` | `#155090` |
| `accent` | `#EC2027` |
| `accent-soft` | `#FFE8E9` |
| `accent-muted` | `#F8B9BD` |
| `accent-strong` | `#B9161C` |
Prefer soft backgrounds with strong text. Avoid large saturated-color areas.

#### Base colors

| Name               | Hex color |
| ------------------ | --------- |
| `background`       | `#FBFBF7` |
| `surface`          | `#FFFFFF` |
| `surface-elevated` | `#FFFFFF` |
| `text`             | `#040316` |
| `text-muted`       | `#5D5B6B` |
| `text-subtle`      | `#8A8796` |
| `border`           | `#DFE3E6` |
| `divider`          | `#ECEEEF` |

#### Semantic colors

| Name                 | Hex color |
| -------------------- | --------- |
| `success`            | `#278A57` |
| `success-background` | `#E7F6ED` |
| `warning`            | `#D9A900` |
| `warning-background` | `#FFF7CC` |
| `error`              | `#B9161C` |
| `error-background`   | `#FFE8E9` |
| `info`               | `#155090` |
| `info-background`    | `#E8F1FB` |

#### Interaction colors

| Name                          | Hex color |
| ----------------------------- | --------- |
| `primary-action-background`   | `#FBD00C` |
| `primary-action-text`         | `#040316` |
| `primary-action-hover`        | `#D9A900` |
| `secondary-action-background` | `#E8F1FB` |
| `secondary-action-text`       | `#040316` |
| `secondary-action-hover`      | `#B8D7F2` |
| `accent-action-background`    | `#EC2027` |
| `accent-action-text`          | `#040316` |
| `accent-action-hover`         | `#F8B9BD` |
| `focus-ring`                  | `#1E66B1` |
| `link`                        | `#155090` |
| `selection-background`        | `#FFEA80` |

### Dark mode

#### Brand colors

| Name               | Hex color |
| ------------------ | --------- |
| `primary`          | `#FBD00C` |
| `primary-soft`     | `#2B2200` |
| `primary-muted`    | `#3D3100` |
| `primary-strong`   | `#D9A900` |
| `secondary`        | `#1E66B1` |
| `secondary-soft`   | `#0C1F35` |
| `secondary-muted`  | `#142F4D` |
| `secondary-strong` | `#155090` |
| `accent`           | `#EC2027` |
| `accent-soft`      | `#2D0A0B` |
| `accent-muted`     | `#461518` |
| `accent-strong`    | `#B9161C` |

#### Base colors

| Name               | Hex color |
| ------------------ | --------- |
| `background`       | `#0D0C18` |
| `surface`          | `#161525` |
| `surface-elevated` | `#1E1D2E` |
| `text`             | `#EDEDF0` |
| `text-muted`       | `#9E9CAD` |
| `text-subtle`      | `#6D6B7D` |
| `border`           | `#2E2D40` |
| `divider`          | `#222136` |

#### Semantic colors

| Name                 | Hex color |
| -------------------- | --------- |
| `success`            | `#278A57` |
| `success-background` | `#0E2118` |
| `warning`            | `#D9A900` |
| `warning-background` | `#2B2200` |
| `error`              | `#B9161C` |
| `error-background`   | `#2D0A0B` |
| `info`               | `#155090` |
| `info-background`    | `#0C1F35` |

#### Interaction colors

| Name                          | Hex color |
| ----------------------------- | --------- |
| `primary-action-background`   | `#FBD00C` |
| `primary-action-text`         | `#040316` |
| `primary-action-hover`        | `#D9A900` |
| `secondary-action-background` | `#0C1F35` |
| `secondary-action-text`       | `#EDEDF0` |
| `secondary-action-hover`      | `#142F4D` |
| `accent-action-background`    | `#EC2027` |
| `accent-action-text`          | `#040316` |
| `accent-action-hover`         | `#F8B9BD` |
| `focus-ring`                  | `#1E66B1` |
| `link`                        | `#5DA8E6` |
| `selection-background`        | `#3D3100` |

## Typography

Use **Be Vietnam Pro** for clear Vietnamese diacritics and the intended warm, practical tone.

```css
font-family:
  'Be Vietnam Pro',
  Inter,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  sans-serif;
```

| Style           | Size / line height | Weight |
| --------------- | ------------------ | ------ |
| Display         | `40px / 48px`      | 700    |
| Page title      | `32px / 40px`      | 700    |
| Section heading | `24px / 32px`      | 700    |
| Module heading  | `20px / 28px`      | 600    |
| Body            | `16px / 24px`      | 400    |
| Body strong     | `16px / 24px`      | 600    |
| Small           | `14px / 20px`      | 400    |
| Caption         | `12px / 16px`      | 400    |
| Button          | `14px / 20px`      | 600    |
| Label           | `13px / 18px`      | 600    |

Rules:

- Use `0` letter spacing; never use negative tracking.
- Use sentence case for controls unless the text is a proper noun.
- Keep headings short and descriptive.
- Keep body text at `16px` on most screens.

## Spacing and radius

### Spacing scale

`0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px`
| Use | Value |
| -------------------- | ----------- |
| Mobile page padding | `16px` |
| Tablet page padding | `24px` |
| Desktop page padding | `32px` |
| Section gap | `40px` |
| Module gap | `24px` |
| Module padding | `20px` |
| Card padding | `16px` |
| Form-field gap | `12px` |
| Button padding | `10px 16px` |

### Radius scale

| Token         | Value   | Typical use                               |
| ------------- | ------- | ----------------------------------------- |
| `radius-none` | `0px`   | Square elements                           |
| `radius-sm`   | `4px`   | Minor elements                            |
| `radius-md`   | `8px`   | Buttons and inputs                        |
| `radius-lg`   | `12px`  | Cards and modules                         |
| `radius-xl`   | `16px`  | Modals                                    |
| `radius-full` | `999px` | Avatars, circular icons, badges, statuses |

Use only scale values; avoid one-off spacing and radii.

## Responsive breakpoints

| Name    | Range        |
| ------- | ------------ |
| Mobile  | `0–767px`    |
| Tablet  | `768–1023px` |
| Desktop | `1024px+`    |

Use mobile-first layouts. At each breakpoint, preserve content hierarchy and adapt navigation, columns, tables, and action placement rather than merely scaling the interface.

## Shadow and elevation

Use shadows only to communicate elevation or temporary layering. Prefer spacing and borders for ordinary module separation.
| Name | Value |
| --- | --- |
| `shadow-sm` | `0 1px 2px rgba(4, 3, 22, 0.08)` |
| `shadow-md` | `0 4px 12px rgba(4, 3, 22, 0.12)` |
| `shadow-lg` | `0 12px 28px rgba(4, 3, 22, 0.16)` |

- Cards use `shadow-sm` only when elevation is meaningful; otherwise use a border or surface.
- Popovers, menus, and dropdowns use `shadow-md`.
- Modals and high-priority dialogs use `shadow-lg`.
- Do not stack shadows or use shadows as decorative effects.

## Focus ring

| Name                | Value                             |
| ------------------- | --------------------------------- |
| `focus-ring-color`  | Light: `#1E66B1`; Dark: `#1E66B1` |
| `focus-ring-width`  | `2px`                             |
| `focus-ring-offset` | `2px`                             |
| `focus-ring-style`  | `solid`                           |

Apply the focus ring to every keyboard-focusable interactive element. Never remove focus styling without providing an equally visible replacement. Keep the ring outside the component boundary where possible so it does not change layout or obscure content.

## Accessibility and responsive behavior

Minimum requirements:

- Readable text and identifiable links/buttons.
- Explicit form labels.
- No important meaning conveyed by color alone.
- Visible keyboard focus states.
- Functional layouts on mobile and desktop.
  On mobile, prioritize clear navigation, readable text, simple actions, and uncrowded layouts. On desktop, prioritize scanning efficiency, structured lists, useful filters, and quick access to related information.

## Signature moments

Give additional design attention to the moments members are most likely to remember or share:

- Achievement or badge unlock.
- A new member's first activity.
- Successful membership application.
- Milestone recap, such as a club anniversary.
  Prioritize first-impression and recognition moments once core flows are stable. These moments should make Sctory feel like a club, not only a system; use celebratory motion and decorative marks sparingly while keeping task completion clear.

## AI-agent checklist

When creating or editing Sctory UX/UI:

- Always call the product **Sctory**.
- Identify the main user and their goal.
- List the page modules and give each one a single purpose.
- Define module relationships and primary actions.
- Reuse existing layouts, terminology, components, and tokens.
- Include loading, empty, error, disabled, success, and permission-denied states where relevant.
- Describe mobile, tablet, and desktop behavior.
- Keep user flows short and content easy to scan.
- Add no decoration without a communication or interaction purpose.
- Validate accessibility, Vietnamese text rendering, and color contrast.

## Brand assets

The canonical SClub and House logos (Ants, Smile, Storm, and Shark) are embedded in the source page. Use approved exported assets from that page or the repository; do not redraw or approximate them.

### SVG logo source

Paste the approved SVG source for each logo in the matching block below. Preserve each logo's `viewBox`, color values, and accessible title/description when supplied.

#### SClub logo

```svg
<svg width="358" height="255" viewBox="0 0 358 255" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M279.572 177.952C283.154 177.952 286.733 177.95 290.309 177.96C291.438 177.967 292.964 177.761 293.177 179.173C293.461 181.058 293.691 183.084 292.964 184.923C292.705 185.569 291.654 185.214 290.966 185.221C286.696 185.267 282.423 185.317 278.154 185.277C276.727 185.26 276.266 185.522 276.763 187.063C278.2 191.506 278.143 191.414 282.803 191.673C288.655 191.992 294.493 192.673 300.339 191.666C301.208 191.517 301.914 191.442 302.475 192.592C303.167 194.022 304.8 193.898 306.219 193.926C315.191 194.111 324.152 194.487 333.099 195.14C335.303 195.3 335.927 196.12 335.888 198.267C335.792 203.09 335.906 203.086 331.143 203.452C329.635 203.569 328.137 203.711 326.636 203.87C326.203 203.924 325.454 203.998 325.401 204.197C324.681 207.025 322.562 205.769 320.993 205.656C308.906 204.775 296.829 205.833 284.748 205.656C283.13 205.627 282.512 206.057 282.832 207.81C283.925 213.807 284.453 219.791 283.857 225.963C283.307 231.673 283.673 237.454 282.803 243.178C282.523 245.027 282.047 245.567 280.142 245.858C277.114 246.316 276.138 244.971 275.184 242.447C271.493 232.659 268.001 222.8 264.863 212.817C264.285 210.982 263.462 210.425 261.63 210.77C257.439 211.55 253.23 212.235 249.017 212.888C248.016 213.044 247.474 213.268 247.335 214.446C246.962 217.594 246.579 220.756 245.607 223.801C245.483 224.202 245.44 224.664 245.504 225.082C245.617 225.849 246.877 226.96 244.879 226.995C243.768 227.013 243.115 227.315 242.761 225.306C242.147 221.821 240.156 218.574 238.701 215.248C238.314 214.35 237.501 214.684 236.83 214.798C228.036 216.274 219.259 217.835 210.582 219.869C210.071 219.99 209.326 220.117 209.156 220.465C207.456 223.929 204.105 223.003 201.415 223.152C196.401 223.418 195.244 224.16 194.197 229.032C193.657 231.531 193.107 234.061 192.199 236.435C191.585 238.029 189.966 238.813 188.213 238.984C187.33 239.069 186.432 239.058 185.544 239.04C184.341 239.012 183.014 240.258 182.017 239.257C180.849 238.072 179.912 236.475 179.923 234.739C179.98 226.946 177.045 219.688 175.934 212.107C175.799 211.217 175.788 209.96 174.387 210.024C172.818 210.095 171.04 209.449 169.745 210.432C168.974 211.014 169.915 212.246 170.224 213.122C172.342 219.141 174.273 225.221 175.469 231.478C176.658 237.724 176.818 243.97 173.911 249.957C173.07 251.699 172.051 252.665 170.053 252.374C169.532 252.292 168.971 252.278 168.456 252.374C165.376 252.959 163.115 251.941 161.781 249.048C161.582 248.846 161.397 248.431 161.071 248.75C160.819 249.002 160.94 249.343 161.287 249.528C161.586 251.249 161.884 252.966 162.228 255C160.361 254.642 158.693 253.992 156.926 254.102C155.918 254.166 155.659 253.517 155.499 252.59C155.205 250.908 154.697 249.265 154.119 246.958C153.558 249.18 154.129 250.684 154.417 252.157C154.697 253.591 154.236 253.808 152.93 253.733C148.227 253.453 148.256 253.485 147.358 248.946C145.282 238.487 140.991 228.873 135.966 219.553C135.76 219.17 135.554 218.751 134.649 218.751C135.593 226.257 136.537 233.721 137.471 241.113C136.647 241.695 136.165 241.117 135.668 240.872C133.272 239.672 130.735 239.438 128.13 239.754C124.449 240.201 124.396 240.233 124.02 236.627C123.151 228.287 122.288 219.947 121.543 211.593C121.397 209.939 120.546 209.808 119.286 209.723C114.594 209.414 109.899 209.031 105.204 208.704C103.372 208.576 102.073 208.044 102.428 205.829C102.709 204.083 101.747 203.817 100.242 203.81C92.686 203.775 85.131 204.094 77.579 203.476C74.658 203.235 71.726 203.122 68.82 202.806C66.981 202.611 65.764 202.025 66.392 199.548C67.542 195.019 67.372 195.016 62.591 194.345C59.071 193.855 55.554 193.287 52.331 191.673C51.455 191.24 50.596 191.382 49.727 191.41C40.854 191.701 31.996 192.464 23.106 192.166C20.341 192.074 17.641 191.577 14.915 191.215C11.824 190.803 12.81 188.149 12.15 186.47C11.519 184.866 13.009 184.433 14.187 183.968C20.622 181.452 27.436 180.667 34.179 179.581C39.871 178.666 45.624 178.023 51.256 176.838C59.277 175.149 67.471 174.691 75.485 173.076C75.794 173.012 76.099 172.931 76.436 172.48C73.944 171.987 71.46 171.476 68.969 171.007C65.81 170.415 66.495 167.465 65.878 165.524C65.409 164.041 67.453 163.924 68.472 163.622C70.846 162.912 73.309 162.508 75.737 161.968C76.368 161.833 77.405 162.227 77.444 161.219C77.483 160.339 76.943 159.725 75.896 159.388C70.2 157.557 64.479 156.627 58.418 157.149C51.611 157.731 44.754 157.67 37.912 157.841C36.397 157.88 34.775 157.702 33.476 158.487C31.141 159.895 29.224 158.611 27.368 157.656C26.509 157.212 26.201 156.222 26.79 154.792C27.801 152.329 29.537 152.769 31.357 152.787C36.556 152.83 41.507 151.179 46.603 150.498C56.995 149.114 67.453 148.528 77.855 147.361C80.762 147.034 83.683 146.754 86.586 146.36C87.395 146.25 89.042 146.853 88.779 145.444C88.52 144.099 88.137 142.105 85.922 142.197C83.974 142.271 82.004 142.264 80.098 142.591C75.715 143.34 71.244 142.339 66.829 143.496C65.533 143.833 63.599 142.63 62.293 141.675C61.623 141.182 61.364 139.958 62.836 138.911C66.758 136.125 71.414 137.725 75.541 136.323C77.433 135.681 79.58 135.816 81.6 135.557C82.87 135.397 83.505 135.01 82.749 133.495C80.762 129.527 78.895 125.496 77.082 121.443C76.411 119.963 75.616 119.714 73.983 119.956C63.014 121.578 52.079 123.505 41.024 124.427C37.83 124.697 34.647 124.722 31.659 126.078C31.137 126.319 30.417 126.791 30.165 125.808C29.803 124.434 28.475 124.473 27.428 123.959C27.709 122.791 29.767 122.894 29.139 121.258C28.916 120.669 29.668 120.626 30.044 120.69C35.563 121.578 40.499 119.047 45.674 117.99C54.113 116.268 62.591 114.788 71.098 113.479C72.983 113.191 73.188 112.538 72.685 110.895C71.528 107.101 70.211 103.304 71.276 99.2123C71.769 97.3283 72.61 95.6563 74.246 94.6383C75.449 93.8853 75.439 93.1263 75.02 91.9973C74.523 90.6633 74.31 89.2543 74.31 87.8173C74.314 84.8783 75.329 83.9523 78.253 84.5023C83.427 85.4783 87.526 88.3283 91.27 91.8943C95.195 95.6353 97.886 100.518 102.347 103.751C102.748 104.035 103.003 104.585 103.983 104.426C102.975 102.584 102.073 100.809 101.058 99.1023C93.854 87.0003 88.57 74.0153 83.576 60.9053C82.952 59.2693 82.327 57.5973 82.356 55.7703C82.409 52.9303 83.583 52.0573 86.21 53.0263C89.421 54.2013 92.204 56.1073 94.894 58.1613C95.121 58.3853 95.341 58.8253 95.689 58.4533C95.948 58.1763 95.753 57.8003 95.483 57.5303C91.384 49.4813 86.479 41.8043 84.08 32.9533C83.228 29.8133 83.072 26.6293 83.481 23.4563C84.08 18.8043 88.587 15.2763 93.79 15.0423C99.39 14.7903 104.494 16.5473 109.43 18.8823C111.411 19.8193 112.138 19.7903 112.092 17.2963C112.014 13.4773 112.962 9.74033 114.136 6.16633C114.594 4.75733 115.744 2.97233 117.902 3.00033C120.152 3.03633 120.993 4.93133 121.699 6.42533C126.391 16.3623 130.933 26.3703 135.054 36.5593C135.281 37.1203 135.671 37.6423 136.083 38.0923C149.856 53.0693 158.25 70.9523 164.059 90.1873C165.035 93.4173 167.271 95.6313 169.155 98.1693C169.734 98.9463 170.564 98.9003 171.342 98.7123C176.85 97.3913 182.471 96.7143 188.057 95.8623C189.583 95.6353 190.069 95.3723 189.367 93.7403C186.449 87.0073 183.678 80.2043 180.792 73.4613C180.452 72.6523 180.633 71.8573 181.126 71.6513C182.063 71.2683 183.174 71.3393 183.994 72.1623C186.364 74.5503 188.71 76.9643 191.081 79.3523C191.688 79.9663 192.266 80.9953 193.256 80.5843C193.395 80.5263 193.528 80.4763 193.655 80.4343C192.154 77.4253 190.65 74.4183 189.136 71.4173C188.682 70.5193 189.225 70.0863 189.785 69.6563C190.662 68.9863 190.822 69.8703 191.091 70.3453C192.967 73.6843 194.802 77.0483 196.686 80.3823C196.728 80.3903 196.769 80.4013 196.809 80.4173C195.419 77.0083 193.923 73.6523 191.539 70.7353C194.2 69.1533 194.3 69.2023 195.712 72.1053C196.67 74.0643 198.566 75.2433 199.903 76.8933C202.062 79.5423 204.322 82.1193 206.542 84.7213C207.855 85.8893 208.218 87.7153 209.145 89.1543C210.185 90.7733 211.736 92.0043 213.212 93.2073C213.341 93.3133 213.418 93.4583 213.451 93.6163C215.348 93.5293 217.244 93.4063 219.136 93.2453C217.842 90.6173 216.546 87.9923 215.242 85.3713C212.094 79.0373 208.9 72.7233 205.614 66.4593C202.327 60.1953 198.952 53.9813 195.439 47.8413C194.871 46.8483 196.404 45.9573 196.972 46.9473C198.942 50.3893 200.872 53.8573 202.764 57.3453C206.139 63.5593 209.4 69.8383 212.598 76.1483C215.446 81.7713 218.243 87.4183 221.026 93.0713C221.794 92.9963 222.561 92.9133 223.326 92.8253C223.597 92.7743 223.872 92.7423 224.148 92.7273C226.692 92.4173 229.221 92.0423 231.755 91.6403C231.655 91.3643 231.558 91.0863 231.464 90.8083C230.989 89.4033 230.581 87.9413 230.265 86.5213C229.949 85.1023 229.718 83.6293 229.069 82.3123C228.566 81.2953 229.977 80.4513 230.599 81.4143L230.605 81.4113L230.63 81.4623C231.696 83.1293 232.761 84.8003 233.831 86.4683C234.767 87.9283 235.703 89.3873 236.649 90.8403C237.974 90.6213 239.305 90.4003 240.642 90.1833L260.587 86.9543C261.062 86.8793 261.541 87.0713 261.68 87.5753C261.797 88.0043 261.531 88.5903 261.059 88.6683C257.254 89.2823 253.453 89.9003 249.653 90.5143C245.659 91.1583 241.697 91.8113 237.708 92.4583C238.303 93.3613 238.903 94.2613 239.51 95.1563C241.444 98.0093 243.46 100.802 245.483 103.592L245.486 103.584C245.766 103.975 245.55 104.575 245.167 104.798C244.723 105.057 244.233 104.866 243.953 104.479C242.796 102.885 241.643 101.292 240.507 99.6883C238.894 97.4113 237.333 95.0983 235.8 92.7673L234.203 93.0243C234.78 94.3923 235.433 95.7263 236.156 97.0253C236.545 97.4243 236.873 97.8883 237.196 98.3573C237.739 99.1453 238.232 99.9613 238.679 100.82C239.126 101.679 239.357 102.456 239.212 103.428C239.08 104.291 238.857 105.167 238.285 105.849L238.187 105.961L238.236 105.959C240.702 105.912 243.133 105.529 245.55 105.071C247.647 104.674 249.67 104.241 251.849 103.929C254.028 103.616 256.296 103.549 258.408 103.336L258.667 103.307C258.892 103.273 259.117 103.24 259.343 103.209C261.093 102.916 262.744 102.355 264.601 102.083C265.134 102.005 265.668 101.952 266.202 101.919C266.303 101.743 266.487 101.617 266.755 101.625C268.372 101.67 269.989 101.647 271.604 101.557C271.883 101.515 272.164 101.494 272.447 101.503L272.483 101.501L272.748 101.481C272.839 101.148 273.232 100.887 273.59 100.972L274.988 101.309C275.541 101.441 275.571 101.992 275.302 102.337C275.952 102.736 276.44 103.368 276.816 104.021C277.146 104.589 277.341 105.157 277.253 105.817L277.252 105.821L277.451 106.097C277.636 106.352 277.519 106.686 277.348 106.903C277.004 107.339 276.619 107.738 276.199 108.098C278.458 108.079 280.718 108.124 282.973 108.237C283.832 108.28 284.744 108.393 285.305 109.075C285.848 109.734 285.868 110.682 285.252 111.293C285.319 111.432 285.386 111.572 285.451 111.711C286.029 112.943 286.505 114.217 286.867 115.526C286.97 115.892 286.742 116.229 286.402 116.346C284.138 117.134 281.728 117.223 279.368 117.51C275.052 118.036 270.992 119.824 266.957 121.34C264.824 122.138 262.691 122.951 260.551 123.742L260.508 123.758C260.137 124.175 259.651 124.566 259.05 124.931C261.212 124.807 262.901 124.857 264.53 124.573C266.28 124.264 267.241 124.672 268.004 126.404L268.052 126.513C269.639 125.988 271.245 125.521 272.891 125.219C275.311 124.772 277.742 124.789 280.191 124.796L284.806 124.807C286.362 124.538 287.921 124.304 289.486 124.101C292.495 123.714 295.523 123.458 298.553 123.338C299.242 123.309 299.987 123.213 300.665 123.373C301.304 123.522 301.779 123.959 302.106 124.512C302.812 125.715 303.277 127.139 303.717 128.455C303.841 128.831 303.572 129.144 303.252 129.275C301.623 129.946 299.909 130.329 298.17 130.578C296.96 130.752 295.741 130.865 294.522 130.981C293.99 131.124 293.451 131.236 292.946 131.362C291.648 131.687 290.344 131.996 289.037 132.291C288.96 132.434 288.829 132.549 288.641 132.593C287.57 132.845 286.475 132.955 285.385 132.921C285.089 133.026 284.789 133.13 284.482 133.229C283.298 133.611 282.054 133.802 280.811 133.81C279.553 134.096 278.289 134.324 277.018 134.435C274.623 134.645 272.132 134.577 269.818 135.003C268.415 135.261 267.038 135.718 265.638 135.996C266.015 136.482 266.369 136.982 266.703 137.496C271.784 137.259 276.865 137.015 281.944 136.717C282.807 136.668 283.256 136.88 283.555 137.377L283.826 137.398C284.02 137.362 284.216 137.337 284.412 137.316L284.361 137.083C287.357 137.438 290.352 137.828 293.351 138.126C294.65 138.254 295.338 138.786 295.161 140.142C294.93 141.909 295.927 142.059 297.386 142.179C299.263 142.339 301.726 140.98 302.848 143.886C302.951 144.149 303.997 144.081 304.611 144.12C309.754 144.458 314.893 144.681 320.017 145.299C323.527 145.728 322.239 148.652 322.782 150.445C323.343 152.269 321.622 152.602 320.074 152.762C317.168 153.057 314.275 153.621 311.362 153.82C309.772 153.93 309.474 154.558 309.491 155.967C309.555 160.41 309.52 160.556 313.814 160.297C322.967 159.746 332.116 159.615 341.276 159.718C346.162 159.775 351.025 160.194 355.89 160.616L355.883 160.612C357.65 160.765 357.874 161.436 357.828 162.901C357.661 168.459 358.648 167.497 353.392 168.235C329.069 171.644 304.645 174.231 280.273 177.212L279.572 177.952ZM205.86 100.865L204.255 98.8153L203.516 99.4043C204.082 99.7903 204.457 100.326 204.744 100.931L205.86 100.865ZM205.042 91.7713C205.589 92.7573 206.269 93.3033 207.124 93.4703L205.163 91.8693L205.042 91.7713ZM211.322 102.019C211.62 102.502 211.904 102.994 212.188 103.484C212.805 103.223 213.43 102.983 214.057 102.754C214.312 102.661 214.567 102.568 214.823 102.477C214.028 102.33 213.231 102.199 212.427 102.108C212.06 102.066 211.691 102.037 211.322 102.019ZM210.772 96.4483L211.516 97.7713C209.507 97.8743 208.74 98.5023 210.217 100.405C210.284 100.49 210.349 100.576 210.413 100.663C211.084 100.668 211.755 100.7 212.427 100.777C213.983 100.953 215.515 101.28 217.052 101.575L215.005 99.9043L210.772 96.4483ZM198.836 85.3483C198.704 85.2123 198.566 85.0833 198.42 84.9623C198.376 85.1523 198.317 85.3413 198.249 85.5303L198.25 85.5343C198.816 86.6953 199.506 87.7953 200.02 88.9813C200.348 89.2593 200.695 89.5253 201.06 89.7833C200.216 88.3553 199.499 86.8653 198.836 85.3483ZM168.229 104.486C167.81 106.523 169.734 107.914 168.857 109.987C168.598 110.604 169.606 110.718 170.22 110.81C170.845 110.913 171.516 111.034 171.938 110.53C172.406 109.987 171.757 109.575 171.498 109.185C170.44 107.602 169.322 106.047 168.229 104.486ZM152.262 76.1653C149.8 69.6643 147.017 63.9043 143.411 58.5453C144.998 64.8873 145.559 71.7333 152.262 76.1653ZM217.608 103.012C217.05 103.137 216.499 103.304 215.955 103.488C217.412 104.927 218.936 106.279 220.54 107.538C220.506 107.41 220.465 107.274 220.416 107.13C219.994 105.878 219.726 104.562 219.235 103.358L219.125 103.268C218.618 103.193 218.112 103.105 217.608 103.012ZM141.559 217.392C143.401 220.909 145.214 224.429 147.042 227.95C145.622 222.676 143.259 217.828 140.824 213.02C140.303 211.99 140.019 209.719 138.415 210.628C137.233 211.302 139.103 212.608 139.532 213.655C140.072 214.954 140.899 216.139 141.559 217.392ZM215.474 103.654C215.144 103.772 214.816 103.892 214.49 104.01C213.954 104.204 213.422 104.407 212.897 104.625C213.433 105.344 214.096 105.769 215.175 105.26C216.171 104.786 215.766 104.218 215.474 103.654ZM204.645 152.393C204.537 152.323 204.479 152.316 204.512 152.351L204.645 152.393ZM273.729 108.144C273.756 108.125 273.785 108.107 273.817 108.091L273.863 108.067C273.764 108.084 273.665 108.101 273.565 108.116L273.283 108.157L273.729 108.144ZM234.746 91.1553C233.924 89.8923 233.109 88.6243 232.297 87.3553C232.527 88.2553 232.788 89.1473 233.079 90.0313C233.225 90.4753 233.38 90.9153 233.541 91.3523L234.746 91.1553ZM235.74 99.3563C235.671 99.3373 235.602 99.3083 235.535 99.2693C233.75 98.2293 231.929 97.2533 230.073 96.3413L229.92 96.2663C229.831 96.2463 229.739 96.2113 229.647 96.1563C228.039 95.2163 226.091 95.0313 224.32 95.6033C223.518 95.8623 222.826 96.4903 221.992 96.6253C221.77 96.6613 221.557 96.6493 221.362 96.5983C221.081 97.1243 220.973 97.8043 220.956 98.3003C220.921 99.3003 221.058 100.448 221.436 101.388L221.509 101.427C221.8 101.584 221.879 101.851 221.823 102.096C222.006 102.364 222.214 102.618 222.411 102.868C222.798 103.361 223.195 103.843 223.642 104.284C224.058 104.695 224.49 105.079 224.806 105.579C224.823 105.605 224.842 105.64 224.862 105.681C224.996 105.722 225.124 105.794 225.236 105.891C225.697 106.293 226.194 106.658 226.717 106.979L228.803 106.739C230.3 106.569 231.812 106.445 233.299 106.196C234.506 105.998 236.003 105.685 236.88 104.756C237.285 104.323 237.419 103.602 237.483 103.027C237.561 102.325 237.171 101.739 236.841 101.146C236.501 100.533 236.133 99.9353 235.74 99.3563ZM261.369 122.021L261.875 121.831C261.714 121.865 261.55 121.891 261.385 121.908L261.369 122.021ZM283.942 115.606L283.964 115.602L283.954 115.59L283.942 115.606ZM302.088 128.304L302.243 128.248L302.21 128.155C302.173 128.206 302.132 128.256 302.088 128.304ZM219.972 94.9413C217.341 95.1813 214.703 95.3513 212.062 95.4503C212.334 95.7253 212.609 95.9973 212.889 96.2633C214.064 97.3813 215.423 98.1483 216.839 98.9113L218.304 99.7003C218.648 99.4873 218.94 99.3453 219.197 99.2753C219.096 97.8343 219.322 96.3413 220.141 95.2853L219.972 94.9413ZM205.236 102.231C205.727 103.756 206.115 105.362 207.646 106.069C208.117 105.697 208.612 105.352 209.125 105.034L206.855 102.136L205.236 102.231ZM237.605 106.49C237.436 106.618 237.257 106.735 237.071 106.843L237.605 106.761C237.589 106.672 237.589 106.58 237.605 106.49ZM207.176 89.2833C206.452 89.3503 206.352 88.6893 206.022 88.2283C203.981 85.3503 202.054 82.3723 199.403 79.9563C200.044 82.2003 201.073 84.2443 202.16 86.2523C203.411 87.2693 204.64 88.3133 205.844 89.3893C207.079 90.4933 208.314 91.6533 209.471 92.7923C209.782 93.0993 210.088 93.4103 210.392 93.7243L211.039 93.7073C209.828 92.6873 208.671 91.6043 207.768 90.2903C207.545 89.9663 207.353 89.6283 207.176 89.2833ZM295.944 124.813L295.666 124.832H295.935L295.944 124.813ZM232.399 93.3123C231.536 93.4493 230.671 93.5863 229.803 93.7223L228.96 93.8523C229.234 93.9743 229.508 94.1013 229.782 94.2333C229.914 94.2943 230.046 94.3583 230.177 94.4243L230.889 94.7723C231.843 95.2403 232.787 95.7253 233.723 96.2273C233.245 95.2733 232.803 94.3003 232.399 93.3123ZM134.848 115.374C134.972 114.38 131.462 110.601 130.312 110.629C126.856 111.225 123.278 111.807 119.712 112.45C115.08 113.284 115.066 113.312 117.65 117.298C118.228 118.188 118.494 119.473 120.159 119.083C124.634 118.022 129.145 117.102 133.634 116.105C134.103 116.002 134.752 116.141 134.848 115.374ZM118.831 30.9383L118.835 30.9343C117.873 31.3353 118.271 32.3543 118.352 33.0703C118.856 37.4503 119.268 41.8473 120.031 46.1803C123.427 65.5083 130.99 83.5083 137.974 101.689C138.312 102.559 138.674 103.371 139.859 103.052C141.204 103.12 141.846 102.857 141.204 101.242C139.756 97.6263 138.514 93.9283 137.151 90.2793C136.363 88.1683 137.03 85.6303 136.001 83.8453C135.125 82.3333 136.218 81.9893 136.544 81.2583C137.02 80.1863 137.964 80.5093 138.805 80.9603C139.348 81.2543 139.983 81.7123 140.516 81.1913C141.19 80.5343 140.484 79.9093 140.182 79.3203C137.935 74.9873 135.834 70.5833 133.9 66.0903C132.91 63.7763 132.587 61.1603 130.671 59.2093C130.27 58.8043 130.586 57.4593 130.877 56.6573C131.2 55.7873 132.026 56.1243 132.715 56.3593C135.086 57.1473 135.206 55.9013 134.628 54.1653C133.936 52.0573 132.974 50.0203 132.463 47.8733C130.795 40.8213 126.6 35.6863 120.691 31.7753C120.109 31.3883 119.559 30.6363 118.831 30.9383ZM88.041 130.794C90.103 135.159 90.174 135.174 95.181 133.864C92.601 128.917 90.074 123.977 87.459 119.083C86.352 117.017 84.488 118.231 83.221 118.66C81.692 119.175 83.193 120.243 83.491 120.932C84.925 124.25 86.49 127.526 88.041 130.794ZM79.14 110.973H79.144C79.424 111.804 79.882 112.123 80.751 111.946C83.31 111.896 83.633 111.374 82.561 109.107C81.319 106.463 80.144 103.787 78.902 101.143C78.668 100.657 78.579 99.7763 77.699 100.067C77.082 100.266 77.217 100.937 77.206 101.451C77.114 104.773 78.104 107.875 79.14 110.973ZM94.876 108.592H94.873C93.535 106.796 92.498 104.734 89.858 102.971C90.852 105.455 91.544 107.219 92.264 108.975C92.747 110.154 93.655 109.76 94.514 109.536C95.089 109.387 95.231 109.06 94.876 108.592ZM189.512 221.53L189.509 221.526C190.066 221.356 190.35 220.905 190.282 220.291C189.945 217.243 189.619 214.191 189.257 211.139C189.125 210.063 188.426 209.645 187.145 209.801C186.584 210.07 184.778 209.148 185.332 211.128C186.237 214.34 187.383 217.488 188.448 220.653C188.607 221.14 188.802 221.754 189.512 221.53ZM153.725 107.797C153.341 111.204 155.641 113.152 158.956 112.052C158.143 110.434 157.366 108.869 156.582 107.307C156.212 106.573 155.687 106.299 154.857 106.59C154.25 106.814 153.81 107.006 153.725 107.797ZM91.952 36.2583L91.955 36.2613C96.399 47.3553 102.457 57.5803 108.752 67.6903C113.419 75.1793 118.693 82.1523 125.035 88.2993L125.56 88.5403L125.507 87.9163C124.868 86.1703 124.233 84.4173 123.591 82.6713C117.075 64.8373 111.293 46.8403 111.641 27.5233C111.652 26.6083 111.645 25.7493 110.701 25.2173C106.286 22.6973 101.793 20.2913 96.651 19.7653C91.98 19.2903 89.936 21.2423 89.748 25.9483C89.599 29.5643 90.635 32.9603 91.952 36.2583ZM109.87 143.705V143.709C110.545 143.719 111.13 143.606 111.02 142.889C110.74 141.736 110.499 140.774 109.161 140.958C108.6 141.036 107.713 140.827 107.982 141.828C108.227 142.754 108.65 143.687 109.87 143.705ZM145.175 98.1193C144.462 95.0853 145.612 91.3373 141.541 88.9383C142.297 92.5653 143.482 95.4293 145.175 98.1193ZM175.831 102.676C174.99 102.871 174.142 103.052 173.01 103.311C174.482 105.476 175.785 107.449 177.155 109.38C178.227 110.885 179.692 109.799 180.778 109.547C181.694 109.341 180.619 108.248 180.526 107.538C180.406 106.686 179.919 105.888 179.724 105.036C179.238 102.861 177.897 102.197 175.831 102.676ZM180.129 102.161L180.132 102.165C178.77 102.782 179.983 103.939 180.189 104.706C181.555 109.71 181.598 109.593 186.755 109.096C188.82 108.894 189.363 108.155 188.689 106.342H188.699C190.14 109.004 192.518 108.312 194.789 107.967C195.368 107.882 195.9 107.623 195.574 106.959C194.545 104.823 193.824 102.356 192.248 100.724C190.999 99.4253 188.795 100.77 187.003 100.919C184.913 101.097 185.417 101.977 186.013 103.088C186.006 103.08 185.985 103.08 185.985 103.08V103.134C185.257 103.13 185.119 102.381 184.65 102.048C183.135 100.958 181.527 101.526 180.129 102.161ZM98.954 144.742V144.738C99.653 144.585 100.941 145.043 100.831 143.989C100.735 143.01 100.235 141.721 98.794 141.597C98.272 141.551 97.74 141.586 96.927 141.586C96.576 142.765 94.248 140.664 94.464 142.772C94.621 144.319 95.87 145.629 97.918 144.908C98.244 144.795 98.617 144.816 98.954 144.742ZM243.965 221.271C244.606 218.715 245.057 216.756 244.972 214.712C244.893 212.874 243.623 213.744 242.849 213.854C242.072 213.967 240.468 213.584 241.007 215.199C241.66 217.139 242.316 219.15 243.965 221.271ZM145.573 140.469H145.576C146.236 140.398 147.198 140.657 147.18 139.603C147.156 138.446 146.293 138.25 145.278 138.336C141.218 138.694 137.155 139.017 133.095 139.365C132.694 139.4 132.08 139.244 132.051 139.858C132.034 140.249 132.286 140.696 132.52 141.044C133.08 141.899 133.982 141.402 134.731 141.526C138.347 141.171 141.96 140.823 145.573 140.469ZM114.85 131.405C115.609 132.111 116.933 131.77 117.614 130.89C118.068 130.294 114.771 126.035 114.008 126.092C113.551 126.177 112.986 126.397 113.082 126.848C113.405 128.466 113.618 130.258 114.85 131.405ZM277.923 225.629L277.92 225.625C277.238 220.827 276.639 216.018 275.901 211.227C275.052 205.698 275.003 205.705 269.374 205.67H266.467C268.075 206.362 269.321 207.426 267.951 209.002C267.074 210.017 267.316 210.645 267.607 211.522C269.118 216.05 270.591 220.589 272.181 225.09C274.133 230.59 276.188 236.056 278.204 241.535C278.41 242.103 278.495 242.951 279.261 242.859C280.117 242.763 279.79 241.887 279.847 241.326C280.127 238.423 280.557 235.527 280.592 232.624C280.621 230.59 281.76 227.883 278.36 227.088C278.112 227.031 277.998 226.144 277.923 225.629ZM119.637 17.7643C117.976 23.6133 118.519 24.7303 123.832 26.7963C122.317 23.5353 120.975 20.6493 119.637 17.7643ZM123.062 125.701C122.718 126.883 126.117 130.422 127.434 130.251C131.026 129.776 134.603 129.236 138.198 128.807C139.316 128.675 140.579 128.732 140.065 127.142C139.674 125.943 140.178 123.732 137.385 124.367C133.222 124.612 128.811 124.864 124.396 125.134C123.892 125.162 123.257 125.027 123.062 125.701ZM110.3 105.224H110.296C110.772 106.019 111.088 107.059 112.415 106.86C117.22 106.147 122.029 105.465 126.895 104.766C121.766 92.9913 94.944 61.2883 88.573 59.5633C89.443 61.8133 90.319 63.9143 91.093 66.0623C96.04 79.8283 102.794 92.7103 110.3 105.224ZM167.619 204.843C169.542 205.673 171.533 205.152 173.503 205.088C171.576 204.264 169.596 204.584 167.619 204.843ZM104.976 132.895H104.98C105.225 132.345 107.315 133.364 106.595 131.394C104.728 126.315 102.329 121.471 99.724 116.744C98.876 115.207 97.478 116.137 96.402 116.474C94.915 116.95 96.001 117.911 96.299 118.557C98.216 122.749 100.175 126.912 102.166 131.067C102.652 132.082 103.099 133.286 104.976 132.895ZM199.829 100.273V100.277C199.57 99.4393 198.981 99.2233 198.047 99.2973C197.579 99.7983 195.694 98.8473 196.209 100.415C196.94 102.651 198.275 104.692 199.375 106.803C199.747 107.513 200.386 107.396 201 107.226C201.784 107.002 201.866 106.527 201.614 105.799C200.979 103.971 200.407 102.122 199.829 100.273ZM196.095 218.858V218.861C196.699 218.655 197.245 218.357 196.823 217.537C196.227 216.391 195.645 215.241 195.059 214.091L194.452 214.297C194.573 215.557 194.704 216.82 194.814 218.08C194.889 218.932 195.396 219.099 196.095 218.858ZM142.034 108.887H142.031C141.419 109.072 141.074 109.391 141.438 110.033C142.223 111.424 142.961 112.854 144.192 113.926C144.547 114.235 144.959 114.377 145.417 114.16C145.761 113.993 145.956 113.72 145.903 113.312C145.268 111.875 144.717 110.391 143.962 109.018C143.533 108.235 142.707 108.687 142.034 108.887ZM309.119 160.325L309.115 160.321C309.051 160.367 308.991 160.414 308.927 160.453C308.984 160.513 309.037 160.602 309.094 160.609C309.154 160.616 309.222 160.531 309.278 160.485C309.229 160.435 309.175 160.378 309.119 160.325ZM207.111 214.695V214.691C208.453 210.869 207.335 209.495 203.271 209.609H202.739C197.696 209.765 197.071 210.837 199.609 215.003C199.652 215.078 199.669 215.188 199.733 215.234C200.592 215.898 201.21 217.328 202.533 216.728C204.059 216.033 206.38 216.778 207.111 214.695ZM119.577 142.985C120.744 141.977 124.034 143.702 123.921 141.697C123.754 138.765 120.67 140.635 118.878 140.316C118.168 140.195 117.146 140.305 117.494 141.594C117.745 142.506 118.104 143.301 119.577 142.985ZM188.132 82.9543C189.541 86.5743 191.194 90.0953 192.724 93.6723C193.604 95.7383 195.219 94.7403 196.599 94.6163C197.132 94.5633 198.111 94.6733 197.881 93.7403C197.508 92.2103 197.263 90.4533 196.33 89.3033C193.558 85.8973 190.485 82.7493 187.191 79.1253C186.779 81.0663 187.738 81.9473 188.132 82.9543ZM312.707 199.484C302.688 198.849 292.669 198.622 282.679 199.416C292.698 199.221 302.716 200.84 312.707 199.484ZM234.101 210.294H234.105C234.907 210.189 236.241 210.374 236.099 209.162C235.979 208.154 234.743 208.626 234.044 208.679C227.525 209.173 221.006 209.52 214.461 209.332C214.014 209.332 213.57 209.293 213.134 209.339C212.403 209.421 211.313 209.002 211.182 210.141C211.033 211.433 210.923 212.849 211.306 214.056C211.597 214.989 212.744 214.251 213.436 214.091C216.065 213.474 218.635 212.32 221.286 212.122C225.615 211.795 229.825 210.883 234.101 210.294ZM159.254 100.365C160.776 99.7303 159.407 98.0233 159.275 96.8273C158.519 89.9493 153.913 85.4033 149.487 80.3963C149.019 81.6803 149.469 82.4863 149.533 83.3163C149.949 89.1153 153.586 93.3783 156.613 97.8993C157.277 98.8893 157.753 100.994 159.254 100.365ZM29.81 186.615C39.8 185.721 50.007 187.056 59.66 183.425C55.6 182.179 34.097 184.326 29.81 186.615ZM170.632 239.037V239.033C170.249 229.433 166.806 220.313 163.601 211.124C163.218 210.038 162.334 210.379 161.596 210.34C160.645 210.283 160.478 210.897 160.382 211.703C159.786 216.547 158.317 221.271 160.251 226.268C161.809 230.285 162.551 234.615 163.679 238.799C164.418 241.542 165.351 244.215 166.806 246.678C167.179 247.313 167.264 248.477 168.265 248.292C169.102 248.14 169.141 247.079 169.439 246.358C170.369 244.105 170.312 241.677 170.632 239.037ZM299.593 169.226L299.597 169.222C308.916 168.115 318.236 167.011 327.555 165.9L327.502 165.396C327.183 165.35 326.849 165.247 326.53 165.265C319.886 165.602 313.239 165.911 306.592 166.319C303.586 166.504 300.598 166.961 297.592 167.139C296.165 167.228 295.714 168.445 295.799 169.144C295.941 170.28 297.013 169.573 297.744 169.431C298.351 169.311 298.976 169.293 299.593 169.226Z" fill="#1E66B1"/>
<path d="M285.593 6.89722C284.471 8.38122 278.942 15.8302 283.428 20.3972C283.428 20.3972 239.552 28.5032 222.354 59.2512C199.95 99.3082 273.895 100.27 277.579 131.994C280.972 161.209 260.062 189.462 199.602 187.219C121.848 181.452 171.909 105.671 249.06 139.578C249.06 139.578 248.311 150.154 245.213 151.009C242.115 151.864 193.831 139.259 179.625 154.963C160.393 185.224 285.195 181.193 260.91 129.967C252.687 112.556 187.337 106.136 207.825 58.8252C227.589 13.1862 262.521 11.2622 285.593 6.89722Z" fill="#EC2027"/>
<path d="M237.579 149.068L233.352 146.118L228.526 147.928L230.027 142.995L226.815 138.967L231.968 138.868L234.807 134.567L236.493 139.439L241.461 140.813L237.352 143.918L237.579 149.068Z" fill="#FBD00C"/>
<path d="M220.814 146.555L216.587 143.606L211.761 145.416L213.258 140.483L210.046 136.455L215.199 136.355L218.042 132.054L219.728 136.927L224.696 138.3L220.583 141.405L220.814 146.555Z" fill="#FBD00C"/>
<path d="M204.602 144.213L200.109 142.939L196.507 145.916L196.333 141.246L192.387 138.744L196.773 137.133L197.934 132.608L200.823 136.281L205.486 135.986L202.881 139.869L204.602 144.213Z" fill="#FBD00C"/>
<path d="M189.867 148.532L185.136 147.882L181.871 151.364L181.083 146.722L176.75 144.77L180.995 142.548L181.58 137.86L184.991 141.129L189.686 140.185L187.553 144.429L189.867 148.532Z" fill="#FBD00C"/>
<path d="M114.871 151.531C114.871 151.531 114.566 155.072 114.339 156.485C114.339 156.485 101.804 156.219 101.804 156.485C101.804 156.751 98.4499 170.202 98.9859 170.468C99.5219 170.734 111.141 170.276 111.141 170.468C111.141 170.659 111.141 174.734 110.722 175.344C110.303 175.954 95.5189 175.876 94.9119 175.344C94.3049 174.812 92.2069 173.286 93.1979 169.172C94.1879 165.059 94.9899 151.949 99.7129 151.531C104.437 151.112 114.878 151.531 114.878 151.531H114.871Z" fill="white"/>
<path d="M117.309 151.346L122.263 151.609L119.14 170.429H126.302L125.958 175.614L112.777 175.23L117.309 151.346Z" fill="white"/>
<path d="M132.552 151.346L137.694 151.57L134.227 170.354H142.304L146.382 151.346L151.489 151.8C151.489 151.8 149.09 175.003 144.668 175.234C140.249 175.461 137.389 175.276 130.646 175.426C124.204 175.564 132.552 151.349 132.552 151.349V151.346Z" fill="white"/>
<path d="M169.815 151.683H154.53L153.937 156.368H166.192C166.192 156.368 165.862 160.893 165.329 161.223C164.794 161.549 157.657 161.478 157.657 161.478L157.682 158.682L153.551 158.405L150.229 175.607C150.229 175.607 161.656 176.526 165.926 175.188C170.192 173.857 168.783 163.948 168.783 163.948C171.299 161.322 172.097 151.68 169.812 151.68L169.815 151.683ZM163.413 170.947C163.335 171.114 155.737 171.078 155.737 171.078L156.801 165.513L164.215 165.709C164.215 165.709 163.491 170.773 163.413 170.947Z" fill="white"/>
</svg>
```

#### Ants House logo

```svg
<svg width="310" height="316" viewBox="0 0 310 316" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M150.877 2.3523C157.699 1.39667 169.61 2.65088 174.943 7.27906C178.113 10.0292 180.956 12.7947 183.915 15.7566L196.299 28.1697L280.04 111.911L292.39 124.229C298.547 130.345 304.385 135.251 305.077 144.641C305.685 152.832 306.312 163.857 301.43 171.015C299.51 173.828 294.994 177.928 292.462 180.461L196.415 276.5L183.476 289.365C174.939 297.732 172.344 300.685 160.058 302.182C151.447 302.777 142.147 302.282 135.201 296.66C127.213 290.19 119.201 281.707 111.882 274.38L32.0177 194.491L19.1105 181.608C14.5039 177.015 6.09503 169.441 5.87999 162.777C5.62049 154.725 4.09608 141.582 8.7794 134.406C10.0912 132.396 15.7839 127.049 17.6368 125.196L129.482 13.3396C137.566 5.25751 139.109 3.53018 150.877 2.3523ZM159.278 13.9998C157.866 12.7362 155.818 12.6437 154.025 12.7888C152.588 13.3654 151.968 13.7934 150.853 14.8816C143.49 22.0672 136.202 29.4009 128.915 36.6609L46.7413 118.684C40.3552 125.065 33.9227 131.405 27.6066 137.853C26.0216 139.471 25.2076 141.184 24.5177 143.305C25.3593 145.133 26.2607 146.726 27.6769 148.179C32.5671 153.196 37.5902 158.17 42.548 163.117L72.1798 192.825L126.674 247.675C134.401 255.37 142.11 263.125 149.845 270.815C152.133 273.09 153.611 274.2 156.918 273.96C160.432 272.11 171.296 260.623 174.849 257.078L253.835 178.192L272.23 159.728C275.617 156.348 279.075 153.032 282.412 149.602C283.837 148.092 285.318 146.483 285.978 144.479C286.313 143.466 286.402 141.502 285.72 140.631C283.192 137.404 279.877 134.379 276.962 131.474L260.752 115.31L167.535 22.1228C164.819 19.3902 162.147 16.565 159.278 13.9998Z" fill="#040316"/>
<path d="M136.584 76.5122C141.511 76.4299 155.238 86.9764 160.988 89.9409C159.107 92.7213 157.268 95.5306 155.474 98.3677C150.523 95.5465 145.335 92.2606 140.441 89.2827C139.844 91.9259 138.187 97.5374 137.259 100.046C143.786 101.642 152.217 109.072 155.493 114.989C161.663 126.131 158.52 139.058 151.066 148.735C161.744 149.364 164.502 155.138 168.554 163.905C175.309 156.751 179.335 152.522 189.089 150.079C207.931 145.302 238.188 159.221 223.824 182.316C219.772 188.83 213.054 190.038 206.087 191.425C208.323 194.33 210.574 197.328 212.908 200.147C210.34 202.298 207.746 204.678 204.771 206.178C200.246 201.8 196.445 194.003 191.553 190.457C190.582 189.754 184.873 188.112 182.981 187.348C183.131 192.822 183.012 198.726 183.001 204.231L173.02 204.248L172.981 180.161C169.887 177.785 169.03 176.897 166.699 173.79C164.389 177.37 160.933 179.749 156.594 179.533C151.711 179.289 151.095 179.628 148.635 184.067C147.766 185.634 146.473 187.753 145.508 189.412C143.374 192.978 141.214 196.528 139.028 200.062C136.776 198.498 132.824 196.224 130.427 194.876C131.641 193.142 133.445 189.83 134.569 187.896L141.703 175.711L139.463 174.225C128.884 179.39 124.883 185.004 111.168 184.249C101.403 183.711 93.6323 179.955 87.0605 172.809C89.184 170.356 91.8915 167.688 94.1895 165.334C97.666 169.726 106.343 174.439 111.992 174.261C120.33 173.998 128.795 170.944 134.727 164.975C134.094 162.855 133.712 161.247 133.26 159.078C133.136 159.132 133.011 159.184 132.885 159.234C116.56 165.691 95.8628 155.064 89.8643 138.993C83.9885 123.25 92.9897 106.469 108.252 100.704C107.148 97.1874 106.101 93.6535 105.112 90.103C100.23 93.4822 94.0962 98.4933 88.6553 100.296C87.2121 97.7502 85.0813 94.5403 83.4961 91.9829C87.7152 89.3685 104.349 78.2737 107.853 77.5669C108.722 77.3917 109.46 77.3494 110.206 77.9077C113.663 80.4945 117.1 93.4654 117.612 97.8589C120.862 97.3404 124.517 97.5395 127.824 97.6567C129.437 92.0129 131.052 85.9506 132.806 80.3335C133.413 78.3882 134.704 77.2474 136.584 76.5122ZM128.695 137.492C122.466 137.422 116.236 137.437 110.007 137.539C110.382 138.218 110.753 138.902 111.157 139.563C114.515 145.049 121.297 147.087 126.249 142.461C127.638 140.708 127.975 139.629 128.695 137.492ZM145.396 117.171C143.968 115.008 141.482 113.785 138.897 113.975C135.014 114.261 132.072 117.599 132.276 121.488C132.481 125.376 135.757 128.386 139.648 128.263C142.239 128.181 144.583 126.705 145.775 124.404C146.968 122.102 146.823 119.335 145.396 117.171ZM113.93 118.938C113.384 115.017 109.796 112.258 105.866 112.739C103.266 113.057 101.04 114.752 100.042 117.174C99.0441 119.596 99.4296 122.368 101.051 124.425C102.672 126.483 105.276 127.506 107.864 127.102C111.775 126.492 114.475 122.859 113.93 118.938Z" fill="#040316"/>
</svg>
```

#### Smile House logo

```svg
<svg width="278" height="303" viewBox="0 0 278 303" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20.0886 7.15079C23.9628 6.89984 29.7666 7.06317 33.74 7.06387L242.715 7.0502C247.6 7.04879 252.632 6.98182 257.493 7.17227C260.978 7.30878 264.266 8.78608 266.494 11.4594C268.614 14.0036 269.226 15.7761 269.378 18.9926C269.659 24.9689 269.543 31.0356 269.537 37.0238L269.569 277.408C269.569 282.325 269.739 288.925 269.379 293.709C265.92 293.889 262.057 293.823 258.559 293.829L45.9881 293.788C37.5724 293.79 28.9755 293.931 20.5681 293.701C17.7287 293.608 15.8523 292.962 13.5154 291.341C7.48433 287.157 8.56976 279.251 8.57106 272.817L8.49293 41.1C8.49041 34.4675 8.50557 27.8487 8.57594 21.2162C8.65803 13.4882 11.8773 8.10832 20.0886 7.15079ZM66.8103 14.4594C54.7701 14.4589 40.8698 14.1175 28.9441 14.5072C12.3216 15.2058 14.8961 27.9389 14.8963 40.2123L14.8972 252.995C14.8954 258.193 14.8304 263.453 15.0007 268.618C15.199 274.622 20.4944 279.738 26.4334 279.996C33.9959 280.327 41.6398 280.107 49.2185 280.131L249.63 280.194C253.853 280.202 258.89 280.327 263.038 280.058C263.262 273.528 263.14 266.478 263.14 259.894L263.123 57.9506L263.142 37.6264C263.147 31.414 264.264 23.2796 259.87 18.5561C256.994 15.4649 253.664 14.502 249.542 14.4867C237.252 14.376 224.9 14.4597 212.606 14.4613L66.8103 14.4594ZM104.022 265.797C105.058 266.544 104.763 266.766 105.505 268.01L105.991 268.128C106.47 267.715 106.846 267.422 107.358 267.05L107.799 267.164C108.617 268.448 107.364 268.95 108.673 269.935C109.466 270.068 109.806 270.187 110.567 269.871C110.892 268.778 109.499 268.016 109.848 266.841L110.333 266.683C110.97 267.164 111.116 267.245 111.851 267.556C112.698 267.385 113.088 267.161 113.847 266.791C114.722 266.779 115.278 267.349 115.987 267.895C117.143 269.521 116.646 271.464 114.916 272.437C112.816 273.64 110.239 273.531 107.899 273.575C103.131 273.661 101.498 269.786 102.697 265.661L104.022 265.797ZM84.1101 156.429C84.7131 156.17 87.4175 156.625 88.2927 156.653C97.7207 156.954 106.661 154.073 105.119 167.695C103.885 166.98 103.054 164.919 102.297 163.525C102.499 164.754 102.824 166.472 103.493 167.527L105.133 172.008C103.095 176.983 105.795 173.904 107.196 178.267C107.708 179.861 108.237 181.367 109.074 182.778C107.672 185.474 106.558 187.051 107.172 190.155C107.594 192.29 108.091 199.52 109.639 200.719C111.44 199.978 110.981 191.734 111.518 189.804C114.522 179.023 112.54 166.862 117.659 156.911C120.954 157.17 124.282 156.665 127.579 156.56C130.921 156.453 134.394 156.703 137.728 156.969C138.837 157.058 140.87 157.108 141.593 158.024C142.674 159.395 142.624 189.358 142.542 193.692C142.445 198.819 141.996 203.915 142.049 209.051C142.114 215.452 142.818 221.818 142.932 228.206C142.995 231.728 142.587 235.294 142.525 238.825C142.421 244.778 142.603 250.752 142.563 256.711C142.528 261.945 143.159 267.269 142.448 272.464C140.909 273.794 134.422 273.691 132.377 273.311C128.403 272.57 121.205 275.548 121.485 269.94C121.629 267.061 120.747 264.249 121.159 261.377C121.185 261.194 122.133 260.586 122.185 259.588C120.573 256.434 120.85 245.364 120.8 241.443C120.777 239.716 121.45 236.692 121.045 234.828L120.715 234.956C118.543 239.304 119.442 252.053 116.506 253.842L116.093 253.703C115.161 252.711 115.299 251.958 114.95 250.519C114.595 250.04 114.292 249.67 113.683 249.478C106.413 247.188 110.584 253.574 103.549 250.421C102.381 250.919 101.523 251.106 100.305 251.405C99.0433 238.181 97.2481 224.494 97.2283 211.281C97.2261 209.766 97.3283 205.959 96.3884 205.031L95.9881 205.236C95.2246 206.962 96.0665 240.531 95.9226 245.49C95.7542 245.655 95.5873 245.822 95.4226 245.992C93.184 248.292 95.5823 247.362 95.6306 250.035C95.3252 250.787 94.8454 251.194 94.281 251.765C94.5036 253.218 95.3782 252.177 95.8123 253.732C94.4019 255.616 96.1381 255.363 96.0955 257.25C96.0771 258.066 94.3608 258.45 93.53 259.142C94.3929 260.402 95.0376 259.649 95.7517 260.867C93.8631 262.393 87.1133 259.881 85.1668 261.851C84.8282 262.58 84.9473 262.821 85.1463 263.592C86.6566 264.089 90.1373 262.4 92.3386 263.662C93.1292 264.115 94.5315 263.273 95.8601 264.463C95.2371 265.153 91.6287 264.675 89.6756 265.771L89.6882 266.136C92.2706 267.608 94.758 266.787 95.9031 267.6C96.3407 268.442 96.122 270.147 96.074 271.171C90.5654 271.568 84.3898 271.592 78.8484 271.501C78.1222 265.839 78.5203 250.869 78.5466 244.805L78.4607 204.37C78.4946 197.49 76.7229 195.763 78.1609 187.938C77.5188 187.638 76.7816 187.358 76.3562 186.751C75.4508 185.461 75.0591 181.645 76.6326 180.791C77.3294 180.987 77.4758 181.04 78.1951 181.011C79.8074 178.633 75.8502 163.556 77.5457 160.215C79.1021 157.15 81.2496 158.868 83.7722 157.895C84.0562 157.341 84.0361 157.255 84.0955 156.614L84.1101 156.429ZM43.364 154.604C46.0103 154.314 50.4527 154.421 52.6277 154.488C60.2487 154.721 68.24 155.15 71.6433 163.115C71.8086 163.501 73.2718 163.464 74.0681 164.285C73.8357 164.996 73.4464 165.093 72.7478 165.629C71.7626 173.79 72.8066 185.477 72.4148 194.164C69.3387 194.675 65.3908 194.379 62.1912 194.755C60.2242 194.986 54.6667 195.549 53.2107 194.588C51.8228 191.68 52.3412 180.268 51.4334 176.499C51.0988 175.11 53.9415 172.346 51.3025 170.471C49.392 170.569 47.94 174.295 47.3455 175.811C48.2006 177.575 49.7619 181.99 49.074 183.835C48.1851 184.368 48.7065 183.849 47.2673 183.569C46.8054 185.635 47.7482 194.993 49.4343 196.31C57.0769 202.278 65.3111 204.31 72.0662 211.931C72.189 214.96 73.5946 217.965 73.5867 220.63C73.5661 227.759 74.571 234.601 73.3377 241.669C73.0906 243.084 74.1987 246.869 74.034 248.278C73.4495 253.271 73.7667 258.729 71.9334 263.404C71.6535 263.968 71.3596 264.535 71.0076 265.058C68.8694 268.235 65.9428 269.735 62.2859 270.425C59.4257 270.965 56.1886 271.396 53.2781 271.463C50.8464 271.519 48.3101 271.182 45.8855 270.984C40.4857 270.543 34.0167 270.618 29.4031 267.402C26.2518 265.205 25.645 260.216 25.0388 256.7C24.135 251.456 23.095 224.478 25.7195 221.144C27.3112 219.122 34.6163 220.089 36.9646 219.991C39.8366 219.87 42.7147 219.613 45.5818 219.399C39.1218 214.43 31.8707 211.352 26.3142 205.281C25.4987 204.39 21.4987 202.986 21.0261 202.413C22.3858 202.527 25.0253 203.055 26.1179 202.768C26.4556 202.137 26.2795 202.113 26.0457 201.25C25.2004 200.189 21.9865 199.936 20.5662 199.712C21.0074 198.183 21.4836 196.663 21.9959 195.156L25.2009 192.722C24.807 185.662 25.6992 186.051 26.4314 179.621C27.1235 173.545 25.5239 164.607 30.1795 159.086C33.2276 155.472 38.9767 154.907 43.364 154.604ZM183.396 33.4252C200.074 33.1891 216.17 39.5524 228.178 51.1293C238.514 61.0441 245.161 74.1861 247.021 88.3871C247.59 92.9348 247.555 97.5975 247.614 102.186C250.55 101.897 253.42 100.742 256.366 100.624C257.903 100.563 257.828 102.49 257.559 103.548C253.861 118.137 246.693 132.365 236.636 143.597C231.77 149.006 227.207 152.371 221.884 156.194C228.951 157.36 236.787 155.173 243.998 155.542C246.736 155.682 248.824 156.764 251.486 157.291L251.661 157.812C251.475 158.326 251.044 159.495 251.034 159.987C250.734 174.285 255.921 174.999 239.641 175.159C239.631 179.032 237.825 196.453 239.343 198.728C240.528 200.504 245.334 199.599 247.298 200.075C249.202 200.537 250.022 201.391 251.035 203.025C250.738 205.049 250.16 208.359 250.253 210.184C250.573 216.48 251.771 217.981 244.141 217.862C242.813 217.841 240.13 217.96 238.607 217.991C239.096 230.435 238.579 242.118 238.335 254.494C238.654 254.616 240.147 255.133 240.309 255.237C241.784 256.174 248.353 256.968 249.145 257.845C248.618 258.638 247.02 259.332 246.11 259.812C244.401 262.226 249.58 266.538 248.865 270.372C247.429 271.638 238.728 271.244 236.234 271.239L217.482 271.226C216.706 260.002 217.542 248.225 216.895 236.879C216.547 230.762 217.424 229.92 215.697 223.242C216.311 222.603 216.912 222.089 217.191 221.253C216.927 219.891 216.631 220.415 215.881 219.324C215.449 219.02 215.482 214.153 215.516 214.102C217.361 211.903 213.231 207.841 215.221 206.631L216.382 207.108C217.366 206.676 215.594 200.891 215.613 199.374C215.689 193.27 215.871 187.127 215.864 181.023C215.821 176.192 215.807 171.361 215.822 166.531C215.812 163.69 215.224 161.637 216.508 159.02C210.314 161.154 205.033 162.522 198.719 164.173C198.242 177.205 198.553 190.548 199.093 203.58C199.328 209.284 198.104 210.61 200.031 216.767C199.375 217.639 198.903 218.279 198.342 219.211C198.676 220.156 198.839 220.007 199.88 220.691C200.804 222.289 199.607 225.22 199.761 227.009C199.831 227.826 200.823 229.311 200.565 230.003C199.791 232.082 199.52 232.797 199.199 235.031C200.419 237.8 199.71 240.296 199.82 243.666C200.032 250.812 197.26 253.405 206.537 252.309C207.168 252.234 209.985 252.7 210.869 252.816C212.137 256.374 211.351 257.718 211.253 261.313C211.189 263.645 211.815 265.662 211.426 268.104C208.189 272.634 188.038 269.424 182.72 270.609C176.904 271.905 175.029 269.223 177.378 264.711C177.501 264.473 176.074 262.49 176.122 260.891C176.54 246.96 176.271 232.967 176.97 219.065C177.995 203.691 175.963 191.091 177.021 175.98C177.311 171.845 176.965 168.006 177.946 164.12C175.949 163.928 173.965 163.619 172.005 163.193C172.164 168.05 171.844 172.791 171.971 177.555C172.264 188.522 172.283 199.206 171.934 210.149C171.653 218.995 172.089 227.684 171.166 236.577C171.345 240.656 170.871 244.465 171.178 248.564C171.381 251.289 172.568 270.178 170.374 270.866C166.945 271.94 154.467 270.868 150.98 269.224C149.929 267.83 151.115 258.862 151.037 256.601C151.011 255.853 152.088 254.422 151.892 253.445C151.559 253.18 150.531 252.367 150.503 251.954C150.156 246.838 150.167 241.656 150.113 236.53C150.108 236.004 150.524 235.378 150.864 235.001C151.711 234.481 152.601 234.652 153.611 234.709L153.876 234.392L153.678 233.941C152.697 233.336 151.339 233.321 150.166 233.206C150.051 230.351 150.377 228.515 150.388 225.76C150.422 217.923 148.371 208.569 150.284 201.12C149.618 199.144 149.179 197.396 148.673 195.371C149.224 194.631 149.99 193.775 150.136 192.907C149.722 192.222 149.539 192.344 148.623 192.011C147.413 190.19 149.49 187.247 148.513 185.335C148.088 184.502 147.28 182.797 147.948 182.003L149.008 182.512L149.345 182.331C149.581 180.326 148.552 177.693 148.574 176.063C148.665 169.164 149.471 161.879 148.059 155.057C118.865 139.327 111.133 107.698 114.1 76.8481C114.305 74.7198 114.648 67.737 116.58 66.8266C118.327 67.2336 123.371 71.6395 125.266 73.0648C129.462 65.6872 130.261 62.1355 136.685 55.0326C149.382 40.9967 163.471 34.6985 182.037 33.5111C182.488 33.4598 182.942 33.4312 183.396 33.4252ZM52.1531 264.602C51.95 265.446 51.868 265.648 52.1004 266.522C52.7413 267.179 52.7712 267.261 53.9509 267.289C54.2919 266.171 54.3553 266.49 54.115 265.436C53.5427 264.811 52.9738 264.773 52.1531 264.602ZM193.718 262.287C192.953 261.991 192.858 261.973 192.057 262.139C190.386 262.262 188.701 262.481 188.663 264.51C189.742 266.832 191.831 266.994 193.999 267.146C193.931 265.406 191.658 263.979 191.55 262.831C192.887 262.571 192.837 263.173 193.722 262.653L193.718 262.287ZM167.509 262.365C166.636 261.776 165.491 261.984 164.465 262.117C163.489 262.199 162.016 262.155 161.342 262.657C161.082 263.687 160.992 265.033 161.594 265.952L162.048 265.904C162.737 265.039 162.788 264.644 163.071 263.564C165.217 261.99 165.203 263.978 166.969 263.37C167.54 262.767 167.522 262.98 167.509 262.365ZM38.4177 264.706C37.7599 262.704 36.3697 263.102 34.4695 263.147C34.8621 265.221 36.6213 264.768 38.4177 264.706ZM223.92 260.293C223.128 260.909 221.225 262.078 220.957 262.801C221.35 263.301 221.379 263.305 221.965 263.584C222.78 263.599 223.477 263.793 224.151 263.228C225.095 262.437 224.96 260.921 223.92 260.293ZM207.428 258.937C206.471 260.005 206.47 261.882 207.438 262.981C208.123 263.095 208.265 263.113 208.954 263.047C209.264 261.875 208.544 259.553 207.428 258.937ZM123.933 257.216C123.521 258.568 123.187 261.113 123.327 262.524L123.664 262.875L124.39 262.759C124.766 261.392 125.452 259.416 125.283 258.078C124.745 257.249 125.074 257.501 123.933 257.216ZM102.056 260.283C102.898 260.323 103.764 260.258 104.406 260.779C104.714 261.762 104.586 261.559 104.275 262.709C103.541 262.886 103.421 262.933 102.716 262.685C102.107 262.078 102.14 261.161 102.056 260.283ZM114.789 257.908C115.93 258.134 116.253 258.033 116.937 258.747C117.006 259.555 116.559 260.081 116.122 260.811L115.447 260.806C114.642 259.986 114.687 258.988 114.789 257.908ZM244.367 258.702C242.26 258.26 237.998 258.426 235.784 258.712C236.631 258.913 241.507 259.711 241.714 260.006C243.484 260.372 243.35 260.025 244.367 258.702ZM100.987 252.839C107.116 252.416 109.499 251.693 106.867 258.402C105.644 259.538 103.545 259.266 101.758 259.292C101.212 256.988 100.957 255.192 100.987 252.839ZM167.669 253.49C166.736 254.472 166.114 255.25 165.455 256.334C165.088 256.937 161.997 256.388 160.978 257.05C161.12 257.726 160.981 257.479 161.56 257.949C164.047 257.925 165.54 258.046 168.022 258.318C168.135 256.981 168.377 255.173 168.139 253.896L167.669 253.49ZM51.0769 252.833C51.4846 254.809 51.5573 255.714 51.6531 257.734L53.5906 255.175C54.436 254.621 54.6023 254.728 54.8591 253.934C53.9785 253.097 52.3504 253.02 51.0769 252.833ZM190.364 251.542C190.51 253.703 190.435 253.335 188.858 254.969L188.913 255.299C190.237 255.633 191.057 255.588 192.395 255.585L193.594 255.139L193.756 254.645C193.424 254.033 190.772 251.655 190.364 251.542ZM158.376 249.055C159.589 249.755 159.93 249.705 160.516 250.835L160.386 251.52C159.985 251.788 159.695 252.015 159.239 252.182L159.471 252.651C160.189 252.839 161.075 253.102 161.793 253.219C162.55 251.819 162.709 250.608 163.469 249.236C161.644 249.231 160.195 249.222 158.376 249.055ZM48.5418 220.515C48.3338 227.745 48.4457 235.189 48.2986 242.447C48.2644 244.133 47.4661 251.074 47.6423 252.077C48.5813 252.956 49.133 252.777 50.323 252.511C52.386 249.97 51.5509 245.463 51.4119 242.19C51.2466 238.298 52.295 222.395 48.5418 220.515ZM220.814 249.766C220.7 251.085 220.525 250.863 221.059 251.88C222.056 252.51 223.746 252.133 224.96 251.976C224.815 249.851 222.628 250.013 220.814 249.766ZM155.638 247.762C154.763 248.754 153.545 250.016 154.376 251.41C155.143 251.372 154.847 251.488 155.476 250.892C156.324 250.105 156.631 249.835 157.601 249.217L157.541 248.795C156.913 248.439 156.279 248.095 155.638 247.762ZM201.349 177.801C202.701 177.798 205.788 177.7 206.514 178.931C206.167 179.752 206.277 179.504 205.202 179.943C204.916 181.129 204.982 181.259 203.803 181.553C201.945 181.152 201.339 179.501 201.349 177.801ZM204.286 173.066C205.308 173.334 206.248 173.378 207.046 174.056L207.025 174.489C206.107 175.192 204.612 175.408 203.448 175.672C202.385 175.659 201.391 175.198 201.515 173.993C202.228 173.491 201.954 173.526 202.664 173.595L203.387 174.692C203.957 174.349 203.992 173.822 204.286 173.066ZM254.054 161.096C254.955 162.503 254.449 166.612 254.149 168.285L253.523 167.986C252.764 166.578 252.919 162.372 253.266 160.778L254.054 161.096ZM209.368 133.468C199.551 134.67 190.523 135.592 180.719 133.907C179.629 133.719 178.25 133.585 177.145 133.527C175.912 137.893 174.965 143.255 173.994 147.749C173.238 151.25 171.904 156.73 171.704 160.108C176.836 161.337 199.294 163.036 203.104 159.881C205.183 151.872 207.752 141.544 209.368 133.468ZM237.323 126.02C227.333 128.963 221.61 130.824 211.383 133.135L207.504 149.151C206.98 151.331 205.51 156.939 205.512 158.988L205.764 159.309L206.321 159.31C215.389 157.458 227.976 149.052 233.788 141.775C234.988 140.273 238.512 127.354 237.907 126.046L237.323 126.02ZM148.975 121.419C146.911 130.265 144.937 139.133 143.055 148.019C153.015 157.477 159.078 152.574 169.89 156.188L170.382 156.217C171.404 154.102 174.581 136.299 175.198 133.02C169.828 131.115 166.445 130.288 161.03 127.772C156.821 125.816 152.924 123.276 148.975 121.419ZM88.3992 76.6264C88.5609 76.631 89.2339 76.7997 89.4461 76.8539C90.9851 77.2462 93.1102 76.7948 94.6902 76.6791C98.2851 76.4161 101.403 77.2494 104.733 78.4584C105.374 80.2923 107.568 86.2545 107.46 87.8305C107.336 89.6102 107.327 102.569 106.716 103.004C105.696 103.73 95.9573 103.434 93.9802 103.42C93.0113 98.789 93.5533 94.6305 93.4754 89.9799C93.4667 89.4736 93.1271 88.9737 92.8035 88.601C91.928 88.2217 92.2611 88.2263 91.4841 88.432C90.8388 89.6476 91.5694 108.289 91.4285 111.905C91.8892 111.842 92.3521 111.79 92.8152 111.749C94.853 111.555 105.973 111.355 107.262 112.421C107.706 115.138 107.374 118.128 107.448 120.886C107.558 124.999 108.804 147.905 107.076 150.042C106.493 150.764 105.481 150.945 104.601 150.966C101.634 151.039 101.541 149.798 99.6394 148.323C99.1369 147.933 97.2536 148.238 96.5779 148.263C96.5733 148.082 100.362 143.692 101.221 142.684C99.4742 140.638 98.214 138.362 96.283 136.496C96.2465 136.456 95.8853 134.763 95.8338 134.515L95.3465 134.204L94.9754 134.517C94.5418 135.808 95.093 136.343 94.742 137.129C92.427 136.951 93.0936 126.718 93.0808 124.677C92.6159 124.05 92.8671 124.197 92.1795 124.067C90.3484 125.597 92.6862 135.679 90.3777 138.701C89.4268 139.17 89.7816 139.15 88.9109 139.013C87.9523 137.786 88.9762 134.688 88.2195 132.591C87.6089 132.039 87.9161 132.159 87.0593 132.163C86.3873 132.868 86.5522 133.69 86.5427 134.791C85.9581 135.251 83.3261 135.75 82.4363 135.956L81.157 135.836C79.902 136.236 79.0299 137.467 78.0466 138.484C77.8517 136.448 78.1931 129.778 77.3504 128.79C73.5023 128.437 74.7445 135.636 74.7918 137.97C74.8762 142.115 75.1719 146.48 74.6287 150.597C69.456 151.095 66.5287 150.496 61.6189 149.593C61.8328 147.476 62.3222 143.035 62.2576 140.733C62.1634 137.392 61.0707 132.031 61.7625 128.304C61.787 128.179 62.4577 127.799 62.6609 127.065C62.4212 126.881 61.6853 126.287 61.6736 126.041C61.5623 123.694 61.6601 120.579 61.5906 118.288C61.4627 114.081 61.4142 109.919 61.2918 105.757C61.2307 103.686 60.5276 97.3401 60.6541 95.8373C60.9138 92.7459 60.3637 79.897 61.2449 77.9086C62.5418 76.8929 70.0257 76.8999 72.0105 77.0541C72.9354 77.1261 73.9774 77.2862 74.447 78.182C75.7491 80.6669 75.1976 87.2714 75.2039 90.2494C75.2229 99.2674 75.0141 108.3 75.1316 117.31C75.1539 119.028 74.8444 120.748 74.9666 122.467C75.007 123.036 75.1191 123.595 75.5203 124.026C75.7917 124.317 76.2598 124.408 76.6531 124.381C77.2574 124.34 77.4904 124.083 77.6199 123.526C78.2476 120.822 77.8569 117.466 77.8211 114.671C77.7469 108.864 76.6688 84.5545 79.0652 81.1449C80.9936 78.4018 85.2405 77.1789 88.3992 76.6264ZM42.7459 77.3461C56.9274 76.4808 58.704 84.763 57.8953 96.7035C57.4949 102.615 58.874 106.77 53.9119 111.609C55.8079 113.748 57.3402 115.71 57.6687 118.66C58.2643 124.008 57.6821 143.968 54.6492 147.663C53.0662 149.592 51.0995 150.002 48.742 150.246C41.6336 150.661 36.0321 150.94 28.8982 150.763C27.945 146.658 27.8042 131.48 27.0242 126.3C27.0506 126.468 27.7213 124.736 27.7566 124.621C27.3025 123.444 22.5276 121.759 20.9978 121.049C22.0447 120.677 23.85 120.345 24.9861 120.1C25.5031 113.916 27.6672 109.169 27.6922 103.16C27.7076 99.4188 27.5908 95.6206 27.5037 91.9057C27.4295 88.7374 26.4065 81.5555 27.075 78.7602C28.3548 77.4019 31.6452 77.5828 33.5867 77.4965C36.3837 77.1629 40.2619 77.4986 42.7459 77.3461ZM91.1765 147.302C91.8315 147.082 91.5193 147.077 92.1443 147.271C92.5081 148.353 93.3557 149.853 92.282 150.53L91.7195 150.145L91.5242 148.745C90.8519 148.728 89.5273 149.628 88.822 150.026C87.4795 150.19 85.64 149.799 85.1687 148.405C86.1056 147.418 89.7457 147.405 91.1765 147.302ZM251.654 146.808C252.675 146.825 253.373 146.865 254.112 147.564C254.594 148.487 254.421 149.237 254.326 150.282L253.568 150.102C252.491 149.168 252.106 148.13 251.654 146.808ZM124.301 101.887C123.459 104.266 120.552 115.548 121.085 117.522C123.787 127.53 130.342 137.279 137.881 144.315C138.722 145.109 140.16 146.508 141.322 146.17L141.751 145.177C143.058 140.549 144.085 135.259 145.201 130.534C145.756 128.184 147.12 122.379 147.254 120.132C142.922 117.002 139.188 114.538 135.004 111.121C132.615 109.17 126.197 103.02 124.301 101.887ZM46.533 142.508C45.4003 141.412 44.6618 141.727 43.1209 141.844C42.901 142.682 43.0122 142.848 43.3543 143.624C43.2354 144.536 43.1501 144.741 42.8298 145.559C43.5281 145.584 43.5491 145.425 44.2205 145.027C45.1763 144.475 45.9343 144.152 46.4968 143.207L46.533 142.508ZM41.447 120.829C38.8563 122.3 39.8042 124.515 39.5369 127.149C37.2179 127.677 35.8585 127.639 33.4627 127.665C32.5066 129.741 32.2529 130.612 31.9841 132.97C34.3898 133.194 36.4331 133.279 38.8523 133.341C38.931 135.551 38.9823 137.827 39.0955 140.029C40.3299 140.068 42.1255 140.07 43.3064 140.221C44.0549 140.364 44.1438 140.362 44.8328 140.039C46.291 138.337 43.9666 134.406 45.4646 132.412C48.054 131.218 51.8093 136.015 51.4451 127.886C49.4772 127.936 46.6601 128.27 45.1004 126.864C42.7925 124.782 46.1624 120.789 41.7166 120.825L41.447 120.829ZM246.676 122.962C246.025 122.481 246.005 122.652 245.041 122.708C242.324 123.884 241.001 124.647 239.771 127.666C239.226 129.004 237.844 134.66 238.167 135.868L238.587 135.969L239.134 135.557C240.473 133.848 246.436 124.772 246.676 122.962ZM184.07 101.442C182.604 106.464 181.471 113.175 180.256 118.413C179.556 121.431 177.872 128.716 177.694 131.518C188.563 133.583 197.782 133.355 208.722 131.658C209.158 131.546 209.745 131.454 209.873 130.948C211.461 124.637 214.988 111.961 215.845 105.991C209.724 105.301 204.126 104.7 198.021 103.705C194.14 103.074 187.861 101.667 184.07 101.442ZM243.122 106.089C233.934 106.57 227.044 106.487 217.864 106.121C215.748 113.848 213.677 123.148 211.928 131.021C218.711 129.982 226.039 127.729 232.565 125.704C234.306 125.143 238.366 124.138 238.962 122.556C240.531 118.388 242.371 110.458 243.122 106.089ZM151.56 109.421C150.909 112.382 149.919 116.389 149.551 119.333C153.071 121.764 172.578 132.46 175.694 130.604C177.24 125.288 178.429 118.65 179.639 113.17C180.306 110.153 181.797 103.607 182.03 100.689C174.121 98.8342 166.582 96.8401 158.944 94.0707C157.74 93.6345 156.437 93.2165 155.192 92.9154L151.56 109.421ZM253.716 105.47C253.223 104.396 252.364 104.757 251.278 104.907C249.293 105.193 247.304 105.462 245.314 105.715C244.664 107.873 241.182 120.383 241.541 121.968C242.469 122.147 243.216 121.763 244.14 121.359C248.107 119.748 248.54 119.846 250.28 115.55C251.32 112.983 253.37 108.011 253.716 105.47ZM129.229 79.8607C128.21 83.5119 125.121 96.2379 124.823 99.7191C127.597 102.318 144.901 117.772 147.677 117.954L148.007 117.233C149.981 108.872 151.827 100.481 153.545 92.0639C148.335 89.8392 143.928 87.92 138.933 85.2904C137.086 84.3179 130.596 80.3693 129.229 79.8607ZM117.037 94.5854C116.884 97.0398 118.04 110.102 119.661 111.217C120.412 110.672 120.239 110.607 120.606 109.547C121.287 106.542 122.131 103.165 122.627 100.154C121.258 98.547 118.803 95.5153 117.037 94.5854ZM42.0593 88.5707C40.7788 88.7653 40.9242 88.5374 40.1736 89.3041C39.5857 91.1516 39.9851 93.0697 39.8054 95.1547C36.5136 95.5538 33.7607 94.2666 32.5115 95.5385C31.9837 96.8952 32.324 99.5034 32.45 101.053C34.5749 101.188 36.7028 101.268 38.8318 101.293C39.0036 103.274 38.6594 106.562 39.7908 107.52C40.5012 107.657 40.6737 107.664 41.3972 107.636C45.988 106.409 44.6618 104.519 45.1375 100.515C46.3328 100.453 50.2083 100.456 50.947 99.8637C51.5285 98.8256 51.3217 97.142 50.3279 96.4506C48.7794 95.3738 45.5802 96.7175 44.7068 94.6732C43.5975 92.0766 46.0024 88.6921 42.0593 88.5707ZM186.178 37.9252C184.698 37.8782 180.615 37.9076 179.191 38.1254C163.639 39.3803 149.242 46.8293 139.234 58.8002C135.631 63.0805 130.811 70.3914 129.319 75.8432C132.493 78.244 136.441 80.3791 139.964 82.2709C158.146 92.0353 177.068 97.0509 197.304 100.343C209.865 102.566 230.306 104.338 242.916 102.747C243.041 98.7045 243.193 94.7717 242.829 90.7299C241.589 77.8696 236.078 65.7951 227.174 56.434C216.557 44.9964 201.777 38.3236 186.178 37.9252ZM118.049 71.7758C117.239 75.1442 115.635 88.5932 117.483 91.8275C118.152 92.9972 121.698 96.584 122.915 97.8315L123.801 95.3393C124.774 91.1429 126.978 82.7642 127.48 78.8051C124.662 76.6277 120.969 73.7092 118.049 71.7758ZM203.848 71.1313C209.078 70.8557 213.553 80.5655 215.408 84.516C212.173 82.127 209.534 80.0623 205.901 78.2758C201.405 76.6764 195.554 79.192 191.071 80.6537C194.245 76.9471 199.152 72.7508 203.848 71.1313ZM168.094 65.4672C168.948 65.3787 170.071 65.2521 170.878 65.5551C174.98 67.0965 178.824 74.9848 180.714 78.6596C177.778 76.9314 175.513 74.7075 172.158 72.8998C167.355 70.4245 160.9 73.0413 156.162 74.6361C159.597 70.8118 163.33 67.4817 168.094 65.4672Z" fill="black"/>
</svg>
```

#### Storm House logo

```svg
<svg width="275" height="281" viewBox="0 0 275 281" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M269.27 5.51465L269.245 246.508C269.245 255.28 269.63 267.195 269.2 275.745C258.872 275.925 248.122 275.78 237.766 275.782L5.82368 275.763C6.27925 269.018 5.9149 256.955 5.91352 249.849L5.84321 72.834C5.83884 50.6756 5.54787 27.5992 5.97017 5.50586L269.27 5.51465ZM214.384 11.54C192.464 11.8849 170.293 11.0912 148.399 11.6006C147.422 11.8431 147.135 11.7303 146.629 12.6162C144.426 16.4779 142.379 20.4906 140.299 24.4209L130.47 42.8369L103.24 93.5479C99.7885 99.9165 96.1215 107.633 92.3598 113.705C105.255 114.468 117.909 114.717 130.775 115.184L143.812 115.667C147.119 115.808 150.54 116.333 153.685 115.338C154.938 116.05 155.769 116.524 156.945 117.39C155.471 118.522 153.619 119.911 152.405 121.311C145.988 128.714 139.077 135.765 133.137 143.558C132.686 144.149 132.124 144.917 131.623 145.449C117.934 160.004 105.492 176.241 91.6167 190.563C88.9464 185.012 81.6465 176.372 77.9057 170.979C76.4428 168.87 72.5644 163.627 70.8852 161.837L33.184 228.05C28.7891 235.699 24.4469 243.379 20.1567 251.088C18.4996 254.048 11.3217 265.742 11.9545 268.415C13.3116 269.81 26.7422 269.462 29.0405 269.032C31.355 268.599 38.6611 258.478 40.3823 256.272L56.2104 236.01C59.9823 231.08 63.7962 226.182 67.6508 221.316C69.1348 219.409 72.2734 214.98 73.853 213.651C74.3577 213.608 74.4084 213.582 74.8032 213.889C75.8944 214.737 94.821 239.851 95.9985 241.762C99.5447 237.881 104.633 230.813 107.974 226.437C114.733 217.509 121.542 208.62 128.402 199.77L190.252 119.896L206.849 98.1719C208.929 95.4353 213.618 88.9855 215.834 86.7275C209.831 86.1578 200.688 86.3633 194.537 86.3516C182.63 86.3006 170.723 86.3724 158.818 86.5674C161.015 82.0738 172.092 72.3342 176.279 68.2285L214.503 30.6963L227.604 18.085C229.475 16.2674 232.203 13.7418 233.876 11.8535C227.54 11.4029 220.753 11.4399 214.384 11.54ZM209.313 123.058C206.864 122.246 203.867 122.153 201.276 122.333C192.776 123.465 188.28 129.158 183.299 135.656L119.364 219.124L103.915 239.472C102.029 241.975 99.2933 244.624 97.8588 247.281C96.3128 247.239 95.0344 247.213 93.4926 247.021C92.8133 245.514 91.1856 243.191 90.0434 241.976C85.6384 237.29 79.6158 225.364 74.2055 222.421C69.7279 225.16 56.2323 244.771 51.812 249.825C49.9997 251.897 38.0194 266.297 38.7749 267.482C43.3245 268.062 48.8003 267.305 53.4809 267.287C62.6116 267.255 71.7445 267.263 80.8754 267.268L200.05 266.853L238.43 266.845C244.593 266.842 251.061 266.602 257.25 266.732C259.17 266.772 260.864 265.507 260.95 263.383C261.357 253.385 261.127 243.362 261.23 233.356L261.342 196.729C261.365 188.137 261.513 179.539 261.363 170.947C261.245 164.014 261.412 162.866 254.163 163.209C250.318 163.375 246.565 164.434 243.199 166.299C242.647 166.603 241.032 167.854 240.997 167.93C239.125 167.245 238.174 166.856 236.171 166.593C233.878 160.682 230.482 157.553 224.758 155.029C224.211 154.788 223.659 154.556 223.105 154.33C222.443 153.339 221.662 152.229 221.045 151.227C223.21 144.672 223.716 139.428 220.574 133.04C218.281 128.379 214.272 124.702 209.313 123.058ZM57.6157 127.149C67.4424 109.731 50.8183 91.6095 32.8295 93.8535C26.4539 94.445 21.4496 95.525 16.684 100.555C14.6027 102.751 14.6218 109.503 14.227 112.42C13.814 122.166 14.0157 132.109 13.9086 141.874C13.5441 167.159 13.6458 192.449 14.2153 217.73C14.2667 221.324 13.8566 246.269 14.5112 247.344C15.3789 247.564 15.6083 247.657 16.5229 247.491C18.5753 245.651 24.5544 234.196 26.2553 231.133L42.1928 202.651C47.045 194.089 52.2745 185.692 56.9995 177.061C59.5779 172.35 62.5202 167.686 64.7299 162.814C66.7699 158.96 67.6404 156.15 71.9028 154.729C75.0068 159.432 77.7119 162.747 81.0346 167.196C84.9075 172.382 87.7472 177.577 92.7348 182.101C95.9225 179.999 100.711 174.043 103.376 170.964L118.287 153.799C121.315 150.271 125.023 145.612 128.236 142.5C127.906 141.99 127.547 141.411 127.187 140.929C119.625 130.779 100.631 130.516 90.895 136.777C89.261 137.818 87.8086 139.12 86.5971 140.631C85.782 141.649 85.5208 143.007 84.7524 143.152C82.8967 142.209 81.4742 142.932 80.8774 142.365C79.7339 133.845 69.429 129.208 62.1958 130.845C60.6068 131.204 59.4414 128.526 57.6157 127.149Z" fill="#040316"/>
</svg>
```

#### Shark House logo

```svg
<svg width="275" height="275" viewBox="0 0 275 275" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.77864 2.26936C23.1791 1.7564 40.1116 2.20263 54.7318 2.20295L250.181 2.18928C255.283 2.18786 260.423 2.14319 265.521 2.27522C267.206 2.31887 268.598 2.55756 269.944 3.59748C271.109 4.49764 272.121 6.07267 272.194 7.56135C272.363 10.9445 272.296 14.5132 272.293 17.911L272.25 245.731C272.274 251.983 272.365 258.283 272.341 264.533C272.333 266.503 271.836 268.727 270.529 270.233C269.234 271.726 267.911 272.041 266.042 272.234C249.595 272.607 231.643 272.261 215.106 272.261L21.431 272.266C17.3008 272.269 13.1253 272.328 8.99543 272.221C7.00544 272.169 6.0294 272 4.40364 270.781C2.63023 269.452 2.50572 268.25 2.36165 266.057C2.1278 262.498 2.23031 258.633 2.23079 255.035L2.24153 64.2508C2.24082 46.3816 2.21123 28.5118 2.23665 10.6434C2.24395 5.51019 2.94732 2.69769 8.77864 2.26936ZM13.4642 9.40217L13.474 235.722C13.4741 245.322 13.3104 255.504 13.5023 265.059L252.082 265.089C254.642 265.088 259.116 265.006 261.546 265.3L261.547 9.36311L13.4642 9.40217Z" fill="#040316"/>
<path d="M206.045 15.6867C207.168 15.5029 210.439 15.4968 211.766 15.4874C219.974 15.4292 228.688 16.1287 236.128 19.8345C227.858 27.0637 219.998 40.6686 217.157 51.1831C215.827 51.1095 214.427 50.7692 213.115 50.4948C219.88 57.4262 229.966 74.7198 231.613 84.0367C239.52 86.5085 246.683 89.2668 252.981 94.9132C247.847 95.5231 241.144 95.2978 235.23 95.9117C235.732 97.9328 236.104 103.551 236.228 105.836C237.142 122.628 232.083 140.578 222.648 154.503C218.432 160.726 213.243 166.958 209.402 173.344C208.466 174.9 206.411 180.936 205.482 183.154C202.137 191.207 197.484 198.653 191.71 205.188C193.868 196.161 191.886 197.448 191.052 190.228C186.311 194.186 177.394 197.094 172.933 202.557C168.631 207.823 165.327 215.701 161.974 221.781C151.718 239.967 134.975 253.613 115.093 259.991C123.271 251.953 129.009 245.175 134.349 235C140.209 224.001 141.403 211.107 137.662 199.219C134.936 190.49 129.823 183.306 123.223 177.078C120.285 174.306 116.581 170.886 112.061 172.48L111.008 172.85C110.332 172.35 108.615 166.951 106.488 164.544C103.807 161.509 100.231 159.866 98.2204 157.717L98.2746 157.238C98.7494 157.297 99.2202 157.457 99.6859 157.588C99.9915 157.38 100.837 156.781 101.187 156.762C112.416 156.136 123.976 161.232 132.96 167.613C137.524 170.855 141.387 175.501 146.147 178.571C151.644 182.193 154.296 184.59 161.064 183.561C170.909 182.065 178.494 172.164 183.936 164.453C180.642 164.346 174.986 164.875 171.705 165.42C174.242 162.756 181.211 157.234 184.57 154.091C186.277 152.441 188.387 150.284 189.537 148.209C192.981 142 192.829 132.693 191.11 126.031C189.426 119.508 184.515 110.651 178.607 107.198C170.854 109.113 166.837 112.876 157.954 113.336C152.129 107.513 145.245 99.9279 136.89 98.2411C134.107 97.6793 130.351 97.44 127.425 97.1336C125.176 100.966 122.878 107.259 122.739 111.668C122.223 127.99 112.313 130.49 99.8185 136.609C94.8838 139.054 90.1328 141.853 85.6026 144.984C80.9365 148.194 75.4209 152.638 71.0937 156.332C66.9998 159.827 64.0119 164.181 59.0509 166.909C58.8879 158.006 64.7402 146.539 69.0693 138.905C76.7121 125.427 88.2551 115.57 99.9961 105.831C93.6012 107.518 84.6154 108.579 78.0371 107.113C74.3472 106.29 73.3686 101.819 76.4503 99.828C77.9295 98.8722 77.1888 98.445 77.6636 97.0721C78.582 97.1266 78.5203 98.4686 79.7113 98.8349C80.2597 98.0862 80.2662 92.5131 80.2449 91.39C80.9657 92.2961 81.3635 92.8203 82.225 93.5828C82.8835 93.3258 82.6571 93.5081 83.0296 92.8139C83.0677 91.6913 82.431 90.3397 82.0144 89.2566L82.1699 88.9247C83.0392 89.034 82.869 89.6796 84.0745 90.2374L84.4658 89.9729C84.8359 88.897 84.5528 88.6628 84.1666 87.4114C84.9495 86.4556 84.8641 87.6899 86.3151 86.9167C86.6403 85.4934 85.7589 85.5804 86.0527 84.2137C86.716 84.2951 86.9236 84.3896 87.483 84.0963C87.8273 83.2547 88.4493 82.0572 88.3056 81.2309L87.8069 80.9365C85.7729 80.9841 85.2159 81.5504 85.0099 83.4577L84.606 83.5391C83.9639 83.0697 83.5514 82.8489 82.8668 82.4791C81.1814 82.5334 82.2038 84.3104 81.295 85.2017C80.5828 84.7138 79.7629 84.0136 78.9516 83.9938L78.7574 84.3461C78.7139 85.4077 79.4181 86.5139 79.916 87.489C79.4347 87.4629 77.9273 87.3767 77.5033 87.2597C76.3066 86.9291 74.7304 85.8648 73.378 86.2201L73.3323 86.6549C73.7988 87.2677 74.2787 87.8703 74.7715 88.4622L74.6867 88.8473C74.0051 88.9867 73.6581 88.7966 73.0238 88.5468L72.7847 88.4515L72.4491 88.7426C72.542 89.5832 73.4857 89.7411 73.7169 90.7764C72.2775 91.3326 69.5331 90.2465 68.4433 90.7595C68.4922 91.2235 68.5368 91.6876 68.5765 92.1524C67.3621 92.6955 65.7024 90.9534 64.433 91.5708C64.755 92.4258 67.6065 95.0539 68.4344 95.8666C65.7271 95.9393 63.3765 95.9952 60.6568 95.8709C60.0792 95.4557 57.9764 93.3824 57.6066 93.2866C48.5378 91.0022 29.9836 89.9581 23.5125 83.1553C19.2222 78.645 46.9651 58.072 50.4899 55.5629C56.7115 51.1342 62.1014 46.8287 68.5612 42.9368C98.1068 25.1363 132.707 23.0555 165.858 30.8516C170.526 28.4523 175.105 25.256 179.877 23.102C188.139 19.3723 197.025 16.5607 206.045 15.6867Z" fill="black"/>
</svg>
```

## Source

- [Product Design Guideline](https://sctory.atlassian.net/wiki/spaces/SCT/pages/98357/Product+Design+Guideline)
