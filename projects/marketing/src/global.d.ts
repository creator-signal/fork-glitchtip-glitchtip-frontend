/* In order to access the chatwoot SDK without TS throwing an error, 
this snippet is required. It adds chatwoot as a property to the Window.*/

export {};

declare global {
  interface Window {
    $chatwoot?: any; // Use 'any' or provide a more specific type if known
  }
}