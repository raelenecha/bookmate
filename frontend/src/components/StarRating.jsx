function StarRating({ value = [], onChange, disabled = true }) {
	const normalisedValue = value.length > 0 ? value.reduce((a, b) => a + b, 0) / value.length : 0;

	return (
		<div className="stars">
			{Array.from({ length: 5 }).map((_, i) => {
				const starValue = i + 1;

				return (
					<span
						key={starValue}
						className={`star ${starValue <= normalisedValue ? "star--on" : ""} ${disabled ? "star--disabled" : ""}`}
						onClick={() => {
							if (!disabled) onChange(starValue);
						}}
						role="button"
						aria-disabled={disabled}
					>
						★
					</span>
				);
			})}
			<p>{normalisedValue.toFixed(1)}</p>
		</div>
	);
}

export default StarRating;