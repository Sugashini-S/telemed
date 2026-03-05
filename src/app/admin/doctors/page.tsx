import { createClient } from "@/lib/supabase/server";
import { DoctorsTable } from "@/components/admin/DoctorsTable";

export default async function DoctorsPage() {
  const supabase = createClient();
  const { data: doctorsRaw } = await supabase
    .from("doctors")
    .select("id, specialization, is_approved, created_at")
    .order("created_at", { ascending: false });

  const doctors = await Promise.all(
    (doctorsRaw || []).map(async (d: any) => {
      const { data: u } = await supabase.from("users").select("name, email").eq("id", d.id).single();
      const { data: appts } = await supabase.from("appointments").select("id, status").eq("doctor_id", d.id);
      return {
        id: d.id,
        name: u?.name || "Unknown",
        email: u?.email || "-",
        phone: "",
        created_at: d.created_at,
        doctors: [{ id: d.id, specialization: d.specialization, is_approved: d.is_approved }],
        appointments: appts || [],
      };
    })
  );

  return <DoctorsTable doctors={doctors} />;
}
