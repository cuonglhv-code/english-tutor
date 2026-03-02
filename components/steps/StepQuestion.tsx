"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, FileText, ChevronLeft, X, ImageIcon } from "lucide-react";
import type { WizardData } from "@/types";

interface Props {
  data: Partial<WizardData>;
  onUpdate: (d: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepQuestion({ data, onUpdate, onNext, onBack }: Props) {
  const [question, setQuestion] = useState(data.question || "");
  const [questionImage, setQuestionImage] = useState<string | null>(data.questionImage || null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setUploadedFileName(file.name);

    if (file.type.startsWith("image/")) {
      // Read image as Data URL so we can display it in the question panel
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setQuestionImage(dataUrl);
        // Clear any manually-typed question text so image takes precedence
        // but keep existing text if user already typed something
        if (!question.trim()) {
          setQuestion(`[Image question: ${file.name}]`);
        }
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith("text/")) {
      // Text / .txt file — read as text and populate textarea
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setQuestion(text);
        setQuestionImage(null);
      };
      reader.readAsText(file);
    } else {
      // PDF or other binary — can't read text, ask user to type
      setQuestion(`[Uploaded: ${file.name}] — Please also type the question text below for analysis.`);
      setQuestionImage(null);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFileName(null);
    setQuestionImage(null);
    setQuestion("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleNext = () => {
    if (!question.trim() || question.trim().length < 5) {
      setError("Please enter the question (at least 5 characters).");
      return;
    }
    onUpdate({ question, questionImage: questionImage ?? undefined });
    onNext();
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-jaxtina-red" />
          <CardTitle>Enter the Question</CardTitle>
        </div>
        <CardDescription>Upload the question image/file or type it directly below.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop zone */}
        <div
          className={`relative rounded-xl border-2 border-dashed p-5 text-center transition-colors cursor-pointer ${
            dragging
              ? "border-jaxtina-blue bg-jaxtina-blue/5"
              : "border-border hover:border-jaxtina-grey"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept=".txt,.pdf,image/*"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />

          {/* Image preview inside drop zone */}
          {questionImage ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={questionImage}
                alt="Question"
                className="mx-auto max-h-48 rounded-lg object-contain border"
              />
              <button
                onClick={clearFile}
                className="absolute -top-2 -right-2 rounded-full bg-background border shadow p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="text-xs text-jaxtina-blue mt-2 font-medium flex items-center justify-center gap-1">
                <ImageIcon className="h-3.5 w-3.5" />
                {uploadedFileName} — image will appear in the question panel
              </p>
            </div>
          ) : uploadedFileName ? (
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-medium text-jaxtina-blue">{uploadedFileName}</span>
              <button onClick={clearFile} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Drag &amp; drop or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">Image, PDF, or .txt file</p>
            </>
          )}
        </div>

        <div className="text-center text-sm text-muted-foreground">— or type below —</div>

        <div className="space-y-1">
          <Label>Question Text *</Label>
          <Textarea
            value={question}
            onChange={(e) => { setQuestion(e.target.value); setError(""); }}
            placeholder={
              data.taskNumber === "1"
                ? "The chart below shows... Summarise the information..."
                : "Some people believe that... To what extent do you agree or disagree?"
            }
            className="min-h-[140px] font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground text-right">{question.length} characters</p>
        </div>

        {error && <p className="text-sm text-jaxtina-red">{error}</p>}

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Button onClick={handleNext} className="flex-1" size="lg">
            Continue to Writing →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
