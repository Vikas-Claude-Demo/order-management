import { auth } from "@/auth";

export type Role = "ADMIN" | "MANAGER" | "STAFF";

export async function getSession() {
  const session = await auth();
  if (!session?.user) return null;
  return session;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function requireRole(...roles: Role[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role as Role)) {
    throw new Error("Forbidden");
  }
  return session;
}

export function canManageUsers(role: string) {
  return role === "ADMIN";
}

export function canCreateOrders(role: string) {
  return role === "ADMIN" || role === "MANAGER";
}

export function canViewAllOrders(role: string) {
  return role === "ADMIN" || role === "MANAGER";
}

export function canAssignOrders(role: string) {
  return role === "ADMIN" || role === "MANAGER";
}

export function canChangeStatus(role: string, userId: string, assigneeId: string | null) {
  if (role === "ADMIN" || role === "MANAGER") return true;
  return role === "STAFF" && userId === assigneeId;
}

export function canAddComment(role: string, userId: string, assigneeId: string | null) {
  if (role === "ADMIN" || role === "MANAGER") return true;
  return role === "STAFF" && userId === assigneeId;
}
