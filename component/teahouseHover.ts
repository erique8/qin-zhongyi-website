import type { Application } from "@splinetool/runtime";

import { TEAHOUSE_ITEMS } from "./teahouseData";

const interactiveNames = new Set(TEAHOUSE_ITEMS.map((item) => item.objectName));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function findObjectName(value: unknown, names: ReadonlySet<string>): string | null {
  const visited = new Set<unknown>();
  let object = value;

  while (isRecord(object) && !visited.has(object)) {
    visited.add(object);

    if (typeof object.name === "string" && names.has(object.name)) {
      return object.name;
    }

    object = object.parent;
  }

  return null;
}

function isVisible(value: unknown): boolean {
  const visited = new Set<unknown>();
  let object = value;

  while (isRecord(object) && !visited.has(object)) {
    visited.add(object);
    if (object.visible === false) return false;
    object = object.parent;
  }

  return true;
}

/**
 * Spline exposes eventManager, but does not type its hit-test context or offer
 * a mouse-leave callback. Keep that version-dependent bridge in this adapter.
 * Reading the existing raycaster also supports objects authored with click
 * events only; it does not add events or change the exported Spline scene.
 */
export function resolveTeahouseHover(
  application: Application,
  pointer: PointerEvent,
  names: ReadonlySet<string> = interactiveNames,
): string | null {
  const manager: unknown = application.eventManager;
  if (!isRecord(manager)) return null;

  const context = manager.eventContext;

  if (isRecord(context)) {
    const raycaster = context.raycaster;
    const page = context.page;

    if (
      typeof context.updateRaycaster === "function" &&
      isRecord(raycaster) &&
      typeof raycaster.intersectObjects === "function" &&
      isRecord(page) &&
      Array.isArray(page.children)
    ) {
      try {
        context.updateRaycaster.call(context, pointer);
        const intersections: unknown = raycaster.intersectObjects.call(
          raycaster,
          page.children,
          true,
        );

        if (Array.isArray(intersections)) {
          // The nearest visible surface occludes objects behind it.
          for (const intersection of intersections) {
            if (isRecord(intersection) && isVisible(intersection.object)) {
              return findObjectName(intersection.object, names);
            }
          }

          return null;
        }
      } catch {
        // A scene can be disposing or switching pages during a pointer event.
        // The authored hover state below remains a safe fallback.
      }
    }
  }

  const handlers = manager.handlers;
  const hover = isRecord(handlers) ? handlers.MouseHover : null;
  const events = isRecord(hover) ? hover.eventsPerObjects : null;
  if (!isRecord(events)) return null;

  for (const objectEvents of Object.values(events)) {
    if (!Array.isArray(objectEvents)) continue;

    for (const event of objectEvents) {
      if (isRecord(event) && event.entered === true) {
        const name = findObjectName(event.object, names);
        if (name) return name;
      }
    }
  }

  return null;
}
