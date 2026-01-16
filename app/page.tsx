import EventCard from '@/app/components/EventCard'
import ExploreBtn from '@/app/components/ExploreBtn'
import { type IEvent } from '@/database';
import { getEvents } from '@/lib/actions/event.actions';
import { cacheLife } from 'next/cache';

const page = async () => {
  'use cache'
  cacheLife('minutes')

  // Use shared data access instead of server-to-server fetch
  const events: IEvent[] = await getEvents();

  return (
    <section>
      <h1 className="text-center">The Hub For Every Dev <br/> Event You Can`t Miss</h1>
      <p className="text-center mt-5">
        Hackathons, Meetups, and Conferences, All in One Place
      </p>

      <ExploreBtn />

      <div className="mt-20 space-t-7">
        <h3>Featured Events</h3>

        <ul className="events list-none">
          {events && events.length > 0 && events.map((event: IEvent) => (
            <li key={event.title}>
              <EventCard {...event} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default page