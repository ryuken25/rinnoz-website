# Mobile & Story Audit — BEFORE (2026-07-10)

## Evidence setup
- Target: live production `https://rinnoz.vercel.app`
- Browser: Playwright Chromium headless — launch confirmed before capture.
- Widths: 320, 360, 390, 430, 768, 1024, 1280, 1440, 1920.
- Core sections: home, pricing, artworks/story, FAQ, order.
- Screenshots: `qa/audit-before/rinnoz-{section}-{width}.png`.
- Story state screenshots: `qa/audit-before/rinnoz-story-{start|middle|end}-{width}.png` at 320/390/768.

## Defects
1. **Horizontal body overflow — reproducible on phones.**
   - 320px: `documentElement=320`, `body=345` (+25px)
   - 360px: `documentElement=360`, `body=385` (+25px)
   - 390px: `documentElement=390`, `body=415` (+25px)
   - 430px: `documentElement=430`, `body=453` (+23px)
   - Reproduced across home, pricing, story, FAQ, and order screenshots.
   - Evidence: `rinnoz-home-320.png`, `rinnoz-pricing-390.png`, `rinnoz-artworks-430.png`.
   - Likely scope: a width/overflow rule in global shell rather than a single section; inspect wide-element scan during fix.

2. **Horizontal body overflow also appears at desktop intermediate widths.**
   - 1024px: `body=1048` (+24px); 1280px: `body=1298` (+18px).
   - 768/1440/1920 passed. This indicates breakpoint-specific width/scrollbar layout behavior.
   - Evidence: `rinnoz-home-1024.png`, `rinnoz-artworks-1280.png`.

3. **Mobile story is a stacked-card fallback, not the required swipeable/snap single-card experience.**
   - Current source renders all five chapters as a vertical list below `lg`; it preserves content but has no 01/05 persistent progress counter, no snap scrolling, and no explicit previous/next tap zones.
   - Evidence: `rinnoz-story-start-320.png`, `rinnoz-story-middle-390.png`, `rinnoz-story-end-768.png`; source `src/components/ArtworkStory.tsx` lines 306–357.

4. **Story image delivery needs a responsive validation pass.**
   - Source uses Next/Image (contrary to prior snapshot) and has `sizes` on the active image, but the decorative background image has no explicit sizes and all stacked mobile cards mount at once.
   - Scope: change mobile story to current/adjacent lazy-loaded slide model and verify requested image widths after fix.

## Non-defects observed
- No production console errors were captured in this matrix.
- Desktop GSAP pin is source-gated at `min-width:1024px`; it is not currently used on mobile.
