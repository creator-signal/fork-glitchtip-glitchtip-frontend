// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  billingEmail: "sales@glitchtip.com",
  // TEMP: pointing at local hosted stack (:8001) for dual-stack testing.
  // Revert to "https://app.glitchtip.com/api/0/billing/license-invoice/" before merging.
  licenseInvoiceUrl: "http://localhost:8001/api/0/billing/license-invoice/",
};
