import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is doctor or patient
    const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    let query;

    if (userData?.role === "doctor") {
        query = supabase
            .from("appointments")
            .select("id, appointment_date, appointment_time, status, users:patient_id(name, email)")
            .eq("doctor_id", user.id)
            .order("appointment_date", { ascending: true });
    } else {
        query = supabase
            .from("appointments")
            .select("id, appointment_date, appointment_time, status, doctors(specialization, users(name))")
            .eq("patient_id", user.id)
            .order("appointment_date", { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { doctor_id, appointment_date, appointment_time } = body;

    const { data, error } = await supabase
        .from("appointments")
        .insert({
            doctor_id,
            patient_id: user.id,
            appointment_date,
            appointment_time,
            status: "booked",
        })
        .select()
        .single();

    if (error) {
        if (error.code === "23505") {
            return NextResponse.json(
                { error: "This time slot is already booked" },
                { status: 409 }
            );
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}
