import Stripe from "stripe";

export function getStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  return new Stripe(key);
}

export function isStripeSandboxEnabled(): boolean {
  return (
    !process.env.STRIPE_SECRET_KEY?.trim() ||
    process.env.NEXT_PUBLIC_STRIPE_SANDBOX === "true"
  );
}

export function getProPriceId(interval: "monthly" | "yearly"): string | null {
  if (interval === "yearly") {
    return process.env.STRIPE_PRO_YEARLY_PRICE_ID?.trim() || null;
  }
  return process.env.STRIPE_PRO_MONTHLY_PRICE_ID?.trim() || null;
}
