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

export type OrbitPath = {
	name: string;
	color: string;
	coords: { lat: number; lng: number; alt: number }[];
};

const useSatellites = (data: string[]) => {
	const [globeData, setGlobeData] = useState<SatelliteData[]>([]);
	const [pathData, setPathData] = useState<OrbitPath[]>([]);

	const EARTH_RADIUS_KM = 6371;

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

	useEffect(() => {
		const satRecords = data.map((sat) => {
			const lines = sat.split("\n");
			return {
				name: lines[0],
				satrec: twoline2satrec(lines[1], lines[2]),
			};
		});

		const updateAllPaths = () => {
			const allOrbitPaths = satRecords.map((sat) => {
				const orbitCoords = [];
				const now = new Date();

				for (let i = 0; i <= 60; i++) {
					const futureTime = new Date(now.getTime() + i * 60000);
					const futurePosAndVelo = propagate(sat.satrec, futureTime);
					const posEci = futurePosAndVelo?.position;

					if (posEci) {
						const gmst = gstime(futureTime);
						const posGd = eciToGeodetic(posEci, gmst);

						const lat = degreesLat(posGd.latitude);
						const lng = degreesLong(posGd.longitude);

						const altFactor = posGd.height / EARTH_RADIUS_KM;

						orbitCoords.push({
							lat: lat,
							lng: lng,
							alt: altFactor,
						});
					}
				}
				return {
					name: sat.name,
					color: "rgba(0, 255, 0, 0.5)",
					coords: orbitCoords,
				};
			});
			setPathData(allOrbitPaths);
		};
        updateAllPaths();

		const interval = setInterval(updateAllPaths, 300000);
		return () => clearInterval(interval);
	}, []);

	return { globeData, pathData };
};
export default useSatellites;
