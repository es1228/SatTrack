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
import type { City, SatelliteData, SatRecord } from "../types/types";

const useSatellites = (satellites: string[]) => {
	const [globeData, setGlobeData] = useState<SatelliteData[]>([]);

	const EARTH_RADIUS_KM = 6371;

	const satRecords: SatRecord[] = satellites.map((sat) => {
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
