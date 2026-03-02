import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = createClient();
    const { id } = params;

    const { data, error } = await supabase
        .from("doctors")
        .select("id, specialization, available_slots, users(name, email)")
        .eq("id", id)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data);
}
