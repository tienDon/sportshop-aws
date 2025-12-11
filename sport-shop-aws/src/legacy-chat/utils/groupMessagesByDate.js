// src/legacy-chat/utils/groupMessagesByDate.js
export function groupMessages(messages) {
  const groups = [];
  let lastDate = "";

  messages.forEach((msg) => {
    const date = new Date(msg.sentAt);
    const day = date.toISOString().split("T")[0]; // YYYY-MM-DD

    if (day !== lastDate) {
      groups.push({
        type: "date",
        date: date,
      });
      lastDate = day;
    }

    groups.push({
      type: "msg",
      msg,
    });
  });

  return groups;
}
