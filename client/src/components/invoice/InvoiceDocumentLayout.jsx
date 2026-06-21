export default function InvoiceDocumentLayout({
  headerLeft,
  headerRight,
  customerSection,
  infoSection,
  tableSection,
  notesSection,
  termsSection,
  calculationsSection
}) {
  return (
    <div className="w-full bg-card border border-border rounded-[var(--radius-card)] p-6 space-y-6">
      
      {/* Top Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-5 border-b border-border/30">
        <div className="w-full sm:w-1/2">{headerLeft}</div>
        <div className="w-full sm:w-1/2 flex sm:justify-end text-left sm:text-right">{headerRight}</div>
      </div>
      
      {/* Customer & Info Row */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2">{customerSection}</div>
        <div className="w-full md:w-1/2">{infoSection}</div>
      </div>
      
      {/* Table Row */}
      <div className="w-full pt-2">
        {tableSection}
      </div>
      
      {/* Bottom Row */}
      <div className="flex flex-col md:flex-row gap-6 pt-2">
        <div className="w-full md:w-1/2 space-y-4">
          {notesSection}
          {termsSection}
        </div>
        <div className="w-full md:w-1/2 flex md:justify-end">
          <div className="w-full md:w-4/5 lg:w-3/4">
            {calculationsSection}
          </div>
        </div>
      </div>

    </div>
  );
}
