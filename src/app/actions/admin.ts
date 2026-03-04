"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveDoctor(doctorId: string) {
    const supabase = createClient();

    const { error } = await supabase
        .from("doctors")
        .update({ is_approved: true })
        .eq("id", doctorId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin/doctors");
    revalidatePath("/doctors");
    return { success: true };
}

export async function rejectDoctor(doctorId: string) {
    const supabase = createClient();

    const { error } = await supabase
        .from("doctors")
        .update({ is_approved: false })
        .eq("id", doctorId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin/doctors");
    return { success: true };
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
    const supabase = createClient();

    const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", appointmentId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin/appointments");
    return { success: true };
}

export async function updateDoctorSlots(doctorId: string, slots: string[]) {
    const supabase = createClient();

    const { error } = await supabase
        .from("doctors")
        .update({ available_slots: slots })
        .eq("id", doctorId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin/slots");
    revalidatePath("/doctors");
    return { success: true };
}
