/** Values stored on admin users and in JWT `role`. */
export type AdminRole = "superAdmin" | "admin" | "editor";

export type AdminStatus = "active" | "inactive" | "suspended";

/** Public admin shape returned from APIs and loaders (no secrets). */
export interface SafeAdmin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
}
