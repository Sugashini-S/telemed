"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface Doctor {
    id: string;
    specialization: string;
    available_slots: string[];
    users: {
        name: string;
        email: string;
    };
}

export default function DoctorsPage() {
    const { t } = useTranslation();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoctors = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("doctors")
                .select("id, specialization, available_slots, users(name, email)");

            if (!error && data) {
                setDoctors(data as unknown as Doctor[]);
            }
            setLoading(false);
        };
        fetchDoctors();
    }, []);

    const specializations = [
        { icon: "🏥", label: "General Medicine" },
        { icon: "👶", label: "Pediatrics" },
        { icon: "🤰", label: "Obstetrics & Gynecology" },
        { icon: "🦷", label: "Dental" },
        { icon: "👁️", label: "Ophthalmology" },
        { icon: "🦴", label: "Orthopedics" },
    ];

    const getSpecIcon = (spec: string) => {
        const found = specializations.find((s) =>
            spec.toLowerCase().includes(s.label.toLowerCase().split(" ")[0])
        );
        return found?.icon || "🏥";
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-sage-100/50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-sage-900 mb-3">
                        {t("doctors_title")}
                    </h1>
                    <p className="text-sage-600 max-w-xl mx-auto">
                        {t("doctors_subtitle")}
                    </p>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <svg className="w-8 h-8 animate-spin text-sage-600" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                )}

                {/* Doctor Cards */}
                {!loading && doctors.length > 0 && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {doctors.map((doctor) => (
                            <Card
                                key={doctor.id}
                                className="rounded-xl border-sage-100 shadow-sm hover:shadow-md transition-all duration-300 group"
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-14 h-14 bg-sage-100 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:bg-sage-200 transition-colors">
                                            {getSpecIcon(doctor.specialization)}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-semibold text-sage-900 truncate">
                                                {doctor.users?.name || "Doctor"}
                                            </h3>
                                            <p className="text-sm text-sage-600">
                                                {doctor.specialization}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-sage-100">
                                        <Badge
                                            variant="secondary"
                                            className="bg-sage-100 text-sage-700 hover:bg-sage-100 rounded-lg"
                                        >
                                            {Array.isArray(doctor.available_slots)
                                                ? doctor.available_slots.length
                                                : 0}{" "}
                                            {t("doctors_available_slots")}
                                        </Badge>
                                        <Link href={`/doctors/${doctor.id}/book`}>
                                            <Button
                                                size="sm"
                                                className="rounded-xl bg-sage-600 hover:bg-sage-700 text-white shadow-sm"
                                            >
                                                {t("doctors_book")}
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && doctors.length === 0 && (
                    <Card className="rounded-xl border-sage-100 shadow-sm max-w-md mx-auto">
                        <CardContent className="p-12 text-center">
                            <div className="w-16 h-16 bg-sage-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-sage-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <p className="text-sage-600">No doctors available yet. Please check back later.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
