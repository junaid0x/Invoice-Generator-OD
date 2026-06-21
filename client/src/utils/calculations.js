export const calculateItemAmount = (quantity, rate) => {
  const q = parseFloat(quantity) || 0;
  const r = parseFloat(rate) || 0;
  return q * r;
};

export const calculateSubtotal = (items) => {
  if (!items || !items.length) return 0;
  return items.reduce((sum, item) => sum + calculateItemAmount(item.quantity, item.rate), 0);
};

export const calculateGrandTotal = (subtotal, taxPercent, discount, shipping) => {
  const s = parseFloat(subtotal) || 0;
  const t = parseFloat(taxPercent) || 0;
  const d = parseFloat(discount) || 0;
  const sh = parseFloat(shipping) || 0;
  
  const taxAmount = s * (t / 100);
  return s + taxAmount + sh - d;
};

export const formatCurrency = (amount, currency = 'CAD') => {
  const value = parseFloat(amount) || 0;
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  const formatted = formatter.format(value);
  
  switch(currency) {
    case 'CAD': return `$${formatted} CAD`;
    case 'USD': return `$${formatted} USD`;
    case 'PKR': return `₨${formatted} PKR`;
    case 'AED': return `د.إ ${formatted} AED`;
    case 'EUR': return `€${formatted} EUR`;
    case 'GBP': return `£${formatted} GBP`;
    default: return `$${formatted} ${currency}`;
  }
};
