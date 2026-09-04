import { useEffect, useMemo, useState } from "react";
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
import type { City, SatelliteData } from "../types/types";

const useSatellites = (
	satellites: string[],
	trackedSat: SatelliteData | null,
) => {
	const [globeData, setGlobeData] = useState<SatelliteData[]>([]);

	const EARTH_RADIUS_KM = 6371;

	const satRecords = useMemo(() => {
		return satellites.map((sat) => {
			const lines = sat.split("\n");

			if (!lines || lines.length < 3 || !lines[1] || !lines[2])
				return null;

			try {
				return {
					name: lines[0],
					satrec: twoline2satrec(lines[1], lines[2]),
				};
			} catch {
				console.warn("Skipping malformed TLE:", lines[0]);
				return null;
			}
		});
	}, [satellites]);

	useEffect(() => {
		if (trackedSat) satRecords.push(trackedSat);
		else satRecords.filter((s) => s !== trackedSat);
	}, [trackedSat]);

	// position updates
	useEffect(() => {
		const updateAllPos = () => {
			const now = new Date();

			const updatedSats = satRecords
				.filter((sat) => sat !== null)
				.map((sat) => {
					const posAndVelo = propagate(sat.satrec, now);
					const posEci = posAndVelo?.position;

					if (posEci) {
						const gmst = gstime(now);
						const posGd = eciToGeodetic(posEci, gmst);

						const lat = degreesLat(posGd.latitude);
						const lng = degreesLong(posGd.longitude);

						const alt = posGd.height / EARTH_RADIUS_KM;

						const closestCity: City = nearestCity({
							latitude: lat,
							longitude: lng,
						});

						return {
							name: sat.name,
							satrec: sat.satrec,
							text: `<b>Name: ${sat.name}<b>
                            <br/>
                            Latitude: ${lat.toFixed(2)}°
                            <br/>
                            Longitude: ${lng.toFixed(2)}°
							<br/>
                            Nearest City: ${closestCity.name}, ${closestCity.countryCode}
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
				});

			setGlobeData(updatedSats as SatelliteData[]);
		};
		updateAllPos();

		const interval = setInterval(updateAllPos, 3000);
		return () => clearInterval(interval);
	}, [satRecords]);

	return { globeData };
};
export default useSatellites;
