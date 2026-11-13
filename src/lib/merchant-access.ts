import { getSession } from "@/lib/auth/demo-session";
import { getDemoAccountById } from "@/lib/demo-account-store";
import { getMerchantProfile } from "@/lib/demo-merchant-store";

export async function getMerchantIdentity() {
  const session = await getSession();
  if (!session || session.role !== "merchant") return null;
  const account = getDemoAccountById(session.userId);
  const merchantId = account?.merchantId;
  if (!merchantId) return null;
  const profile = getMerchantProfile(merchantId);
  if (!profile) return null;
  return { session, account, merchantId, profile };
}

export async function getApprovedMerchantIdentity() {
  const identity = await getMerchantIdentity();
  return identity?.profile.status === "approved" ? identity : null;
}
