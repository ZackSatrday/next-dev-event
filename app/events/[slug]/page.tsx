import BookEvent from "@/app/components/BookEvent";
import EventCard from "@/app/components/EventCard";
import { IEvent, Booking } from "@/database";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import connectDB from "@/lib/mongodb";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailsItem = ({ icon, alt, label }: { icon: string; alt: string; label: string }) => (
  <div className="flex flex-row gap-2 items-center">
    <img src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div className="agenda">
    <h2>Agenda</h2>

    <ul>
      {agendaItems.map((item, index) => (
        <li key={`agenda-${index}`}>{item}</li>
      ))}
    </ul>
  </div>
)

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row gap-1 flex-wrap">
    {tags.map((tag) => (
      <div className="pill" key={tag}>
        {tag}
      </div>
    ))}
  </div>
)

interface EventApiResponseBody {
  message?: string;
  error?: string;
  event?: {
    _id: string;
    title: string;
    description: string;
    image: string;
    overview: string;
    date: string;
    time: string;
    location: string;
    mode: string;
    agenda: string[];
    audience: string;
    tags: string[];
    venue: string;
    organizer: string;
  };
}

// Async component that fetches and displays event details
const EventDetailsContent = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const eventApiUrl = BASE_URL ? `${BASE_URL}/api/events/${slug}` : `/api/events/${slug}`;

  let eventData: EventApiResponseBody["event"] | undefined;

  try {
    const response = await fetch(eventApiUrl, { cache: "no-store" });

    if (!response.ok) {
      // For 404s or other non-OK responses, show Next.js 404 page
      return notFound();
    }

    const body = (await response.json()) as EventApiResponseBody;

    if (!body || typeof body !== "object" || !body.event) {
      return notFound();
    }

    const {
      _id,
      title,
      description,
      image,
      overview,
      date,
      time,
      location,
      mode,
      agenda,
      audience,
      tags,
      venue,
      organizer,
    } = body.event;

    // Basic runtime validation of required fields
    if (!title || !description || !image) {
      return notFound();
    }

    eventData = {
      _id,
      title,
      description,
      image,
      overview,
      date,
      time,
      location,
      mode,
      agenda,
      audience,
      tags,
      venue,
      organizer,
    };
  } catch (error) {
    console.error("Failed to load event details:", error);
    return notFound();
  }

  if (!eventData) {
    return notFound();
  }

  const {
    _id,
    title,
    description,
    image,
    overview,
    date,
    time,
    location,
    mode,
    agenda,
    audience,
    tags,
    venue,
    organizer,
  } = eventData;

  // Fetch booking count for this event using its ID
  await connectDB();

  let bookings = 0;
  try {
    if (_id) {
      bookings = await Booking.countDocuments({ eventId: _id });
    }
  } catch (error) {
    console.error("Failed to load booking count for event:", error);
  }

  const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);

  return (
    <section id="event">
      <div className="header">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <div className="details">
        {/* left side - Event content */}
        <div className="content">
          <img src={image} alt="Event Banner" width={800} height={800} className="banner" />

          <section className="flex-col-gap-2">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2>Event Details</h2>
            <EventDetailsItem icon="/icons/calendar.svg" alt="calendar" label={date} />
            <EventDetailsItem icon="/icons/clock.svg" alt="clock" label={time} />
            <EventDetailsItem icon="/icons/pin.svg" alt="venue" label={venue} />
            <EventDetailsItem icon="/icons/pin.svg" alt="pin" label={location} />
            <EventDetailsItem icon="/icons/mode.svg" alt="mode" label={mode} />
            <EventDetailsItem icon="/icons/audience.svg" alt="audience" label={audience} />
          </section>

          <EventAgenda agendaItems={agenda} />

          <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>
            <p>{organizer}</p>
          </section>

          <EventTags tags={tags} />

        </div>

        {/* right side - booking form */}
        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>
            {bookings > 0 ? (
              <p className="text-sm">
                Join {bookings} people who have booked their spot!
              </p>
            ) : (
              <p className="text-sm">
                Be the first to book your spot
              </p>
            )}
            <BookEvent eventId={_id} />
          </div>
        </aside>
      </div>

      <div className="flex w-full flex-col gap-4 pt-20">
        <h2>Similar Events</h2>
        {similarEvents.length > 0 && (
          <ul className="events">
            {similarEvents.map((similarEvent: IEvent, index: number) => (
             
                <EventCard
                  {...similarEvent}
                  key={similarEvent._id ?? similarEvent.slug ?? `similar-${index}`}
                />
             
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

// Main page component with Suspense boundary
const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventDetailsContent params={params} />
    </Suspense>
  );
};

export default EventDetailsPage