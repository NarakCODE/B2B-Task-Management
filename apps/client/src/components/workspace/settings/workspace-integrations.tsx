import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWorkspaceIntegrationsQueryFn,
  createOrUpdateIntegrationMutationFn,
} from "@/lib/api";
import useWorkspaceId from "@/hooks/use-workspace-id";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";
import { Copy, Check, Save, Settings } from "lucide-react";

import PermissionsGuard from "@/components/resuable/permission-guard";
import { Permissions } from "@/constant";

const WorkspaceIntegrations = () => {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const [githubActive, setGithubActive] = useState(false);
  const [githubSecret, setGithubSecret] = useState("");

  const [slackActive, setSlackActive] = useState(false);
  const [slackUrl, setSlackUrl] = useState("");

  const [githubDialogOpen, setGithubDialogOpen] = useState(false);
  const [slackDialogOpen, setSlackDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["workspaceIntegrations", workspaceId],
    queryFn: () => getWorkspaceIntegrationsQueryFn(workspaceId),
    enabled: !!workspaceId,
  });

  useEffect(() => {
    if (data?.integrations) {
      const git = data.integrations.find((i) => i.provider === "GITHUB");
      const slk = data.integrations.find((i) => i.provider === "SLACK");
      if (git) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setGithubActive(git.isActive);
        setGithubSecret(git.secret || "");
      }
      if (slk) {
         
        setSlackActive(slk.isActive);
        setSlackUrl(slk.webhookUrl || "");
      }
    }
  }, [data]);

  const { mutate: updateIntegration, isPending } = useMutation({
    mutationFn: createOrUpdateIntegrationMutationFn,
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({
        queryKey: ["workspaceIntegrations", workspaceId],
      });
      setGithubDialogOpen(false);
      setSlackDialogOpen(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update integration settings.");
    },
  });

  const handleSaveGithub = (e: React.FormEvent) => {
    e.preventDefault();
    updateIntegration({
      workspaceId,
      data: {
        provider: "GITHUB",
        secret: githubSecret || undefined,
        isActive: githubActive,
      },
    });
  };

  const handleSaveSlack = (e: React.FormEvent) => {
    e.preventDefault();
    updateIntegration({
      workspaceId,
      data: {
        provider: "SLACK",
        webhookUrl: slackUrl || undefined,
        isActive: slackActive,
      },
    });
  };

  const generatedWebhookUrl = `${window.location.origin}/api/integration/github/webhook/${workspaceId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedWebhookUrl);
    setCopied(true);
    toast.success("Webhook URL copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground">Loading integrations...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="mb-5 border-b pb-3">
        <h1 className="text-[17px] tracking-[-0.16px] dark:text-[#fcfdffef] font-semibold mb-1">
          Integrations
        </h1>
        <p className="text-sm text-muted-foreground">
          Extend your B2B workflow with real-time updates and DevOps
          integrations.
        </p>
      </div>

      <PermissionsGuard
        showMessage
        requiredPermission={Permissions.MANAGE_WORKSPACE_SETTINGS}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GitHub Integration */}
          <Card className="w-full max-w-full h-full flex flex-col justify-between">
            <CardHeader>
              <CardTitle>GitHub Integration</CardTitle>
              <CardDescription>
                Receive push commits to update tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Parse commit messages for task codes (e.g.{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-primary font-semibold">
                  task-xyz
                </code>
                ). Prefixes like{" "}
                <code className="text-primary font-mono font-semibold">
                  fixes
                </code>{" "}
                or{" "}
                <code className="text-primary font-mono font-semibold">
                  closes
                </code>{" "}
                will automatically resolve the task.
              </p>
            </CardContent>
            <CardFooter className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={githubActive}
                  onCheckedChange={setGithubActive}
                />
                <span className="text-sm text-muted-foreground">Active</span>
              </div>
              <Dialog
                open={githubDialogOpen}
                onOpenChange={setGithubDialogOpen}
              >
                <form onSubmit={handleSaveGithub}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Settings className="h-4 w-4" /> Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>GitHub Integration Settings</DialogTitle>
                      <DialogDescription>
                        Configure your GitHub webhook. The payload URL receives
                        commit events; the secret token verifies payload
                        authenticity.
                      </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                      <Field className="gap-2">
                        <FieldLabel htmlFor="github-webhook-url">
                          Payload Webhook URL
                        </FieldLabel>
                        <div className="flex gap-2">
                          <Input
                            id="github-webhook-url"
                            readOnly
                            value={generatedWebhookUrl}
                            className="bg-muted text-xs font-mono text-muted-foreground h-9"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={copyToClipboard}
                            className="h-9 w-9 shrink-0"
                          >
                            {copied ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </Field>
                      <Field className="gap-2">
                        <FieldLabel htmlFor="github-secret">
                          Webhook Secret Token
                        </FieldLabel>
                        <Input
                          id="github-secret"
                          type="password"
                          placeholder="Enter signature secret to verify payloads"
                          value={githubSecret}
                          onChange={(e) => setGithubSecret(e.target.value)}
                          className="h-9 text-xs"
                        />
                      </Field>
                    </FieldGroup>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit" disabled={isPending}>
                        <Save className="h-3.5 w-3.5" /> Save
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </form>
              </Dialog>
            </CardFooter>
          </Card>

          {/* Slack Integration */}
          <Card className="w-full max-w-full h-full flex flex-col justify-between">
            <CardHeader>
              <CardTitle>Slack Channel Notifications</CardTitle>
              <CardDescription>
                Broadcast team activities to Slack
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Sends live updates to your team's Slack channel whenever task
                statuses change, new tasks are created, or commit details are
                logged.
              </p>
            </CardContent>
            <CardFooter className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={slackActive}
                  onCheckedChange={setSlackActive}
                />
                <span className="text-sm text-muted-foreground">Active</span>
              </div>
              <Dialog open={slackDialogOpen} onOpenChange={setSlackDialogOpen}>
                <form onSubmit={handleSaveSlack}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Settings className="h-4 w-4" /> Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Slack Integration Settings</DialogTitle>
                      <DialogDescription>
                        Connect your Slack workspace by providing an incoming
                        webhook URL to receive task notifications.
                      </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                      <Field className="gap-2">
                        <FieldLabel htmlFor="slack-webhook-url">
                          Incoming Slack Webhook URL
                        </FieldLabel>
                        <Input
                          id="slack-webhook-url"
                          placeholder="https://hooks.slack.com/services/..."
                          value={slackUrl}
                          onChange={(e) => setSlackUrl(e.target.value)}
                          className="h-9 text-xs font-mono"
                        />
                      </Field>
                    </FieldGroup>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit" disabled={isPending}>
                        <Save className="h-3.5 w-3.5" /> Save
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </form>
              </Dialog>
            </CardFooter>
          </Card>
        </div>
      </PermissionsGuard>
    </div>
  );
};

export default WorkspaceIntegrations;
