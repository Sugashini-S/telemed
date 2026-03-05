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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from("users").select("name").eq("id", user.id).single().then(({ data }) => {
          if (data?.name) setAdminName(data.name);
        });
      }
    });
  }, []);

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-30 transform transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto flex flex-col overflow-hidden`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center"><Heart className="w-5 h-5 text-white" /></div>
          <div><p className="font-bold text-sm text-white">TN Clinic Booker</p><p className="text-xs text-green-400">Admin Panel</p></div>
          <button className="ml-auto lg:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(href) ? "bg-green-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
              <Icon className="w-5 h-5" />{label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-700">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-sm font-bold">{adminName.charAt(0).toUpperCase()}</div>
            <div><p className="text-sm font-medium text-white truncate">{adminName}</p><p className="text-xs text-green-400">Administrator</p></div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />Logout
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
          <button className="lg:hidden text-gray-500" onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6" /></button>
          <h1 className="text-lg font-semibold text-gray-800">{navItems.find((n) => isActive(n.href))?.label ?? "Admin"}</h1>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
