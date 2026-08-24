# Design — Where SC-er

## Genre

Playful product workspace: warm, energetic, and practical for SC-ers sharing
where they have checked in.

## Macrostructure family

- Entry route: invitation flow with one focused action at a time.
- App route: Workbench — account context, map as the primary canvas, and a
  community feed as the supporting workspace.

## Theme and typography

- Keep the SClub yellow, blue, and red semantic palette defined in
  `public/docs/design-system.md`.
- Display and body: Be Vietnam Pro. Mono metadata: JetBrains Mono.
- Use named tokens only; colour is functional before decorative.

## Layout and motion

- Four-point spacing scale; cards use a 12px radius and borders before shadows.
- Desktop dashboard: map and community feed sit side-by-side. Mobile: map,
  then feed, then supporting actions.
- Motion is limited to 200ms surface/transform feedback and honours reduced
  motion. Focus rings are always visible for keyboard navigation.

## Shared component voice

- Primary actions use yellow fill with dark text; secondary actions use soft
  blue surfaces; destructive/error states use red with supporting copy.
- Community rows show a nickname, a clear "Bạn" marker for the current user,
  and grouped selection chips. No fabricated metrics or decorative chrome.
