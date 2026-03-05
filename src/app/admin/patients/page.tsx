import { createClient } from "@/lib/supabase/server";
import { PatientsTable } from "@/components/admin/PatientsTable";

export default async function PatientsPage() {
  const supabase = createClient();
  
  const { data: patientUsers } = await supabase
    .from("users")
    .select("id, name, email, phone, created_at")
    .eq("role", "patient")
    .order("created_at", { ascending: false });

  const patients = await Promise.all(
    (patientUsers || []).map(async (u) => {
      const { data: appts } = await supabase
        .from("appointments")
        .select("id, status")
        .eq("patient_id", u.id);
      return { ...u, appointments: appts || [] };
    })
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">All Patients</h2>
        <span className="text-sm text-gray-500">{patients.length} total</span>
      </div>
      <PatientsTable patients={patients} />
    </div>
  );
}
