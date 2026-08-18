# AGENTS.md

## Project overview

This repository contains the implementation of **Tâm.**, a personal portfolio project internally named **Prism Within**.

The portfolio should communicate these qualities:

- Sincere and human
- Friendly and approachable
- Energetic and expressive
- Colorful without becoming visually chaotic
- Introspective, nuanced, and emotionally layered
- Clear and professional in its presentation

The visual personality should feel warm on the surface and reveal more depth through typography, color, composition, and small interactions.

## Repository technology

The current implementation is a TypeScript web application built with:

- React 19
- TanStack Start and TanStack Router with file-based routes
- TanStack Query
- Vite
- Tailwind CSS 4
- Cloudflare Workers for deployment
- npm, using the committed `package-lock.json`
- ESLint and Prettier for code quality and formatting

The application entry points and routing live under `src/`. Global design tokens and styles currently live in `src/styles.css`. Shared components, content modules, and additional routes should follow the existing TypeScript and TanStack conventions rather than introducing a new framework or build system.

## Sources of truth

Before making visual or UI decisions, read:

1. `public/docs/porfolio-design-system.md`
2. `.agents/figma-context.md`
3. The existing project structure and implementation

Use the sources in this order when resolving conflicts:

1. Explicit requirements in the current task
2. The approved Figma designs
3. `public/docs/porfolio-design-system.md`
4. Existing implementation patterns

Do not invent a separate visual language when the design system or Figma already defines the required behavior.

## Content authority and Figma scope

The approved Figma file is a source of truth for **layout and visual style only**. It is not a source of portfolio content.

- Do not copy or publish biography, experience, company, education, project, case-study, metric, date, contact, location, social-link, or technology-stack content from Figma.
- Treat every piece of text in Figma as layout-only sample copy, even when it appears realistic or complete.
- Do not infer or invent personal facts, achievements, responsibilities, outcomes, or project details.
- Use content only when it is supplied by Tâm or comes from another explicitly identified content source.
- If a task requires unavailable content, keep the presentation ready for content injection and clearly identify what information is missing. Use temporary structural placeholders only when the current task explicitly permits them.
- Keep approved content separate from presentation through typed content modules, translation dictionaries, or an equivalent content layer.
- English and Vietnamese versions must derive from approved content; do not translate unverified Figma copy.

## Figma workflow

The approved design source is the **Noukardia** Figma file documented in `.agents/figma-context.md`.

For tasks involving an existing screen or component:

1. Read the relevant Figma node using the connected Figma tools.
2. Inspect both its design context and screenshot.
3. Identify reusable components, variables, spacing, and typography.
4. Ignore the node’s sample copy and content details.
5. Implement the layout and style using the project’s existing architecture.
6. Compare the result with the Figma reference at the target viewport.
7. Verify both Light and Dark modes.

Do not recreate the interface from memory or rely only on screenshots when structured Figma information is available.

Do not modify the Figma source unless the task explicitly requests a design change.

## Planned portfolio structure

The approved layout includes:

- Header and navigation
- Hero
- About
- Experience
- Case Studies
- Tech Stack
- Contact
- Full Case Study article page

The site must support:

- Light and Dark themes
- English and Vietnamese content
- Responsive layouts
- Keyboard navigation
- Reduced-motion preferences
- Accessible color contrast and focus states

## Case studies

Case-study summaries may contain:

- Problem
- Responsibility
- Technical Challenge
- Solution
- Impact

Summary cards should remain concise. Full explanations belong on the individual case-study page.

The listed fields describe the intended information structure only. Their values must come from approved content, never from the Figma sample copy. Keep content separate from presentation so personal information and translations can be updated without rebuilding the UI.

## Design implementation rules

- Use semantic design tokens instead of raw color values.
- Preserve the Light and Dark theme mappings defined by the design system.
- Use **Fraunces** for expressive display typography.
- Use **Be Vietnam Pro** for body text, labels, navigation, and UI controls.
- Preserve the spacing rhythm, radii, borders, and shadow behavior from the design system.
- Reuse shared components instead of duplicating markup and styling.
- Prefer content-driven height over fixed-height content sections.
- Avoid unnecessary gradients, glass effects, excessive animation, or generic portfolio aesthetics.
- Decorative colors may be expressive, but functional colors must remain accessible.
- Theme and language toggles must have clear labels and accessible names.
- Do not use flags to represent languages.

