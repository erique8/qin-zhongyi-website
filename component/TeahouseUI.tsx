"use client";

import { useEffect, useId, useRef } from "react";
import type { MotionValue } from "motion/react";

import { TEAHOUSE_INTRO } from "./teahouseContent";
import type { TeahouseItem } from "./teahouseData";
import type { TeahouseRoom } from "./teahouseRooms";
import TeahouseTooltip from "./TeahouseTooltip";
import styles from "./TeahouseUI.module.css";

type Props = {
  activeItem: TeahouseItem | null;
  hoveredItem: TeahouseItem | null;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  room: TeahouseRoom;
  tooltipBottomInset: number;
  onClose: () => void;
};

export default function TeahouseUI({
  activeItem,
  hoveredItem,
  pointerX,
  pointerY,
  room,
  tooltipBottomInset,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closeCallback = useRef(onClose);
  const titleId = useId();
  const descriptionId = useId();
  const activeItemId = activeItem?.id;

  useEffect(() => {
    closeCallback.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!activeItemId) return;

    const previousFocus = document.activeElement;
    closeButtonRef.current?.focus({ preventScroll: true });

    function handleDialogKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeCallback.current();
        return;
      }

      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const controls = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((control) => control.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];

      if (!first || !last) {
        event.preventDefault();
        dialog.focus();
      } else if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleDialogKey, true);

    return () => {
      window.removeEventListener("keydown", handleDialogKey, true);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [activeItemId]);

  return (
    <>
      <TeahouseTooltip
        item={activeItem ? null : hoveredItem}
        pointerX={pointerX}
        pointerY={pointerY}
        bottomInset={tooltipBottomInset}
      />

      <header className={styles.header}>
        <p className={styles.eyebrow}>{TEAHOUSE_INTRO.eyebrow}</p>
        <h1 className={styles.siteTitle}>{TEAHOUSE_INTRO.title}</h1>
        <p className={styles.subtitle}>{TEAHOUSE_INTRO.subtitle}</p>
        <p className={styles.roomLabel}>
          <span>{room.chapter}</span>
          <span aria-hidden="true"> / </span>
          <span>{room.name}</span>
        </p>
      </header>

      {activeItem && (
        <div className={styles.backdrop} onClick={onClose}>
          <article
            ref={dialogRef}
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.dialogHeader}>
              <span className={styles.category}>{activeItem.category}</span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className={styles.closeButton}
                aria-label="关闭物件详情"
              >
                ×
              </button>
            </div>

            <p className={styles.dialogChapter}>{room.chapter} · {room.name}</p>
            <h2 id={titleId} className={styles.dialogTitle}>{activeItem.title}</h2>
            <div className={styles.divider} aria-hidden="true" />
            <p id={descriptionId} className={styles.description}>{activeItem.description}</p>
            <p className={styles.detail}>{activeItem.detail}</p>

            <button type="button" onClick={onClose} className={styles.returnButton}>
              返回茶馆 <span aria-hidden="true">↗</span>
            </button>
          </article>
        </div>
      )}
    </>
  );
}
