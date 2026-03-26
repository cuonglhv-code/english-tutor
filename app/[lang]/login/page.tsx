import { Suspense } from "react";
import { LoginPageContent } from "@/components/auth/LoginPageContent";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