## Responsive behavior

Desktop Figma screens are the approved visual reference, but the implementation must adapt deliberately to smaller screens.

For responsive layouts:

- Preserve information hierarchy before preserving exact geometry.
- Collapse multi-column layouts into a clear single-column reading flow.
- Keep touch targets at least 44×44 CSS pixels where practical.
- Avoid horizontal scrolling.
- Keep body copy readable without requiring zoom.
- Ensure long English and Vietnamese strings can wrap safely.
- Keep case-study navigation understandable without relying on a sticky sidebar.

When mobile behavior is not defined in Figma, derive it from the design system and document any significant design decisions.

## Accessibility

Meet WCAG 2.2 AA where applicable.

At minimum:

- Use semantic HTML landmarks and headings.
- Provide visible keyboard focus.
- Ensure interactive elements are keyboard accessible.
- Respect `prefers-reduced-motion`.
- Do not communicate meaning using color alone.
- Provide useful alternative text for meaningful images.
- Hide purely decorative visuals from assistive technology.
- Maintain sufficient text and control contrast in both themes.
- Avoid invalid heading-level jumps.
- Associate form fields with visible labels.

## Motion

Motion should feel warm and energetic, but restrained.

- Prefer subtle reveal, hover, and transition effects.
- Use motion to clarify hierarchy or state changes.
- Avoid constant decorative movement.
- Keep transitions short and responsive.
- Provide a reduced-motion version.
- Never delay access to content for an animation.

## Engineering conventions

Before editing:

- Inspect the repository structure and existing conventions.
- Read `package.json` and the active lockfile.
- Use the package manager selected by the existing lockfile.
- Reuse existing utilities and components before adding dependencies.
- Do not replace the current framework, styling approach, or build system without explicit approval.

Keep components focused and use clear semantic names. Avoid premature abstraction, but extract patterns that appear repeatedly across the portfolio.

Do not commit secrets, API keys, access tokens, personal credentials, or Figma credentials.

## Validation

After making changes, run the relevant scripts defined in `package.json`, including when available:

- Type checking
- Linting
- Unit or component tests
- Production build

For visual work, also verify:

- Desktop and mobile layouts
- Light and Dark modes
- English and Vietnamese content
- Keyboard navigation
- Focus states
- Text wrapping
- Overflow and clipping
- Reduced-motion behavior
- Browser console errors

If a check cannot be run, state exactly which check was skipped and why.

## Definition of done

A task is complete only when:

- The requested behavior is implemented.
- The result follows the design system and relevant Figma nodes.
- Both themes continue to work.
- Responsive behavior has been considered.
- Accessibility is not knowingly regressed.
- Relevant validation passes.
- No unrelated files are changed.
- Remaining assumptions or intentional deviations are documented in the handoff.
-

<!-- intent-skills:start -->

## TanStack Intent - before editing files, run the matching guidance command.

tanstackIntent:

- id: "@tanstack/devtools#devtools-app-setup"
  run: "npx @tanstack/intent@latest load @tanstack/devtools#devtools-app-setup"
  for: "Install TanStack Devtools, pick framework adapter (React/Vue/Solid/Preact), register plugins via plugins prop, configure shell (position, hotkeys, theme, hideUntilHover, requireUrlFlag, eventBusConfig). TanStackDevtools component, defaultOpen, localStorage persistence."
- id: "@tanstack/devtools#devtools-marketplace"
  run: "npx @tanstack/intent@latest load @tanstack/devtools#devtools-marketplace"
  for: "Publish plugin to npm and submit to TanStack Devtools Marketplace. PluginMetadata registry format, plugin-registry.ts, pluginImport (importName, type), requires (packageName, minVersion), framework tagging, multi-framework submissions, featured plugins."
- id: "@tanstack/devtools#devtools-plugin-panel"
  run: "npx @tanstack/intent@latest load @tanstack/devtools#devtools-plugin-panel"
  for: "Build devtools panel components that display emitted event data. Listen via EventClient.on(), handle theme (light/dark), use @tanstack/devtools-ui components. Plugin registration (name, render, id, defaultOpen), lifecycle (mount, activate, destroy), max 3 active plugins. Two paths: Solid.js core with devtools-ui for multi-framework support, or framework-specific panels."
