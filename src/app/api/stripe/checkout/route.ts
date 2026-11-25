import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProPriceId, getStripeClient } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      {
        error: "STRIPE_NOT_CONFIGURED",
        message:
          "Stripe keys are not configured. Use the Sandbox Pro toggle or set STRIPE_SECRET_KEY in .env.",
      },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const interval = body.interval === "yearly" ? "yearly" : "monthly";
  const priceId = getProPriceId(interval);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const lineItem = priceId
    ? { price: priceId, quantity: 1 }
    : {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Глагол AI Pro",
            description:
              "Unlimited Russian AI practice, pronunciation check, speaking, listening & error breakdown",
          },
          unit_amount: interval === "yearly" ? 9900 : 1200,
          recurring: {
            interval: interval === "yearly" ? ("year" as const) : ("month" as const),
          },
        },
        quantity: 1,
      };

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [lineItem],
    success_url: `${appUrl}/billing?checkout=success`,
    cancel_url: `${appUrl}/billing?checkout=canceled`,
    metadata: {
      userId: user.id,
      interval,
    },
    subscription_data: {
      metadata: {
        userId: user.id,
      },
    },
  });

  return NextResponse.json({ url: session.url });
}
