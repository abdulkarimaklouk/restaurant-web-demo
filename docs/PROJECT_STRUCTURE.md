# Recommended Project Structure

This is the recommended structure for the current mobile-only website demo. Keep the source tree small and feature-oriented. Create files as they become necessary; do not create layers that contain no behavior.

```text
project-root/
  AGENTS.md
  README.md
  .gitignore
  index.html
  package.json
  vite.config.ts
  tsconfig.json
  docs/
    WEB_DEMO_SPEC.md
    PROJECT_STRUCTURE.md
    SCREEN_INVENTORY.md
    DECISIONS.md
    QA_CHECKLIST.md
    archive/
      original_flutter_requirements.md   # optional archival copy only
  design/
    reference-screens/
      README.md
      01-orders.png                      # example naming only
      02-order-details.png
      03-menu.png
      04-item-form.png
      05-demo-tools.png
    notes/
      visual-differences.md               # create during visual iteration
  public/
    assets/
      images/                             # only actual assets used by the UI
      fonts/                              # optional local font files
  src/
    app/
      App.tsx
      navigation.tsx
    components/
      layout/
        MobileAppShell.tsx
        BottomNavigation.tsx
      ui/
        StatusBadge.tsx
        DemoNotice.tsx
        EmptyState.tsx
        ConfirmDialog.tsx
        Toast.tsx
    features/
      orders/
        OrdersPage.tsx
        OrderDetailsPage.tsx
        orderTransitions.ts
        components/
      menu/
        MenuPage.tsx
        MenuItemForm.tsx
        components/
      demo-tools/
        DemoToolsPage.tsx
    data/
      seedOrders.ts
      seedMenu.ts
      mockRepositories.ts
    types/
      order.ts
      menu.ts
    styles/
      tokens.css
      global.css
    utils/
      formatCurrency.ts
      formatRelativeTime.ts
      calculateCoins.ts
    main.tsx
```

## Why These Folders Exist

- `AGENTS.md`: persistent rules read by Antigravity in the project context.
- `docs/WEB_DEMO_SPEC.md`: active requirements for the website milestone.
- `design/reference-screens/`: original UI/UX images. Keep these separate from production assets.
- `public/assets/`: images or fonts that the implementation actually uses.
- `features/`: screen-specific components and interactions, grouped by domain feature.
- `components/ui/`: shared, visually consistent primitives.
- `data/`: mock seed data and in-memory repositories.
- `types/`: shared TypeScript domain types.
- `styles/`: design tokens and global RTL/mobile viewport rules.
- `utils/`: small pure formatting and calculation helpers.

## Avoid

- A single enormous `App.tsx` containing every screen and interaction.
- A separate folder for every tiny component before it is needed.
- Redux, a backend, database clients, authentication libraries, API clients, or large UI frameworks for this demo.
- Storing raw reference screenshots under `public/assets/` as if they were live app assets.
