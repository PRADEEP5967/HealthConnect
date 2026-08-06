import { Users, hashPassword, uid } from "./storage";

export async function adminResetPassword(input: { userId: string; password: string }): Promise<{ ok: boolean }> {
  if (!input?.userId) throw new Error("userId required");
  if (!input?.password || input.password.length < 6) throw new Error("Password must be at least 6 characters");
  const hash = await hashPassword(input.password);
  Users.update(input.userId, { passwordHash: hash });
  return { ok: true };
}

export async function adminDeleteUser(input: { userId: string }): Promise<{ ok: boolean }> {
  if (!input?.userId) throw new Error("userId required");
  Users.remove(input.userId);
  return { ok: true };
}
