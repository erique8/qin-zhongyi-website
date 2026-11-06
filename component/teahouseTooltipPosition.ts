const VIEWBOX_WIDTH = 320;
const VIEWBOX_HEIGHT = 180;
const TOOLTIP_WIDTH = 340;
const POINTER_GAP = 20;
const VIEWPORT_PADDING = 20;

export function getTooltipPlacement(
  mouseX: number,
  mouseY: number,
  viewportWidth: number,
  viewportHeight: number,
  measuredHeight = 240,
  preferredWidth = TOOLTIP_WIDTH,
) {
  const width = Math.max(
    0,
    Math.min(preferredWidth, viewportWidth - VIEWPORT_PADDING * 2),
  );
  const height = measuredHeight;
  const viewBoxHeight = width ? (height * VIEWBOX_WIDTH) / width : VIEWBOX_HEIGHT;
  // Grow the body with the copy; keep the hand-drawn top and tail proportions.
  const stretch = Math.max(0, viewBoxHeight - VIEWBOX_HEIGHT);
  const tailInset = (width * 20) / VIEWBOX_WIDTH;
  const availableAbove = mouseY - VIEWPORT_PADDING;
  const availableBelow = viewportHeight - mouseY - VIEWPORT_PADDING;
  const fitsAbove = availableAbove >= height - tailInset + POINTER_GAP;
  const below = !fitsAbove && availableBelow > availableAbove;
  const onLeft =
    mouseX + POINTER_GAP + (width * 305) / VIEWBOX_WIDTH >
    viewportWidth - VIEWPORT_PADDING;
  const preferredLeft = onLeft
    ? mouseX - POINTER_GAP - (width * 305) / VIEWBOX_WIDTH
    : mouseX + POINTER_GAP - (width * 15) / VIEWBOX_WIDTH;
  const left = Math.max(
    VIEWPORT_PADDING,
    Math.min(preferredLeft, viewportWidth - width - VIEWPORT_PADDING),
  );
  const preferredTop = below
    ? mouseY + POINTER_GAP - tailInset
    : mouseY - POINTER_GAP - (height - tailInset);
  const top = Math.max(
    VIEWPORT_PADDING,
    Math.min(preferredTop, viewportHeight - height - VIEWPORT_PADDING),
  );
  // Let the tail slide along the paper when the bubble is clamped at an edge.
  const tailX = width
    ? Math.max(15, Math.min(305, ((mouseX - left) / width) * VIEWBOX_WIDTH))
    : 15;
  const tailBaseLeft = Math.max(
    35,
    Math.min(250, tailX + (onLeft ? -44 : 12)),
  );
  const tailBaseRight = tailBaseLeft + 32;
  const path = `M 42 24
    C 66 10 99 14 122 18
    C 148 7 181 12 207 16
    C 235 9 267 20 278 38
    C 301 42 312 ${64 + stretch / 4} 302 ${84 + stretch / 2}
    C 310 ${104 + stretch} 291 ${121 + stretch} 270 ${124 + stretch}
    C ${270 - (270 - tailBaseRight) / 2} ${141 + stretch} ${tailBaseRight + 10} ${137 + stretch} ${tailBaseRight} ${132 + stretch}
    Q ${tailBaseRight - 6} ${146 + stretch} ${tailX} ${160 + stretch}
    Q ${tailBaseLeft + 5} ${144 + stretch} ${tailBaseLeft} ${130 + stretch}
    C ${tailBaseLeft - 12} ${139 + stretch} 47 ${140 + stretch} 28 ${118 + stretch}
    C 10 ${108 + stretch} 8 ${90 + stretch / 2} 16 ${76 + stretch / 3}
    C 6 54 21 34 42 24 Z`;

  return { left, top, width, height, below, path, tailX, viewBoxHeight };
}
