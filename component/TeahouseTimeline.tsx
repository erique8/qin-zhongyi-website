"use client";

import { useId } from "react";

import type { TeahouseRoom } from "./teahouseRooms";
import styles from "./TeahouseTimeline.module.css";

type Props = {
  rooms: readonly TeahouseRoom[];
  activeIndex: number;
  onSelect: (index: number) => void;
  disabled?: boolean;
};

export default function TeahouseTimeline({
  rooms,
  activeIndex,
  onSelect,
  disabled = false,
}: Props) {
  const id = useId();
  const selectedIndex = Math.max(0, Math.min(activeIndex, rooms.length - 1));
  const currentRoom = rooms[selectedIndex];

  if (!currentRoom) return null;

  const currentStatus = currentRoom.sceneUrl ? "可探索" : "房间制作中";

  return (
    <nav className={styles.timeline} aria-label="秦仲义人生时间轴" data-disabled={disabled}>
      <div className={styles.caption}>
        <label className={styles.heading} htmlFor={`${id}-range`}>
          人生三幕
        </label>
        <p id={`${id}-hint`} className={styles.hint}>拖动滑块 · 选择阶段</p>
        <p className={styles.status} aria-live="polite" aria-atomic="true">
          <span className={styles.statusDot} aria-hidden="true" />
          {currentRoom.chapter} · {currentStatus}
        </p>
      </div>

      <div className={styles.rail}>
        <div className={styles.ticks} aria-hidden="true">
          {rooms.map((room) => <span key={room.id} className={styles.tick} />)}
        </div>
        <input
          id={`${id}-range`}
          className={styles.slider}
          type="range"
          min={0}
          max={rooms.length - 1}
          step={1}
          value={selectedIndex}
          disabled={disabled}
          aria-describedby={`${id}-hint`}
          aria-valuetext={`${currentRoom.chapter}，${currentRoom.name}，${currentStatus}`}
          onChange={(event) => onSelect(Number(event.currentTarget.value))}
        />
      </div>

      <div className={styles.nodes} style={{ gridTemplateColumns: `repeat(${rooms.length}, minmax(0, 1fr))` }}>
        {rooms.map((room, index) => (
          <button
            key={room.id}
            type="button"
            className={styles.node}
            disabled={disabled}
            aria-current={index === selectedIndex ? "step" : undefined}
            aria-label={`${room.chapter}，${room.name}${room.sceneUrl ? "" : "，房间制作中"}`}
            data-room-id={room.id}
            onClick={() => onSelect(index)}
          >
            <span className={styles.chapter}>{room.chapter}</span>
            <span className={styles.name}>{room.name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
