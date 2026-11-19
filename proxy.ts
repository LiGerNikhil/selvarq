import { NextRequest, NextResponse } from "next/server";
import { getDemoAccountById } from "@/lib/demo-account-store";

// DEMO ONLY: the unsigned cookie is for local role-flow testing, not access control in production.
export function proxy(request: NextRequest): NextResponse {
  const pathname = request.nextUrl.pathname;
  if (/^\/merchant\/[^/]+\/store\/?$/.test(pathname)) return NextResponse.next();
  if (pathname === "/merchant/register") return NextResponse.next();
  const requiredRole = pathname === "/account" || pathname.startsWith("/account/")
    ? "customer"
    : pathname.startsWith("/merchant/")
      ? "merchant"
      : pathname === "/admin" || pathname.startsWith("/admin/")
        ? "admin"
        : undefined;

  if (!requiredRole) return NextResponse.next();

  const value = request.cookies.get("selvarq-demo-session")?.value;
  const separator = value?.lastIndexOf(":") ?? -1;
  const userId = separator > 0 ? value?.slice(0, separator) : undefined;
  const role = separator > 0 ? value?.slice(separator + 1) : undefined;
  const validatedRole = userId ? getDemoAccountById(userId)?.role : undefined;
  if (role === requiredRole && validatedRole === role) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/account/:path*", "/merchant/:path*", "/admin/:path*"],
};
