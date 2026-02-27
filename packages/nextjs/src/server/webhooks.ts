import crypto from "crypto";

export interface WebhookEvent {
  id: string;
  type: string;
  created_at: number;
  data: Record<string, unknown>;
}

export class Webhook {
  constructor(private secret: string) {}

  verify(payload: string, signature: string): WebhookEvent {
    const computedSignature = crypto
      .createHmac("sha256", this.secret)
      .update(payload)
      .digest("hex");

    if (computedSignature !== signature) {
      throw new Error("Invalid webhook signature");
    }

    return JSON.parse(payload) as WebhookEvent;
  }
}
