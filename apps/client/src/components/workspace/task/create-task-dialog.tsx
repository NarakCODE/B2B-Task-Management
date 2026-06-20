import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CreateTaskForm from "./create-task-form";

const CreateTaskDialog = (props: { projectId?: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClose = () => {
    setIsOpen(false);
  };
  return (
    <div>
      <Dialog modal={true} open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger>
          <Button>
            <Plus />
            New Task
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-hidden border-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>Add a new task to organize work</DialogDescription>
          </DialogHeader>
          <CreateTaskForm projectId={props.projectId} onClose={onClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateTaskDialog;
