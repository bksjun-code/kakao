export function displayName(user) {
  return user?.nickname || user?.username || "";
}
