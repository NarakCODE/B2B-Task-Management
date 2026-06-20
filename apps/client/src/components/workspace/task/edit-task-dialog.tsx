import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EditTaskForm from "./edit-task-form";
import { TaskType } from "@/types/api.type";

const EditTaskDialog = ({ task, isOpen, onClose }: { task: TaskType; isOpen: boolean; onClose: () => void }) => {
  return (
    <Dialog modal={true} open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-hidden border-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>Update task details</DialogDescription>
        </DialogHeader>
        <EditTaskForm task={task} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskDialog;
