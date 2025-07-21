export function formatDistanceToNow(date: string | Date): string {
  const now = new Date();
  const parsedDate = typeof date === 'string' ? new Date(date) : date; // Conversion des dates SQL
  const diffInSeconds = Math.floor((now.getTime() - parsedDate.getTime()) / 1000);

  if (diffInSeconds < 5) return 'Juste maintenant';
  if (diffInSeconds < 60) return `Il y a ${diffInSeconds} secondes`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'}`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Il y a ${diffInHours} ${diffInHours === 1 ? 'heure' : 'heures'}`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `Il y a ${diffInDays} ${diffInDays === 1 ? 'jour' : 'jours'}`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `Il y a ${diffInMonths} ${diffInMonths === 1 ? 'mois' : 'mois'}`;

  const diffInYears = Math.floor(diffInMonths / 12);
  return `Il y a ${diffInYears} ${diffInYears === 1 ? 'an' : 'ans'}`;
}
