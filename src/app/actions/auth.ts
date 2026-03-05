"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
    const supabase = createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    // Check user role
    const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", (await supabase.auth.getUser()).data.user?.id)
        .single();

    if (userData?.role === "admin") {
        redirect("/admin");
    }

    redirect("/dashboard");
}

export async function registerAction(formData: FormData) {
    const supabase = createClient();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;
    const specialization = formData.get("specialization") as string;

    // Sign up
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        return { error: authError.message };
    }

    if (authData.user) {
        // Insert into users table
        const { error: userError } = await supabase.from("users").insert({
            id: authData.user.id,
            name,
            email,
            role,
        });

        if (userError) {
            return { error: userError.message };
        }

        // If doctor, insert into doctors table
        if (role === "doctor") {
            const { error: doctorError } = await supabase.from("doctors").insert({
                id: authData.user.id,
                specialization: specialization || "General Medicine",
                available_slots: [],
            });

            if (doctorError) {
                return { error: doctorError.message };
            }
        }
    }

    redirect("/dashboard");
}

export async function logoutAction() {
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect("/");
}
