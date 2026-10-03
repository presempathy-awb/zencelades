/** Public navigation contains no private prompts or authoring data. */
export default function PrivateStudioLink() {
  return (
    <section className="audio-workbench">
      <div className="pane-reading-area audio-detail">
        <h1>Private asset studio</h1>
        <p>Music prompts, sound effects and production notes live in the crew studio.</p>
        <a href="https://studio.zenceladus.com/">Open private studio · sign in with Authentik ↗</a>
        <p>Access requires approved studio membership. The public artwork stays open.</p>
      </div>
    </section>
  );
}
