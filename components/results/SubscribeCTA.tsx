"use client";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, Mail, MessageSquare, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  email: string;
  name: string;
  mobile: string;
}

export function SubscribeCTA({ email, name, mobile }: Props) {
  const [open, setOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const already = sessionStorage.getItem("ielts_subscribed");
    if (!already) {
      const timer = setTimeout(() => setOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubscribe = async () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#D32F2F", "#1976D2", "#FFFFFF"],
    });
    sessionStorage.setItem("ielts_subscribed", "true");
    setSubscribed(true);

    try {
      await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _action: "subscribe", email, name, mobile, subscribed: true }),
      });
    } catch {}

    toast.success("You are subscribed! Watch for weekly tips in your inbox.");
    setTimeout(() => setOpen(false), 2500);
  };

  const handleDecline = () => {
    sessionStorage.setItem("ielts_subscribed", "no");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-jaxtina-red/10">
            <Bell className="h-6 w-6 text-jaxtina-red" />
          </div>
          <DialogTitle className="text-center text-xl">
            {subscribed ? "You are subscribed!" : "Get Weekly IELTS Tips"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {subscribed
              ? "Check your email for a welcome message from Jaxtina."
              : `Hi ${name || "there"}! Want free weekly writing tips and band-boosting strategies sent directly to you?`}
          </DialogDescription>
        </DialogHeader>

        {!subscribed && (
          <>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-jaxtina-blue" />
                <span>{email || "Your email"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-jaxtina-blue" />
                <span>{mobile || "Your mobile"} (SMS alerts)</span>
              </div>
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button onClick={handleSubscribe} className="w-full" size="lg">
                Yes, send me weekly tips!
              </Button>
              <Button variant="ghost" onClick={handleDecline} className="w-full text-muted-foreground">
                <X className="h-3.5 w-3.5 mr-1" /> No thanks
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
