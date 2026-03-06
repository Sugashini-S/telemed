"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
    const { t, language, setLanguage } = useTranslation();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const getUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data } = await supabase
                    .from("users")
                    .select("name, role")
                    .eq("id", user.id)
                    .single();
                setUserName(data?.name || null);
                setUserRole(data?.role || null);
            }
        };
        getUser();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        setUser(null);
        setUserName(null);
        setUserRole(null);
        setProfileOpen(false);
        router.push("/");
        router.refresh();
    };

    const toggleLanguage = () => {
        setLanguage(language === "en" ? "ta" : "en");
    };

    const dashboardLink = userRole === "doctor" ? "/dashboard/doctor" : "/dashboard";

    // Get initials for avatar
    const getInitial = () => {
        if (userName) return userName.charAt(0).toUpperCase();
        if (user?.email) return user.email.charAt(0).toUpperCase();
        return "U";
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-sage-200/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 bg-sage-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <span className="text-lg font-semibold text-sage-800 hidden sm:block">
                            TN Clinic Booker
                        </span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-1">
                        <Link
                            href="/"
                            className="px-4 py-2 text-sm font-medium text-sage-700 hover:text-sage-900 hover:bg-sage-100 rounded-xl transition-all"
                        >
                            {t("nav_home")}
                        </Link>
                        <Link
                            href="/doctors"
                            className="px-4 py-2 text-sm font-medium text-sage-700 hover:text-sage-900 hover:bg-sage-100 rounded-xl transition-all"
                        >
                            {t("nav_doctors")}
                        </Link>
                        {user && (
                            <Link
                                href={dashboardLink}
                                className="px-4 py-2 text-sm font-medium text-sage-700 hover:text-sage-900 hover:bg-sage-100 rounded-xl transition-all"
                            >
                                {t("nav_dashboard")}
                            </Link>
                        )}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleLanguage}
                            className="text-sm font-medium text-sage-600 hover:text-sage-800 hover:bg-sage-100 rounded-xl"
                        >
                            {t("nav_language")}
                        </Button>

                        {user ? (
                            /* ---- Avatar + Dropdown ---- */
                            <div ref={profileRef} className="relative">
                                <button
                                    id="profile-avatar-btn"
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-sage-200 transition-all focus:outline-none focus:ring-2 focus:ring-sage-400"
                                    aria-label="Open profile menu"
                                >
                                    <div className="w-9 h-9 bg-gradient-to-br from-sage-500 to-sage-700 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                        {getInitial()}
                                    </div>
                                </button>

                                {/* Profile Dropdown */}
                                {profileOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white border border-sage-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {/* User Info Header */}
                                        <div className="px-4 py-3 bg-sage-50 border-b border-sage-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-sage-500 to-sage-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                    {getInitial()}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-sage-900 truncate">
                                                        {userName || "User"}
                                                    </p>
                                                    <p className="text-xs text-sage-500 truncate">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                            {userRole && (
                                                <span className="inline-block mt-2 px-2 py-0.5 bg-sage-200 text-sage-700 text-xs font-medium rounded-lg capitalize">
                                                    {userRole}
                                                </span>
                                            )}
                                        </div>

                                        {/* Menu Items */}
                                        <div className="py-1">
                                            <Link
                                                href={dashboardLink}
                                                onClick={() => setProfileOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-sage-700 hover:bg-sage-50 transition-colors"
                                            >
                                                <svg className="w-4 h-4 text-sage-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                </svg>
                                                {t("nav_my_dashboard")}
                                            </Link>
                                            <Link
                                                href="/doctors"
                                                onClick={() => setProfileOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-sage-700 hover:bg-sage-50 transition-colors"
                                            >
                                                <svg className="w-4 h-4 text-sage-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {t("nav_doctors")}
                                            </Link>
                                        </div>

                                        {/* Logout */}
                                        <div className="border-t border-sage-100 py-1">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                {t("nav_logout")}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-2">
                                <Link href="/login">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-xl text-sage-700 hover:bg-sage-100"
                                    >
                                        {t("nav_login")}
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button
                                        size="sm"
                                        className="rounded-xl bg-sage-600 hover:bg-sage-700 text-white shadow-sm"
                                    >
                                        {t("nav_register")}
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden p-2 text-sage-600 hover:text-sage-800 rounded-xl hover:bg-sage-100 transition-colors"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {mobileOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="md:hidden pb-4 pt-2 border-t border-sage-200/50">
                        <div className="flex flex-col gap-1">
                            <Link
                                href="/"
                                className="px-4 py-2.5 text-sm font-medium text-sage-700 hover:bg-sage-100 rounded-xl transition-all"
                                onClick={() => setMobileOpen(false)}
                            >
                                {t("nav_home")}
                            </Link>
                            <Link
                                href="/doctors"
                                className="px-4 py-2.5 text-sm font-medium text-sage-700 hover:bg-sage-100 rounded-xl transition-all"
                                onClick={() => setMobileOpen(false)}
                            >
                                {t("nav_doctors")}
                            </Link>
                            {user && (
                                <>
                                    <Link
                                        href={dashboardLink}
                                        className="px-4 py-2.5 text-sm font-medium text-sage-700 hover:bg-sage-100 rounded-xl transition-all"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {t("nav_dashboard")}
                                    </Link>
                                    {/* Mobile user info */}
                                    <div className="mx-4 my-2 p-3 bg-sage-50 rounded-xl border border-sage-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-sage-500 to-sage-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                {getInitial()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-sage-800 truncate">{userName || "User"}</p>
                                                <p className="text-xs text-sage-500 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setMobileOpen(false);
                                            handleLogout();
                                        }}
                                        className="px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all text-left"
                                    >
                                        {t("nav_logout")}
                                    </button>
                                </>
                            )}
                            {!user && (
                                <>
                                    <Link
                                        href="/login"
                                        className="px-4 py-2.5 text-sm font-medium text-sage-700 hover:bg-sage-100 rounded-xl transition-all"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {t("nav_login")}
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="px-4 py-2.5 text-sm font-medium text-sage-700 hover:bg-sage-100 rounded-xl transition-all"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {t("nav_register")}
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}



