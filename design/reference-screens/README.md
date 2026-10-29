# Reference Images

Place the original UI/UX reference images in this folder. Keep the originals unchanged and do not overwrite them with generated screenshots.

## Recommended Handling

- Use clear, stable filenames in English, such as `01-orders-overview.png`, `02-order-details.png`, `03-menu-management.png`, `04-item-form.png`, and `05-demo-tools.png`.
- If two images show different states of the same screen, give each a separate filename.
- Prefer PNG for UI screenshots and retain the original resolution.
- Do not combine several screens into one collage unless the supplied source is already a collage and cannot be separated.
- Keep reference screenshots here, not in `public/assets/images/`. The implementation should recreate the interface using HTML and CSS rather than display the screenshot as a page background.
- Place actual reusable logos, icons, and product images under `public/assets/images/` only after identifying them as genuine UI assets.
- After copying the files, update `docs/SCREEN_INVENTORY.md` and mention the exact filenames in the first Antigravity prompt.
