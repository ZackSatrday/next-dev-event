import  EventCard from '@/app/components/EventCard'
import ExploreBtn from '@/app/components/ExploreBtn'
import { IEvent } from '@/database';
import { cacheLife } from 'next/cache';
// import {events} from '@/lib/constants'

// const events = [
//   { 
//     image: '/images/event1.png', 
//     title: 'Event 1',
//     slug: 'event-1',
//     location: 'location-1',
//     date: 'Date-1',
//     time: 'Time-1',
//   },
// ]

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

const page = async () => {
  'use cache'
  cacheLife('hours')
  const response = await fetch(`${BASE_URL}/api/events`)
  const { events } = await response.json();

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