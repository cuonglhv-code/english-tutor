import { Suspense } from "react";
import { LoginPageContent } from "@/components/auth/LoginPageContent";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-jaxtina-red" />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
