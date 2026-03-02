"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<"patient" | "doctor">("patient");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const specialization = formData.get("specialization") as string;

        const supabase = createClient();

        // Sign up
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        if (authData.user) {
            // Insert into users table
            const { error: userError } = await supabase.from("users").insert({
                id: authData.user.id,
                name,
                email,
                role,
            });

            if (userError) {
                setError(userError.message);
                setLoading(false);
                return;
            }

            // If doctor, insert into doctors table
            if (role === "doctor") {
                const { error: doctorError } = await supabase.from("doctors").insert({
                    id: authData.user.id,
                    specialization: specialization || "General Medicine",
                    available_slots: [],
                });

                if (doctorError) {
                    setError(doctorError.message);
                    setLoading(false);
                    return;
                }
            }
        }

        router.push("/dashboard");
        router.refresh();
    };

    return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-gradient-to-br from-sage-100 via-white to-sage-50 px-4 py-12">
            <Card className="w-full max-w-md rounded-xl shadow-md border-sage-100">
                <CardHeader className="text-center pb-2">
                    <div className="w-14 h-14 bg-sage-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <CardTitle className="text-2xl font-bold text-sage-900">
                        {t("register_title")}
                    </CardTitle>
                    <CardDescription className="text-sage-600">
                        {t("register_subtitle")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sage-700">
                                {t("register_name")}
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="rounded-xl border-sage-200 focus:border-sage-400 focus:ring-sage-400"
                                placeholder="Your full name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sage-700">
                                {t("register_email")}
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="rounded-xl border-sage-200 focus:border-sage-400 focus:ring-sage-400"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sage-700">
                                {t("register_password")}
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                className="rounded-xl border-sage-200 focus:border-sage-400 focus:ring-sage-400"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Role Selector */}
                        <div className="space-y-2">
                            <Label className="text-sage-700">{t("register_role")}</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole("patient")}
                                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${role === "patient"
                                            ? "border-sage-600 bg-sage-50 text-sage-800"
                                            : "border-sage-200 text-sage-500 hover:border-sage-300"
                                        }`}
                                >
                                    <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {t("register_patient")}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole("doctor")}
                                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${role === "doctor"
                                            ? "border-sage-600 bg-sage-50 text-sage-800"
                                            : "border-sage-200 text-sage-500 hover:border-sage-300"
                                        }`}
                                >
                                    <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    {t("register_doctor")}
                                </button>
                            </div>
                            <input type="hidden" name="role" value={role} />
                        </div>

                        {/* Specialization (doctors only) */}
                        {role === "doctor" && (
                            <div className="space-y-2">
                                <Label htmlFor="specialization" className="text-sage-700">
                                    {t("register_specialization")}
                                </Label>
                                <Input
                                    id="specialization"
                                    name="specialization"
                                    type="text"
                                    required
                                    className="rounded-xl border-sage-200 focus:border-sage-400 focus:ring-sage-400"
                                    placeholder="e.g. General Medicine, Pediatrics"
                                />
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-sage-600 hover:bg-sage-700 text-white py-5 shadow-sm"
                        >
                            {loading ? (
                                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : (
                                t("register_submit")
                            )}
                        </Button>

                        <p className="text-center text-sm text-sage-600">
                            {t("register_has_account")}{" "}
                            <Link
                                href="/login"
                                className="text-sage-700 font-medium hover:text-sage-900 underline underline-offset-4"
                            >
                                {t("register_login_link")}
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
