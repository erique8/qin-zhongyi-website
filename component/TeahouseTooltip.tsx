"use client";

import { useLayoutEffect, useRef } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  type MotionValue,
} from "motion/react";

import type { TeahouseItem } from "./teahouseData";
import { getTooltipPlacement } from "./teahouseTooltipPosition";
import styles from "./TeahouseTooltip.module.css";

type Props = {
  item: TeahouseItem | null;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  bottomInset?: number;
};

export default function TeahouseTooltip({ item, pointerX, pointerY, bottomInset = 0 }: Props) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const width = useMotionValue(340);
  const fitScale = useMotionValue(1);
  const path = useMotionValue("");
  const viewBox = useMotionValue("0 0 320 226");
  const shapeTransform = useMotionValue("none");
  const paddingTop = useMotionValue(34);
  const paddingBottom = useMotionValue(72);
  const origin = useMotionValue("5% 89%");
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    const tooltip = tooltipRef.current;
    if (!tooltip) return;

    function placeTooltip() {
      const availableHeight = Math.max(41, window.innerHeight - bottomInset);
      // Only scale the whole existing design when a short viewport cannot fit it.
      const layoutHeight = tooltip?.offsetHeight || 240;
      const layoutWidth = Math.max(1, Math.min(340, window.innerWidth - 40));
      const scale = Math.min(1, (availableHeight - 40) / layoutHeight);
      const placement = getTooltipPlacement(
        pointerX.get(),
        pointerY.get(),
        window.innerWidth,
        availableHeight,
        // Layout height excludes the entrance animation's scale transform.
        layoutHeight * scale,
        layoutWidth * scale,
      );

      x.set(placement.left);
      y.set(placement.top);
      width.set(layoutWidth);
      fitScale.set(scale);
      path.set(placement.path);
      viewBox.set(`0 0 320 ${placement.viewBoxHeight}`);
      shapeTransform.set(
        placement.below ? `translateY(${placement.viewBoxHeight}px) scaleY(-1)` : "none",
      );
      // Flip the tail clearance with the background, while keeping the text upright.
      paddingTop.set(placement.below ? 72 : 34);
      paddingBottom.set(placement.below ? 34 : 72);
      const tailY = placement.below ? 20 : placement.viewBoxHeight - 20;
      origin.set(`${(placement.tailX / 320) * 100}% ${(tailY / placement.viewBoxHeight) * 100}%`);
    }

    placeTooltip();
    const observer = new ResizeObserver(placeTooltip);
    observer.observe(tooltip);
    const stopX = pointerX.on("change", placeTooltip);
    const stopY = pointerY.on("change", placeTooltip);
    window.addEventListener("resize", placeTooltip);

    return () => {
      observer.disconnect();
      stopX();
      stopY();
      window.removeEventListener("resize", placeTooltip);
    };
  }, [
    pointerX, pointerY, x, y, width, fitScale, path, viewBox,
    shapeTransform, paddingTop, paddingBottom, origin, bottomInset,
  ]);

  return (
    <motion.div
      ref={tooltipRef}
      className={styles.tooltip}
      style={{ x, y, width, scale: fitScale, originX: 0, originY: 0 }}
    >
      <AnimatePresence mode="wait">
        {item && (
          <motion.div
            key={item.id}
            role="tooltip"
            className={styles.paper}
            style={{ transformOrigin: origin }}
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.97 }}
            transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
          >
            <motion.svg
              className={styles.outline}
              viewBox={viewBox}
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <g transform="translate(7 9)">
                <motion.path
                  d={path}
                  style={{ transform: shapeTransform, originX: 0, originY: 0, transformBox: "view-box" }}
                  fill="#AF896A"
                  stroke="#75553F"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
              </g>
              <motion.g style={{ transform: shapeTransform, originX: 0, originY: 0, transformBox: "view-box" }}>
                <motion.path
                  d={path}
                  fill="#CBA27F"
                  stroke="#513C30"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Short overlapping ink strokes give the contour a varied weight. */}
                <path d="M 42 24 C 66 10 99 14 122 18" stroke="#513C30" strokeWidth="5" strokeLinecap="round" />
                <path d="M 45 31 C 68 20 94 23 110 25 M 284 48 Q 297 56 296 67" stroke="#E7C4A2" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
                <path d="M 143 28 l 2 -1 M 234 112 l 3 1 M 31 84 l 2 -2 M 91 118 l 3 1 M 262 35 l 2 1" stroke="#79563D" strokeWidth="1.2" strokeLinecap="round" opacity="0.28" />
              </motion.g>
            </motion.svg>
            <motion.div className={styles.copy} style={{ paddingTop, paddingBottom }}>
              <p className={styles.eyebrow}>INTERACTIVE OBJECT</p>
              <p className={styles.title}>{item.label}</p>
              <p className={styles.description}>{item.tooltipDescription}</p>
              <p className={styles.hint}>点击探索详情 ↗</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
