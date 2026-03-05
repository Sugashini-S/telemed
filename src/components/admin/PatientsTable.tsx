"use client";
import { useState } from "react";
import { Search, Download, Trash2, Edit2, Check, X, UserPlus } from "lucide-react";
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
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const router = useRouter();

  const filtered = patients.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const addPatient = async () => {
    if (!addName || !addEmail || !addPassword) { setAddError("Name, email and password are required"); return; }
    setAdding(true); setAddError("");
    try {
      const res = await fetch("/api/admin/create-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: addName, email: addEmail, phone: addPhone, password: addPassword }),
      });
      const result = await res.json();
      if (!res.ok) { setAddError(result.error || "Failed to create patient"); setAdding(false); return; }
      setShowAdd(false); setAddName(""); setAddEmail(""); setAddPhone(""); setAddPassword("");
      router.refresh();
    } catch (e) { setAddError("Something went wrong"); }
    setAdding(false);
  };

  const saveEdit = async (id: string) => {
    const supabase = createClient();
    await supabase.from("users").update({ name: editName, phone: editPhone }).eq("id", id);
    setPatients((prev) => prev.map((p) => p.id === id ? { ...p, name: editName, phone: editPhone } : p));
    setEditId(null); router.refresh();
  };

  const deletePatient = async (id: string) => {
    const supabase = createClient();
    await supabase.from("appointments").delete().eq("patient_id", id);
    await supabase.from("users").delete().eq("id", id);
    setPatients((prev) => prev.filter((p) => p.id !== id));
    setDeleteId(null);
  };

  const exportCSV = () => {
    const rows = patients.map((p) => [p.name, p.email, p.phone || "-", new Date(p.created_at).toLocaleDateString(), p.appointments.length, p.appointments.filter((a) => a.status === "pending").length, p.appointments.filter((a) => a.status === "completed").length]);
    const csv = [["Name","Email","Phone","Registered","Total","Pending","Completed"], ...rows].map((r) => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "patients.csv"; a.click();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-4"><p className="text-2xl font-bold text-blue-700">{patients.length}</p><p className="text-sm text-blue-500">Total Patients</p></div>
        <div className="bg-yellow-50 rounded-xl p-4"><p className="text-2xl font-bold text-yellow-700">{patients.reduce((a,p)=>a+p.appointments.filter(x=>x.status==="pending").length,0)}</p><p className="text-sm text-yellow-500">Pending Appts</p></div>
        <div className="bg-green-50 rounded-xl p-4"><p className="text-2xl font-bold text-green-700">{patients.reduce((a,p)=>a+p.appointments.filter(x=>x.status==="completed").length,0)}</p><p className="text-sm text-green-500">Completed Appts</p></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50"><Download className="w-4 h-4" />Export</button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"><UserPlus className="w-4 h-4" />Add Patient</button>
        </div>

        {showAdd && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="font-semibold text-gray-800 text-lg">Add New Patient</h3>
                <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                {addError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{addError}</p>}
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Full Name *</label><input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Patient name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Email *</label><input value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="patient@email.com" type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Password *</label><input value={addPassword} onChange={(e) => setAddPassword(e.target.value)} placeholder="Min 6 characters" type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Phone</label><input value={addPhone} onChange={(e) => setAddPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
              </div>
              <div className="flex gap-3 p-6 border-t">
                <button onClick={() => setShowAdd(false)} className="flex-1 border border-gray-200 py-2 rounded-lg text-sm text-gray-600">Cancel</button>
                <button onClick={addPatient} disabled={adding} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm disabled:opacity-50">{adding ? "Creating..." : "Create Patient"}</button>
              </div>
            </div>
          </div>
        )}

        {deleteId && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full">
              <h3 className="font-semibold text-gray-800 mb-2">Delete Patient?</h3>
              <p className="text-sm text-gray-500 mb-4">This will permanently delete the patient and all their appointments.</p>
              <div className="flex gap-3">
                <button onClick={() => deletePatient(deleteId)} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm">Delete</button>
                <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Patient</th>
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Phone</th>
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Registered</th>
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Total</th>
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Pending</th>
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Completed</th>
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-gray-400">No patients found</td></tr>}
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-3">
                    {editId === p.id ? <input value={editName} onChange={(e) => setEditName(e.target.value)} className="border border-gray-200 rounded px-2 py-1 text-sm w-36" /> :
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm flex-shrink-0">{p.name?.charAt(0).toUpperCase() || "?"}</div>
                      <div><p className="font-medium text-gray-800">{p.name}</p><p className="text-xs text-gray-400">{p.email}</p></div>
                    </div>}
                  </td>
                  <td className="py-3 px-3">{editId === p.id ? <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="border border-gray-200 rounded px-2 py-1 text-sm w-28" /> : <span className="text-gray-500">{p.phone || "-"}</span>}</td>
                  <td className="py-3 px-3 text-gray-400 text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-3 font-semibold text-gray-700">{p.appointments.length}</td>
                  <td className="py-3 px-3"><span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">{p.appointments.filter((a) => a.status === "pending").length}</span></td>
                  <td className="py-3 px-3"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">{p.appointments.filter((a) => a.status === "completed").length}</span></td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      {editId === p.id ? (<>
                        <button onClick={() => saveEdit(p.id)} className="p-1.5 bg-green-100 text-green-700 rounded-lg"><Check className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setEditId(null)} className="p-1.5 bg-gray-100 text-gray-600 rounded-lg"><X className="w-3.5 h-3.5" /></button>
                      </>) : (<>
                        <button onClick={() => { setEditId(p.id); setEditName(p.name); setEditPhone(p.phone); }} className="p-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteId(p.id)} className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"><Trash2 className="w-3.5 h-3.5" /></button>
                      </>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
