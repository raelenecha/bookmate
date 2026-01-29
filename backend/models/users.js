import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true
		},
		password: {
			type: String,
			required: true
		},
		points: {
			type: Number,
			default: 0
		},
		role: {
			type: String,
			default: "student",
			enum: ["student", "admin"]
		}
	},
);

export default mongoose.model("Users", userSchema);
