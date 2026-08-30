import { useEffect, useState } from "react";
import {
	degreesLat,
	degreesLong,
	eciToGeodetic,
	gstime,
	propagate,
	twoline2satrec,
} from "satellite.js";

export type SatelliteData = {
	name: string;
	lat: number;
	lng: number;
	alt: number;
	radius: number;
	color: string;
};

const useSatellites = (data: string[]) => {
	const [globeData, setGlobeData] = useState<SatelliteData[]>([]);
	useEffect(() => {
		const satRecords = data.map((sat) => {
			const lines = sat.split("\n");
			return {
				name: lines[0],
				satrec: twoline2satrec(lines[1], lines[2]),
			};
		});

		const updateAllPos = () => {
			const now = new Date();
			const EARTH_RADIUS_KM = 6371;

			const updatedSats = satRecords
				.map((sat) => {
					const posAndVelo = propagate(sat.satrec, now);
					const posEci = posAndVelo?.position;

					if (posEci) {
						const gmst = gstime(now);
						const posGd = eciToGeodetic(posEci, gmst);

						const lat = degreesLat(posGd.latitude);
						const lng = degreesLong(posGd.longitude);

						const altFactor = posGd.height / EARTH_RADIUS_KM;

						console.log("name: " + sat.name);
						console.log("lat: " + lat);
						console.log("lng: " + lng);
						console.log("alt: " + altFactor);

						return {
							name: sat.name,
							lat: lat,
							lng: lng,
							alt: altFactor,
							radius: 0.01,
							color: "green",
						};
					}
					return null;
				})
				.filter((sat) => sat !== null);
			setGlobeData(updatedSats);
		};
		updateAllPos();

		const interval = setInterval(updateAllPos, 1000);
		return () => clearInterval(interval);
	}, []);

	return { globeData };
};
export default useSatellites;
