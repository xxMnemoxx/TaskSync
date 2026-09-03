export function getUserName(user) {
  return user?.user_metadata?.name || 'Unknown';
}