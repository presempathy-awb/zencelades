import { type JSX, useEffect, useMemo, useRef, useState } from "react";
import {
  AccountError,
  accountSession,
  loadAccountScenario,
  saveAccountScenario,
  type AccountSession,
} from "./account-api";
import type { Scenario } from "./scenario";
import { Button } from "./ui";
import "./account.css";

/** Explicit account saves leave all guest edits in memory until Andrew chooses Save. */
export default function AccountControls({
  scenario,
  onLoad,
}: {
  scenario: Scenario;
  onLoad: (scenario: Scenario) => void;
}): JSX.Element {
  const [session, setSession] = useState<AccountSession | null>(null);
  const [busy, setBusy] = useState(true);
  const [revision, setRevision] = useState<number | null>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const [savedText, setSavedText] = useState<string | null>(null);
  const [status, setStatus] = useState(
    "Checking account · this draft stays temporary until saved.",
  );
  const generation = useRef(0);
  const currentText = useMemo(() => JSON.stringify(scenario), [scenario]);
  const unsaved = savedText !== currentText;

  const failed = (error: unknown): void => {
    if (
      error instanceof AccountError &&
      (error.status === 401 || error.code === "account_changed")
    ) {
      setSession(null);
      setRevision(null);
      setSavedText(null);
      setHasSaved(false);
    }
    setStatus(
      error instanceof Error ? error.message : "Account request failed. Keep or export this draft.",
    );
  };
  const refresh = async (): Promise<void> => {
    const run = ++generation.current;
    setBusy(true);
    setRevision(null);
    setSavedText(null);
    setHasSaved(false);
    try {
      const next = await accountSession();
      if (run !== generation.current) return;
      setSession(next);
      if (!next.user) {
        setStatus("Guest draft · edits reset on reload. Export before signing in or leaving.");
        return;
      }
      const saved = await loadAccountScenario(next.user.id);
      if (run !== generation.current) return;
      setHasSaved(saved !== null);
      setRevision(saved ? null : 0);
      setStatus(
        saved
          ? "An account draft exists. Export this working draft before loading it. Loading enables subsequent saves."
          : "Signed in. Save explicitly to keep this draft with your account.",
      );
    } catch (error) {
      if (run === generation.current) failed(error);
    } finally {
      if (run === generation.current) setBusy(false);
    }
  };
  useEffect(() => {
    void refresh();
    return () => {
      generation.current++;
    };
  }, []);

  const load = async (): Promise<void> => {
    if (!session?.user || busy) return;
    setBusy(true);
    try {
      const saved = await loadAccountScenario(session.user.id);
      if (!saved) {
        setRevision(0);
        setHasSaved(false);
        setStatus("No account draft exists. This working draft is unchanged.");
        return;
      }
      onLoad(saved.scenario);
      setRevision(saved.revision);
      setSavedText(JSON.stringify(saved.scenario));
      setHasSaved(true);
      setStatus(`Loaded account draft, revision ${saved.revision}. Further edits need Save.`);
    } catch (error) {
      failed(error);
    } finally {
      setBusy(false);
    }
  };
  const save = async (): Promise<void> => {
    if (!session?.user || busy || revision === null) return;
    setBusy(true);
    try {
      const saved = await saveAccountScenario(session.user.id, revision, scenario);
      setRevision(saved.revision);
      setSavedText(JSON.stringify(saved.scenario));
      setHasSaved(true);
      setStatus(
        `Saved account draft, revision ${saved.revision}. Changes made afterward still need Save.`,
      );
    } catch (error) {
      if (error instanceof AccountError && error.code === "revision_conflict") setRevision(null);
      failed(error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <details className="draft-help account-controls">
      <summary title="Guest edits are temporary. Signed-in edits persist only after Save to account.">
        {session?.user
          ? `${session.user.username} · ${unsaved ? "unsaved draft" : "saved draft"}`
          : "Guest draft"}{" "}
        ⓘ
      </summary>
      <div className="account-content">
        <p>
          Model choices, budget, funding, build board, parts and the applied note save together.
          These are personal drafts; they do not change the public project or Pacinman.
        </p>
        <p role="status">{status}</p>
        <div className="account-actions">
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() => {
              void refresh();
            }}
            hint="Recheck sign-in without changing this working draft."
          >
            Refresh account
          </Button>
          {session?.user ? (
            <>
              <Button
                disabled={busy || revision === null || !unsaved}
                onClick={() => {
                  void save();
                }}
                hint="Store the current scenario and applied note for this account. Unsaved text in the note field is excluded."
              >
                Save to account
              </Button>
              <Button
                variant="outline"
                disabled={busy || !hasSaved}
                onClick={() => {
                  void load();
                }}
                hint="Replace the working draft with your saved account draft. Export current edits first if you want to keep them."
              >
                Load saved · replace draft
              </Button>
              <a
                href={session.signOutURL}
                title="Sign out through Authentik. Export or save first; unsaved edits are lost when this page leaves."
              >
                Sign out
              </a>
            </>
          ) : (
            session && (
              <a
                href={session.signInURL}
                title="Sign in through Authentik. Export this guest draft first, then import it after returning."
              >
                Sign in with Paw
              </a>
            )
          )}
        </div>
        <p>
          Export before signing in, signing out, or loading a different draft. Columns and open
          views are temporary layout choices.
        </p>
      </div>
    </details>
  );
}
