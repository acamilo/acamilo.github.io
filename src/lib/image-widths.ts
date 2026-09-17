// Keep responsive copies within both the original size and our delivery cap.
export function imageWidths(sourceWidth: number): number[] {
  const max = Math.min(sourceWidth, 2600);
  return [...new Set([480, 800, 1300, 1920, max].filter((width) => width <= max))]
    .sort((a, b) => a - b);
}
