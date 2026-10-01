import { parseScenario, type Scenario } from "./scenario";
import { loadAccountDraft, saveAccountDraft } from "../../site/naming/account-client.mjs";
export { AccountError, accountSession } from "../../site/naming/account-client.mjs";

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

/** Retrieve and validate the displayed account's scenario without applying it. */
export async function loadAccountScenario(subject: string): Promise<AccountSnapshot | null> {
  const saved = await loadAccountDraft("scenarios", subject);
  return saved === null
    ? null
    : {
        revision: saved.revision,
        scenario: parseScenario(JSON.stringify(saved.document)),
        updatedAt: saved.updatedAt,
      };
}

/** Save the complete scenario using the displayed account and expected revision. */
export async function saveAccountScenario(
  subject: string,
  revision: number,
  scenario: Scenario,
): Promise<AccountSnapshot> {
  const cleaned = parseScenario(JSON.stringify(scenario));
  const saved = await saveAccountDraft("scenarios", subject, revision, cleaned);
  return {
    revision: saved.revision,
    scenario: parseScenario(JSON.stringify(saved.document)),
    updatedAt: saved.updatedAt,
  };
}
