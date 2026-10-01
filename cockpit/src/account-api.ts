import { parseScenario, type Scenario } from "./scenario";

export interface AccountUser {
  id: string;
  username: string;
}
export interface AccountSession {
  user: AccountUser | null;
  signInURL: string;
  signOutURL: string;
}
export interface AccountSnapshot {
  revision: number;
  scenario: Scenario;
  updatedAt: string;
}

export class AccountError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Account service returned an invalid response. Your draft is unchanged.");
  return value as Record<string, unknown>;
}

async function request(path: string, options?: RequestInit): Promise<unknown> {
  const response = await fetch(`/account/api/${path}`, {
    ...options,
    credentials: "same-origin",
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  const payload = record(await response.json());
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

function snapshot(value: unknown): AccountSnapshot {
  const saved = record(value);
  if (
    !Number.isSafeInteger(saved.revision) ||
    (saved.revision as number) < 1 ||
    typeof saved.updatedAt !== "string" ||
    !Number.isFinite(Date.parse(saved.updatedAt))
  )
    throw new Error("Invalid saved revision. Your draft is unchanged.");
  return {
    revision: saved.revision as number,
    scenario: parseScenario(JSON.stringify(saved.scenario)),
    updatedAt: saved.updatedAt,
  };
}

/** Read the verified session and gimmesomepaw's same-origin entry points. */
export async function accountSession(): Promise<AccountSession> {
  const data = record(await request("session"));
  if (
    data.signInURL !== "/outpost.goauthentik.io/start?rd=%2F" ||
    data.signOutURL !== "/outpost.goauthentik.io/sign_out"
  )
    throw new Error("Invalid account navigation. Your draft is unchanged.");
  let user: AccountUser | null = null;
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

/** Retrieve only the displayed account's private draft; never applies it automatically. */
export async function loadAccountScenario(subject: string): Promise<AccountSnapshot | null> {
  const value = await request("scenarios/current", { headers: { "X-Account-Subject": subject } });
  return value === null ? null : snapshot(value);
}

/** Save a complete validated snapshot with optimistic concurrency and account binding. */
export async function saveAccountScenario(
  subject: string,
  revision: number,
  scenario: Scenario,
): Promise<AccountSnapshot> {
  const cleaned = parseScenario(JSON.stringify(scenario));
  return snapshot(
    await request("scenarios/current", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Account-Subject": subject },
      body: JSON.stringify({ expectedRevision: revision, scenario: cleaned }),
    }),
  );
}
