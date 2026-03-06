import { createClient } from "@/lib/supabase/server";
import { PatientsTable } from "@/components/admin/PatientsTable";

export const dynamic = "force-dynamic";

export default async function PatientsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("users")
    .select("id, name, email, phone, created_at, appointments:appointments(id, status)")
    .eq("role", "patient")
    .order("created_at", { ascending: false });

  const patients = (data || []).map((p) => ({
    id: p.id as string,
    name: p.name as string,
    email: p.email as string,
    phone: (p.phone || "") as string,
    created_at: p.created_at as string,
    appointments: (p.appointments || []) as { id: string; status: string }[],
  }));

  return <PatientsTable patients={patients} />;
}
