export type SubscriptionPlanId = 'individual' | 'student' | 'family';

export interface SubscriptionRequest {
  email: string;
  planId: SubscriptionPlanId;
}
