import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReviewQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: any;
  onSave: (edited: any) => void;
}

export default function ReviewQuestionDialog({ open, onOpenChange, question, onSave }: ReviewQuestionDialogProps) {
  const [edited, setEdited] = useState<any>(question);

  React.useEffect(() => {
    setEdited(question);
  }, [question]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review & Edit Question</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Question</Label>
            <Input
              value={edited.question || ""}
              onChange={e => setEdited({ ...edited, question: e.target.value })}
            />
          </div>
          {edited.options && Array.isArray(edited.options) && (
            <div>
              <Label>Options</Label>
              <div className="space-y-2">
                {edited.options.map((opt: string, i: number) => (
                  <Input
                    key={i}
                    value={opt}
                    onChange={e => {
                      const opts = [...edited.options];
                      opts[i] = e.target.value;
                      setEdited({ ...edited, options: opts });
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          {edited.answer !== undefined && (
            <div>
              <Label>Answer</Label>
              <Input
                value={edited.answer}
                onChange={e => setEdited({ ...edited, answer: e.target.value })}
              />
            </div>
          )}
          {edited.explanation !== undefined && (
            <div>
              <Label>Explanation</Label>
              <Input
                value={edited.explanation}
                onChange={e => setEdited({ ...edited, explanation: e.target.value })}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onSave(edited)} className="w-full mt-4">Save and Add to Question Bank</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
