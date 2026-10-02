import { type JSX, useRef, useState } from "react";
import { readEffects, readMusicPrompt } from "./audio-prompts";
import effectsText from "../../docs/audio/elevenlabs-effects.md?raw";
import "./audio.css";

const sources = import.meta.glob<string>("../../docs/audio/suno/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});
const songs = Object.entries(sources)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, text]) =>
    readMusicPrompt(text, path.split("/").pop()?.replace(/\.md$/, "") ?? path),
  );
const effects = readEffects(effectsText);

function CopyField({ label, text }: { label: string; text: string }): JSX.Element {
  const field = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState("");
  return (
    <section className="prompt-field">
      <label>
        {label}
        <textarea ref={field} readOnly value={text} />
      </label>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setMessage(`${label} copied`);
          } catch {
            field.current?.focus();
            field.current?.select();
            setMessage("Text selected — copy with your keyboard");
          }
        }}
      >
        Copy {label}
      </button>
      <span role="status">{message}</span>
    </section>
  );
}

/** Protected copy-ready prompts; generation and persistent editing remain deferred. */
export default function AudioView(): JSX.Element {
  const [kind, setKind] = useState("music");
  const [music, setMusic] = useState(0);
  const [effect, setEffect] = useState(0);
  const [detail, setDetail] = useState("prompt");
  const song = songs[music],
    cue = effects[effect];
  return (
    <div className="audio-workbench">
      <nav className="pane-topic-bar" aria-label="Audio prompt selection">
        <label>
          Collection
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="music">Suno · 8 songs</option>
            <option value="effects">ElevenLabs · 16 effects</option>
          </select>
        </label>
        <label>
          Prompt
          <select
            value={kind === "music" ? music : effect}
            onChange={(e) =>
              kind === "music"
                ? setMusic(Number(e.target.value))
                : setEffect(Number(e.target.value))
            }
          >
            {(kind === "music" ? songs : effects).map((item, i) => (
              <option key={item.id} value={i}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Detail
          <select value={detail} onChange={(e) => setDetail(e.target.value)}>
            <option value="prompt">Copy prompts</option>
            <option value="settings">Settings & mixing</option>
          </select>
        </label>
      </nav>
      <div
        className="pane-reading-area audio-detail"
        tabIndex={0}
        aria-label="Selected audio prompt"
      >
        <header>
          <p>{kind === "music" ? "Suno · Instrumental" : "ElevenLabs · Sound Effects"}</p>
          <h1>{kind === "music" ? song.title : cue.title}</h1>
          <p>
            {kind === "music"
              ? `${song.use} · ${song.target}`
              : `${cue.use} · ${cue.seconds} seconds · Loop ${cue.loop ? "on" : "off"}`}
          </p>
        </header>
        <p>Prepared prompts · audio has not been generated or auditioned.</p>
        {detail === "prompt" ? (
          <div key={`${kind}-${music}-${effect}`} className="prompt-fields">
            <CopyField
              label={kind === "music" ? "Style" : "Effect"}
              text={kind === "music" ? song.prompt : cue.prompt}
            />
            {kind === "music" && <CopyField label="Exclude" text={song.exclude} />}
          </div>
        ) : (
          <section className="audio-notes">
            <h2>Provider settings</h2>
            <p>
              {kind === "music"
                ? song.controls
                : "Use Sound Effects, with the duration and loop setting above. Start with prompt influence 0.3 where available. Audition the result before publishing it."}
            </p>
            <h2>Let the music breathe</h2>
            <p>
              Keep one music bed across Showtime’s 60-second film loop. Use chapter-timed effects.
              Mix within the 72, 96 or 120 BPM families after checking the actual audio; use a soft
              ambient bridge between families.
            </p>
            <p>
              The planned private asset studio will use Pawthentik through gimmesomepaw. Studio
              hosting, audio generation and automatic mixing are deferred.
            </p>
            <a href="/documents/audio/studio-and-umesemu.md" target="_blank" rel="noreferrer">
              Studio, optimization and mixing plan ↗
            </a>
          </section>
        )}
        <footer>
          <a
            href={
              kind === "music"
                ? `/documents/audio/suno/${song.id}.md`
                : "/documents/audio/elevenlabs-effects.md"
            }
            target="_blank"
            rel="noreferrer"
          >
            Original prompt & production notes ↗
          </a>{" "}
          ·{" "}
          <a href="/documents/audio/README.md" target="_blank" rel="noreferrer">
            Complete audio pack ↗
          </a>
        </footer>
      </div>
    </div>
  );
}
