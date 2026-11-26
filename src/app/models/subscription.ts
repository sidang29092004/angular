export type SubscriptionPlanId = 'free' | 'individual' | 'student' | 'family';

export interface SubscriptionRequest {
  email: string;
  planId: SubscriptionPlanId;
}
