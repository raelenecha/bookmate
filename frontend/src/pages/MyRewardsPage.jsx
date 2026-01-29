import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../components/UserAuth";
import api from "../components/Request";
import "../styles/MyRewardsPage.scss";

const MyRewardsPage = () => {
	const navigate = useNavigate();
	const { user, loading } = useAuth();
	const { setHeaderProps } = useOutletContext();

	const [points, setPoints] = useState(0);
	const [userRewards, setUserRewards] = useState({ rewards: [], attained: [] });
	const [leaderboard, setLeaderboard] = useState([]);

	useEffect(() => {
		if (loading) return;
		if (!user) return navigate("/login");
		setHeaderProps({ showHome: true });
		document.title = "Bookmate | My Rewards";
		let mounted = true;

		const fetchData = async () => {
			try {
				const rewardsRes = await api.get("/rewards");
				if (!mounted) return;
				setUserRewards(rewardsRes.data);

				const usersRes = await api.get("/users");
				if (!mounted) return;

				const myPoints = usersRes.data.find((u) => u._id === user._id).points;
				setPoints(myPoints);
				setLeaderboard(usersRes.data);
			} catch (err) {
				console.error(err);
			}
		};

		fetchData();
		return () => mounted = false;
	}, [navigate, loading, user]);

	const pointsCalc = useMemo(() => {
		if (!user) return { tier: "N/A", progress: 0 };

		// Determine tier based on points
		const calculateTier = (points) => {
			if (points >= 300) return "Bookworm Gold";
			if (points >= 150) return "Bookworm Silver";
			if (points > 0) return "Bookworm Bronze";
			return "N/A";
		};

		const tier = calculateTier(points);
		const progress = Math.min((points / 500) * 100, 100);

		return { tier, progress };
	}, [points, leaderboard]);

	if (loading) return;

	return (
		<div className="rewardsPage">
			<div className="rewardsLeft">
				<h2 className="pageTitle">My Points and Badges</h2>
				<p className="pointsText">Points: <strong>{points}</strong></p>

				<div className="progressBar">
					<div className="progressFill" style={{ width: `${pointsCalc.progress}%` }} />
				</div>

				<p className="pointsText">Tiers:</p>
				<div className="tiersContainer">
					{["Bookworm Bronze", "Bookworm Silver", "Bookworm Gold"].map((tier, index) => (
						<p className="tier" key={index} data-selected={tier === pointsCalc.tier}>{tier}</p>
					))}
				</div>

				<div className="badgesContainer">
					{userRewards.rewards.map((badge, index) => {
						const attained = userRewards.attained.find((b) => b.rewardId === badge._id);

						return (
							<div className={`badgeCard ${attained ? "attained" : ""}`} key={index}>
								<span>{badge.description}</span>
								<div className="badgeIcon">★</div>
								<p className="badgeTitle">{badge.name}</p>
								<p className="badgeDate">
									{attained ? `Earned on: ${new Date(attained?.attainedDate).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "2-digit" })}` : "Not Earned"}
									<br />
									(+{badge.points} Points)
								</p>
							</div>
						);
					})}
				</div>
			</div>

			<div className="rewardsRight">
				<h2 className="pageTitle">Leaderboard</h2>

				<div className="leaderboardHeader">
					<span>User</span>
					<span>Points</span>
				</div>

				<ul className="leaderboardList">
					{leaderboard.map((u, index) => (
						<li className="leaderboardRow" key={index}>
							<span>{index + 1}. {u.name}</span>
							<span>{u.points}</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default MyRewardsPage;
