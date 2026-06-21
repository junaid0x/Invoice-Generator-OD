# Patch 07E: Invoice Preview Polish

## Objective
Elevate the existing Invoice Preview to a premium, corporate-grade document visually reminiscent of professional ERP systems and accounting software, without modifying any underlying business logic, API endpoints, or calculations.

## Architectural Decisions
- **Strict Separation of Concerns**: Kept the styling changes entirely contained within the new `InvoicePreviewDocument.jsx` component. The builder workspace remains completely untouched.
- **Content-Driven Scaling**: Removed all artificial height constraints. The document dynamically and organically scales its height based on the number of items and line breaks.

## Visual Improvements
- **Document Sizing**: Increased the maximum width from `850px` to `950px` to give the document more presence and breathing room.
- **Paper Styling**: Replaced the harsh `shadow-2xl` with a subtle, premium soft shadow (`shadow-[0_0_40px_rgba(0,0,0,0.05)]`) and a delicate `rounded-lg` border radius to give it a physical paper feel.
- **Color Palette**: Shifted the primary monochrome scale from generic `gray` to a cooler, more professional `slate` to convey corporate trust and modern accounting software aesthetics.
- **Logo Presence**: Increased logo size by roughly 30% (`h-16` to `h-24`), making it a true anchor of brand identity on the document.

## Typography Changes
- **INVOICE Heading**: Adopted an elegant, extra-light font weight (`font-extralight`), increased size (`text-5xl`), and added professional wide letter spacing (`tracking-[0.2em]`).
- **Section Labels (BILL TO, DATE, NOTES, TERMS)**: Shifted to a very subtle uppercase style (`text-[10px] tracking-[0.2em] font-semibold text-slate-400`) to provide structure without drawing unnecessary attention.
- **Customer Name**: Strengthened visual hierarchy by making the company name bold and slightly larger (`text-2xl font-bold`).
- **Total Dominance**: The final Total is now the most visually dominant number on the page (`text-3xl font-bold text-slate-900 tracking-tight`), separated by a strong, dark top border.

## Layout & Spacing Refinements
- **Internal Padding**: Upgraded padding from `p-12` to `p-16` to provide comfortable internal margins.
- **Vertical Rhythm**: Established a consistent cascading spacing rhythm:
  - Header to Customer Section: `mb-20`
  - Customer Section to Items Table: `mb-16`
  - Items Table to Bottom Section: `mb-12`
- **Table Modernization**: 
  - Header row now features a strong dark divider (`border-b-2 border-slate-800`).
  - Item rows use very subtle, light separators (`border-slate-50`) with generous padding (`py-6`) for improved readability.
  - Aligned Quantity, Rate, and Amount to the right, keeping numbers organized in a highly scannable, professional column format.
