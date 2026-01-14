'use server'

import { Booking } from "@/database";
import connectDB from "../mongodb";

export const createBooking = async ({ eventId, email }: { eventId: string; email: string }) => {
    try {
        await connectDB();
        await Booking.create({ eventId, email });

        return { success: true };
    } catch (error: unknown) {
        console.error("Failed to create booking:", error);
        return { success: false, message: "Failed to create booking" };
    }
};