- id: "@tanstack/devtools#devtools-production"
  run: "npx @tanstack/intent@latest load @tanstack/devtools#devtools-production"
  for: "Handle devtools in production vs development. removeDevtoolsOnBuild, devDependency vs regular dependency, conditional imports, NoOp plugin variants for tree-shaking, non-Vite production exclusion patterns."
- id: "@tanstack/devtools-event-client#devtools-bidirectional"
  run: "npx @tanstack/intent@latest load @tanstack/devtools-event-client#devtools-bidirectional"
  for: "Two-way event patterns between devtools panel and application. App-to-devtools observation, devtools-to-app commands, time-travel debugging with snapshots and revert. structuredClone for snapshot safety, distinct event suffixes for observation vs commands, serializable payloads only."
- id: "@tanstack/devtools-event-client#devtools-event-client"
  run: "npx @tanstack/intent@latest load @tanstack/devtools-event-client#devtools-event-client"
  for: "Create typed EventClient for a library. Define event maps with typed payloads, pluginId auto-prepend namespacing, emit()/on()/onAll()/onAllPluginEvents() API. Connection lifecycle (5 retries, 300ms), event queuing, enabled/disabled state, SSR fallbacks, singleton pattern. Unique pluginId requirement to avoid event collisions."
- id: "@tanstack/devtools-event-client#devtools-instrumentation"
  run: "npx @tanstack/intent@latest load @tanstack/devtools-event-client#devtools-instrumentation"
  for: "Analyze library codebase for critical architecture and debugging points, add strategic event emissions. Identify middleware boundaries, state transitions, lifecycle hooks. Consolidate events (1 not 15), debounce high-frequency updates, DRY shared payload fields, guard emit() for production. Transparent server/client event bridging."
- id: "@tanstack/devtools-vite#devtools-vite-plugin"
  run: "npx @tanstack/intent@latest load @tanstack/devtools-vite#devtools-vite-plugin"
  for: "Configure @tanstack/devtools-vite for source inspection (data-tsd-source, inspectHotkey, ignore patterns), console piping (client-to-server, server-to-client, levels), enhanced logging, server event bus (port, host, HTTPS), production stripping (removeDevtoolsOnBuild), editor integration (launch-editor, custom editor.open). Must be FIRST plugin in Vite config. Vite ^6 || ^7 only."
- id: "@tanstack/react-start#lifecycle/migrate-from-nextjs"
  run: "npx @tanstack/intent@latest load @tanstack/react-start#lifecycle/migrate-from-nextjs"
  for: "Step-by-step migration from Next.js App Router to TanStack Start: route definition conversion, API mapping, server function conversion from Server Actions, middleware conversion, data fetching pattern changes."
- id: "@tanstack/react-start#react-start"
  run: "npx @tanstack/intent@latest load @tanstack/react-start#react-start"
  for: "React bindings for TanStack Start: createStart, StartClient, StartServer, React-specific imports, re-exports from @tanstack/react-router, full project setup with React, useServerFn hook."
- id: "@tanstack/react-start#react-start/server-components"
  run: "npx @tanstack/intent@latest load @tanstack/react-start#react-start/server-components"
  for: "Implement, review, debug, and refactor TanStack Start React Server Components in React 19 apps. Use when tasks mention @tanstack/react-start/rsc, renderServerComponent, createCompositeComponent, CompositeComponent, renderToReadableStream, createFromReadableStream, createFromFetch, Composite Components, React Flight streams, loader or query owned RSC caching, router.invalidate, structuralSharing: false, selective SSR, stale names like renderRsc or .validator, or migration from Next App Router RSC patterns. Do not use for generic SSR or non-TanStack RSC frameworks except brief comparison."
- id: "@tanstack/router-core#router-core"
  run: "npx @tanstack/intent@latest load @tanstack/router-core#router-core"
  for: "Framework-agnostic core concepts for TanStack Router: route trees, createRouter, createRoute, createRootRoute, createRootRouteWithContext, addChildren, Register type declaration, route matching, route sorting, file naming conventions. Entry point for all router skills."
