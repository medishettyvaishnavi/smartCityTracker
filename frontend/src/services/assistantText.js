export const cleanAssistantText = (text = "") =>
  text
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```/g, ""))
    .replace(/[*_`~]/g, "")
    .replace(/^\s*[-+]\s+/gm, "")
    .replace(/^\s*#+\s+/gm, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
