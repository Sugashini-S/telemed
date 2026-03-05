import { createClient } from "@/lib/supabase/server";
import { Users, Stethoscope, Calendar } from "lucide-react";

export default async function ActivityPage() {
  const supabase = createClient();
  const [{ data: users }, { data: appointments }] = await Promise.all([
    supabase.from("users").select("id, name, email, role, created_at").order("created_at", { ascending: false }).limit(20),
    supabase.from("appointments").select("id, status, created_at").order("created_at", { ascending: false }).limit(20),
  ]);

  const events = [
    ...(users || []).map((u) => ({
      id: u.id,
      type: u.role === "doctor" ? "doctor_registered" : "patient_registered",
      name: u.name,
      detail: u.email,
      time: u.created_at,
    })),
    ...(appointments || []).map((a) => ({
      id: a.id,
      type: "appointment_booked",
      name: "Appointment",
      detail: `Status: ${a.status}`,
      time: a.created_at,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 30);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Activity Log</h2>
      <div className="space-y-4">
        {events.map((e, i) => (
          <div key={i} className="flex items-start gap-4 pb-4 border-b border-gray-50">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${e.type === "doctor_registered" ? "bg-blue-100" : e.type === "patient_registered" ? "bg-green-100" : "bg-purple-100"}`}>
              {e.type === "doctor_registered" && <Stethoscope className="w-4 h-4 text-blue-600" />}
              {e.type === "patient_registered" && <Users className="w-4 h-4 text-green-600" />}
              {e.type === "appointment_booked" && <Calendar className="w-4 h-4 text-purple-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700">
                {e.type === "doctor_registered" ? "Doctor Registered" : e.type === "patient_registered" ? "Patient Registered" : "Appointment Booked"}
              </p>
              <p className="text-sm text-gray-500">{e.name} - {e.detail}</p>
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">{new Date(e.time).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
