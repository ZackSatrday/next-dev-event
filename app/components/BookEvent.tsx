'use client'

import { useState, type FormEvent } from "react"

const BookEvent = () => {
    const [email, setEmail] = useState("")
    const [submitted, setSubmitted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (isSubmitting) return; // Guard against double submissions

      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        setError("Email is required");
        return;
      }

      setError(null);
      setIsSubmitting(true);

      try {
        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: trimmedEmail }),
        });

        if (!response.ok) {
          let message = "Failed to book event. Please try again.";

          try {
            const data = (await response.json()) as { message?: string; error?: string };
            message = data.error || data.message || message;
          } catch {
            // Ignore JSON parse errors and fall back to default message
          }

          setError(message);
          return;
        }

        setSubmitted(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred while booking.";
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    }

  return (
    <div id="book-event">
      { submitted ? (
        <p className="text-sm">Thank you for signing up!</p>
      ): (
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

          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            className="button-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Booking..." : "Book Now"}
          </button>
        </form>
      )
      }
    </div>
  )
}

export default BookEvent