import { useAuth } from "./UserAuth";
import { useNavigate } from "react-router-dom";
import "../styles/Header.scss";

// reusable header component shared across pages
// supports optional search bar and custom right-side actions
export default function Header({
	children,
	showBack = false,
	showSearch = false,
	showLogout = true,
	showLogin = false,
	showBookCatalogue = false,
	showHome = false,
	showSignup = false,
	searchValue = "",
	onSearchChange,
	onSearchSubmit,
}) {
	const { logout } = useAuth();
	const navigate = useNavigate();

	// handles search submission logic
	// prevents empty or invalid search values
	const submit = () => {
		if (!onSearchSubmit) return;
		const q = String(searchValue || "").trim();
		if (!q) return;
		onSearchSubmit(q);
	};

	// triggers search when enter key is pressed
	const handleKeyDown = (e) => {
		if (e.key === "Enter") submit();
	};

	return (
		<header className="header">
			<div className="leftGroup">
				<img src="/logo.png" alt="Bookmate" />
				<h1 className="logo">BookMate</h1>

				{/* search bar shown only when enabled */}
				{showSearch && (
					<div className="searchWrapper">
						<i className="fas fa-bars menuIcon"></i>

						<input
							className="searchInput"
							type="text"
							placeholder="Search for books..."
							value={searchValue}
							// updates search value as user types
							onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
							onKeyDown={handleKeyDown}
						/>

						{/* search button triggers submit logic */}
						<button
							type="button"
							className="searchBtn"
							onClick={submit}
							aria-label="Search"
						>
						</button>
					</div>
				)}
			</div>

			<div className="rightGroup">
				{children}

				{showBack && <button className="headerBtn" onClick={() => navigate(-1)}>
					<i className="fas fa-arrow-left"></i>
					Back
				</button>}

				{showSignup && <button className="headerBtn" onClick={() => navigate("/signup")}>
					<i className="fas fa-user-plus"></i>
					Sign up
				</button>}
				
				{showBookCatalogue && <button className="headerBookBtn" onClick={() => navigate("/catalogue")}>
					<i className="fas fa-book"></i>
					Book Catalogue
				</button>}

				{showHome && <button className="headerBtn" onClick={() => navigate("/home")}>
					<i className="fa-solid fa-house" />
					Home
				</button>}

				{showLogout && <button onClick={() => { logout(); navigate("/login", { replace: true }); }}>
					<i className="fas fa-right-to-bracket"></i>
					Sign out
				</button>}

				{showLogin && <button className="headerBtn" onClick={() => navigate("/login")}>
					<i className="fas fa-right-to-bracket"></i>
					Sign in
				</button>}
			</div>
		</header>
	);
}
