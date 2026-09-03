import { useEffect, useState } from "react";
import type { SatelliteData } from "../types/types";

const useSatelliteSearch = (
	satelliteRecords: SatelliteData[],
	inputText: string,
) => {
	const [searchResults, setSearchResults] = useState<SatelliteData[]>([]);

	useEffect(() => {
		if (inputText && inputText.length > 0) {
			const filteredSats = satelliteRecords
				.filter((s) => s.name.toLowerCase().includes(inputText))
				.slice(0, 5);
			setSearchResults(filteredSats);
		}
	}, [inputText]);

	return { searchResults };
};
export default useSatelliteSearch;
