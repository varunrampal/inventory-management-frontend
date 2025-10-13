// src/auth/roles.js
export function hasRole(user, role) {
  return !!user?.roles?.includes?.(role);
}
export function hasAnyRole(user, roles = []) {
  if (!roles?.length) return true; // no restriction
  const ur = user?.roles || [];
  return roles.some(r => ur.includes(r));
}
