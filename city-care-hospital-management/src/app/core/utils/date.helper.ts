export class DateHelper {
  static toISODate(date: Date | string): string {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    } else if (typeof date === 'string' && date.includes('-')) {
      const parts = date.split('-');
      if (parts.length === 3 && parts[0].length === 2) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    return date as string;
  }

  static toShortDate(date: Date): string {
    return date.toLocaleDateString('en-IN');
  }

  static toDisplayDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-IN', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }
}
