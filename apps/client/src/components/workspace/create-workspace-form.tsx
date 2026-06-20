import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "../ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWorkspaceMutationFn } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader } from "lucide-react";

export default function CreateWorkspaceForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: createWorkspaceMutationFn,
  });

  const formSchema = z.object({
    name: z.string().trim().min(1, {
      message: "Workspace name is required",
    }),
    description: z.string().trim(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;
    mutate(values, {
      onSuccess: (data) => {
        queryClient.resetQueries({
          queryKey: ["userWorkspaces"],
        });

        const workspace = data.workspace;
        onClose();
        navigate(`/workspace/${workspace._id}`);
      },
      onError: (error) => {
      toast.error(error.message);
      },
    });
  };

  return (
    <div className="flex flex-row">
      <div className="flex flex-1 flex-col gap-5 px-10 py-10">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            Let's build a Workspace
          </h1>
          <p className="text-muted-foreground text-lg leading-tight">
            Boost your productivity by making it easier for everyone to access
            projects in one location.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">
                    Workspace name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Taco's Co."
                      className="!h-[48px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is the name of your company, team or organization.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">
                    Workspace description
                    <span className="text-xs font-extralight ml-2">
                      Optional
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={6}
                      placeholder="Our team organizes marketing projects and tasks here."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Get your members on board with a few words about your
                    Workspace.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={isPending}
              className="w-full"
              size="lg"
              type="submit"
            >
              {isPending && <Loader className="animate-spin" />}
              Create Workspace
            </Button>
          </form>
        </Form>
      </div>
      <div className="relative hidden md:block w-[45%] shrink-0 bg-muted bg-[url('/images/workspace.jpg')] bg-cover bg-center rounded-r-lg" />
    </div>
  );
}
