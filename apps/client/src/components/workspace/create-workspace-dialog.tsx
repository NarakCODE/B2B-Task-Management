import WorkspaceForm from "./create-workspace-form";
import useCreateWorkspaceDialog from "@/hooks/use-create-workspace-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
const CreateWorkspaceDialog = () => {
  const { open, onClose } = useCreateWorkspaceDialog();

  return (
    <Dialog modal={true} open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl !p-0 overflow-hidden border-0 max-h-[85vh]">
        <DialogHeader className="sr-only">
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>Set up a new workspace for your team</DialogDescription>
        </DialogHeader>
        <WorkspaceForm {...{ onClose }} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkspaceDialog;
