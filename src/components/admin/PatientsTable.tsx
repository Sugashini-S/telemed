"use client";
import { useState } from "react";
import { Search, Download, Trash2, Edit2, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Patient = {
  id: string; name: string; email: string; phone: string; created_at: string;
  appointments: { id: string; status: string }[];
};

export function PatientsTable({ patients: initial }: { patients: Patient[] }) {
  const [patients, setPatients] = useState(initial);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();

  const filtered = patients.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const saveEdit = async (id: string) => {
    const supabase = createClient();
    await supabase.from("users").update({ name: editName, phone: editPhone }).eq("id", id);
    setPatients((prev) => prev.map((p) => p.id === id ? { ...p, name: editName, phone: editPhone } : p));
    setEditId(null);
    router.refresh();
  };

  const deletePatient = async (id: string) => {
    const supabase = createClient();
    await supabase.from("appointments").delete().eq("patient_id", id);
    await supabase.from("users").delete().eq("id", id);
    setPatients((prev) => prev.filter((p) => p.id !== id));
    setDeleteId(null);
    router.refresh();
  };

  const exportCSV = () => {
    const rows = patients.map((p) => [p.name, p.email, p.phone || "-", new Date(p.created_at).toLocaleDateString(), p.appointments.length, p.appointments.filter((a) => a.status === "pending").length, p.appointments.filter((a) => a.status === "completed").length]);
    const csv = [["Name","Email","Phone","Registered","Total","Pending","Completed"], ...rows].map((r) => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "patients.csv"; a.click();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"><Download className="w-4 h-4" />Export CSV</button>
      </div>
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full mx-4">
            <h3 className="font-semibold text-gray-800 mb-2">Delete Patient?</h3>
            <p className="text-sm text-gray-500 mb-4">This will delete the patient and all their appointments.</p>
            <div className="flex gap-3">
              <button onClick={() => deletePatient(deleteId)} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm">Delete</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100">
            <th className="text-left py-3 px-2 text-gray-500 font-medium">Name</th>
            <th className="text-left py-3 px-2 text-gray-500 font-medium">Email</th>
            <th className="text-left py-3 px-2 text-gray-500 font-medium">Phone</th>
            <th className="text-left py-3 px-2 text-gray-500 font-medium">Registered</th>
            <th className="text-left py-3 px-2 text-gray-500 font-medium">Total</th>
            <th className="text-left py-3 px-2 text-gray-500 font-medium">Pending</th>
            <th className="text-left py-3 px-2 text-gray-500 font-medium">Completed</th>
            <th className="text-left py-3 px-2 text-gray-500 font-medium">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-gray-400">No patients found</td></tr>}
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-2">{editId === p.id ? <input value={editName} onChange={(e) => setEditName(e.target.value)} className="border border-gray-200 rounded px-2 py-1 text-sm w-32" /> : <div className="flex items-center gap-2"><div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs">{p.name?.charAt(0).toUpperCase()}</div><span className="font-medium text-gray-700">{p.name}</span></div>}</td>
                <td className="py-3 px-2 text-gray-500">{p.email}</td>
                <td className="py-3 px-2">{editId === p.id ? <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="border border-gray-200 rounded px-2 py-1 text-sm w-28" /> : <span className="text-gray-500">{p.phone || "-"}</span>}</td>
                <td className="py-3 px-2 text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="py-3 px-2 text-center font-medium">{p.appointments.length}</td>
                <td className="py-3 px-2"><span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">{p.appointments.filter((a) => a.status === "pending").length}</span></td>
                <td className="py-3 px-2"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">{p.appointments.filter((a) => a.status === "completed").length}</span></td>
                <td className="py-3 px-2"><div className="flex items-center gap-1">
                  {editId === p.id ? (<><button onClick={() => saveEdit(p.id)} className="p-1.5 bg-green-100 text-green-700 rounded"><Check className="w-3.5 h-3.5" /></button><button onClick={() => setEditId(null)} className="p-1.5 bg-gray-100 text-gray-600 rounded"><X className="w-3.5 h-3.5" /></button></>) : (<><button onClick={() => { setEditId(p.id); setEditName(p.name); setEditPhone(p.phone); }} className="p-1.5 bg-blue-100 text-blue-700 rounded"><Edit2 className="w-3.5 h-3.5" /></button><button onClick={() => setDeleteId(p.id)} className="p-1.5 bg-red-100 text-red-700 rounded"><Trash2 className="w-3.5 h-3.5" /></button></>)}
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
