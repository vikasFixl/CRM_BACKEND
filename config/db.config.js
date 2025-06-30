import mongoose from "mongoose";
import dotenv from "dotenv";

// dotenv.config({ path: "../../.env" }); /// use while seedeing 
dotenv.config();
console.log(process.env.Mongo_URI);
export const url =
 process.env.Mongo_URI

mongoose.Promise = global.Promise;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  autoIndex: false,
  maxPoolSize: 10,
  socketTimeoutMS: 45000,
  family: 4,
};
export const connectDB = async () => {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      autoIndex: false,
      maxPoolSize: 10,
      socketTimeoutMS: 45000,
      family: 4,
    });
    console.log("Connected to MongoDB",mongoose.connection.readyState);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
