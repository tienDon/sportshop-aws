// src/legacy-chat/utils/formatTime.js
export function formatChatTime(sentAt) {
  if (!sentAt) return "";

  const date = new Date(sentAt);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const hh = date.getHours().toString().padStart(2, "0");
  const mm = date.getMinutes().toString().padStart(2, "0");

  if (isToday) {
    return `${hh}:${mm}`;
  }

  const dd = date.getDate().toString().padStart(2, "0");
  const mm2 = (date.getMonth() + 1).toString().padStart(2, "0");
  const yyyy = date.getFullYear();

  return `${dd}/${mm2}/${yyyy} • ${hh}:${mm}`;
}
