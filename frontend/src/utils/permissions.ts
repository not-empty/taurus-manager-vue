export function checkPermission(
  userRole: string,
  requiredRole: string
): boolean {
  if (userRole === 'administrator') {
    return true;
  }
  if (requiredRole === 'controller') {
    return userRole !== 'guest';
  }
  if (requiredRole === 'administrator') {
    return userRole === 'administrator';
  }
  return false;
}
