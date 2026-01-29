import mongoose from "mongoose";

const waitlistSchema = new mongoose.Schema({
	bookId: {
		type: String,
		required: true,
		ref: "Books"
	},
	userId: {
		type: String,
		required: true,
		ref: "Users"
	}
});

export default mongoose.model("Waitlists", waitlistSchema);
