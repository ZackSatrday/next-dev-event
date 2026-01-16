'use client'

import { createBooking } from "@/lib/actions/booking.actions"
import { useState, useEffect, type FormEvent } from "react"

const BookEvent = ({ eventId }: { eventId: string }) => {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration mismatch by only rendering form after mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return; // Guard against double submissions

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      alert("Email is required");
      setError("Email is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { success, message } = await createBooking({ eventId, email: trimmedEmail });

      if (!success) {
        const fallbackMessage =
          (typeof error === "string" && error) ||
          message ||
          "Failed to create booking. Please try again.";
        console.error("Booking failed:", fallbackMessage);
        setError(fallbackMessage);
        return;
      }

      setSubmitted(true);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred while booking.";
      console.error("Booking failed:", message);
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Show a non-interactive placeholder during SSR to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div id="book-event" suppressHydrationWarning>
        <form>
          <div>
            <label htmlFor="email" className="input-label">Email Address</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              value=""
              readOnly
            />
          </div>
          <button type="submit" className="button-submit">
            Book Now
          </button>
        </form>
      </div>
    )
  }

  return (
    <div id="book-event">
      {submitted ? (
        <p className="text-sm">Thank you for signing up!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="input-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              placeholder="Enter your email" />
          </div>

          <button
            type="submit"
            className="button-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Booking..." : "Book Now"}
          </button>

          {error && (
            <p className="text-red-500 text-sm mt-2" role="alert">
              {error}
            </p>
          )}
        </form>
      )
      }
    </div>
  )
}

export default BookEvent