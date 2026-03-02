import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("doctors")
        .select("id, specialization, available_slots, users(name, email)");

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
