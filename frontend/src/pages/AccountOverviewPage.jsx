import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../components/UserAuth.jsx";
import api from "../components/Request.js";
import "../styles/AccountOverviewPage.scss";

function AccountOverviewPage() {
	const navigate = useNavigate();
	const { setHeaderProps } = useOutletContext();
	const { user, login, logout, loading } = useAuth();
	const [name, setName] = useState(user?.name || "");
	const [password, setPassword] = useState({ new: "", confirm: "" });

	useEffect(() => {
		if (loading) return;
		if (!user) return navigate("/login");
		document.title = "Bookmate | Account Overview";
		setHeaderProps({ showHome: true });
		setName(user?.name || "");
	}, [navigate, user, loading]);

	const handleSubmit = async (e) => {
		try {
			e.preventDefault();
			if (password.new !== password.confirm) return alert("Passwords do not match");
			if (name === "") return alert("Please fill in all fields");
			const form = new FormData(e.target);
			if (password.new !== "") form.append("password", password.new);

			const res = await api.put(`/users`, form);
			if (res.status === 200) alert("Successfully updated account");
			if (password.new !== "") {
				logout();
				navigate('/login', { replace: true })
			} else login(res.data.token);
		} catch (err) {
			console.error(err);
			if (err.response?.data?.message.includes("E11000")) alert("Username already exists")
            else alert("Update failed: " + (err.response?.data?.message || err.message));
		}
	};

	if (loading) return;

	return (
		<form className="accountPage" onSubmit={handleSubmit}>
			<div className="titleRow">
				<div className="titleGroup">
					<i className="fas fa-user-circle userIcon"></i>
					<h1 className="pageTitle">Account Overview</h1>
				</div>

				<button className="actionBtn myRewards" type="button" onClick={() => navigate("/rewards")}>
					My Rewards
				</button>
			</div>

			<div className="content">
				<label htmlFor="name">Name:</label>
				<input type="text" id="name" name="name" placeholder="Enter your name" value={name || ""} onChange={(e) => setName(e.target.value)} />

				<p>Change Password</p>

				<label htmlFor="new">New Password:</label>
				<input type="text" id="new" placeholder="Enter your new password" value={password.new} autoComplete="new-password" onChange={(e) => setPassword({ ...password, new: e.target.value })} />

				<label htmlFor="confirm">Confirm Password:</label>
				<input type="password" id="confirm" placeholder="Confirm your new password" value={password.confirm} autoComplete="off" onChange={(e) => setPassword({ ...password, confirm: e.target.value })} />
			</div>

			<button>Save</button>
		</form>
	);
}

export default AccountOverviewPage;
