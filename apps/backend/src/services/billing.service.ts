import Stripe from "stripe";
import { config } from "../config/app.config";
import SubscriptionModel from "../models/subscription.model";
import WorkspaceModel from "../models/workspace.model";
import { NotFoundException, BadRequestException } from "../utils/appError";

const stripe = new Stripe(config.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27" as any, // Standard stable API version
});

// Helper: Ensure a subscription document (and Stripe customer ID) exists for a workspace
const getOrCreateStripeCustomer = async (workspaceId: string): Promise<string> => {
  const workspace = await WorkspaceModel.findById(workspaceId).populate("owner");
  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  let subscription = await SubscriptionModel.findOne({ workspace: workspaceId });

  if (subscription && subscription.stripeCustomerId) {
    return subscription.stripeCustomerId;
  }

  // Create a new Stripe Customer
  const customer = await stripe.customers.create({
    email: (workspace.owner as any)?.email || undefined,
    name: workspace.name,
    metadata: { workspaceId },
  });

  if (subscription) {
    subscription.stripeCustomerId = customer.id;
    await subscription.save();
  } else {
    subscription = new SubscriptionModel({
      workspace: workspaceId,
      stripeCustomerId: customer.id,
      plan: "FREE",
      status: "active",
    });
    await subscription.save();
  }

  return customer.id;
};

// 1. Create Checkout Session
export const createCheckoutSessionService = async (workspaceId: string) => {
  const customerId = await getOrCreateStripeCustomer(workspaceId);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: config.STRIPE_PRICE_PRO_ID,
        quantity: 1,
      },
    ],
    success_url: `${config.FRONTEND_ORIGIN}/workspace/${workspaceId}/settings?billing_status=success`,
    cancel_url: `${config.FRONTEND_ORIGIN}/workspace/${workspaceId}/settings?billing_status=cancel`,
    client_reference_id: workspaceId,
  });

  return { url: session.url };
};

// 2. Create Billing Portal Session
export const createPortalSessionService = async (workspaceId: string) => {
  const subscription = await SubscriptionModel.findOne({ workspace: workspaceId });
  if (!subscription || !subscription.stripeCustomerId) {
    throw new BadRequestException("No billing account found for this workspace");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${config.FRONTEND_ORIGIN}/workspace/${workspaceId}/settings`,
  });

  return { url: session.url };
};

// 3. Handle Stripe Webhook Events
export const handleStripeWebhookService = async (rawBody: string, signature: string) => {
  let event: any;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      config.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message);
    throw new BadRequestException(`Webhook Error: ${err.message}`);
  }

  console.log(`Received Stripe Webhook Event: ${event.type}`);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const workspaceId = session.client_reference_id;
      const subscriptionId = session.subscription as string;

      if (workspaceId && subscriptionId) {
        const stripeSubscription = (await stripe.subscriptions.retrieve(subscriptionId)) as any;
        
        await SubscriptionModel.findOneAndUpdate(
          { workspace: workspaceId },
          {
            stripeSubscriptionId: subscriptionId,
            plan: "PRO",
            status: "active",
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          },
          { upsert: true }
        );
        console.log(`Workspace ${workspaceId} subscription activated: ${subscriptionId}`);
      }
      break;
    }

    case "customer.subscription.updated": {
      const stripeSubscription = event.data.object as any;
      const subscriptionId = stripeSubscription.id;
      const status = stripeSubscription.status;
      const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);

      // Determine the plan based on Stripe Price ID (metadata or price list)
      const priceId = stripeSubscription.items.data[0]?.price.id;
      const plan = priceId === config.STRIPE_PRICE_PRO_ID ? "PRO" : "FREE";

      await SubscriptionModel.findOneAndUpdate(
        { stripeSubscriptionId: subscriptionId },
        {
          status,
          plan,
          currentPeriodEnd,
        }
      );
      console.log(`Subscription ${subscriptionId} updated status to ${status}`);
      break;
    }

    case "customer.subscription.deleted": {
      const stripeSubscription = event.data.object as any;
      const subscriptionId = stripeSubscription.id;

      await SubscriptionModel.findOneAndUpdate(
        { stripeSubscriptionId: subscriptionId },
        {
          plan: "FREE",
          status: "canceled",
          currentPeriodEnd: null,
        }
      );
      console.log(`Subscription ${subscriptionId} canceled/deleted`);
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return { received: true };
};

export const getWorkspaceSubscriptionService = async (workspaceId: string) => {
  let subscription = await SubscriptionModel.findOne({ workspace: workspaceId });
  if (!subscription) {
    // Return default Free tier subscription details
    return {
      workspace: workspaceId,
      plan: "FREE",
      status: "active",
      currentPeriodEnd: null,
    };
  }
  return subscription;
};
