export function buildWhatsAppShareUrl(message: string, phoneNumber?: string): string {
  const encoded = encodeURIComponent(message);
  if (phoneNumber) {
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits) {
      return `https://wa.me/${digits}?text=${encoded}`;
    }
  }
  return `https://wa.me/?text=${encoded}`;
}

export function openWhatsAppShare(message: string, phoneNumber?: string): void {
  const url = buildWhatsAppShareUrl(message, phoneNumber);
  window.open(url, '_blank', 'noopener,noreferrer');
}
