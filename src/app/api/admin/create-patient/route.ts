import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json();
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email, password, email_confirm: true,
    });
    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });
    await adminSupabase.from("users").insert({ id: authData.user.id, name, email, phone, role: "patient" });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
