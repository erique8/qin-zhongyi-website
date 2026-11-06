"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, type PointerEvent as ReactPointerEvent } from "react";
import Spline from "@splinetool/react-spline";
import type { Application, SplineEvent } from "@splinetool/runtime";

import { resolveTeahouseHover } from "./teahouseHover";
import type { TeahouseItem } from "./teahouseData";

type Props = {
  sceneUrl: string;
  items: readonly TeahouseItem[];
  interactive?: boolean;
  onObjectClick: (objectName: string) => void;
  onObjectHover: (objectName: string | null) => void;
};

export default function TeahouseScene({
  sceneUrl, items, interactive = true, onObjectClick, onObjectHover,
}: Props) {
  const names = useMemo(() => new Set(items.map((item) => item.objectName)), [items]);
  const callbacks = useRef({ onObjectClick, onObjectHover, interactive, names });
  const application = useRef<Application | null>(null);
  const pointer = useRef<PointerEvent | null>(null);
  const pendingFrame = useRef<number | null>(null);
  const hoveredName = useRef<string | null>(null);

  // react-spline registers its Spline callbacks once per scene URL. Ref-backed
  // callbacks keep them current without reloading the scene.
  useLayoutEffect(() => {
    callbacks.current = { onObjectClick, onObjectHover, interactive, names };
    if (!interactive) clearHover();
    // clearHover uses stable refs and must not retrigger this effect every frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onObjectClick, onObjectHover, interactive, names]);

  function publishHover(name: string | null) {
    if (hoveredName.current === name) return;
    hoveredName.current = name;
    callbacks.current.onObjectHover(name);
  }

  function clearHover() {
    pointer.current = null;
    if (pendingFrame.current !== null) {
      cancelAnimationFrame(pendingFrame.current);
      pendingFrame.current = null;
    }
    publishHover(null);
  }

  function scheduleHover() {
    if (!callbacks.current.interactive) {
      clearHover();
      return;
    }
    if (pendingFrame.current !== null) return;

    // Spline sends the same hover callback for entry and departure, before
    // updating its entered flags. Resolve after those handlers finish and
    // coalesce movement to at most one hit test per animation frame.
    pendingFrame.current = requestAnimationFrame(() => {
      pendingFrame.current = null;
      const scene = application.current;
      const position = pointer.current;
      const current = callbacks.current;
      publishHover(current.interactive && scene && position
        ? resolveTeahouseHover(scene, position, current.names)
        : null);
    });
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!callbacks.current.interactive || event.pointerType === "touch" || event.buttons !== 0) {
      clearHover();
      return;
    }

    pointer.current = event.nativeEvent;
    scheduleHover();
  }

  useEffect(() => {
    const handleBlur = () => clearHover();
    const handleVisibilityChange = () => {
      if (document.hidden) clearHover();
    };

    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (pendingFrame.current !== null) cancelAnimationFrame(pendingFrame.current);
      application.current = null;
    };
    // These handlers only access stable refs, including the latest callbacks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSplineMouseDown(event: SplineEvent) {
    if (!callbacks.current.interactive) return;
    const objectName = event.target?.name;

    if (!objectName) return;

    console.log("Clicked 3D Object:", objectName);

    callbacks.current.onObjectClick(objectName);
  }

  return (
    <div
      className="absolute inset-0"
      onPointerMoveCapture={handlePointerMove}
      onPointerDownCapture={clearHover}
      onPointerLeave={clearHover}
      onPointerCancel={clearHover}
    >
      <Spline
        scene={sceneUrl}
        onSplineMouseDown={handleSplineMouseDown}
        onSplineMouseHover={scheduleHover}
        onLoad={(scene) => {
          application.current = scene;
          scheduleHover();
        }}
        className="w-full h-full"
      />
    </div>
  );
}
