"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function bookAppointment(formData: FormData) {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "You must be logged in to book an appointment" };
    }

    const doctorId = formData.get("doctor_id") as string;
    const appointmentDate = formData.get("appointment_date") as string;
    const appointmentTime = formData.get("appointment_time") as string;

    const { error } = await supabase.from("appointments").insert({
        doctor_id: doctorId,
        patient_id: user.id,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        status: "booked",
    });

    if (error) {
        if (error.code === "23505") {
            return { error: "This time slot is already booked" };
        }
        return { error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/doctors");
    return { success: true };
}

export async function cancelAppointment(appointmentId: string) {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "You must be logged in" };
    }

    const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", appointmentId)
        .or(`patient_id.eq.${user.id},doctor_id.eq.${user.id}`);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/dashboard");
    return { success: true };
}
