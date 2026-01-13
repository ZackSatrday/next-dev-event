import cloudinary from "@/lib/cloudinary";

import { Event } from "@/database";
import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try{
        await connectDB();

        const formData = await req.formData();

        let event: Record<string, unknown>;

        try {
            event = Object.fromEntries(formData.entries());

            // Normalize the `mode` field so it fits the Mongoose enum ['online', 'offline', 'hybrid']
            const rawMode = typeof event.mode === 'string' ? event.mode : undefined;
            if (rawMode) {
                // Examples:
                //   "hybrid (in-person & online)" -> "hybrid"
                //   "online event"              -> "online"
                //   "offline - in person"       -> "offline"
                const normalizedMode = rawMode.split(/[\s(]/)[0].toLowerCase().trim();
                const allowedModes = ["online", "offline", "hybrid"] as const;

                if (!allowedModes.includes(normalizedMode as (typeof allowedModes)[number])) {
                    return NextResponse.json({ message: "Invalid mode value" }, { status: 400 });
                }

                // Assign normalized value back into the event payload
                (event as any).mode = normalizedMode;
            }
        } catch (e) {
            return NextResponse.json({ message: 'Invalid Json data format'}, { status: 400 })
        }

        const file = formData.get('image') as File;

        if(!file) return NextResponse.json({ message: 'Image file is required'}, { status: 400 })

        const rawTags = formData.get('tags');
        const rawAgenda = formData.get('agenda');

        if (typeof rawTags !== 'string') {
            return NextResponse.json({
                message: 'Invalid tags format',
                error: 'Field "tags" is required and must be a JSON stringified array of strings.',
            }, { status: 400 });
        }

        if (typeof rawAgenda !== 'string') {
            return NextResponse.json({
                message: 'Invalid agenda format',
                error: 'Field "agenda" is required and must be a JSON stringified array of strings.',
            }, { status: 400 });
        }

        let tags: string[];
        let agenda: string[];

        try {
            const parsedTags = JSON.parse(rawTags) as unknown;

            if (!Array.isArray(parsedTags) || !parsedTags.every(tag => typeof tag === 'string' && tag.trim().length > 0)) {
                return NextResponse.json({
                    message: 'Invalid tags value',
                    error: 'Field "tags" must be a non-empty JSON array of non-empty strings.',
                }, { status: 400 });
            }

            tags = parsedTags.map(tag => tag.trim());
        } catch {
            return NextResponse.json({
                message: 'Invalid tags JSON',
                error: 'Field "tags" must contain valid JSON.',
            }, { status: 400 });
        }

        try {
            const parsedAgenda = JSON.parse(rawAgenda) as unknown;

            if (!Array.isArray(parsedAgenda) || !parsedAgenda.every(item => typeof item === 'string' && item.trim().length > 0)) {
                return NextResponse.json({
                    message: 'Invalid agenda value',
                    error: 'Field "agenda" must be a non-empty JSON array of non-empty strings.',
                }, { status: 400 });
            }

            agenda = parsedAgenda.map(item => item.trim());
        } catch {
            return NextResponse.json({
                message: 'Invalid agenda JSON',
                error: 'Field "agenda" must contain valid JSON.',
            }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer)

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'DevEvent' }, (error, results) => {
                if(error) return reject(error);

                resolve(results)
            }).end(buffer);
        })

        event.image = ( uploadResult as { secure_url: string }).secure_url;

        const createdEvent = await Event.create({
            ...event,
            tags: tags, 
            agenda: agenda,
        })

        return NextResponse.json({ message: 'Event created successfully', event: createdEvent }, { status: 201 })
    } catch (e){
        console.error(e);
        return NextResponse.json({ message: 'Event Creation failed', error: e instanceof Error ? e.message : 'Unknown'}, { status: 500 })
    }
}

export async function GET() {
    try {
        await connectDB();

        const events = await Event.find().sort({ createdAt: -1 })

        return NextResponse.json({ message: 'Events fetched successfully', events}, { status: 200 })

    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred while fetching events';
        return NextResponse.json({ message: 'Event fetching failed', error: errorMessage }, { status: 500 })
    }
}

