# Design — Where SC-er?

## Genre

Hum: a playful, alive community map for SC-ers. It is warm and bright, never
childish or visually noisy.

## Macrostructure family

- Entry route: off-centre invitation split with a small reacting map mark.
- App route: Map / Diagram — the live map is the main composition; profile
  nodes, community activity, and a future-news sign-up orbit it.

## Theme and typography

- Cream paper, pear primary actions, cyan community surfaces, and coral only
  for emphatic success and the wishlist invitation.
- Display/body: Plus Jakarta Sans. Metadata: JetBrains Mono.
- Use semantic named tokens only; no decorative gradients.

## Layout and motion

- Four-point spacing scale; 20px cards, 12px inputs, fully pill-shaped actions.
- Desktop: map canvas and community stream share one spatial composition.
  Mobile: profile, map, stream, then wishlist in reading order.
- Buttons lift then physically press down. Cards tint and lift on hover.
  Reduced motion removes transforms, counter animation, and celebration.

## Shared component voice

- Primary actions have a pear face and solid lower edge; secondary actions are
  cyan-soft; destructive/error states are coral.
- One CSS character mark appears only at entry and reacts on successful action.
- Community rows retain nickname, “Bạn”, and grouped check-in selections.
