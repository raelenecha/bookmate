import mongoose from "mongoose";

const rewardsSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		points: {
			type: Number,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		attainedDate: {
			type: Date
		}
	}
);

export default mongoose.model("Rewards", rewardsSchema);
