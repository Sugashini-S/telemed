import { createClient } from "@/lib/supabase/server";
import { DoctorsTable } from "@/components/admin/DoctorsTable";

export default async function DoctorsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("users")
    .select("id, name, email, phone, created_at, doctors:doctors(id, specialization, is_approved), appointments:appointments(id, status)")
    .eq("role", "doctor")
    .order("created_at", { ascending: false });
  const doctors = data || [];
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">All Doctors</h2>
        <span className="text-sm text-gray-500">{doctors.length} total</span>
      </div>
      <DoctorsTable doctors={doctors} />
    </div>
  );
}
