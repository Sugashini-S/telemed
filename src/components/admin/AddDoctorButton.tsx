"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const SPECIALIZATIONS = ["General Practice","Cardiology","Dermatology","Pediatrics","Orthopedics","Neurology","Gynecology","Psychiatry","Ophthalmology","ENT","Dentistry","Radiology","Other"];

export function AddDoctorButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", password:"", specialization:"" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name, role: "doctor" } }
    });

    if (authError || !authData.user) {
      setError(authError?.message || "Failed to create user");
      setLoading(false);
      return;
    }

    const userId = authData.user.id;

    const { error: userError } = await supabase.from("users").insert({
      id: userId,
      name: form.name,
      email: form.email,
      role: "doctor",
    });

    if (userError) {
      setError("User profile failed: " + userError.message);
      setLoading(false);
      return;
    }

    const { error: docError } = await supabase.from("doctors").insert({
      id: userId,
      specialization: form.specialization,
      is_approved: true,
    });

    if (docError) {
      setError("Doctor record failed: " + docError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => {
      setOpen(false);
      setSuccess(false);
      setForm({ name:"", email:"", password:"", specialization:"" });
      router.refresh();
    }, 1500);
  };

  return (
    <>
      <button onClick={() => setOpen(true)}
        style={{display:"flex",alignItems:"center",gap:"6px",padding:"8px 16px",background:"#16a34a",color:"white",border:"none",borderRadius:"8px",fontSize:"14px",fontWeight:"600",cursor:"pointer"}}>
        + Add Doctor
      </button>

      {open && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}>
          <div style={{background:"white",borderRadius:"16px",width:"100%",maxWidth:"460px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"24px 24px 16px",borderBottom:"1px solid #e5e7eb"}}>
              <h3 style={{margin:0,fontSize:"18px",fontWeight:"600"}}>Add New Doctor</h3>
              <button onClick={() => setOpen(false)} style={{background:"none",border:"none",fontSize:"24px",cursor:"pointer",color:"#6b7280",lineHeight:1}}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={{padding:"24px",display:"flex",flexDirection:"column",gap:"16px"}}>
              {error && <div style={{padding:"12px",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:"8px",color:"#dc2626",fontSize:"14px"}}>{error}</div>}
              {success && <div style={{padding:"12px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:"8px",color:"#16a34a",fontSize:"14px"}}>✅ Doctor added successfully!</div>}

              <div>
                <label style={{display:"block",fontSize:"13px",fontWeight:"500",color:"#374151",marginBottom:"4px"}}>Full Name *</label>
                <input name="name" value={form.name} onChange={handleChange} required placeholder="Dr. John Smith"
                  style={{width:"100%",padding:"10px 12px",border:"1px solid #d1d5db",borderRadius:"8px",fontSize:"14px",boxSizing:"border-box"}} />
              </div>

              <div>
                <label style={{display:"block",fontSize:"13px",fontWeight:"500",color:"#374151",marginBottom:"4px"}}>Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="doctor@example.com"
                  style={{width:"100%",padding:"10px 12px",border:"1px solid #d1d5db",borderRadius:"8px",fontSize:"14px",boxSizing:"border-box"}} />
              </div>

              <div>
                <label style={{display:"block",fontSize:"13px",fontWeight:"500",color:"#374151",marginBottom:"4px"}}>Password *</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Min 6 characters"
                  style={{width:"100%",padding:"10px 12px",border:"1px solid #d1d5db",borderRadius:"8px",fontSize:"14px",boxSizing:"border-box"}} />
              </div>

              <div>
                <label style={{display:"block",fontSize:"13px",fontWeight:"500",color:"#374151",marginBottom:"4px"}}>Specialization *</label>
                <select name="specialization" value={form.specialization} onChange={handleChange} required
                  style={{width:"100%",padding:"10px 12px",border:"1px solid #d1d5db",borderRadius:"8px",fontSize:"14px",boxSizing:"border-box"}}>
                  <option value="">Select specialization...</option>
                  {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{display:"flex",gap:"12px",paddingTop:"4px"}}>
                <button type="button" onClick={() => setOpen(false)}
                  style={{flex:1,padding:"10px",border:"1px solid #d1d5db",background:"white",borderRadius:"8px",fontSize:"14px",cursor:"pointer"}}>
                  Cancel
                </button>
                <button type="submit" disabled={loading || success}
                  style={{flex:1,padding:"10px",background:"#16a34a",color:"white",border:"none",borderRadius:"8px",fontSize:"14px",fontWeight:"600",cursor:"pointer",opacity:(loading||success)?0.6:1}}>
                  {loading ? "Adding..." : "Add Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
