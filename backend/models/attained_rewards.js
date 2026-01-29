import mongoose from "mongoose";

const attainedRewardsSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
			ref: "Users",
		},
		rewardId: {
			type: String,
			required: true,
			ref: "Rewards",
		},
		attainedDate: {
			type: Date
		}
	}, {
		collection: "attainedrewards"
	}
);

export default mongoose.model("AttainedRewards", attainedRewardsSchema);
