import { useEffect, useState } from "react";
import type { SatelliteData } from "./useSatellites";
import {
	degreesLat,
	degreesLong,
	eciToGeodetic,
	gstime,
	propagate,
} from "satellite.js";

export type OrbitPath = {
	name: string;
	type: string;
	color: string;
	coords: { lat: number; lng: number; alt: number }[];
};

const useSatellitePath = (
	trackedSat: SatelliteData | null,
): { pathData: OrbitPath[] } => {
	const [pathData, setPathData] = useState<OrbitPath[]>([]);
	const EARTH_RADIUS_KM = 6371;

	useEffect(() => {
		if (!trackedSat) {
			setPathData([]);
			return;
		}

		const updatePaths = () => {
			const orbitCoords = [];
			const now = new Date();

			for (let i = -60; i <= 60; i++) {
				const futureTime = new Date(now.getTime() + i * 60000);
				const futurePosAndVelo = propagate(
					trackedSat.satrec,
					futureTime,
				);
				const posEci = futurePosAndVelo?.position;

				if (posEci) {
					const gmst = gstime(futureTime);
					const posGd = eciToGeodetic(posEci, gmst);

					const lat = degreesLat(posGd.latitude);
					const lng = degreesLong(posGd.longitude);

					const alt = posGd.height / EARTH_RADIUS_KM;

					orbitCoords.push({
						lat: lat,
						lng: lng,
						alt: alt,
					});
				}
			}
			const midIndex = Math.floor(orbitCoords.length / 2)
			setPathData([
				{
					type: "solid",
					name: trackedSat.name,
					color: "blue",
					coords: orbitCoords.slice(0, midIndex + 1),
				},
				{
					type: "dashed",
					name: trackedSat.name,
					color: "blue",
					coords: orbitCoords.slice(midIndex),
				},
			]);
		};
		updatePaths();

		const interval = setInterval(updatePaths, 1000);
		return () => clearInterval(interval);
	}, [trackedSat]);

	return { pathData };
};
export default useSatellitePath;
