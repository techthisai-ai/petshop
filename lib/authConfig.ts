export const ADMIN_EMAIL = "admin@gmail.com";
export const ADMIN_PASSWORD = "Admin@123";

export const isAdminEmail = (email?: string | null) =>
  email?.trim().toLowerCase() === ADMIN_EMAIL;

export const isAdminCredential = (email: string, password: string) =>
  isAdminEmail(email) && password === ADMIN_PASSWORD;
  