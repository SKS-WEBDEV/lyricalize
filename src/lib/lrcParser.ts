export interface LyricLine {
  time: number;
  text: string;
}
/**
 * Parses an LRC string into an array of LyricLine objects.
 * Supports [mm:ss.xx] and [mm:ss.xxx] formats.
 */
export function parseLRC(lrc: string): LyricLine[] {
  const lines = lrc.split('\n');
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d+):(\d+(?:\.\d+)?)]/g;
  for (const line of lines) {
    const text = line.replace(timeRegex, '').trim();
    if (!text) continue;
    let match;
    // Reset regex state for global search in this line
    timeRegex.lastIndex = 0; 
    while ((match = timeRegex.exec(line)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      const timeInSeconds = minutes * 60 + seconds;
      result.push({
        time: timeInSeconds,
        text: text
      });
    }
  }
  // Sort by time just in case the LRC is out of order
  return result.sort((a, b) => a.time - b.time);
}