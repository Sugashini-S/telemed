import { createClient } from "@/lib/supabase/server";
import { PatientsTable } from "@/components/admin/PatientsTable";

export default async function PatientsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("users")
    .select("id, name, email, created_at, appointments:appointments(id, status)")
    .eq("role", "patient")
    .order("created_at", { ascending: false });

  const patients = (data || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    phone: "",
    created_at: p.created_at,
    appointments: p.appointments || [],
  }));

  return <PatientsTable patients={patients} />;
}
