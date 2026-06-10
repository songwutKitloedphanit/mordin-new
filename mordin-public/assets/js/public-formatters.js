(function(root) {
  function digits(value, limit) {
    return String(value || '').replaceAll(/\D/g, '').slice(0, limit);
  }

  function formatIDCard(value) {
    const cleaned = digits(value, 13);
    let formatted = cleaned;

    if (cleaned.length > 1) formatted = cleaned.slice(0, 1) + '-' + cleaned.slice(1);
    if (cleaned.length > 5) formatted = formatted.slice(0, 6) + '-' + formatted.slice(6);
    if (cleaned.length > 10) formatted = formatted.slice(0, 12) + '-' + formatted.slice(12);
    if (cleaned.length > 12) formatted = formatted.slice(0, 15) + '-' + formatted.slice(15);

    return formatted;
  }

  function formatPhoneNumber(value) {
    const cleaned = digits(value, 10);
    let formatted = cleaned;

    if (cleaned.length > 3) formatted = cleaned.slice(0, 3) + '-' + cleaned.slice(3);
    if (cleaned.length > 6) formatted = formatted.slice(0, 7) + '-' + formatted.slice(7);

    return formatted;
  }

  root.PublicFormatters = {
    formatIDCard: formatIDCard,
    formatPhoneNumber: formatPhoneNumber
  };
})(globalThis);
