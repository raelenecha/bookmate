import express from "express";
import AttainedRewards from "../models/attained_rewards.js";
import Reward from "../models/rewards.js";
import checkAuth from "../auth.js";

const router = express.Router();
router.use(checkAuth);

// GET /rewards for displaying of rewards and badges
router.get("/", async (req, res) => {
    try {
        const rewards = await Reward.find(req.query);
        const attained = await AttainedRewards.find({ userId: req.user._id });
        return res.status(200).json({ rewards, attained });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

export default router;
