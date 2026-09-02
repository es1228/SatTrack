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
			setPathData([
				{
					name: trackedSat.name,
					color: "rgba(0, 255, 0, 0.5)",
					coords: orbitCoords,
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
