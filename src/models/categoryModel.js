import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
  name: String,
  description: String,
  image: String,
});

export default mongoose.model("category", categorySchema);
