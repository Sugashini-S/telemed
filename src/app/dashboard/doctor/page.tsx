"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

interface Appointment {
    id: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    users: {
        name: string;
        email: string;
    };
}

export default function DoctorDashboard() {
    const { t } = useTranslation();
    const router = useRouter();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [slots, setSlots] = useState<string[]>([]);
    const [newSlot, setNewSlot] = useState("");
    const [loading, setLoading] = useState(true);
    const [doctorName, setDoctorName] = useState("");
    const [doctorId, setDoctorId] = useState("");

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

            // Verify doctor role
            const { data: userData } = await supabase
                .from("users")
                .select("name, role")
                .eq("id", user.id)
                .single();

            if (!userData || userData.role !== "doctor") {
                router.push("/dashboard");
                return;
            }

            setDoctorName(userData.name);
            setDoctorId(user.id);

            // Get doctor slots
            const { data: doctorData } = await supabase
                .from("doctors")
                .select("available_slots")
                .eq("id", user.id)
                .single();

            if (doctorData?.available_slots) {
                setSlots(doctorData.available_slots as string[]);
            }

            // Get appointments
            const { data: appts } = await supabase
                .from("appointments")
                .select("id, appointment_date, appointment_time, status, users:patient_id(name, email)")
                .eq("doctor_id", user.id)
                .order("appointment_date", { ascending: true });

            if (appts) {
                setAppointments(appts as unknown as Appointment[]);
            }

            setLoading(false);
        };
        fetchData();
    }, [router]);

    const addSlot = async () => {
        if (!newSlot || slots.includes(newSlot)) return;

        const updatedSlots = [...slots, newSlot].sort();
        const supabase = createClient();

        const { error } = await supabase
            .from("doctors")
            .update({ available_slots: updatedSlots })
            .eq("id", doctorId);

        if (!error) {
            setSlots(updatedSlots);
            setNewSlot("");
        }
    };

    const removeSlot = async (slot: string) => {
        const updatedSlots = slots.filter((s) => s !== slot);
        const supabase = createClient();

        const { error } = await supabase
            .from("doctors")
            .update({ available_slots: updatedSlots })
            .eq("id", doctorId);

        if (!error) {
            setSlots(updatedSlots);
        }
    };

    const markComplete = async (appointmentId: string) => {
        const supabase = createClient();
        const { error } = await supabase
            .from("appointments")
            .update({ status: "completed" })
            .eq("id", appointmentId);

        if (!error) {
            setAppointments((prev) =>
                prev.map((a) =>
                    a.id === appointmentId ? { ...a, status: "completed" } : a
                )
            );
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "booked":
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 rounded-lg">{t("dashboard_status_booked")}</Badge>;
            case "completed":
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 rounded-lg">{t("dashboard_status_completed")}</Badge>;
            case "cancelled":
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 rounded-lg">{t("dashboard_status_cancelled")}</Badge>;
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

    const todayStr = new Date().toISOString().split("T")[0];
    const todayAppointments = appointments.filter(
        (a) => a.appointment_date === todayStr && a.status === "booked"
    );
    const upcomingAppointments = appointments.filter(
        (a) => a.appointment_date > todayStr && a.status === "booked"
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-sage-100/50 to-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-sage-900">
                        {t("doctor_dashboard_title")}
                    </h1>
                    {doctorName && (
                        <p className="text-sage-600 mt-1">Welcome, Dr. {doctorName} 🩺</p>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <Card className="rounded-xl border-sage-100 shadow-sm">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-sage-800">{todayAppointments.length}</div>
                            <div className="text-xs text-sage-600">Today</div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl border-sage-100 shadow-sm">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-sage-800">{upcomingAppointments.length}</div>
                            <div className="text-xs text-sage-600">Upcoming</div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl border-sage-100 shadow-sm">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-sage-800">{slots.length}</div>
                            <div className="text-xs text-sage-600">Slots</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Manage Slots */}
                    <Card className="rounded-xl border-sage-100 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sage-900">{t("doctor_manage_slots")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Add Slot */}
                            <div className="flex gap-2 mb-4">
                                <Input
                                    type="time"
                                    value={newSlot}
                                    onChange={(e) => setNewSlot(e.target.value)}
                                    className="rounded-xl border-sage-200 focus:border-sage-400"
                                />
                                <Button
                                    onClick={addSlot}
                                    className="rounded-xl bg-sage-600 hover:bg-sage-700 text-white shrink-0"
                                >
                                    {t("doctor_add_slot")}
                                </Button>
                            </div>

                            {slots.length === 0 ? (
                                <p className="text-sage-500 text-sm text-center py-4">
                                    {t("doctor_no_slots")}
                                </p>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {slots.map((slot) => (
                                        <div
                                            key={slot}
                                            className="flex items-center justify-between p-2.5 bg-sage-50 rounded-xl border border-sage-100"
                                        >
                                            <span className="text-sm font-medium text-sage-800">{slot}</span>
                                            <button
                                                onClick={() => removeSlot(slot)}
                                                className="text-red-400 hover:text-red-600 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Today's Appointments */}
                    <Card className="rounded-xl border-sage-100 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sage-900">{t("doctor_today")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {todayAppointments.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-sage-500 text-sm">No appointments today</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {todayAppointments.map((appt) => (
                                        <div
                                            key={appt.id}
                                            className="flex items-center justify-between p-3 bg-sage-50/50 rounded-xl border border-sage-100"
                                        >
                                            <div>
                                                <p className="font-medium text-sage-900 text-sm">
                                                    {appt.users?.name || "Patient"}
                                                </p>
                                                <p className="text-xs text-sage-600">{appt.appointment_time}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(appt.status)}
                                                {appt.status === "booked" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => markComplete(appt.id)}
                                                        className="rounded-xl border-green-200 text-green-700 hover:bg-green-50 text-xs"
                                                    >
                                                        ✓ Complete
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Upcoming Appointments */}
                {upcomingAppointments.length > 0 && (
                    <Card className="rounded-xl border-sage-100 shadow-sm mt-6">
                        <CardHeader>
                            <CardTitle className="text-sage-900">{t("dashboard_upcoming")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {upcomingAppointments.map((appt) => (
                                    <div
                                        key={appt.id}
                                        className="flex items-center justify-between p-4 bg-sage-50/50 rounded-xl border border-sage-100"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-sage-100 rounded-xl flex items-center justify-center">
                                                <svg className="w-5 h-5 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-medium text-sage-900">{appt.users?.name || "Patient"}</p>
                                                <p className="text-sm text-sage-600">
                                                    {appt.appointment_date} at {appt.appointment_time}
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
