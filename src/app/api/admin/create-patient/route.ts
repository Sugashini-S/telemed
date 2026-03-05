import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { name, email, password, phone } = await request.json();

    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { name, role: "patient" }
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || "Auth failed" }, { status: 400 });
    }

    const { error: userError } = await adminSupabase.from("users").insert({
      id: authData.user.id, name, email, role: "patient", phone: phone || null,
    });

    if (userError) {
      await adminSupabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: userError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
