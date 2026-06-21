# Debug 08B: html2canvas oklch() Compatibility

## Issue
Tailwind CSS v4 generates all default color utilities (like `slate-500`, `white`, etc.) using the `oklch()` color function inside the browser's computed styles. When `html2canvas` reads the DOM to render the PDF canvas, it encounters `oklch()` and throws an `Attempting to parse an unsupported color function "oklch"` error because it does not support modern CSS color spaces.

## Solution
To comply with the strict constraint of **"Do not modify components"** (leaving `InvoicePreviewDocument.jsx` completely untouched), the `oklch` usages were globally overridden at the CSS Variable level. 

By defining the equivalent exact Hex values inside the `@theme` block of `index.css`, Tailwind now compiles these utility classes natively into Hex colors instead of `oklch`. This fully restores compatibility with `html2canvas` without altering a single line of component logic or layout.

### Replacements Made in `client/src/index.css`
The following Tailwind default `oklch` colors were overridden with their exact Hex equivalents:

- `--color-slate-50`: `#f8fafc`
- `--color-slate-100`: `#f1f5f9`
- `--color-slate-200`: `#e2e8f0`
- `--color-slate-300`: `#cbd5e1`
- `--color-slate-400`: `#94a3b8`
- `--color-slate-500`: `#64748b`
- `--color-slate-600`: `#475569`
- `--color-slate-700`: `#334155`
- `--color-slate-800`: `#1e293b`
- `--color-slate-900`: `#0f172a`
- `--color-slate-950`: `#020617`
- `--color-white`: `#ffffff`
- `--color-black`: `#000000`
- `--color-transparent`: `transparent`

*(Custom colors like `--color-primary` and `--color-danger` were already configured as Hex strings).*

## Verification
- Verified compatibility with `html2canvas`: **Yes**. All rendered DOM elements now report Hex/RGB/RGBA in their computed styles.
- Did not modify the design: **Yes**.
- Did not change spacing or typography: **Yes**.
- Did not modify components: **Yes**. All components remain untouched.
- Used only hex/rgb/rgba: **Yes**.
