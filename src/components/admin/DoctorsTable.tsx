"use client";
import { useState } from "react";
import { Search, Download, Trash2, Edit2, Check, X, CheckCircle, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Doctor = {
  id: string; name: string; email: string; phone: string; created_at: string;
  doctors: { id: string; specialization: string; is_approved: boolean }[];
  appointments: { id: string; status: string }[];
};

export function DoctorsTable({ doctors: initial }: { doctors: Doctor[] }) {
  const [doctors, setDoctors] = useState(initial);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editSpec, setEditSpec] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();

  const filtered = doctors.filter((d) =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.email?.toLowerCase().includes(search.toLowerCase()) ||
    d.doctors?.[0]?.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  const saveEdit = async (d: Doctor) => {
    const supabase = createClient();
    await supabase.from("users").update({ name: editName, phone: editPhone }).eq("id", d.id);
    if (d.doctors?.[0]?.id) await supabase.from("doctors").update({ specialization: editSpec }).eq("id", d.doctors[0].id);
    setDoctors((prev) => prev.map((doc) => doc.id === d.id ? { ...doc, name: editName, phone: editPhone, doctors: [{ ...doc.doctors[0], specialization: editSpec }] } : doc));
    setEditId(null); router.refresh();
  };

  const approveDoctor = async (d: Doctor, approve: boolean) => {
    const supabase = createClient();
    if (d.doctors?.[0]?.id) {
      await supabase.from("doctors").update({ is_approved: approve }).eq("id", d.doctors[0].id);
      setDoctors((prev) => prev.map((doc) => doc.id === d.id ? { ...doc, doctors: [{ ...doc.doctors[0], is_approved: approve }] } : doc));
    }
    router.refresh();
  };

  const deleteDoctor = async (id: string) => {
    const supabase = createClient();
    await supabase.from("appointments").delete().eq("doctor_id", id);
    await supabase.from("doctors").delete().eq("user_id", id);
    await supabase.from("users").delete().eq("id", id);
    setDoctors((prev) => prev.filter((d) => d.id !== id));
    setDeleteId(null); router.refresh();
  };

  const exportCSV = () => {
    const rows = doctors.map((d) => [d.name, d.email, d.phone || "-", d.doctors?.[0]?.specialization || "-", d.doctors?.[0]?.is_approved ? "Approved" : "Pending", new Date(d.created_at).toLocaleDateString(), d.appointments.length]);
    const csv = [["Name","Email","Phone","Specialization","Status","Registered","Appointments"], ...rows].map((r) => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "doctors.csv"; a.click();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by name, email or specialization..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"><Download className="w-4 h-4" />Export CSV</button>
      </div>
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full mx-4">
            <h3 className="font-semibold text-gray-800 mb-2">Delete Doctor?</h3>
            <p className="text-sm text-gray-500 mb-4">This will delete the doctor and all their appointments.</p>
            <div className="flex gap-3">
              <button onClick={() => deleteDoctor(deleteId)} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm">Delete</button>
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
            <th className="text-left py-3 px-2 text-gray-500 font-medium">Specialization</th>
            <th className="text-left py-3 px-2 text-gray-500 font-medium">Status</th>
            <th className="text-left py-3 px-2 text-gray-500 font-medium">Appts</th>
            <th className="text-left py-3 px-2 text-gray-500 font-medium">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-400">No doctors found</td></tr>}
            {filtered.map((d) => {
              const isApproved = d.doctors?.[0]?.is_approved;
              return (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-2">{editId === d.id ? <input value={editName} onChange={(e) => setEditName(e.target.value)} className="border border-gray-200 rounded px-2 py-1 text-sm w-32" /> : <div className="flex items-center gap-2"><div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">{d.name?.charAt(0).toUpperCase()}</div><span className="font-medium text-gray-700">{d.name}</span></div>}</td>
                  <td className="py-3 px-2 text-gray-500">{d.email}</td>
                  <td className="py-3 px-2">{editId === d.id ? <input value={editSpec} onChange={(e) => setEditSpec(e.target.value)} className="border border-gray-200 rounded px-2 py-1 text-sm w-32" /> : <span className="text-gray-600">{d.doctors?.[0]?.specialization || "-"}</span>}</td>
                  <td className="py-3 px-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isApproved ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{isApproved ? "Approved" : "Pending"}</span></td>
                  <td className="py-3 px-2 text-center font-medium">{d.appointments.length}</td>
                  <td className="py-3 px-2"><div className="flex items-center gap-1">
                    {editId === d.id ? (<><button onClick={() => saveEdit(d)} className="p-1.5 bg-green-100 text-green-700 rounded"><Check className="w-3.5 h-3.5" /></button><button onClick={() => setEditId(null)} className="p-1.5 bg-gray-100 text-gray-600 rounded"><X className="w-3.5 h-3.5" /></button></>) : (<>{!isApproved && <button onClick={() => approveDoctor(d, true)} className="p-1.5 bg-green-100 text-green-700 rounded"><CheckCircle className="w-3.5 h-3.5" /></button>}{isApproved && <button onClick={() => approveDoctor(d, false)} className="p-1.5 bg-orange-100 text-orange-700 rounded"><XCircle className="w-3.5 h-3.5" /></button>}<button onClick={() => { setEditId(d.id); setEditName(d.name); setEditPhone(d.phone); setEditSpec(d.doctors?.[0]?.specialization || ""); }} className="p-1.5 bg-blue-100 text-blue-700 rounded"><Edit2 className="w-3.5 h-3.5" /></button><button onClick={() => setDeleteId(d.id)} className="p-1.5 bg-red-100 text-red-700 rounded"><Trash2 className="w-3.5 h-3.5" /></button></>)}
                  </div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
