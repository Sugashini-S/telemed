"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

interface DoctorDetail {
    id: string;
    specialization: string;
    available_slots: string[];
    users: {
        name: string;
        email: string;
    };
}

export default function BookingPage() {
    const { t } = useTranslation();
    const params = useParams();
    const router = useRouter();
    const doctorId = params.id as string;

    const [doctor, setDoctor] = useState<DoctorDetail | null>(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);

    // Fetch doctor details
    useEffect(() => {
        const fetchDoctor = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("doctors")
                .select("id, specialization, available_slots, users(name, email)")
                .eq("id", doctorId)
                .single();

            if (!error && data) {
                setDoctor(data as unknown as DoctorDetail);
            }
            setLoading(false);
        };
        fetchDoctor();
    }, [doctorId]);

    // Fetch booked appointments for the selected date
    const fetchBookedSlots = useCallback(async (date: string) => {
        if (!date || !doctorId) return;
        setSlotsLoading(true);

        const supabase = createClient();
        const { data, error } = await supabase
            .from("appointments")
            .select("appointment_time")
            .eq("doctor_id", doctorId)
            .eq("appointment_date", date)
            .in("status", ["booked", "completed"]);

        if (!error && data) {
            // Extract the booked time slots as strings (HH:MM format)
            const taken = data.map((appt) => {
                // appointment_time comes as "HH:MM:SS" from DB, normalize to "HH:MM"
                const time = appt.appointment_time as string;
                return time.length > 5 ? time.substring(0, 5) : time;
            });
            setBookedSlots(taken);
        } else {
            setBookedSlots([]);
        }
        setSlotsLoading(false);
    }, [doctorId]);

    // Re-fetch booked slots whenever date changes
    useEffect(() => {
        if (selectedDate) {
            fetchBookedSlots(selectedDate);
        } else {
            setBookedSlots([]);
        }
    }, [selectedDate, fetchBookedSlots]);

    const isSlotBooked = (slot: string): boolean => {
        // Normalize slot to HH:MM for comparison
        const normalizedSlot = slot.length > 5 ? slot.substring(0, 5) : slot;
        return bookedSlots.includes(normalizedSlot);
    };

    const handleBooking = async () => {
        if (!selectedDate || !selectedTime) return;

        // Double-check: prevent booking an already-taken slot
        if (isSlotBooked(selectedTime)) {
            setError("This time slot has already been booked. Please choose another.");
            setSelectedTime("");
            return;
        }

        setSubmitting(true);
        setError(null);

        const supabase = createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            router.push("/login");
            return;
        }

        const { error: bookError } = await supabase.from("appointments").insert({
            doctor_id: doctorId,
            patient_id: user.id,
            appointment_date: selectedDate,
            appointment_time: selectedTime,
            status: "booked",
        });

        if (bookError) {
            if (bookError.code === "23505") {
                setError("This time slot is already booked. Please choose another.");
                // Refresh booked slots to update the UI
                await fetchBookedSlots(selectedDate);
                setSelectedTime("");
            } else {
                setError(bookError.message);
            }
            setSubmitting(false);
            return;
        }

        setSuccess(true);
        setSubmitting(false);
        setTimeout(() => router.push("/dashboard"), 2000);
    };

    // Get tomorrow as minimum date
    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split("T")[0];
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

    return (
        <div className="min-h-screen bg-gradient-to-b from-sage-100/50 to-white">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-sage-900 mb-8">
                    {t("booking_title")}
                </h1>

                {/* Doctor Info */}
                {doctor && (
                    <Card className="rounded-xl border-sage-100 shadow-sm mb-6">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-sage-100 rounded-xl flex items-center justify-center text-2xl">
                                    🏥
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-sage-900">
                                        {doctor.users?.name || "Doctor"}
                                    </h2>
                                    <p className="text-sage-600">{doctor.specialization}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Success Message */}
                {success && (
                    <Card className="rounded-xl border-green-200 bg-green-50 shadow-sm mb-6">
                        <CardContent className="p-6 text-center">
                            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-green-800 font-medium">{t("booking_success")}</p>
                            <p className="text-sm text-green-600 mt-1">Redirecting to dashboard...</p>
                        </CardContent>
                    </Card>
                )}

                {!success && (
                    <Card className="rounded-xl border-sage-100 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sage-900">Select Date & Time</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            {/* Date Picker */}
                            <div className="space-y-2">
                                <Label className="text-sage-700">{t("booking_select_date")}</Label>
                                <Input
                                    type="date"
                                    min={getMinDate()}
                                    value={selectedDate}
                                    onChange={(e) => {
                                        setSelectedDate(e.target.value);
                                        setSelectedTime("");
                                        setError(null);
                                    }}
                                    className="rounded-xl border-sage-200 focus:border-sage-400 focus:ring-sage-400"
                                />
                            </div>

                            {/* Time Slots */}
                            {selectedDate && doctor && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sage-700">{t("booking_select_time")}</Label>
                                        {slotsLoading && (
                                            <svg className="w-4 h-4 animate-spin text-sage-400" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                        )}
                                    </div>

                                    {/* Slot Legend */}
                                    <div className="flex items-center gap-4 text-xs text-sage-500">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-3 h-3 rounded border-2 border-sage-200 bg-white"></span>
                                            Available
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-3 h-3 rounded border-2 border-sage-600 bg-sage-50"></span>
                                            Selected
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-3 h-3 rounded bg-gray-200 border-2 border-gray-300"></span>
                                            Booked
                                        </div>
                                    </div>

                                    {Array.isArray(doctor.available_slots) && doctor.available_slots.length > 0 ? (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                            {doctor.available_slots.map((slot: string) => {
                                                const booked = isSlotBooked(slot);
                                                const selected = selectedTime === slot;

                                                return (
                                                    <button
                                                        key={slot}
                                                        type="button"
                                                        disabled={booked}
                                                        onClick={() => {
                                                            if (!booked) {
                                                                setSelectedTime(slot);
                                                                setError(null);
                                                            }
                                                        }}
                                                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${booked
                                                                ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                                                                : selected
                                                                    ? "border-sage-600 bg-sage-50 text-sage-800 shadow-sm"
                                                                    : "border-sage-200 text-sage-600 hover:border-sage-300 hover:bg-sage-50"
                                                            }`}
                                                        title={booked ? "This slot is already booked" : `Book ${slot}`}
                                                    >
                                                        {slot}
                                                        {booked && (
                                                            <span className="block text-[10px] font-normal text-gray-400 mt-0.5">
                                                                Booked
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-sage-500 text-sm py-4">{t("booking_no_slots")}</p>
                                    )}
                                </div>
                            )}

                            {/* Confirm */}
                            <Button
                                onClick={handleBooking}
                                disabled={!selectedDate || !selectedTime || submitting}
                                className="w-full rounded-xl bg-sage-600 hover:bg-sage-700 text-white py-5 shadow-sm disabled:opacity-50"
                            >
                                {submitting ? (
                                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                ) : (
                                    t("booking_confirm")
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
