"use client";

import { useState } from "react";
import { Loader2, X, CheckCircle2, CalendarDays, Clock, MapPin, User, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JAXTINA_CENTERS, TIME_SLOTS } from "@/lib/consultationConstants";

interface Props {
  open: boolean;
  onClose: () => void;
  sourceContext?: string;
  defaultName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
  defaultCenter?: string;
}

interface BookingSummary {
  id: string;
  studentName: string;
  phone: string;
  email: string;
  centerName: string;
  preferredDate: string;
  preferredTime: string;
}

function getTodayISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function ConsultationModal({
  open,
  onClose,
  sourceContext = "main_button",
  defaultName = "",
  defaultEmail = "",
  defaultPhone = "",
  defaultCenter = "",
}: Props) {
  const today = getTodayISO();

  const [studentName, setStudentName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [email, setEmail] = useState(defaultEmail);
  const [centerName, setCenterName] = useState(defaultCenter);
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [consentContacted, setConsentContacted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<BookingSummary | null>(null);

  const resetForm = () => {
    setStudentName(defaultName);
    setPhone(defaultPhone);
    setEmail(defaultEmail);
    setCenterName(defaultCenter);
    setPreferredDate("");
    setPreferredTime("");
    setConsentContacted(false);
    setSuccess(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = (): string | null => {
    if (!studentName.trim()) return "Please enter your full name.";
    if (!phone.trim()) return "Please enter your phone number.";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Please enter a valid email address.";
    if (!centerName) return "Please select your nearest Jaxtina center.";
    if (!preferredDate) return "Please select a preferred date.";
    if (preferredDate < today) return "Please select today or a future date.";
    if (!preferredTime) return "Please select a preferred time slot.";
    if (!consentContacted)
      return "Please agree to be contacted by Jaxtina IELTS advisors.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: studentName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          centerName,
          preferredDate,
          preferredTime,
          sourceContext,
          consentContacted,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          toast.error("You already have a booking for this date and time slot.");
        } else {
          toast.error(data?.error ?? "Failed to submit booking. Please try again.");
        }
        return;
      }

      setSuccess({
        id: data.id,
        studentName: studentName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        centerName,
        preferredDate,
        preferredTime,
      });
    } catch (err) {
      console.error("[ConsultationModal] submit error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Custom close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1 opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {success ? (
          /* ── Success screen ────────────────────────────────────────────── */
          <div className="space-y-5 pt-2">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-xl text-green-700">Booking Confirmed!</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                We&apos;ll call you at <strong>{success.preferredTime}</strong> on{" "}
                <strong>{success.preferredDate}</strong>.
              </p>
              <p className="text-xs text-muted-foreground">
                Tư vấn viên sẽ gọi cho bạn vào lúc{" "}
                <strong>{success.preferredTime}</strong> ngày{" "}
                <strong>{success.preferredDate}</strong>.
              </p>
            </div>

            <div className="bg-muted/40 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <span>{success.studentName}</span>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <span>{success.phone}</span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <span>{success.email}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <span>{success.centerName}</span>
              </div>
              <div className="flex items-start gap-2">
                <CalendarDays className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <span>{success.preferredDate}</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <span>{success.preferredTime}</span>
              </div>
            </div>

            <Button className="w-full" onClick={handleClose}>
              Close
            </Button>
          </div>
        ) : (
          /* ── Booking form ──────────────────────────────────────────────── */
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader className="pr-6">
              <DialogTitle className="text-xl">Book a Free Consultation</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Fill in your details and an IELTS advisor will call you at your chosen time.
              </p>
            </DialogHeader>

            {/* Full name */}
            <div className="space-y-1.5">
              <Label htmlFor="cb-name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cb-name"
                placeholder="Nguyen Van A"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="cb-phone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cb-phone"
                type="tel"
                placeholder="0901 234 567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="cb-email">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cb-email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            {/* Center */}
            <div className="space-y-1.5">
              <Label htmlFor="cb-center">
                Nearest Jaxtina Center <span className="text-destructive">*</span>
              </Label>
              <select
                id="cb-center"
                value={centerName}
                onChange={(e) => setCenterName(e.target.value)}
                disabled={submitting}
                required
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
              >
                <option value="" disabled>Select your nearest center</option>
                {JAXTINA_CENTERS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label htmlFor="cb-date">
                Preferred Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cb-date"
                type="date"
                min={today}
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            {/* Time slot */}
            <div className="space-y-1.5">
              <Label htmlFor="cb-time">
                Preferred Time Slot <span className="text-destructive">*</span>
              </Label>
              <select
                id="cb-time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                disabled={submitting}
                required
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
              >
                <option value="" disabled>Select a time slot</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>

            {/* Consent */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="cb-consent"
                type="checkbox"
                checked={consentContacted}
                onChange={(e) => setConsentContacted(e.target.checked)}
                disabled={submitting}
                className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
                required
              />
              <label htmlFor="cb-consent" className="text-sm leading-snug text-muted-foreground cursor-pointer">
                I agree to be contacted by Jaxtina IELTS advisors via the phone number provided.{" "}
                <span className="text-destructive">*</span>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting…
                </>
              ) : (
                "Book Free Consultation"
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleClose}
                className="text-xs text-muted-foreground underline-offset-2 hover:underline"
              >
                Skip for now
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