- id: "@tanstack/router-core#router-core/auth-and-guards"
  run: "npx @tanstack/intent@latest load @tanstack/router-core#router-core/auth-and-guards"
  for: "Route protection with beforeLoad, redirect()/throw redirect(), isRedirect helper, authenticated layout routes (_authenticated), non-redirect auth (inline login), RBAC with roles and permissions, auth provider integration (Auth0, Clerk, Supabase), router context for auth state."
- id: "@tanstack/router-core#router-core/code-splitting"
  run: "npx @tanstack/intent@latest load @tanstack/router-core#router-core/code-splitting"
  for: "Automatic code splitting (autoCodeSplitting), .lazy.tsx convention, createLazyFileRoute, createLazyRoute, lazyRouteComponent, getRouteApi for typed hooks in split files, codeSplitGroupings per-route override, splitBehavior programmatic config, critical vs non-critical properties."
- id: "@tanstack/router-core#router-core/data-loading"
  run: "npx @tanstack/intent@latest load @tanstack/router-core#router-core/data-loading"
  for: "Route loader option, loaderDeps for cache keys, staleTime/gcTime/ defaultPreloadStaleTime SWR caching, pendingComponent/pendingMs/ pendingMinMs, errorComponent/onError/onCatch, beforeLoad, router context and createRootRouteWithContext DI pattern, router.invalidate, Await component, deferred data loading with unawaited promises."
- id: "@tanstack/router-core#router-core/navigation"
  run: "npx @tanstack/intent@latest load @tanstack/router-core#router-core/navigation"
  for: "Link component, useNavigate, Navigate component, router.navigate, ToOptions/NavigateOptions/LinkOptions, from/to relative navigation, activeOptions/activeProps, preloading (intent/viewport/render), preloadDelay, navigation blocking (useBlocker, Block), createLink, linkOptions helper, scroll restoration, MatchRoute."
- id: "@tanstack/router-core#router-core/not-found-and-errors"
  run: "npx @tanstack/intent@latest load @tanstack/router-core#router-core/not-found-and-errors"
  for: "notFound() function, notFoundComponent, defaultNotFoundComponent, notFoundMode (fuzzy/root), errorComponent, CatchBoundary, CatchNotFound, isNotFound, NotFoundRoute (deprecated), route masking (mask option, createRouteMask, unmaskOnReload)."
- id: "@tanstack/router-core#router-core/path-params"
  run: "npx @tanstack/intent@latest load @tanstack/router-core#router-core/path-params"
  for: "Dynamic path segments ($paramName), splat routes ($ / _splat), optional params ({-$paramName}), prefix/suffix patterns ({$param}.ext), useParams, params.parse/stringify, pathParamsAllowedCharacters, i18n locale patterns."
- id: "@tanstack/router-core#router-core/search-params"
  run: "npx @tanstack/intent@latest load @tanstack/router-core#router-core/search-params"
  for: "validateSearch, search param validation with Zod/Valibot/ArkType adapters, fallback(), search middlewares (retainSearchParams, stripSearchParams), custom serialization (parseSearch, stringifySearch), search param inheritance, loaderDeps for cache keys, reading and writing search params."
- id: "@tanstack/router-core#router-core/ssr"
  run: "npx @tanstack/intent@latest load @tanstack/router-core#router-core/ssr"
  for: "Non-streaming and streaming SSR, RouterClient/RouterServer, renderRouterToString/renderRouterToStream, createRequestHandler, defaultRenderHandler/defaultStreamHandler, HeadContent/Scripts components, head route option (meta/links/styles/scripts), ScriptOnce, automatic loader dehydration/hydration, memory history on server, data serialization, document head management."
- id: "@tanstack/router-core#router-core/type-safety"
  run: "npx @tanstack/intent@latest load @tanstack/router-core#router-core/type-safety"
  for: "Full type inference philosophy (never cast, never annotate inferred values), Register module declaration, from narrowing on hooks and Link, strict:false for shared components, getRouteApi for code-split typed access, addChildren with object syntax for TS perf, LinkProps and ValidateLinkOptions type utilities, as const satisfies pattern."
