import { createClient } from "@/lib/supabase/server";

export default async function AppointmentsPage() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("appointments")
    .select("id, status, appointment_date, appointment_time, patient_id, doctor_id")
    .order("appointment_date", { ascending: false });

  const appointments = await Promise.all(
    (data || []).map(async (a) => {
      const [{ data: patient }, { data: doctor }] = await Promise.all([
        supabase.from("users").select("name, email").eq("id", a.patient_id).single(),
        supabase.from("doctors").select("specialization").eq("id", a.doctor_id).single(),
      ]);
      const { data: docUser } = await supabase.from("users").select("name").eq("id", a.doctor_id).single();
      return {
        id: a.id,
        status: a.status,
        appointment_date: a.appointment_date,
        appointment_time: a.appointment_time,
        patientName: patient?.name || "Unknown",
        patientEmail: patient?.email || "-",
        doctorName: docUser?.name || "Unknown",
        specialization: doctor?.specialization || "-",
      };
    })
  );

  const statusColor = (s: string) => {
    if (s === "completed") return "bg-green-100 text-green-700";
    if (s === "cancelled") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">All Appointments</h2>
        <span className="text-sm text-gray-500">{appointments.length} total</span>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          Error: {error.message}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-2 text-gray-500 font-medium">Patient</th>
              <th className="text-left py-3 px-2 text-gray-500 font-medium">Doctor</th>
              <th className="text-left py-3 px-2 text-gray-500 font-medium">Specialization</th>
              <th className="text-left py-3 px-2 text-gray-500 font-medium">Date</th>
              <th className="text-left py-3 px-2 text-gray-500 font-medium">Time</th>
              <th className="text-left py-3 px-2 text-gray-500 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No appointments found</td></tr>
            )}
            {appointments.map((a) => (
              <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-2">
                  <p className="font-medium text-gray-700">{a.patientName}</p>
                  <p className="text-xs text-gray-400">{a.patientEmail}</p>
                </td>
                <td className="py-3 px-2 text-gray-600">{a.doctorName}</td>
                <td className="py-3 px-2 text-gray-500">{a.specialization}</td>
                <td className="py-3 px-2 text-gray-500">{a.appointment_date}</td>
                <td className="py-3 px-2 text-gray-500">{a.appointment_time}</td>
                <td className="py-3 px-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(a.status)}`}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
