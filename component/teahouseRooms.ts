import { TEAHOUSE_ITEMS, type TeahouseItem } from "./teahouseData";

export type TeahouseRoom = {
  id: string;
  chapter: string;
  name: string;
  description: string;
  sceneUrl: string | null;
  status: "ready" | "coming-soon";
  items: readonly TeahouseItem[];
};

function defineRoom(room: Omit<TeahouseRoom, "status">): TeahouseRoom {
  // A URL is the single switch: filling it in also updates the room's status.
  return { ...room, status: room.sceneUrl ? "ready" : "coming-soon" };
}

// Change `name` / `chapter` here to rename a stage. Each room owns its items.
export const TEAHOUSE_ROOMS: readonly TeahouseRoom[] = [
  defineRoom({
    id: "ambition",
    chapter: "第一幕",
    name: "立业之志",
    description: "从茶馆中的日常物件，读起秦仲义的理想。",
    sceneUrl: "https://prod.spline.design/tuBMwvVsJu8byMOF/scene.splinecode",
    items: TEAHOUSE_ITEMS,
  }),
  defineRoom({
    id: "industry",
    chapter: "第二幕",
    name: "实业之路",
    description: "关于实业、抉择与时代的下一段故事。",
    sceneUrl: null, // Paste the second room's Spline URL here to enable it.
    items: [], // Add this room's TeahouseItem records, with matching Spline names.
  }),
  defineRoom({
    id: "aftermath",
    chapter: "第三幕",
    name: "理想余烬",
    description: "回望来路，读懂理想与命运的回声。",
    sceneUrl: null, // Paste the third room's Spline URL here to enable it.
    items: [],
  }),
];
