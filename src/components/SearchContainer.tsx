import { useState } from "react";
import useSatelliteSearch from "../hooks/useSatelliteSearch";
import type { SatelliteData } from "../types/types";

type SearchContainerProps = {
	satelliteRecords: SatelliteData[];
	onClick: (sat: SatelliteData) => void;
};

const SearchContainer = ({
	satelliteRecords,
	onClick,
}: SearchContainerProps) => {
	const [textInput, setTextInput] = useState("");
	const { searchResults } = useSatelliteSearch(satelliteRecords, textInput);

	return (
		<div className="fixed top-5 left-5 space-y-2 text-white">
			<input
				type="text"
				placeholder="Search active satellites..."
				className="rounded-full bg-neutral-950/40 p-4 outline-0 backdrop-blur-3xl"
				onChange={(e) => setTextInput(e.target.value)}
				value={textInput}
				onKeyDown={(e) => {
					if (
						e.key === "Enter" &&
						searchResults &&
						searchResults.length > 0
					) {
						onClick(searchResults[0]);
						setTextInput("");
					}
				}}
			/>
			{textInput && textInput.length > 0 && (
				<ul className="space-y-1 rounded-3xl bg-neutral-950/40 p-4 backdrop-blur-3xl">
					{searchResults.map((sat) => (
						<li
							key={sat.name}
							onClick={() => {
								onClick(sat);
								setTextInput("");
							}}
							className="rounded-3xl p-2 hover:cursor-pointer hover:bg-neutral-950/80"
						>
							{sat.name}
						</li>
					))}
					{searchResults.length === 0 && <p>No Satellites Found</p>}
				</ul>
			)}
		</div>
	);
};
export default SearchContainer;
