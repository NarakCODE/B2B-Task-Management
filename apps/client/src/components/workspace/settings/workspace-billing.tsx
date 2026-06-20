import { useQuery, useMutation } from "@tanstack/react-query";
import { getWorkspaceSubscriptionQueryFn, createCheckoutSessionMutationFn, createPortalSessionMutationFn } from "@/lib/api";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, CreditCard, Sparkles, ShieldCheck, Zap } from "lucide-react";
import PermissionsGuard from "@/components/resuable/permission-guard";
import { Permissions } from "@/constant";

const WorkspaceBilling = () => {
  const workspaceId = useWorkspaceId();

  // 1. Fetch current subscription details
  const { data, isLoading } = useQuery({
    queryKey: ["workspaceSubscription", workspaceId],
    queryFn: () => getWorkspaceSubscriptionQueryFn(workspaceId),
    enabled: !!workspaceId,
  });

  const subscription = data?.subscription;
  const isPro = subscription?.plan === "PRO";

  // 2. Checkout Session Mutation (Upgrade)
  const { mutate: createCheckout, isPending: isCheckoutPending } = useMutation({
    mutationFn: createCheckoutSessionMutationFn,
    onSuccess: (res) => {
      if (res.url) {
        window.location.href = res.url; // Redirect to Stripe checkout
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to initiate checkout. Please try again.");
    },
  });

  // 3. Portal Session Mutation (Manage billing)
  const { mutate: createPortal, isPending: isPortalPending } = useMutation({
    mutationFn: createPortalSessionMutationFn,
    onSuccess: (res) => {
      if (res.url) {
        window.location.href = res.url; // Redirect to Stripe Customer Portal
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to open billing portal. Please try again.");
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Loading subscription details...</p>
      </div>
    );
  }

  const freeFeatures = [
    "Up to 5 Workspace Members",
    "Up to 2 Projects",
    "Basic Sprints & Task tracking",
    "GitHub & Slack Integrations",
  ];

  const proFeatures = [
    "Up to 50 Workspace Members",
    "Up to 15 Projects",
    "Priority Support & API Access",
    "Advanced Agile metrics & Analytics",
    "Dedicated Slack support channel link",
  ];

  return (
    <div className="w-full space-y-6">
      <div className="mb-5 border-b pb-3">
        <h1 className="text-[17px] tracking-[-0.16px] dark:text-[#fcfdffef] font-semibold mb-1">
          Billing & Subscription
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your subscription plans, seats, and billing options.
        </p>
      </div>

      <PermissionsGuard
        showMessage
        requiredPermission={Permissions.MANAGE_WORKSPACE_SETTINGS}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Plan Comparison - Free Tier */}
          <Card className="flex flex-col border border-border/65 rounded-xl overflow-hidden bg-background">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Free Starter</CardTitle>
              <CardDescription className="text-xs">For small teams getting started</CardDescription>
              <div className="mt-4 text-3xl font-extrabold">$0 <span className="text-xs font-normal text-muted-foreground">/ forever</span></div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 p-5 border-t border-border/40">
              <ul className="space-y-2.5">
                {freeFeatures.map((f, i) => (
                  <li key={i} className="flex items-center text-xs text-muted-foreground">
                    <Check className="h-4 w-4 text-green-500 mr-2 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="p-5">
              <Button disabled variant="outline" className="w-full text-xs">
                {isPro ? "Current Starter Plan" : "Free Active"}
              </Button>
            </CardFooter>
          </Card>

          {/* Plan Comparison - Pro Tier */}
          <Card className="relative flex flex-col md:col-span-2 border-2 border-primary rounded-xl overflow-hidden bg-gradient-to-br from-indigo-50/10 to-background shadow-lg">
            <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-bl-lg flex items-center gap-1 shadow-md">
              <Sparkles className="h-3 w-3" /> Popular Plan
            </div>

            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-primary fill-primary" /> Pro Plan
              </CardTitle>
              <CardDescription className="text-xs">Accelerate team speed and scale project capacity</CardDescription>
              <div className="mt-4 text-3xl font-extrabold">$15 <span className="text-xs font-normal text-muted-foreground">/ month / member</span></div>
            </CardHeader>

            <CardContent className="flex-1 p-5 border-t border-border/40">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Everything in Free, plus:</span>
                  <ul className="space-y-2.5">
                    {proFeatures.map((f, i) => (
                      <li key={i} className="flex items-center text-xs text-muted-foreground">
                        <Check className="h-4 w-4 text-primary mr-2 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col justify-center bg-muted/40 dark:bg-muted/10 p-4 rounded-lg border border-border/40 space-y-3">
                  <div className="flex items-start gap-2 text-xs">
                    <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-0.5">Secure billing by Stripe</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">Modify your billing card, download invoices, or cancel subscription anytime.</p>
                    </div>
                  </div>

                  {isPro && subscription?.currentPeriodEnd && (
                    <div className="pt-2 border-t text-[11px] text-muted-foreground">
                      Subscription renews on: <strong className="text-foreground">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</strong>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-5 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-muted-foreground text-center sm:text-left">
                {isPro ? (
                  <span className="flex items-center gap-1.5 text-green-600 font-semibold dark:text-green-400">
                    <ShieldCheck className="h-4 w-4" /> Active Pro Plan subscription
                  </span>
                ) : (
                  <span>Ready to unlock professional limits?</span>
                )}
              </div>
              
              {isPro ? (
                <Button
                  onClick={() => createPortal(workspaceId)}
                  disabled={isPortalPending}
                  className="w-full sm:w-auto text-xs shrink-0"
                >
                  {isPortalPending && <span className="animate-spin mr-1.5 h-3.5 w-3.5 border-b-2 border-current"></span>}
                  <CreditCard className="h-4 w-4 mr-1.5" /> Manage Invoices & Billing
                </Button>
              ) : (
                <Button
                  onClick={() => createCheckout(workspaceId)}
                  disabled={isCheckoutPending}
                  className="w-full sm:w-auto text-xs shrink-0"
                >
                  {isCheckoutPending && <span className="animate-spin mr-1.5 h-3.5 w-3.5 border-b-2 border-current"></span>}
                  Upgrade to Pro
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </PermissionsGuard>
    </div>
  );
};

export default WorkspaceBilling;
