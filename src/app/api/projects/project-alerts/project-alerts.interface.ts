export interface NewProjectAlert {
  timespanMinutes: number | null;
  quantity: number | null;
  uptime: boolean;
  uptimeQuantity: number | null;
  uptimeTimespanMinutes: number | null;
  alertRecipients: NewAlertRecipient[];
}

export interface PartialProjectAlert extends NewProjectAlert {
  id: number;
  alertRecipients: AlertRecipient[];
}
export interface ProjectAlert extends PartialProjectAlert {
  name: string;
}

export interface NewAlertRecipient {
  recipientType: RecipientType;
  url: string;
}

export interface AlertRecipient extends NewAlertRecipient {
  id: number;
}

export type RecipientType =
  | "email"
  | "webhook"
  | "discord"
  | "feishu"
  | "googlechat"
  | "ntfy"
  | "teams"
  | "zulip";
