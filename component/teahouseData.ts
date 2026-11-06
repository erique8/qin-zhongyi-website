export type TeahouseItem = {
  id: string;
  objectName: string;
  label: string;
  tooltipDescription: string;
  category: string;
  title: string;
  description: string;
  detail: string;
};

export const TEAHOUSE_ITEMS: TeahouseItem[] = [

  {
    id: "watch",
    objectName: "pocket_watch",
    label: "西洋怀表",
    tooltipDescription: "从茶馆日常，读懂人物身份",
    category: "人物身份",
    title: "秦仲义的人物身份",
    description: "在这里填写人物介绍。",
    detail: "在这里填写更详细的文学分析。"
  },

  {
    id: "paper",
    objectName: "paper",
    label: "地契",
    tooltipDescription: "一笔生意，一段实业抱负",
    category: "商业经营",
    title: "商人与资本",
    description: "在这里填写商业经营相关内容。",
    detail: "在这里填写详细分析。"
  },

  {
    id: "blueprint",
    objectName: "blueprint ",
    label: "工厂图纸",
    tooltipDescription: "纸上蓝图，寄托救国理想",
    category: "人生理想",
    title: "实业救国",
    description: "在这里填写秦仲义的工业理想。",
    detail: "在这里填写详细分析。"
  },

  {
    id: "newspaper",
    objectName: "NewspaperGroup",
    label: "旧报纸",
    tooltipDescription: "翻阅旧闻，看见时代变迁",
    category: "时代背景",
    title: "时代与命运",
    description: "在这里填写时代背景。",
    detail: "在这里填写详细分析。"
  },

];
