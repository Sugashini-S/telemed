import { createClient } from "@/lib/supabase/server";
import { PatientsTable } from "@/components/admin/PatientsTable";

export default async function PatientsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("users")
    .select("id, name, email, phone, created_at, appointments:appointments(id, status)")
    .eq("role", "patient")
    .order("created_at", { ascending: false });
  const patients = data || [];
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
