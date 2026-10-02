/** Shared by the cockpit and standalone Naming page; callers keep their working draft. */
export class AccountError extends Error {
  /** @param {number} status @param {string} code @param {string} message */
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/** @param {unknown} value @returns {Record<string, unknown>} */
function record(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Account service returned an invalid response. Your draft is unchanged.");
  return value;
}

/** @param {string} path @param {RequestInit} [options] @returns {Promise<unknown>} */
async function request(path, options) {
  const response = await fetch(`/account/api/${path}`, {
    ...options,
    credentials: "same-origin",
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  let decoded;
  try {
    decoded = await response.json();
  } catch (cause) {
    const error = new AccountError(
      response.status,
      "invalid_response",
      "Account service returned an unreadable response. Keep this draft and export it before leaving.",
    );
    error.cause = cause;
    throw error;
  }
  const payload = record(decoded);
  if (!response.ok) {
    const error = record(payload.error);
    throw new AccountError(
      response.status,
      typeof error.code === "string" ? error.code : "unavailable",
      typeof error.message === "string"
        ? error.message
        : "Account service unavailable. Keep your draft.",
    );
  }
  return payload.data;
}

/** Read verified identity and gimmesomepaw's same-origin navigation paths. */
export async function accountSession() {
  const data = record(await request("session"));
  if (
    data.signInURL !== "/outpost.goauthentik.io/start?rd=%2F" ||
    data.signOutURL !== "/outpost.goauthentik.io/sign_out"
  )
    throw new Error("Invalid account navigation. Your draft is unchanged.");
  /** @type {{id: string, username: string} | null} */
  let user = null;
  if (data.user !== null) {
    const value = record(data.user);
    if (
      typeof value.id !== "string" ||
      !value.id ||
      typeof value.username !== "string" ||
      !value.username
    )
      throw new Error("Invalid account identity.");
    user = { id: value.id, username: value.username };
  }
  return { user, signInURL: data.signInURL, signOutURL: data.signOutURL };
}

/** @param {unknown} value */
function snapshot(value) {
  const saved = record(value);
  if (
    typeof saved.revision !== "number" ||
    !Number.isSafeInteger(saved.revision) ||
    saved.revision < 1 ||
    typeof saved.updatedAt !== "string" ||
    !Number.isFinite(Date.parse(saved.updatedAt))
  )
    throw new Error("Invalid saved revision. Your draft is unchanged.");
  return { revision: saved.revision, document: record(saved.document), updatedAt: saved.updatedAt };
}

/** Read only the displayed account's draft. Domain validation precedes application.
 * @param {"scenarios" | "naming"} kind @param {string} subject */
export async function loadAccountDraft(kind, subject) {
  const value = await request(`${kind}/current`, { headers: { "X-Account-Subject": subject } });
  return value === null ? null : snapshot(value);
}

/** Save a domain-validated document with revision and displayed-account binding.
 * @param {"scenarios" | "naming"} kind @param {string} subject
 * @param {number} revision @param {unknown} document */
export async function saveAccountDraft(kind, subject, revision, document) {
  return snapshot(
    await request(`${kind}/current`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Account-Subject": subject },
      body: JSON.stringify({ expectedRevision: revision, document }),
    }),
  );
}
