import { Suspense } from "react";
import TutorSessionClient from "./TutorSessionClient";

export default function TutorSessionPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading…</div>}>
      <TutorSessionClient />
    </Suspense>
  );
}
