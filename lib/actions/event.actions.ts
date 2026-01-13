'use server'

import { Event } from "@/database";
import type { IEvent } from "@/database";
import connectDB from "../mongodb";

export const getSimilarEventsBySlug = async (slug: string): Promise<IEvent[]> => {
  try {
    await connectDB();

    const event = await Event.findOne({ slug }).lean<IEvent | null>();

    // If the base event does not exist or has no tags, there are no similar events
    if (!event || !Array.isArray(event.tags) || event.tags.length === 0) {
      return [];
    }

    const similarEvents = await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags },
    })
      .lean<IEvent[]>();

    return similarEvents ?? [];
  } catch (error) {
    console.error("Failed to load similar events for slug:", slug, error);
    return [];
  }
};

export const getEvents = async (): Promise<IEvent[]> => {
  try {
    await connectDB();

    const events = await Event.find().sort({ createdAt: -1 }).lean<IEvent[]>();
    return events ?? [];
  } catch (error) {
    console.error("Failed to load events:", error);
    return [];
  }
};
