"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

// Smart search: keyword → specialty mapping
const KEYWORD_MAP: Record<string, string> = {
    eye: "Ophthalmologist",
    eyes: "Ophthalmologist",
    vision: "Ophthalmologist",
    sight: "Ophthalmologist",
    heart: "Cardiologist",
    cardiac: "Cardiologist",
    chest: "Cardiologist",
    teeth: "Dentist",
    tooth: "Dentist",
    dental: "Dentist",
    baby: "Pediatrician",
    child: "Pediatrician",
    kids: "Pediatrician",
    children: "Pediatrician",
    women: "Gynecologist",
    woman: "Gynecologist",
    pregnancy: "Gynecologist",
    pregnant: "Gynecologist",
    gynec: "Gynecologist",
    skin: "Dermatologist",
    rash: "Dermatologist",
    acne: "Dermatologist",
    bone: "Orthopedic",
    bones: "Orthopedic",
    joint: "Orthopedic",
    fracture: "Orthopedic",
    general: "General Medicine",
    fever: "General Medicine",
    cold: "General Medicine",
    cough: "General Medicine",
};

export default function DoctorsPage() {
    const { t } = useTranslation();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchDoctors = async () => {
            const supabase = createClient();

            // Session is validated by middleware, so we can fetch directly
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

    // Close suggestions on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Get smart suggestions based on search query
    const suggestions = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase().trim();
        const matched = new Set<string>();

        // Check keyword map
        for (const [keyword, specialty] of Object.entries(KEYWORD_MAP)) {
            if (keyword.startsWith(query) || query.startsWith(keyword)) {
                matched.add(specialty);
            }
        }

        // Also match against actual doctor specializations
        doctors.forEach((doc) => {
            if (doc.specialization.toLowerCase().includes(query)) {
                matched.add(doc.specialization);
            }
            if (doc.users?.name?.toLowerCase().includes(query)) {
                matched.add(`Dr. ${doc.users.name}`);
            }
        });

        return Array.from(matched).slice(0, 6);
    }, [searchQuery, doctors]);

    // Filtered doctors list
    const filteredDoctors = useMemo(() => {
        if (!activeFilter && !searchQuery.trim()) return doctors;

        const query = (activeFilter || searchQuery).toLowerCase().trim();

        return doctors.filter((doc) => {
            const specMatch = doc.specialization.toLowerCase().includes(query);
            const nameMatch = doc.users?.name?.toLowerCase().includes(query);

            // Also check if the filter maps to any keyword
            let keywordMatch = false;
            for (const [keyword, specialty] of Object.entries(KEYWORD_MAP)) {
                if (query.includes(keyword) || keyword.includes(query)) {
                    if (doc.specialization.toLowerCase().includes(specialty.toLowerCase())) {
                        keywordMatch = true;
                        break;
                    }
                }
            }

            return specMatch || nameMatch || keywordMatch;
        });
    }, [doctors, activeFilter, searchQuery]);

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

    const handleSuggestionClick = (suggestion: string) => {
        setActiveFilter(suggestion);
        setSearchQuery(suggestion);
        setShowSuggestions(false);
    };

    const clearFilter = () => {
        setActiveFilter(null);
        setSearchQuery("");
        setShowSuggestions(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-sage-100/50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-sage-900 mb-3">
                        {t("doctors_title")}
                    </h1>
                    <p className="text-sage-600 max-w-xl mx-auto">
                        {t("doctors_subtitle")}
                    </p>
                </div>

                {/* Smart Search Bar */}
                <div ref={searchRef} className="relative max-w-xl mx-auto mb-10">
                    <div className="relative">
                        <svg
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400 pointer-events-none"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <Input
                            id="doctor-search"
                            type="text"
                            placeholder="Search by specialty, name, or keyword (e.g. eye, heart, teeth, skin...)"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setActiveFilter(null);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            className="pl-12 pr-10 py-3 h-12 rounded-2xl border-sage-200 bg-white shadow-sm focus:border-sage-400 focus:ring-sage-400 text-sage-800 placeholder:text-sage-400"
                        />
                        {searchQuery && (
                            <button
                                onClick={clearFilter}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Smart Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-20 w-full mt-2 bg-white border border-sage-200 rounded-2xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-4 py-2 bg-sage-50 border-b border-sage-100">
                                <p className="text-xs font-medium text-sage-500 uppercase tracking-wide">
                                    Suggested Specialties
                                </p>
                            </div>
                            {suggestions.map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-sage-50 transition-colors border-b border-sage-50 last:border-b-0"
                                >
                                    <span className="w-8 h-8 bg-sage-100 rounded-lg flex items-center justify-center text-sm shrink-0">
                                        🔍
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-sage-800">{suggestion}</p>
                                        <p className="text-xs text-sage-500">
                                            Click to filter doctors
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Active Filter Badge */}
                {activeFilter && (
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <span className="text-sm text-sage-600">Filtering by:</span>
                        <Badge className="bg-sage-600 text-white hover:bg-sage-700 rounded-xl px-3 py-1 text-sm font-medium">
                            {activeFilter}
                            <button
                                onClick={clearFilter}
                                className="ml-2 hover:text-sage-200 transition-colors"
                            >
                                ✕
                            </button>
                        </Badge>
                    </div>
                )}

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
                {!loading && filteredDoctors.length > 0 && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDoctors.map((doctor) => (
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

                {/* No Results After Search */}
                {!loading && filteredDoctors.length === 0 && (searchQuery || activeFilter) && (
                    <Card className="rounded-xl border-sage-100 shadow-sm max-w-md mx-auto">
                        <CardContent className="p-12 text-center">
                            <div className="w-16 h-16 bg-sage-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-sage-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <p className="text-sage-600 mb-3">
                                No doctors found matching &quot;{searchQuery || activeFilter}&quot;
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearFilter}
                                className="rounded-xl border-sage-300 text-sage-700 hover:bg-sage-100"
                            >
                                Clear Search
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Empty State - No Doctors At All */}
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
