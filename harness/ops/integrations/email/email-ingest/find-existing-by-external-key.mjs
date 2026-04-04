import { findOpenIssuesByDescriptionFragment } from "../../../linear-client.mjs";

export async function findExistingByExternalKey(externalKey) {
  const marker = `<!-- external-key:${externalKey} -->`;
  const matches = await findOpenIssuesByDescriptionFragment(marker);
  return matches.find((issue) => issue.description?.includes(marker)) || null;
}
