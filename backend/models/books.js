import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true
		},
		author: {
			type: String,
			required: true
		},
		categoryId: {
			type: String,
			ref: "Categories",
		},
		image: {
			type: String
		},
		rating: {
			type: [Number],
			default: [],
			validate: {
				validator: (arr) => arr.every(n => n >= 0 && n <= 5),
				message: "Ratings must be between 1 and 5"
			}
		},
		reservedBy: {
			type: String,
			default: null,
			ref: "Users"
		},
		dueDate: {
			type: Date,
			default: null
		},
		description: {
			type: String,
			required: true
		}
	}
);

bookSchema.index({ title: 1 }, { unique: true });
export default mongoose.model("Books", bookSchema);