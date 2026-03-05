"use client";
import "../globals.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LayoutDashboard, Users, Stethoscope, Calendar, Activity, Heart, Menu, X, LogOut } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/patients", label: "Patients", icon: Users },
  { href: "/admin/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/admin/appointments", label: "Appointments", icon: Calendar },
  { href: "/admin/activity", label: "Activity Log", icon: Activity },
];

function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"white",borderRadius:"12px",padding:"24px",width:"320px",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
        <h3 style={{margin:"0 0 8px",fontSize:"18px",fontWeight:"600",color:"#111"}}>Confirm Logout</h3>
        <p style={{margin:"0 0 20px",fontSize:"14px",color:"#6b7280"}}>Are you sure you want to logout from the admin panel?</p>
        <div style={{display:"flex",gap:"12px"}}>
          <button onClick={onCancel} style={{flex:1,padding:"10px",border:"1px solid #d1d5db",background:"white",borderRadius:"8px",fontSize:"14px",cursor:"pointer",color:"#374151"}}>Cancel</button>
          <button onClick={onConfirm} style={{flex:1,padding:"10px",background:"#dc2626",color:"white",border:"none",borderRadius:"8px",fontSize:"14px",fontWeight:"600",cursor:"pointer"}}>Logout</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from("users").select("name").eq("id", user.id).single().then(({ data }) => {
          if (data?.name) setAdminName(data.name);
        });
      }
    });
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const isActive = (href) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div style={{display:"flex",height:"100vh",overflow:"hidden",background:"#f3f4f6"}}>
      {showLogout && <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside style={{width:"256px",minWidth:"256px",height:"100vh",background:"#111827",color:"white",display:"flex",flexDirection:"column",position:"relative",zIndex:30}}>
        <div style={{padding:"20px 24px",borderBottom:"1px solid #374151",display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"32px",background:"#16a34a",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Heart size={18} color="white" />
          </div>
          <div>
            <p style={{fontWeight:"700",fontSize:"14px",color:"white",margin:0}}>TN Clinic Booker</p>
            <p style={{fontSize:"12px",color:"#4ade80",margin:0}}>Admin Panel</p>
          </div>
        </div>

        <nav style={{flex:1,padding:"16px",display:"flex",flexDirection:"column",gap:"4px",overflowY:"auto"}}>
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
              style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px 16px",borderRadius:"8px",fontSize:"14px",fontWeight:"500",textDecoration:"none",transition:"background 0.15s",background:isActive(href)?"#16a34a":"transparent",color:isActive(href)?"white":"#9ca3af"}}>
              <Icon size={18} />{label}
            </Link>
          ))}
        </nav>

        <div style={{padding:"16px",borderTop:"1px solid #374151"}}>
          <div style={{display:"flex",alignItems:"center",gap:"12px",padding:"8px 12px",marginBottom:"8px"}}>
            <div style={{width:"36px",height:"36px",background:"#16a34a",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",fontWeight:"700",flexShrink:0}}>
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div style={{overflow:"hidden"}}>
              <p style={{fontSize:"14px",fontWeight:"500",color:"white",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{adminName}</p>
              <p style={{fontSize:"12px",color:"#4ade80",margin:0}}>Administrator</p>
            </div>
          </div>
          <button onClick={() => setShowLogout(true)}
            style={{width:"100%",display:"flex",alignItems:"center",gap:"12px",padding:"10px 16px",borderRadius:"8px",fontSize:"14px",color:"#9ca3af",background:"transparent",border:"none",cursor:"pointer",transition:"background 0.15s"}}
            onMouseEnter={e => { e.currentTarget.style.background="#1f2937"; e.currentTarget.style.color="#f87171"; }}
            onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#9ca3af"; }}>
            <LogOut size={16} />Logout
          </button>
        </div>
      </aside>

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <header style={{background:"white",borderBottom:"1px solid #e5e7eb",padding:"16px 24px",display:"flex",alignItems:"center",gap:"16px",flexShrink:0}}>
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)} style={{background:"none",border:"none",cursor:"pointer",color:"#6b7280"}}>
            <Menu size={24} />
          </button>
          <h1 style={{fontSize:"18px",fontWeight:"600",color:"#1f2937",margin:0}}>
            {navItems.find((n) => isActive(n.href))?.label ?? "Admin"}
          </h1>
        </header>
        <main style={{flex:1,padding:"24px",overflowY:"auto"}}>{children}</main>
      </div>
    </div>
  );
}
