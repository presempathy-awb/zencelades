import {
  namingDraftFor,
  parseNamingDraft,
  readLegacyNamingBackup,
  maxNamingDraftBytes,
} from "./draft-state.mjs";
import {
  AccountError,
  accountSession,
  loadAccountDraft,
  saveAccountDraft,
} from "./account-client.mjs";

/** Offer explicit personal saves, portable drafts and recovery of old browser data.
 * @param {Document | ShadowRoot} root */
export function initNamingDraftControls(root = document) {
  const host = root.querySelector("#name-studio");
  if (!host || root.querySelector("#naming-draft-controls")) return;
  const panel = document.createElement("section");
  panel.id = "naming-draft-controls";
  panel.setAttribute("aria-label", "Naming draft storage");
  panel.className = "section naming-draft-controls";
  const copy = document.createElement("p");
  copy.textContent =
    "Naming edits stay temporary until explicitly saved to a signed-in account. Naming saves include palette, shelves, weights and receipts, separately from the model scenario. Export before signing in, signing out or replacing edits. Old browser drafts remain available through recovery.";
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  const actions = document.createElement("div");
  actions.className = "name-actions";
  function download(value, name) {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function button(label, hint, run) {
    const control = document.createElement("button");
    control.type = "button";
    control.textContent = label;
    control.title = hint;
    control.addEventListener("click", async () => {
      try {
        await run();
      } catch (error) {
        status.textContent = `${error.message}. Current edits and old browser backups are unchanged.`;
      }
    });
    actions.append(control);
    return control;
  }
  button(
    "Export Naming draft",
    "Download the current palette, shelves, scores and research receipts. This does not save to an account.",
    () => {
      download(namingDraftFor(root).snapshot(), "zencelades-naming-draft.json");
      status.textContent = "Naming draft exported. It remains temporary in this page.";
    },
  );
  const file = document.createElement("input");
  file.type = "file";
  file.accept = "application/json,.json";
  file.hidden = true;
  file.addEventListener("change", async () => {
    const selected = file.files?.[0];
    if (!selected) return;
    try {
      if (selected.size > maxNamingDraftBytes)
        throw new Error("Naming file exceeds the 4 MiB size limit");
      const draft = parseNamingDraft(await selected.text());
      namingDraftFor(root).replace(draft);
      status.textContent =
        "Imported into this working Naming draft. Save to your account or export before reloading.";
    } catch (error) {
      status.textContent = `Import refused: ${error.message}. Current edits are unchanged.`;
    } finally {
      file.value = "";
    }
  });
  button(
    "Import · replace Naming draft",
    "Replaces this page's Naming edits only. Export the current draft first to retain it.",
    () => file.click(),
  );
  button(
    "Recover old browser drafts",
    "Download old palette and shelves exactly as stored. Nothing is loaded, changed or deleted until you choose to import that file.",
    () => {
      const backup = readLegacyNamingBackup(
        localStorage,
        document.documentElement.dataset.project ?? "thatsnozorb",
      );
      if (backup.palette === null && backup.shelves === null) {
        status.textContent = "No old Naming drafts were found in this browser.";
        return;
      }
      download(backup, "zencelades-legacy-naming-backup.json");
      status.textContent =
        "Old drafts downloaded; browser storage is unchanged. Import the recovery file explicitly to use it here.";
    },
  );
  const identity = document.createElement("p");
  const navigation = document.createElement("a");
  navigation.hidden = true;
  let session = null,
    revision = null,
    hasSaved = false,
    busy = false;
  function renderAccount() {
    refreshButton.disabled = busy;
    saveButton.disabled = busy || !session?.user || revision === null;
    loadButton.disabled = busy || !session?.user || !hasSaved;
    identity.textContent = session?.user
      ? `Naming account: ${session.user.username}`
      : "Guest Naming draft · edits reset on reload.";
    navigation.hidden = !session;
    if (session) {
      navigation.href = session.user ? session.signOutURL : session.signInURL;
      navigation.textContent = session.user ? "Sign out" : "Sign in with Paw";
      navigation.title =
        "Export or save first. Signing in or out leaves this page and discards unsaved edits.";
    }
  }
  function accountFailed(error) {
    if (error instanceof AccountError) {
      if (error.status === 401 || error.code === "account_changed") {
        session = null;
        revision = null;
        hasSaved = false;
      } else if (error.code === "revision_conflict") revision = null;
    }
    status.textContent = `${error.message} Working Naming edits are unchanged.`;
  }
  async function withAccount(action) {
    if (busy) return;
    busy = true;
    renderAccount();
    try {
      await action();
    } catch (error) {
      if (panel.isConnected) accountFailed(error);
    } finally {
      busy = false;
      if (panel.isConnected) renderAccount();
    }
  }
  async function refresh() {
    await withAccount(async () => {
      session = null;
      revision = null;
      hasSaved = false;
      const next = await accountSession();
      if (!panel.isConnected) return;
      session = next;
      if (!next.user) {
        status.textContent =
          "Guest edits are temporary. Export this draft before signing in or leaving.";
        return;
      }
      const saved = await loadAccountDraft("naming", next.user.id);
      if (!panel.isConnected) return;
      hasSaved = saved !== null;
      revision = saved ? null : 0;
      status.textContent = saved
        ? "A saved Naming draft exists. Export current edits before loading it; loading enables subsequent saves."
        : "Signed in. Save Naming explicitly to keep this draft with your account.";
    });
  }
  const refreshButton = button(
    "Refresh Naming account",
    "Check sign-in without changing this Naming draft.",
    refresh,
  );
  const saveButton = button(
    "Save Naming to account",
    "Save palette, shelves, weights and receipts to this account. The model scenario is saved separately.",
    async () => {
      if (!session?.user || revision === null) return;
      const subject = session.user.id,
        expected = revision;
      const document = namingDraftFor(root).snapshot();
      await withAccount(async () => {
        const saved = await saveAccountDraft("naming", subject, expected, document);
        if (!panel.isConnected) return;
        parseNamingDraft(JSON.stringify(saved.document));
        revision = saved.revision;
        hasSaved = true;
        status.textContent = `Saved Naming revision ${revision}. Changes made afterward still need Save.`;
      });
    },
  );
  const loadButton = button(
    "Load saved Naming · replace draft",
    "Replace palette and shelves with this account's saved Naming draft. Export current edits first.",
    async () => {
      if (!session?.user) return;
      const subject = session.user.id;
      await withAccount(async () => {
        const saved = await loadAccountDraft("naming", subject);
        if (!panel.isConnected) return;
        if (!saved) {
          revision = 0;
          hasSaved = false;
          status.textContent = "No saved Naming draft exists. Working edits are unchanged.";
          return;
        }
        namingDraftFor(root).replace(parseNamingDraft(JSON.stringify(saved.document)));
        revision = saved.revision;
        hasSaved = true;
        status.textContent = `Loaded Naming revision ${revision}. Further edits need Save.`;
      });
    },
  );
  panel.append(copy, identity, actions, navigation, file, status);
  host.before(panel);
  void refresh();
}

if (typeof document !== "undefined" && document.getElementById("name-studio"))
  initNamingDraftControls();
