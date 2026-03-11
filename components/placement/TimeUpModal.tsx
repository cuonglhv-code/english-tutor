"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlarmClock } from "lucide-react";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

interface Props {
  open: boolean;
  lang: Lang;
  onContinue: () => void;
}

export function TimeUpModal({ open, lang, onContinue }: Props) {
  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-sm text-center"
        onPointerDownOutside={(e) => e.preventDefault()} // prevent closing by clicking outside
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <AlarmClock className="h-12 w-12 text-red-500" />
          </div>
          <DialogTitle className="text-red-600 text-xl">
            {t("placement", "timeUp", lang)}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {t("placement", "timeUpBody", lang)}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="justify-center">
          <Button onClick={onContinue} className="w-full">
            {t("placement", "timeUpBtn", lang)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
