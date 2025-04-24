import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface SubmitTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  areAllQuestionsAnswered: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export function SubmitTestDialog({ open, onOpenChange, areAllQuestionsAnswered, onSubmit, onCancel }: SubmitTestDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Test?</DialogTitle>
          <DialogDescription>
            {areAllQuestionsAnswered
              ? "You have answered all questions. Are you sure you want to submit the test?"
              : "You have unanswered questions. Are you sure you want to submit the test?"}
          </DialogDescription>
        </DialogHeader>
        {!areAllQuestionsAnswered && (
          <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-md text-yellow-800">
            <AlertCircle className="h-5 w-5" />
            <span>Some questions are unanswered. You can still submit, but unanswered questions will be marked incorrect.</span>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Submit Test</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
