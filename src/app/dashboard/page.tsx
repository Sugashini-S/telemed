"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface Appointment {
    id: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    doctors: {
        specialization: string;
        users: {
            name: string;
        };
    };
}

export default function PatientDashboard() {
    const { t } = useTranslation();
    const router = useRouter();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            // Get user info
            const { data: userData } = await supabase
                .from("users")
                .select("name, role")
                .eq("id", user.id)
                .single();

            if (userData) {
                setUserName(userData.name);
                if (userData.role === "doctor") {
                    router.push("/dashboard/doctor");
                    return;
                }
            }

            // Get appointments
            const { data: appts } = await supabase
                .from("appointments")
                .select(
                    "id, appointment_date, appointment_time, status, doctors(specialization, users(name))"
                )
                .eq("patient_id", user.id)
                .order("appointment_date", { ascending: true });

            if (appts) {
                setAppointments(appts as unknown as Appointment[]);
            }
            setLoading(false);
        };
        fetchData();
    }, [router]);

    const handleCancel = async (appointmentId: string) => {
        const supabase = createClient();
        const { error } = await supabase
            .from("appointments")
            .update({ status: "cancelled" })
            .eq("id", appointmentId);

        if (!error) {
            setAppointments((prev) =>
                prev.map((a) =>
                    a.id === appointmentId ? { ...a, status: "cancelled" } : a
                )
            );
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "booked":
                return (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 rounded-lg">
                        {t("dashboard_status_booked")}
                    </Badge>
                );
            case "completed":
                return (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 rounded-lg">
                        {t("dashboard_status_completed")}
                    </Badge>
                );
            case "cancelled":
                return (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 rounded-lg">
                        {t("dashboard_status_cancelled")}
                    </Badge>
                );
            default:
                return <Badge className="rounded-lg">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-sage-100/50 to-white flex items-center justify-center">
                <svg className="w-8 h-8 animate-spin text-sage-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            </div>
        );
    }

    const upcomingAppointments = appointments.filter((a) => a.status === "booked");
    const pastAppointments = appointments.filter((a) => a.status !== "booked");

    return (
        <div className="min-h-screen bg-gradient-to-b from-sage-100/50 to-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-sage-900">
                            {t("dashboard_title")}
                        </h1>
                        {userName && (
                            <p className="text-sage-600 mt-1">Welcome back, {userName} 👋</p>
                        )}
                    </div>
                    <Link href="/doctors">
                        <Button className="rounded-xl bg-sage-600 hover:bg-sage-700 text-white shadow-sm">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {t("dashboard_book_new")}
                        </Button>
                    </Link>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <Card className="rounded-xl border-sage-100 shadow-sm">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-sage-800">{upcomingAppointments.length}</div>
                            <div className="text-xs text-sage-600">Upcoming</div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl border-sage-100 shadow-sm">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-sage-800">
                                {appointments.filter((a) => a.status === "completed").length}
                            </div>
                            <div className="text-xs text-sage-600">Completed</div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl border-sage-100 shadow-sm">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-sage-800">{appointments.length}</div>
                            <div className="text-xs text-sage-600">Total</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Upcoming Appointments */}
                <Card className="rounded-xl border-sage-100 shadow-sm mb-6">
                    <CardHeader>
                        <CardTitle className="text-sage-900">{t("dashboard_upcoming")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {upcomingAppointments.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-14 h-14 bg-sage-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-7 h-7 text-sage-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-sage-500">{t("dashboard_no_appointments")}</p>
                                <Link href="/doctors" className="inline-block mt-3">
                                    <Button variant="outline" className="rounded-xl border-sage-300 text-sage-700">
                                        {t("dashboard_book_new")}
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingAppointments.map((appt) => (
                                    <div
                                        key={appt.id}
                                        className="flex items-center justify-between p-4 bg-sage-50/50 rounded-xl border border-sage-100"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-sage-100 rounded-xl flex items-center justify-center">
                                                <svg className="w-5 h-5 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-medium text-sage-900">
                                                    {appt.doctors?.users?.name || "Doctor"}
                                                </p>
                                                <p className="text-sm text-sage-600">
                                                    {appt.doctors?.specialization} • {appt.appointment_date} at {appt.appointment_time}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {getStatusBadge(appt.status)}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCancel(appt.id)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl text-sm"
                                            >
                                                {t("dashboard_cancel")}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Past Appointments */}
                {pastAppointments.length > 0 && (
                    <Card className="rounded-xl border-sage-100 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sage-900">Past Appointments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {pastAppointments.map((appt) => (
                                    <div
                                        key={appt.id}
                                        className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-700">
                                                    {appt.doctors?.users?.name || "Doctor"}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {appt.doctors?.specialization} • {appt.appointment_date} at {appt.appointment_time}
                                                </p>
                                            </div>
                                        </div>
                                        {getStatusBadge(appt.status)}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
