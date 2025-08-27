import type { UserModel } from "../Data/Models/User";

export function friendlyName(u: UserModel | null){
  if(!u) return "Guest";
  return u.display_name || u.email || "User";
}
