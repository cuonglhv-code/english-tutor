"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText, ChevronLeft } from "lucide-react";
import type { WizardData } from "@/types";

interface Props {
  data: Partial<WizardData>;
  onUpdate: (d: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const TASK_INFO = {
  academic: {
    "1": "Describe a chart, graph, table, map or diagram. Minimum 150 words.",
    "2": "Write an essay responding to a point of view, argument or problem. Minimum 250 words.",
  },
  general: {
    "1": "Write a letter (formal, semi-formal or informal) responding to a situation. Minimum 150 words.",
    "2": "Write an essay on a topic of general interest. Minimum 250 words.",
  },
};

export function StepTask({ data, onUpdate, onNext, onBack }: Props) {
  const [taskType, setTaskType] = useState<"academic" | "general">(data.taskType || "academic");
  const [taskNumber, setTaskNumber] = useState<"1" | "2">(data.taskNumber || "1");

  const handleNext = () => {
    onUpdate({ taskType, taskNumber });
    onNext();
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-jaxtina-red" />
          <CardTitle>Select Your Task</CardTitle>
        </div>
        <CardDescription>Choose your IELTS module and task type.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-base font-semibold">IELTS Module</Label>
          <RadioGroup
            value={taskType}
            onValueChange={(v) => setTaskType(v as "academic" | "general")}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {(["academic", "general"] as const).map((type) => (
              <Label
                key={type}
                htmlFor={type}
                className={`flex cursor-pointer flex-col gap-2 rounded-xl border-2 p-4 transition-all ${
                  taskType === type
                    ? "border-jaxtina-red bg-jaxtina-red/5"
                    : "border-border hover:border-jaxtina-grey"
                }`}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value={type} id={type} />
                  <span className="font-semibold capitalize">{type}</span>
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  {type === "academic"
                    ? "University admission, professional registration"
                    : "Secondary education, work experience abroad"}
                </p>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold">Task Number</Label>
          <RadioGroup
            value={taskNumber}
            onValueChange={(v) => setTaskNumber(v as "1" | "2")}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {(["1", "2"] as const).map((num) => (
              <Label
                key={num}
                htmlFor={`task${num}`}
                className={`flex cursor-pointer flex-col gap-2 rounded-xl border-2 p-4 transition-all ${
                  taskNumber === num
                    ? "border-jaxtina-blue bg-jaxtina-blue/5"
                    : "border-border hover:border-jaxtina-grey"
                }`}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value={num} id={`task${num}`} />
                  <span className="font-semibold">Task {num}</span>
                  <Badge variant={num === "2" ? "blue" : "default"} className="ml-auto text-xs">
                    {num === "1" ? "20 min" : "40 min"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  {TASK_INFO[taskType][num]}
                </p>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Button onClick={handleNext} className="flex-1" size="lg">
            Continue to Question →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
