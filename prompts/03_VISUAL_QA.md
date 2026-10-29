# Prompt 3: Visual and Interaction QA for the Current Screen

Perform a focused visual and functional quality review of the currently implemented and approved screen.

Do not start a redesign from scratch. Do not expand the scope or begin implementing additional screens.

Read the relevant project instructions, active specification, approved discovery report, decisions, screen inventory, and QA checklist before making changes.

## 1. Scope

Review only the screen implemented in the current iteration.

For the first QA iteration, this is the Orders Dashboard and its implemented interactions.

Do not test features belonging to screens that have not been implemented yet.

## 2. Capture the Implementation

1. Run the existing application using the documented development command.
2. Open the current screen in a browser at the agreed mobile viewport of `390 x 844 CSS pixels`.
3. Capture a fresh screenshot of the rendered application.
4. Do not include a decorative phone frame in the application screenshot.
5. Use the original reference image from `design/reference-screens/` as the visual baseline.
6. Keep the viewport dimensions consistent when capturing screenshots for comparison.

If a relevant state has already been implemented, capture it as well when needed to evaluate the design or interaction.

## 3. Visual Comparison

Compare the current implementation with its corresponding original reference image.

Inspect:

- Overall layout and visual hierarchy.
- Component positions and dimensions.
- Spacing, padding, and alignment.
- Typography, font weight, and text density.
- Colors, borders, shadows, and corner radii.
- Icons and their size and alignment.
- Card composition and information hierarchy.
- Button dimensions, placement, and styling.
- Bottom navigation placement and appearance.
- Arabic text direction, wrapping, and readability.
- Scrolling behavior, clipping, and horizontal overflow.

Distinguish genuine visual mismatches from intentional differences required by the active specification.

The reference image governs visual appearance. The active specification governs functionality and behavior.

Do not remove required functionality simply to imitate a visual detail that conflicts with the specification.

## 4. Report Differences Before Fixing Them

Prepare a concise list of concrete visual differences.

For each difference, record:

- The affected component.
- What appears in the reference.
- What appears in the implementation.
- Why the difference matters.
- The recommended correction.
- Its priority: High, Medium, or Low.

Prioritize geometry, layout, component dimensions, spacing, typography, and prominent colors before minor decorative differences.

Do not invent measurements that cannot be reliably determined from the screenshots.

## 5. Correct and Recheck

After identifying the differences:

1. Fix the highest-impact issues first.
2. Preserve the approved architecture and current scope.
3. Avoid unnecessary dependencies and unrelated refactoring.
4. Capture a new screenshot at the same viewport dimensions.
5. Compare the updated screenshot against the original reference again.
6. Repeat as necessary until the major visual mismatches are resolved.

Do not claim pixel-perfect accuracy unless it has been adequately verified.

## 6. Functional Checks for the Current Screen

Test only interactions implemented within the current scope.

For the Orders Dashboard, verify applicable items such as:

- Selecting each order-status tab.
- Correctly displaying the relevant orders and dynamic counts.
- Opening order details if implemented in this iteration.
- Triggering a primary order action without accidentally triggering the card click.
- Updating order status and counts consistently.
- Enforcing payment and order-state rules.
- Displaying appropriate empty states and Arabic feedback.
- Handling long content and narrow mobile widths without overflow.

Do not test menu editing, availability switches, simulated-order generation, sound settings, or reset functionality unless the corresponding features have already been implemented.

Do not add missing features during QA. Record out-of-scope functionality as pending rather than implementing it without approval.

## 7. Validation

- Check browser console errors.
- Check for broken interactions and layout overflow.
- Run available build, type-check, lint, and test commands relevant to the current implementation.
- Fix errors introduced by the current scope.
- Update `docs/QA_CHECKLIST.md` to reflect checks actually performed.
- Do not mark untested requirements as passed.

## 8. Final Report

Provide:

1. The screen reviewed.
2. The screenshot location.
3. The main visual differences found.
4. The fixes applied.
5. The result of the final screenshot comparison.
6. Functional checks performed and their outcomes.
7. Build or validation results.
8. Remaining known differences and pending work.

Do not proceed to another screen after QA.

Stop and wait for review and approval before the next implementation iteration.
