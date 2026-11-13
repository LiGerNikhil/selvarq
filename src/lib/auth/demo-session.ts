import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { usersRepository } from "@/lib/repo";
import type { User } from "@/data";

const COOKIE_NAME = "selvarq-demo-session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export interface DemoSession {
  userId: string;
  role: User["role"];
}

// DEMO ONLY: this session cookie is unsigned and must never be treated as production authentication.
export async function getSession(): Promise<DemoSession | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) return null;
  const separator = value.lastIndexOf(":");
  if (separator <= 0) return null;
  const userId = value.slice(0, separator);
  const role = value.slice(separator + 1);
  if (role !== "customer" && role !== "merchant" && role !== "admin") return null;
  const user = await usersRepository.getById(userId);
  return user?.role === role ? { userId: user.id, role: user.role } : null;
}

// DEMO ONLY: exposes a predictable, unsigned role session for local development.
export async function setDemoSession(userId: string): Promise<void> {
  const user = await usersRepository.getById(userId);
  if (!user) throw new Error(`Cannot create demo session for unknown user "${userId}".`);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${user.id}:${user.role}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

// DEMO ONLY: role checks rely on the unsigned demo cookie above.
export async function clearDemoSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// DEMO ONLY: route authorization is not production-grade until P13 authentication exists.
export async function requireRole(allowedRoles: User["role"][], next = "/"): Promise<DemoSession> {
  const session = await getSession();
  if (!session || !allowedRoles.includes(session.role)) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }
  return session;
}
