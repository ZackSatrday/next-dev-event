import mongoose from 'mongoose';

// Extend the global object to include mongoose cache
declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

// Get MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Initialize the cached connection object
// In development, use a global variable to preserve the connection across module reloads (HMR)
// In production, this ensures we don't create multiple connections
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Establishes and returns a cached MongoDB connection
 * 
 * This function ensures that only one connection is created and reused
 * across multiple invocations, which is especially important in serverless
 * environments and during Next.js development with hot module replacement
 * 
 * @returns Promise<mongoose.Connection> - The active MongoDB connection
 */
async function connectDB(): Promise<mongoose.Connection> {

  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Create new connection promise if one doesn't exist
  if (!cached.promise) {
      // Validate that the MongoDB URI is defined
      if (!MONGODB_URI) {
      throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
      );
    }
    
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false, // Disable command buffering for better error handling
    };

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
      return mongoose.connection;
    });
  }

  try {
    // Await the connection promise and cache the result
    cached.conn = await cached.promise;
  } catch (error) {
    // Clear the promise on error so subsequent calls will retry
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;
