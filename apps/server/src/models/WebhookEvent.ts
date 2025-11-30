import mongoose, { Schema, Document } from 'mongoose';

export interface IWebhookEvent extends Document {
  eventId: string;
  eventType: string;
  eventData: object;
  receivedAt: Date;
  processed: boolean;
}

const WebhookEventSchema: Schema = new Schema({
  eventId: { type: String, required: true, unique: true },
  eventType: { type: String, required: true },
  eventData: { type: Object, required: true },
  receivedAt: { type: Date, required: true },
  processed: { type: Boolean, default: false }
});

export const WebhookEvent = mongoose.model<IWebhookEvent>('WebhookEvent', WebhookEventSchema);