declare global {
  interface Window {
    // Chatwoot live-chat SDK, loaded via projects/marketing/src/analytics.js.
    // Only the methods this app calls are typed.
    $chatwoot?: {
      toggleBubbleVisibility(state?: "hide" | "show"): void;
      toggle(state?: "open" | "close"): void;
      setConversationCustomAttributes(
        attributes: Record<string, unknown>,
      ): void;
    };
  }
}

export {};
