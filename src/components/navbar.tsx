"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
    const { t, language, setLanguage } = useTranslation();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data } = await supabase
                    .from("users")
                    .select("role")
                    .eq("id", user.id)
                    .single();
                setUserRole(data?.role || null);
            }
        };
        getUser();
    }, []);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        setUser(null);
        setUserRole(null);
        router.push("/");
        router.refresh();
    };

    const toggleLanguage = () => {
        setLanguage(language === "en" ? "ta" : "en");
    };

    const dashboardLink = userRole === "doctor" ? "/dashboard/doctor" : "/dashboard";

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
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="rounded-xl border-sage-300 text-sage-700 hover:bg-sage-100"
                            >
                                {t("nav_logout")}
                            </Button>
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
                                <Link
                                    href={dashboardLink}
                                    className="px-4 py-2.5 text-sm font-medium text-sage-700 hover:bg-sage-100 rounded-xl transition-all"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {t("nav_dashboard")}
                                </Link>
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
