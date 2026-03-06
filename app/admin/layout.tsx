import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase-server";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    // Server-side admin verification
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const service = createServiceClient();
    const { data: profile } = await service
        .from("profiles")
        .select("role, full_name, display_name, email")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "admin") {
        redirect("/dashboard");
    }

    const adminName = profile.full_name || profile.display_name || profile.email || "Admin";

    return <AdminShell adminName={adminName}>{children}</AdminShell>;
}