- id: "@tanstack/router-plugin#router-plugin"
  run: "npx @tanstack/intent@latest load @tanstack/router-plugin#router-plugin"
  for: "TanStack Router bundler plugin for route generation and automatic code splitting. Supports Vite, Webpack, Rspack, and esbuild. Configures autoCodeSplitting, routesDirectory, target framework, and code split groupings."
- id: "@tanstack/start-client-core#start-core"
  run: "npx @tanstack/intent@latest load @tanstack/start-client-core#start-core"
  for: "Core overview for TanStack Start: tanstackStart() Vite plugin, getRouter() factory, root route document shell (HeadContent, Scripts, Outlet), client/server entry points, routeTree.gen.ts, tsconfig configuration. Entry point for all Start skills."
- id: "@tanstack/start-client-core#start-core/auth-server-primitives"
  run: "npx @tanstack/intent@latest load @tanstack/start-client-core#start-core/auth-server-primitives"
  for: "Server-side authentication primitives for TanStack Start: session cookies (HttpOnly, Secure, SameSite, __Host- prefix), session read/issue/destroy via createServerFn and middleware, OAuth authorization-code flow with state and PKCE, password-reset enumeration defense, CSRF for non-GET RPCs, rate limiting auth endpoints, session rotation on privilege change. Pairs with router-core/auth-and-guards for the routing side."
- id: "@tanstack/start-client-core#start-core/deployment"
  run: "npx @tanstack/intent@latest load @tanstack/start-client-core#start-core/deployment"
  for: "Deploy to Cloudflare Workers, Netlify, Vercel, Node.js/Docker, Bun, Railway. Selective SSR (ssr option per route), SPA mode, static prerendering, ISR with Cache-Control headers, SEO and head management."
- id: "@tanstack/start-client-core#start-core/execution-model"
  run: "npx @tanstack/intent@latest load @tanstack/start-client-core#start-core/execution-model"
  for: "Isomorphic-by-default principle, environment boundary functions (createServerFn, createServerOnlyFn, createClientOnlyFn, createIsomorphicFn), ClientOnly component, useHydrated hook, import protection, dead code elimination, environment variable safety (VITE_ prefix, process.env)."
- id: "@tanstack/start-client-core#start-core/middleware"
  run: "npx @tanstack/intent@latest load @tanstack/start-client-core#start-core/middleware"
  for: "createMiddleware, request middleware (.server only), server function middleware (.client + .server), context passing via next({ context }), sendContext for client-server transfer, global middleware via createStart in src/start.ts, middleware factories, method order enforcement, fetch override precedence."
- id: "@tanstack/start-client-core#start-core/server-functions"
  run: "npx @tanstack/intent@latest load @tanstack/start-client-core#start-core/server-functions"
  for: "createServerFn (GET/POST), validator (Zod or function), useServerFn hook, server context utilities (getRequest, getRequestHeader, setResponseHeader, setResponseStatus), error handling (throw errors, redirect, notFound), streaming, FormData handling, file organization (.functions.ts, .server.ts)."
- id: "@tanstack/start-client-core#start-core/server-routes"
  run: "npx @tanstack/intent@latest load @tanstack/start-client-core#start-core/server-routes"
  for: "Server-side API endpoints using the server property on createFileRoute, HTTP method handlers (GET, POST, PUT, DELETE), createHandlers for per-handler middleware, handler context (request, params, context), request body parsing, response helpers, file naming for API routes."
- id: "@tanstack/start-server-core#start-server-core"
  run: "npx @tanstack/intent@latest load @tanstack/start-server-core#start-server-core"
  for: "Server-side runtime for TanStack Start: createStartHandler, request/response utilities (getRequest, setResponseHeader, setCookie, getCookie, useSession), three-phase request handling, AsyncLocalStorage context."
- id: "@tanstack/virtual-file-routes#virtual-file-routes"
  run: "npx @tanstack/intent@latest load @tanstack/virtual-file-routes#virtual-file-routes"
  for: "Programmatic route tree building as an alternative to filesystem conventions: rootRoute, index, route, layout, physical, defineVirtualSubtreeConfig. Use with TanStack Router plugin's virtualRouteConfig option."

<!-- intent-skills:end -->
