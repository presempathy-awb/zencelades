export interface MusicPrompt {
  id: string;
  title: string;
  use: string;
  target: string;
  prompt: string;
  exclude: string;
  controls: string;
}
export interface EffectPrompt {
  id: string;
  title: string;
  use: string;
  seconds: number;
  loop: boolean;
  prompt: string;
}

/** Keep the two Suno copy fields separate from controls and production notes. */
export function readMusicPrompt(markdown: string, id: string): MusicPrompt {
  const fields = [...markdown.matchAll(/```text\n([\s\S]*?)\n```/g)];
  const title = markdown.match(/^# (.+)/)?.[1];
  if (!title || fields.length !== 2) throw new Error(`Incomplete music prompt: ${id}`);
  return {
    id,
    title,
    use: markdown.match(/^Use: (.+)/m)?.[1].trim() ?? "",
    target: markdown.match(/^Tempo\/key targets: (.+)/m)?.[1].trim() ?? "",
    controls: markdown.match(/## Suno controls\n([\s\S]*?)\n##/)?.[1].trim() ?? "",
    prompt: fields[0][1],
    exclude: fields[1][1],
  };
}

/** Read individual effect cues from the authored provider run sheet. */
export function readEffects(markdown: string): EffectPrompt[] {
  return markdown
    .split("\n")
    .filter((line) => line.startsWith("| sfx-"))
    .map((line) => {
      const [, identity, use, duration, loop, prompt] = line.split("|").map((s) => s.trim());
      const [id, title] = identity.split(" · ");
      const seconds = Number(duration);
      if (
        !title ||
        !prompt ||
        !Number.isFinite(seconds) ||
        seconds < 0.5 ||
        seconds > 30 ||
        !["On", "Off"].includes(loop)
      )
        throw new Error(`Invalid effect: ${identity}`);
      return { id, title, use, seconds, loop: loop === "On", prompt };
    });
}
