import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const serverSupabase = createServerClient();
  const { data: { user } } = await serverSupabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const body = await request.json();
  const { type, name, email, password, specialization } = body;

  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role: type }
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message || "Failed" }, { status: 400 });
  }

  const userId = authData.user.id;

  const { error: userError } = await adminSupabase.from("users").insert({
    id: userId, name, email, role: type,
  });

  if (userError) {
    await adminSupabase.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: userError.message }, { status: 400 });
  }

  if (type === "doctor") {
    const { error: docError } = await adminSupabase.from("doctors").insert({
      id: userId, specialization, is_approved: true,
    });
    if (docError) {
      await adminSupabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: docError.message }, { status: 400 });
    }
  }

  return NextResponse.json({ success: true });
}
