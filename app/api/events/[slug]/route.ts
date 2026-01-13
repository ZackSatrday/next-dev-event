import { NextRequest, NextResponse } from 'next/server';

import { Event, type IEvent } from '@/database';
import connectDB from '@/lib/mongodb';

// Route params type for strong typing of dynamic [slug] segment
interface EventSlugParams {
  slug: string;
}

// Successful response payload when an event is found
interface EventSuccessResponse {
  message: string;
  event: IEvent;
}

// Error response payload shape for all failure cases
interface ErrorResponse {
  message: string;
  error?: string;
}

/**
 * GET /api/events/[slug]
 *
 * Returns a single event by its slug with robust validation and error handling.
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<EventSlugParams> }
): Promise<NextResponse<EventSuccessResponse | ErrorResponse>> {
  const { slug } = (await context.params) ?? {};

  // Basic presence and type validation for slug
  if (typeof slug !== 'string' || !slug.trim()) {
    return NextResponse.json<ErrorResponse>(
      {
        message: 'Invalid slug',
        error: 'The route parameter "slug" is required and must be a non-empty string.',
      },
      { status: 400 }
    );
  }

  const normalizedSlug = slug.trim().toLowerCase();

  // Enforce a conservative slug format (aligns with how slugs are generated in the model)
  const slugPattern = /^[a-z0-9-]+$/;
  if (!slugPattern.test(normalizedSlug)) {
    return NextResponse.json<ErrorResponse>(
      {
        message: 'Invalid slug format',
        error: 'Slug may only contain lowercase letters, numbers, and hyphens.',
      },
      { status: 400 }
    );
  }

  try {
    // Ensure database connection is established (cached in lib/mongodb)
    await connectDB();

    // Find a single event by its unique slug
    const event = await Event.findOne({ slug: normalizedSlug }).exec();

    if (!event) {
      return NextResponse.json<ErrorResponse>(
        {
          message: 'Event not found',
          error: `No event found for slug "${normalizedSlug}".`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json<EventSuccessResponse>(
      {
        message: 'Event fetched successfully',
        event,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    // Log full error on the server for observability
    console.error('Error fetching event by slug:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred while fetching the event.';

    return NextResponse.json<ErrorResponse>(
      {
        message: 'Failed to fetch event',
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
