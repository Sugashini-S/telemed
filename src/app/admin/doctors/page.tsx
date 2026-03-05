import { createClient } from "@/lib/supabase/server";
import { DoctorsTable } from "@/components/admin/DoctorsTable";

export default async function DoctorsPage() {
  const supabase = createClient();
  const { data: doctorRecords } = await supabase
    .from("doctors")
    .select("id, specialization, is_approved, created_at");

  const doctors = await Promise.all(
    (doctorRecords || []).map(async (d) => {
      const { data: user } = await supabase
        .from("users").select("id, name, email, phone").eq("id", d.id).single();
      const { data: appts } = await supabase
        .from("appointments").select("id, status").eq("doctor_id", d.id);
      return {
        id: d.id,
        name: user?.name || "Unknown",
        email: user?.email || "-",
        phone: user?.phone || "-",
        created_at: d.created_at,
        doctors: [{ id: d.id, specialization: d.specialization, is_approved: d.is_approved }],
        appointments: appts || [],
      };
    })
  );

  return <DoctorsTable doctors={doctors} />;
}
