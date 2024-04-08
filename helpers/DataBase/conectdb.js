import mongoose from 'mongoose';

async function connectToDatabase() {
  await mongoose.connect(process.env.URI_MONGO);
//   console.log('conect')
}

connectToDatabase();
