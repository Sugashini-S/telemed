"use client";
import { useState } from "react";
import { Search, Download, Trash2, Edit2, Check, X, CheckCircle, XCircle, Plus, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Doctor = {
  id: string; name: string; email: string; phone: string; created_at: string;
  doctors: { id: string; specialization: string; is_approved: boolean }[];
  appointments: { id: string; status: string }[];
};

const SPECIALIZATIONS = ["Cardiology","Dermatology","ENT","Endocrinology","Gastroenterology","General Medicine","Gynecology","Nephrology","Neurology","Oncology","Ophthalmology","Orthopedics","Pediatrics","Psychiatry","Pulmonology","Urology"];

export function DoctorsTable({ doctors: initial }: { doctors: Doctor[] }) {
  const [doctors, setDoctors] = useState(initial);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editSpec, setEditSpec] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addSpec, setAddSpec] = useState("General Medicine");
  const [addPassword, setAddPassword] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const router = useRouter();

  const filtered = doctors.filter((d) =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.email?.toLowerCase().includes(search.toLowerCase()) ||
    d.doctors?.[0]?.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  const addDoctor = async () => {
    if (!addName || !addEmail || !addPassword) { setAddError("Name, email and password are required"); return; }
    setAdding(true); setAddError("");
    try {
      const res = await fetch("/api/admin/create-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: addName, email: addEmail, phone: addPhone, specialization: addSpec, password: addPassword }),
      });
      const result = await res.json();
      if (!res.ok) { setAddError(result.error || "Failed to create doctor"); setAdding(false); return; }
      alert("Doctor created successfully!"); window.location.href = "/admin/doctors"; setShowAdd(false); setAddName(""); setAddEmail(""); setAddPhone(""); setAddPassword(""); setAddSpec("General Medicine");
      router.refresh();
    } catch (e) { setAddError("Something went wrong"); }
    setAdding(false);
  };

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
  };

  const deleteDoctor = async (id: string) => {
    const supabase = createClient();
    await supabase.from("appointments").delete().eq("doctor_id", id);
    await supabase.from("doctors").delete().eq("id", id);
    await supabase.from("users").delete().eq("id", id);
    setDoctors((prev) => prev.filter((d) => d.id !== id));
    setDeleteId(null);
  };

  const exportCSV = () => {
    const rows = doctors.map((d) => [d.name, d.email, d.phone || "-", d.doctors?.[0]?.specialization || "-", d.doctors?.[0]?.is_approved ? "Approved" : "Pending", d.appointments.length]);
    const csv = [["Name","Email","Phone","Specialization","Status","Appointments"], ...rows].map((r) => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "doctors.csv"; a.click();
  };

  const pendingCount = doctors.filter(d => !d.doctors?.[0]?.is_approved).length;
  const approvedCount = doctors.filter(d => d.doctors?.[0]?.is_approved).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-4"><p className="text-2xl font-bold text-blue-700">{doctors.length}</p><p className="text-sm text-blue-500">Total Doctors</p></div>
        <div className="bg-green-50 rounded-xl p-4"><p className="text-2xl font-bold text-green-700">{approvedCount}</p><p className="text-sm text-green-500">Approved</p></div>
        <div className="bg-orange-50 rounded-xl p-4"><p className="text-2xl font-bold text-orange-700">{pendingCount}</p><p className="text-sm text-orange-500">Pending Approval</p></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by name, email or specialization..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50"><Download className="w-4 h-4" />Export</button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"><UserPlus className="w-4 h-4" />Add Doctor</button>
        </div>

        {showAdd && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="font-semibold text-gray-800 text-lg">Add New Doctor</h3>
                <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                {addError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{addError}</p>}
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Full Name *</label><input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Dr. John Smith" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Email *</label><input value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="doctor@hospital.com" type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Password *</label><input value={addPassword} onChange={(e) => setAddPassword(e.target.value)} placeholder="Min 6 characters" type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Phone</label><input value={addPhone} onChange={(e) => setAddPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Specialization</label>
                  <select value={addSpec} onChange={(e) => setAddSpec(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t">
                <button onClick={() => setShowAdd(false)} className="flex-1 border border-gray-200 py-2 rounded-lg text-sm text-gray-600">Cancel</button>
                <button onClick={addDoctor} disabled={adding} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm disabled:opacity-50">{adding ? "Creating..." : "Create Doctor"}</button>
              </div>
            </div>
          </div>
        )}

        {deleteId && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full">
              <h3 className="font-semibold text-gray-800 mb-2">Delete Doctor?</h3>
              <p className="text-sm text-gray-500 mb-4">This will permanently delete the doctor and all their appointments.</p>
              <div className="flex gap-3">
                <button onClick={() => deleteDoctor(deleteId)} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm">Delete</button>
                <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left py-3 px-3 text-gray-500 font-medium rounded-l-lg">Doctor</th>
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Specialization</th>
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Status</th>
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Appts</th>
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Joined</th>
              <th className="text-left py-3 px-3 text-gray-500 font-medium rounded-r-lg">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-gray-400">No doctors found</td></tr>}
              {filtered.map((d) => {
                const isApproved = d.doctors?.[0]?.is_approved;
                return (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3">
                      {editId === d.id ? <input value={editName} onChange={(e) => setEditName(e.target.value)} className="border border-gray-200 rounded px-2 py-1 text-sm w-36" /> :
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">{d.name?.charAt(0).toUpperCase() || "U"}</div>
                        <div><p className="font-medium text-gray-800">{d.name}</p><p className="text-xs text-gray-400">{d.email}</p></div>
                      </div>}
                    </td>
                    <td className="py-3 px-3">{editId === d.id ? <select value={editSpec} onChange={(e) => setEditSpec(e.target.value)} className="border border-gray-200 rounded px-2 py-1 text-sm">{SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}</select> : <span className="text-gray-600">{d.doctors?.[0]?.specialization || "-"}</span>}</td>
                    <td className="py-3 px-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isApproved ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{isApproved ? "? Approved" : "? Pending"}</span></td>
                    <td className="py-3 px-3"><span className="font-semibold text-gray-700">{d.appointments.length}</span></td>
                    <td className="py-3 px-3 text-gray-400 text-xs">{new Date(d.created_at).toISOString().split("T")[0]}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        {editId === d.id ? (<>
                          <button onClick={() => saveEdit(d)} className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditId(null)} className="p-1.5 bg-gray-100 text-gray-600 rounded-lg"><X className="w-3.5 h-3.5" /></button>
                        </>) : (<>
                          {!isApproved && <button onClick={() => approveDoctor(d, true)} title="Approve" className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"><CheckCircle className="w-3.5 h-3.5" /></button>}
                          {isApproved && <button onClick={() => approveDoctor(d, false)} title="Revoke" className="p-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"><XCircle className="w-3.5 h-3.5" /></button>}
                          <button onClick={() => { setEditId(d.id); setEditName(d.name); setEditPhone(d.phone); setEditSpec(d.doctors?.[0]?.specialization || ""); }} className="p-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteId(d.id)} className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"><Trash2 className="w-3.5 h-3.5" /></button>
                        </>)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


