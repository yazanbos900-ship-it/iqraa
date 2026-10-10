# Aali Education — Interface System

This file is the shared visual reference for the public marketplace, account flows, and student, provider, and admin portals. Product behavior and Firebase access rules remain defined in the application code.

## Product direction

- Use a calm, professional education marketplace style with clear hierarchy and generous spacing.
- Keep the public pages light. Use a deep navy sidebar for authenticated portals and a light neutral canvas for their content.
- Use indigo as the single primary action color. Reserve green, amber, and red for success, caution, and errors.
- Prefer plain surfaces, subtle borders, and soft shadows. Avoid clay effects, oversized decoration, competing banners, and repeated calls to action.
- Arabic is the primary interface language. Keep Arabic labels readable and short; technical implementation details belong in admin tools, not student-facing copy.

## Tokens

| Role | Value | CSS source |
|---|---|---|
| Page background | `#f6f8fb` | `--aali-bg` |
| Surface | `#ffffff` | `--aali-surface` |
| Main text | `#17253a` | `--aali-text` |
| Muted text | `#65748b` | `--aali-muted` |
| Border | `#e2e8f0` | `--aali-border` |
| Primary | `#4f5bd5` | `--aali-primary` |
| Strong primary | `#414ab4` | `--aali-primary-strong` |
| Portal sidebar | `#17243a` | `.aali-sidebar` |

Use IBM Plex Sans Arabic for Arabic text with Plus Jakarta Sans as the Latin fallback. Keep body copy at 14–16px or larger where space allows. Labels and secondary metadata should remain comfortably readable; avoid relying on 10px text for important information.

## Layout and components

- Public pages share one compact navbar, one main content column, and a useful footer. Do not expose the admin portal as a public destination.
- Keep the primary public action obvious: search the directory, inspect a service, then send a registration request.
- Auth screens use a focused form with concise context and preserve the existing login, registration, Google sign-in, and recovery flows.
- Student, provider, and admin portals share the dark sidebar, clear active state, responsive mobile navigation, and a light content area.
- Use shared `Button`, `Card`, `Input`, `Select`, `Badge`, `Alert`, `Modal`, `Table`, and `EmptyState` components. Extend them rather than creating near-duplicate patterns.
- Use 44px minimum control heights, visible keyboard focus, semantic labels, and clear loading, empty, error, and success states.
- Use a single-column layout on narrow screens. At medium widths, avoid four-column metric grids; use two columns until there is enough room.
- Avoid horizontal page scrolling. Wide data tables may scroll within their own bordered container.

## Interaction and accessibility

- Use short transitions and respect `prefers-reduced-motion`.
- Do not make a hero carousel autoplay by default. Give controls an accessible name and preserve pause/play behavior.
- Keep navigation destinations role-aware. Do not expose privileged actions to anonymous users.
- Keep notices concise and explain the next useful action in plain language.
- Use Lucide icons consistently; never substitute emoji for controls or status icons.
