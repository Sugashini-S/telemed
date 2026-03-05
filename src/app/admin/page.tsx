import { createClient } from "@/lib/supabase/server";
import { Users, Stethoscope, Calendar, Clock } from "lucide-react";

async function getStats() {
  const supabase = createClient();
  const [
    { count: totalPatients },
    { count: totalDoctors },
    { count: totalAppointments },
    { count: pendingApprovals },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "patient"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "doctor"),
    supabase.from("appointments").select("*", { count: "exact", head: true }),
    supabase.from("doctors").select("*", { count: "exact", head: true }).eq("is_approved", false),
  ]);
  return { totalPatients, totalDoctors, totalAppointments, pendingApprovals };
}

async function getSpecializations() {
  const supabase = createClient();
  const { data } = await supabase.from("doctors").select("specialization");
  if (!data) return [];
  const map: Record<string, number> = {};
  data.forEach((d) => { if (d.specialization) map[d.specialization] = (map[d.specialization] || 0) + 1; });
  return Object.entries(map).map(([name, count]) => ({ name, count }));
}

async function getRecentRegistrations() {
  const supabase = createClient();
  const [{ data: patients }, { data: doctors }] = await Promise.all([
    supabase.from("users").select("id, name, email, created_at").eq("role", "patient").order("created_at", { ascending: false }).limit(5),
    supabase.from("users").select("id, name, email, created_at").eq("role", "doctor").order("created_at", { ascending: false }).limit(5),
  ]);
  return { patients: patients || [], doctors: doctors || [] };
}

export default async function AdminDashboard() {
  const [stats, specializations, recent] = await Promise.all([
    getStats(), getSpecializations(), getRecentRegistrations(),
  ]);

  const statCards = [
    { label: "Total Patients", value: stats.totalPatients ?? 0, icon: Users, color: "bg-blue-500" },
    { label: "Total Doctors", value: stats.totalDoctors ?? 0, icon: Stethoscope, color: "bg-green-500" },
    { label: "Total Appointments", value: stats.totalAppointments ?? 0, icon: Calendar, color: "bg-purple-500" },
    { label: "Pending Approvals", value: stats.pendingApprovals ?? 0, icon: Clock, color: "bg-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
            <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center`}><Icon className="w-6 h-6 text-white" /></div>
            <div><p className="text-2xl font-bold text-gray-800">{value}</p><p className="text-sm text-gray-500">{label}</p></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Specializations</h2>
          <div className="space-y-3">
            {specializations.length === 0 && <p className="text-sm text-gray-400">No data yet</p>}
            {specializations.map(({ name, count }) => (
              <div key={name} className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">{name}</span>
                <span className="text-sm font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Recent Patients</h2>
          <div className="space-y-3">
            {recent.patients.map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">{u.name?.charAt(0).toUpperCase() ?? "?"}</div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-700 truncate">{u.name}</p><p className="text-xs text-gray-400 truncate">{u.email}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
