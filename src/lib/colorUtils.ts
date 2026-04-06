// Consistent colors for group participants
const SENDER_COLORS = [
  '#e91e8c', '#7c4dff', '#00bcd4', '#ff6d00',
  '#4caf50', '#f44336', '#2196f3', '#ff9800',
  '#9c27b0', '#009688', '#795548', '#607d8b',
];

export function getSenderColor(sender: string): string {
  let hash = 0;
  for (let i = 0; i < sender.length; i++) {
    hash = sender.charCodeAt(i) + ((hash << 5) - hash);
  }
  return SENDER_COLORS[Math.abs(hash) % SENDER_COLORS.length];
}
