import StarRating from "./StarRating.jsx";

// reusable component that displays a single book as a card
function BookCard({
	title,
	category,
	author,
	image,
	rating = null,
	children,
	onClick,
	className = "",
	style = {},
	waitlist = 0,
	dueDate = null
}) {
	// used to control styling, accessibility, and interactions
	const clickable = typeof onClick === "function";

	const handleKeyDown = (e) => {
		if (!clickable) return;
		if (e.key === "Enter" || e.key === " ") onClick(e);
	};

	return (
		<div
			style={style}
			className={`card ${clickable ? "card--clickable" : ""} ${className}`}
			onClick={onClick}
			role={clickable ? "button" : undefined}
			tabIndex={clickable ? 0 : undefined}
			onKeyDown={handleKeyDown}
		>
			<img className="card__img" src={image} alt={title} />

			<div className="card__body">
				<div><strong>{title}</strong></div>
				<div className="card__author">{author}</div>
				{rating !== null && <StarRating value={rating} disabled />}
				<div className="card__tags">
					<div className="pill">
						<i className="fas fa-tags"></i>{" "}
						{category}
					</div>

					{dueDate && <div className="pill">
						<i className="fa-solid fa-timer"></i>{" "}
						{dueDate}
					</div>}

					{waitlist > 0 && <div className="pill">
						<i className="fa-solid fa-users"></i>{" "}
						{waitlist} {waitlist === 1 ? "person" : "people"} in queue
					</div>}
				</div>

				{children}
			</div>
		</div>
	);
}

export default BookCard;
