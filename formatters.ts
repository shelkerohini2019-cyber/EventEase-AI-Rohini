export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'CA$',
    AUD: 'AU$',
    INR: '₹',
  };

  const symbol = currencySymbols[currency] || '$';
  return `${symbol}${amount.toLocaleString('en-US')}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'Date TBD';
  try {
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return dateString;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (e) {
    return dateString;
  }
}

export function calculateDaysRemaining(dateString?: string): { days: number; isPast: boolean; label: string } {
  if (!dateString) return { days: 0, isPast: false, label: 'Date not set' };
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = dateString.split('-');
    const eventDate = new Date(Number(year), Number(month) - 1, Number(day));
    eventDate.setHours(0, 0, 0, 0);

    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { days: 0, isPast: false, label: 'Event is Today!' };
    } else if (diffDays > 0) {
      return { days: diffDays, isPast: false, label: `${diffDays} days to go` };
    } else {
      return { days: Math.abs(diffDays), isPast: true, label: `${Math.abs(diffDays)} days ago` };
    }
  } catch (e) {
    return { days: 0, isPast: false, label: 'Date not set' };
  }
}
