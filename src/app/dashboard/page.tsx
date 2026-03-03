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

            // Get appointments with doctor details
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

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + "T00:00:00");
        return date.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (timeStr: string) => {
        const [h, m] = timeStr.split(":");
        const hour = parseInt(h);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${m} ${ampm}`;
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
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-sage-500 to-sage-700 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md">
                            {userName ? userName.charAt(0).toUpperCase() : "P"}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-sage-900">
                                {t("dashboard_title")}
                            </h1>
                            {userName && (
                                <p className="text-sage-600 mt-0.5">Welcome back, {userName} 👋</p>
                            )}
                        </div>
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
                        <CardContent className="p-5 text-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-sage-800">{upcomingAppointments.length}</div>
                            <div className="text-xs text-sage-600 mt-0.5">Upcoming</div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl border-sage-100 shadow-sm">
                        <CardContent className="p-5 text-center">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-sage-800">
                                {appointments.filter((a) => a.status === "completed").length}
                            </div>
                            <div className="text-xs text-sage-600 mt-0.5">Completed</div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl border-sage-100 shadow-sm">
                        <CardContent className="p-5 text-center">
                            <div className="w-10 h-10 bg-sage-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                                <svg className="w-5 h-5 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-sage-800">{appointments.length}</div>
                            <div className="text-xs text-sage-600 mt-0.5">Total Booked</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Upcoming Appointments */}
                <Card className="rounded-xl border-sage-100 shadow-sm mb-6">
                    <CardHeader>
                        <CardTitle className="text-sage-900 flex items-center gap-2">
                            <svg className="w-5 h-5 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {t("dashboard_upcoming")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {upcomingAppointments.length === 0 ? (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 bg-sage-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-sage-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-sage-500 mb-1">{t("dashboard_no_appointments")}</p>
                                <p className="text-xs text-sage-400 mb-4">Book your first appointment with a doctor</p>
                                <Link href="/doctors">
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
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-sage-50/50 rounded-xl border border-sage-100 gap-3"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-sage-100 rounded-xl flex items-center justify-center shrink-0">
                                                <svg className="w-6 h-6 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sage-900">
                                                    {appt.doctors?.users?.name || "Doctor"}
                                                </p>
                                                <p className="text-sm text-sage-600">
                                                    {appt.doctors?.specialization}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-sage-500">
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        {formatDate(appt.appointment_date)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {formatTime(appt.appointment_time)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 sm:shrink-0">
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
                            <CardTitle className="text-sage-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-sage-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Past Appointments
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {pastAppointments.map((appt) => (
                                    <div
                                        key={appt.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100 gap-3"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-700">
                                                    {appt.doctors?.users?.name || "Doctor"}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {appt.doctors?.specialization}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        {formatDate(appt.appointment_date)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {formatTime(appt.appointment_time)}
                                                    </span>
                                                </div>
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
