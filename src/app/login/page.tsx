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

export default function LoginPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const supabase = createClient();
        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <CardTitle className="text-2xl font-bold text-sage-900">
                        {t("login_title")}
                    </CardTitle>
                    <CardDescription className="text-sage-600">
                        {t("login_subtitle")}
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
                            <Label htmlFor="email" className="text-sage-700">
                                {t("login_email")}
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
                                {t("login_password")}
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="rounded-xl border-sage-200 focus:border-sage-400 focus:ring-sage-400"
                                placeholder="••••••••"
                            />
                        </div>

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
                                t("login_submit")
                            )}
                        </Button>

                        <p className="text-center text-sm text-sage-600">
                            {t("login_no_account")}{" "}
                            <Link
                                href="/register"
                                className="text-sage-700 font-medium hover:text-sage-900 underline underline-offset-4"
                            >
                                {t("login_register_link")}
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
