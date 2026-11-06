"use client";

import { useCallback, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion } from "motion/react";

import TeahouseScene from "./TeahouseScene";
import TeahouseTimeline from "./TeahouseTimeline";
import TeahouseUI from "./TeahouseUI";
import type { TeahouseItem } from "./teahouseData";
import { TEAHOUSE_ROOMS } from "./teahouseRooms";
import styles from "./TeahouseExperience.module.css";

type Props = { isActive: boolean };

export default function TeahouseExperience({ isActive }: Props) {
  const [selection, setSelection] = useState({ roomIndex: 0, sceneIndex: 0 });
  const [activeItem, setActiveItem] = useState<TeahouseItem | null>(null);
  const [hoveredItem, setHoveredItem] = useState<TeahouseItem | null>(null);
  const [tooltipBottomInset, setTooltipBottomInset] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const reduceMotion = useReducedMotion();
  const room = TEAHOUSE_ROOMS[selection.roomIndex];
  // Keep the last real scene mounted while a coming-soon room is selected.
  const sceneRoom = TEAHOUSE_ROOMS[selection.sceneIndex];
  const canInteract = isActive && Boolean(room.sceneUrl) && room.id === sceneRoom.id;
  const interactionRef = useRef({ room, enabled: canInteract && !activeItem });

  useLayoutEffect(() => {
    interactionRef.current = { room, enabled: canInteract && !activeItem };
  }, [room, canInteract, activeItem]);

  const handleObjectHover = useCallback((objectName: string | null) => {
    const current = interactionRef.current;
    if (current.room.id !== sceneRoom.id) return;
    setHoveredItem(current.enabled
      ? current.room.items.find((item) => item.objectName === objectName) ?? null
      : null);
  }, [sceneRoom.id]);

  const handleObjectClick = useCallback((objectName: string) => {
    const current = interactionRef.current;
    if (!current.enabled || current.room.id !== sceneRoom.id) return;
    const item = current.room.items.find((item) => item.objectName === objectName);
    if (item) {
      setHoveredItem(null);
      setActiveItem(item);
    }
  }, [sceneRoom.id]);

  function selectRoom(index: number) {
    const nextRoom = TEAHOUSE_ROOMS[index];
    if (!nextRoom || index === selection.roomIndex) return;
    setActiveItem(null);
    setHoveredItem(null);
    setSelection((previous) => ({
      roomIndex: index,
      sceneIndex: nextRoom.sceneUrl ? index : previous.sceneIndex,
    }));
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    pointerX.set(event.clientX);
    pointerY.set(event.clientY);
  }

  useLayoutEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline || !isActive) return;
    const measure = () => {
      // Keep the existing tooltip above the actual responsive timeline region.
      setTooltipBottomInset(window.innerHeight - timeline.getBoundingClientRect().top);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(timeline);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [isActive]);

  return (
    <div
      className={styles.experience}
      data-room={room.id}
      onPointerMoveCapture={handlePointerMove}
      onPointerLeave={() => setHoveredItem(null)}
    >
      <div className={styles.sceneDeck} data-intro={!isActive}>
        <motion.div
          className={styles.sceneVisibility}
          animate={{ opacity: room.sceneUrl ? 1 : 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.45 }}
          inert={!canInteract}
          aria-hidden={!canInteract}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${sceneRoom.id}:${sceneRoom.sceneUrl}`}
              className={styles.scene}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.35 }}
            >
              {sceneRoom.sceneUrl && <TeahouseScene
                sceneUrl={sceneRoom.sceneUrl}
                items={sceneRoom.items}
                interactive={canInteract && !activeItem}
                onObjectClick={handleObjectClick}
                onObjectHover={handleObjectHover}
              />}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {isActive && (
        <>
          <TeahouseUI
            room={room}
            activeItem={activeItem}
            hoveredItem={activeItem || !canInteract ? null : hoveredItem}
            pointerX={pointerX}
            pointerY={pointerY}
            tooltipBottomInset={tooltipBottomInset}
            onClose={() => setActiveItem(null)}
          />

          <AnimatePresence mode="wait">
            {!room.sceneUrl && (
              <motion.section
                key={room.id}
                className={styles.placeholder}
                aria-labelledby={`room-title-${room.id}`}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
                transition={{ duration: reduceMotion ? 0 : 0.35 }}
              >
                <span className={styles.chapter} aria-hidden="true">{room.chapter}</span>
                <p className={styles.placeholderEyebrow}>故事，未完待续</p>
                <h2 id={`room-title-${room.id}`}>{room.name}</h2>
                <p className={styles.roomDescription}>{room.description}</p>
                <p className={styles.comingSoon} role="status">房间制作中 · 敬请期待</p>
                <button type="button" className={styles.returnButton} onClick={() => selectRoom(0)}>
                  返回第一间茶馆 ↗
                </button>
              </motion.section>
            )}
          </AnimatePresence>

          <div
            ref={timelineRef}
            className={styles.timelineDock}
            onPointerEnter={() => setHoveredItem(null)}
          >
            <TeahouseTimeline
              rooms={TEAHOUSE_ROOMS}
              activeIndex={selection.roomIndex}
              onSelect={selectRoom}
              disabled={Boolean(activeItem)}
            />
          </div>
        </>
      )}
    </div>
  );
}
