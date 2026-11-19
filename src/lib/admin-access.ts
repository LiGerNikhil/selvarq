import { getSession } from "@/lib/auth/demo-session";
import { getDemoAccountById } from "@/lib/demo-account-store";

export async function getAdminIdentity() {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;
  const account = getDemoAccountById(session.userId);
  if (!account || account.role !== "admin") return null;
  return { session, account };
}
