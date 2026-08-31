import { useEffect, useState } from "react";
import {
	degreesLat,
	degreesLong,
	eciToGeodetic,
	gstime,
	propagate,
	twoline2satrec,
} from "satellite.js";
// @ts-ignore
import { nearestCity } from "cityjs";

export type SatelliteData = {
	name: string;
	text: string;
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

export type City = {
	latitude: number;
	longitude: number;
	name: string;
	countryCode: string;
	distance: number;
};

const useSatellites = (satellites: string[]) => {
	const [globeData, setGlobeData] = useState<SatelliteData[]>([]);
	const [pathData, setPathData] = useState<OrbitPath[]>([]);

	const EARTH_RADIUS_KM = 6371;

	const satRecords = satellites.map((sat) => {
		const lines = sat.split("\n");
		return {
			name: lines[0],
			satrec: twoline2satrec(lines[1], lines[2]),
		};
	});

	// position updates
	useEffect(() => {
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

						const alt = posGd.height / EARTH_RADIUS_KM;

						const closestCity: City = nearestCity({ latitude: lat, longitude: lng });

						return {
							name: sat.name,
							text: `<b>Name: ${sat.name}<b>
                            <br/>
                            Latitude: ${lat.toFixed(2)}°
                            <br/>
                            Longitude: ${lng.toFixed(2)}°
							<br/>
                            City: ${closestCity.name}, ${closestCity.countryCode}
                            <br/>
                            Altitude: ${Math.round(posGd.height)}km`,
							lat: lat,
							lng: lng,
							alt: alt,
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

	// path updates
	useEffect(() => {
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

						const alt = posGd.height / EARTH_RADIUS_KM;

						orbitCoords.push({
							lat: lat,
							lng: lng,
							alt: alt,
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

		const interval = setInterval(updateAllPaths, 1000);
		return () => clearInterval(interval);
	}, []);

	return { globeData, pathData };
};
export default useSatellites;
