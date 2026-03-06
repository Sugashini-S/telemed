"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError("Invalid email or password"); setLoading(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Login failed"); setLoading(false); return; }
    const { data: roleData } = await supabase.rpc("get_user_role", { user_id: user.id });
    if (roleData !== "admin") { await supabase.auth.signOut(); setError("Access denied."); setLoading(false); return; }
    router.push("/admin");
    router.refresh();
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#111827"}}>
      <div style={{background:"#1f2937",padding:"2rem",borderRadius:"1rem",width:"100%",maxWidth:"400px",margin:"0 16px"}}>
        <h1 style={{color:"white",textAlign:"center",marginBottom:"0.5rem",fontSize:"1.5rem",fontWeight:"bold"}}>Admin Login</h1>
        <p style={{color:"#9ca3af",textAlign:"center",marginBottom:"1.5rem",fontSize:"0.875rem"}}>TN Clinic Booker</p>
        {error && <div style={{background:"#450a0a",color:"#fca5a5",padding:"0.75rem",borderRadius:"0.5rem",marginBottom:"1rem",fontSize:"0.875rem"}}>{error}</div>}
        <form onSubmit={handleLogin}>
          <div style={{marginBottom:"1rem"}}>
            <label style={{color:"#d1d5db",display:"block",marginBottom:"0.5rem",fontSize:"0.875rem"}}>Email</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required placeholder="admin@example.com" style={{width:"100%",padding:"0.75rem",background:"#374151",border:"1px solid #4b5563",borderRadius:"0.5rem",color:"white",fontSize:"0.875rem",boxSizing:"border-box"}} />
          </div>
          <div style={{marginBottom:"1.5rem"}}>
            <label style={{color:"#d1d5db",display:"block",marginBottom:"0.5rem",fontSize:"0.875rem"}}>Password</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required placeholder="••••••••" style={{width:"100%",padding:"0.75rem",background:"#374151",border:"1px solid #4b5563",borderRadius:"0.5rem",color:"white",fontSize:"0.875rem",boxSizing:"border-box"}} />
          </div>
          <button type="submit" disabled={loading} style={{width:"100%",padding:"0.75rem",background:"#16a34a",color:"white",border:"none",borderRadius:"0.5rem",fontWeight:"bold",fontSize:"1rem",cursor:"pointer"}}>
            {loading ? "Signing in..." : "Sign In to Admin Panel"}
          </button>
        </form>
      </div>
    </div>
  );
}
