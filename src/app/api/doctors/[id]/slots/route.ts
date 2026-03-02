import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = createClient();
    const { id } = params;

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { available_slots } = body;

    const { data, error } = await supabase
        .from("doctors")
        .update({ available_slots })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
