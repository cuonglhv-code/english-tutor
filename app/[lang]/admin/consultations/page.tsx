import { requireAdmin } from "@/lib/admin-auth";
import ConsultationsClient from "./ConsultationsClient";

export const dynamic = "force-dynamic";

export default async function ConsultationsPage() {
  const auth = await requireAdmin();
  if (auth.error) {
    return (
      <div className="text-red-400 p-8">
        Access denied. Admin privileges required.
      </div>
    );
  }

  const { service } = auth;

  // Fetch first page of bookings
  const { data: initialBookings, count } = await service
    .from("consultation_bookings")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(0, 49);

  return (
    <ConsultationsClient
      initialBookings={initialBookings ?? []}
      initialTotal={count ?? 0}
    />
  );
}
