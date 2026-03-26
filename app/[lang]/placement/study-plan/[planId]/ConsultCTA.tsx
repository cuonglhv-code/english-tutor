"use client";

import { useState } from "react";
import ConsultationModal from "@/components/consultation/ConsultationModal";

interface Props {
  defaultName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
  defaultCenter?: string;
}

export default function ConsultCTA({
  defaultName = "",
  defaultEmail = "",
  defaultPhone = "",
  defaultCenter = "",
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-indigo-700 transition-colors"
      >
        Book a Free Consultation
      </button>

      <ConsultationModal
        open={open}
        onClose={() => setOpen(false)}
        sourceContext="study_plan"
        defaultName={defaultName}
        defaultEmail={defaultEmail}
        defaultPhone={defaultPhone}
        defaultCenter={defaultCenter}
      />
    </>
  );
}
