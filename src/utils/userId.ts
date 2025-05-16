export const getOrCreateAppUserId = (): string => {
  let appUserId = localStorage.getItem('appUserId');
  if (!appUserId) {
    appUserId = self.crypto.randomUUID(); // Uses browser's built-in UUID generator
    localStorage.setItem('appUserId', appUserId);
  }
  return appUserId;
}; 