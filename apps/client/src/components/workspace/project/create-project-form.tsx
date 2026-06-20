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
import { Textarea } from "../../ui/textarea";
import EmojiPickerComponent from "@/components/emoji-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProjectMutationFn } from "@/lib/api";
import { toast } from "sonner";
import { Loader } from "lucide-react";

export default function CreateProjectForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const [emoji, setEmoji] = useState("📊");

  const { mutate, isPending } = useMutation({
    mutationFn: createProjectMutationFn,
  });

  const formSchema = z.object({
    name: z.string().trim().min(1, {
      message: "Project title is required",
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

  const handleEmojiSelection = (emoji: string) => {
    setEmoji(emoji);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;
    const payload = {
      workspaceId,
      data: {
        emoji,
        ...values,
      },
    };
    mutate(payload, {
      onSuccess: (data) => {
        const project = data.project;
        queryClient.invalidateQueries({
          queryKey: ["allprojects", workspaceId],
        });

        toast.success("Project created successfully");

        navigate(`/workspace/${workspaceId}/project/${project._id}`);
        setTimeout(() => onClose(), 500);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="pb-3 border-b">
        <h1 className="text-xl font-semibold tracking-tight">
          Create Project
        </h1>
        <p className="text-muted-foreground text-sm leading-tight mt-1">
          Organize and manage tasks, resources, and team collaboration
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormItem>
            <FormLabel className="text-sm">Select Emoji</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="size-14 rounded-full !p-2 !shadow-none text-3xl"
                >
                  {emoji}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="!p-0">
                <EmojiPickerComponent onSelectEmoji={handleEmojiSelection} />
              </PopoverContent>
            </Popover>
          </FormItem>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Project title</FormLabel>
                <FormControl>
                  <Input placeholder="Website Redesign" {...field} />
                </FormControl>
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
                  Project description
                  <span className="text-xs font-extralight ml-2">Optional</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    placeholder="Projects description"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Describe the goals and scope of this project.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button
              disabled={isPending}
              className="text-white font-semibold"
              type="submit"
            >
              {isPending && <Loader className="animate-spin" />}
              Create
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
