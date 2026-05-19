# Mobile UI & UX Guidelines for PWA Document Reader

These guidelines define the implementation and best practices used for building an efficient, mobile-optimized document reader inside the PWA, specifically targeting low-end mobile devices (e.g., ~4GB RAM on Snapdragon, Itel, or Tecno chips).

## 1. Scrolling & Navigation
**Implementation**: Vertical Scrolling
- We use **vertical scrolling** (`overflow-y-auto`) scoped to the main `article` container.
- Horizontal swiping requires complex pagination logic (re-measuring DOM per page) which is CPU-heavy and drains battery. Standard vertical web scrolling relies on native compositor threads and utilizes GPU acceleration automatically.
- **Best Practice**: The header and the bottom floating controls are marked as `fixed` or `sticky`, allowing the reading container to scroll independently. This prevents layout reflows and jerky interface shifts.

## 2. Summaries & Navigation Menus
**Implementation**: Interactive Bottom Sheet
- Instead of a traditional side-drawer that compresses readability, we utilize a **draggable bottom sheet**.
- Using `framer-motion`, the summary menu is launched from the bottom and can be seamlessly dragged down (`drag="y"` constraints to only allow downward closure).
- **UX Improvement**: The bottom sheet covers `60vh` (slightly over half the screen), so context of the text is not entirely lost but provides enough room to review the AI summary or list of highlights.

## 3. Highlighting
**Implementation**: Interleaved `<mark>` mapping
- A floating `Highlight` action button triggers the native browser selection API (`window.getSelection()`).
- On text changes, our custom `renderParagraph` algorithm parses the plain text and strategically splices `<mark>` nodes where active highlights exist. This approach works without relying on heavy external libraries like DOM Purify or Rangy.
- **Toggle UX**: The highlighted text blocks are directly clickable. Tapping an existing highlight passes an `onClick` event with `e.stopPropagation()` which executes `removeHighlight(id)`. 

## 4. Zooming & Typography
**Implementation**: Dynamic Context Sizing + Pinch handlers
- We avoid `transform: scale()` which introduces blurry artifacts in mobile browser engines. Instead, we directly manipulate the inline `fontSize` style on the root `<article>` parameter.
- **Gestures**: We implemented a `touchstart / touchmove / touchend` loop attached to the reader's `contentRef` node. By mathematically projecting `Math.hypot` on two active touches, we establish a fluid "Pinch-To-Zoom" metric that increments or decrements the font scaling smoothly.
- **Overlay Buttons**: Floating transparent overlay buttons (`+` and `-`) are pinned to the `bottom-right` corner above the text. This allows for one-handed operation on low-end devices where multi-touch may lag.

## 5. Mobile Optimization (Low-End Devices)
**Implementation**: Strict offline caching & Memory usage
- **PWA Service Worker**: We bypass loading the network repeatedly by employing `vite-plugin-pwa` with a wide `maximumFileSizeToCacheInBytes`.
- **Memory Optimization**: Splitting textbooks directly into structural memory strings (1 level deep) rather than complicated DOM tree models prevents garbage collection spikes. Memory holds the string, and React maps it on demand.
- **CSS GPU Offloading**: We use `translate` classes from Tailwind to hand off floating element calculations directly to the GPU instead of leaning on the web engine's CPU layout thread.
