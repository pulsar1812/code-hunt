import mongoose from 'mongoose'

let isConnected: boolean = false

export const connectToDB = async () => {
  mongoose.set('strictQuery', true)

  if (!process.env.MONGODB_URI) {
    return console.log('Missing MONGODB_URI')
  }

  if (isConnected) {
    return console.log('MongoDB is already connected')
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'codehunt',
    })

    isConnected = true

    console.log('MongoDB connected successfully')
  } catch (error) {
    console.log('MongoDB connection failed', error)
  }
}
