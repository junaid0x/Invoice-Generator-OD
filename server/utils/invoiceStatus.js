const getEffectiveStatus = (invoice) => {
  if (!invoice) return 'draft';
  const status = (invoice.status || 'draft').toLowerCase();
  if (status === 'paid') return 'paid';

  if (invoice.due_date) {
    let dateStr = '';
    if (typeof invoice.due_date === 'string') {
      dateStr = invoice.due_date.split('T')[0];
    } else if (invoice.due_date instanceof Date) {
      const year = invoice.due_date.getFullYear();
      const month = String(invoice.due_date.getMonth() + 1).padStart(2, '0');
      const day = String(invoice.due_date.getDate()).padStart(2, '0');
      dateStr = `${year}-${month}-${day}`;
    }

    if (dateStr) {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      if (dateStr < todayStr) {
        return 'overdue';
      }
    }
  }

  return status;
};

const SQL_EXPRESSIONS = {
  IS_OVERDUE: `(status != 'paid' AND due_date IS NOT NULL AND due_date < CURRENT_DATE())`,
  IS_PENDING: `(status = 'pending' AND (due_date IS NULL OR due_date >= CURRENT_DATE()))`,
  IS_DRAFT: `(status = 'draft' AND (due_date IS NULL OR due_date >= CURRENT_DATE()))`,
  IS_PAID: `(status = 'paid')`,
  COMPUTED_STATUS: `CASE WHEN status != 'paid' AND due_date IS NOT NULL AND due_date < CURRENT_DATE() THEN 'overdue' ELSE status END`
};

module.exports = {
  getEffectiveStatus,
  SQL_EXPRESSIONS
};
