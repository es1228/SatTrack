import { useMemo } from "react";
import {
	eciToGeodetic,
	gstime,
	propagate,
	radiansToDegrees,
	twoline2satrec,
} from "satellite.js";

const useParticles = (satellites: string[], time: Date) => {
	const satRecords = useMemo(
		() =>
			satellites.map((sat) => {
				const lines = sat.split("\n");
				return {
					name: lines[0],
					satrec: twoline2satrec(lines[1], lines[2]),
				};
			}),
		[satellites],
	);

	const particlesData = useMemo(() => {
		if (!satRecords) return [];

		// Update satellite positions
		const now = new Date();
		const gmst = gstime(now);
		const EARTH_RADIUS_KM = 6371;

		return [
			satRecords
				.map((sat) => {
					const eci = propagate(sat.satrec, now);
					if (eci?.position) {
						const gdPos = eciToGeodetic(eci.position, gmst);
						const lat = radiansToDegrees(gdPos.latitude);
						const lng = radiansToDegrees(gdPos.longitude);
						const alt = gdPos.height / EARTH_RADIUS_KM;

						return {
							...sat,
							lat,
							lng,
							alt,
							text: `<b>Name: ${sat.name}<b>
                            <br/>
                            Latitude: ${lat.toFixed(2)}°
                            <br/>
                            Longitude: ${lng.toFixed(2)}°
                            <br/>
                            Altitude: ${Math.round(gdPos.height)}km`,
						};
					}
					return null;
				})
				.filter((sat) => sat !== null && !sat.name.includes("ISS")),
		];
	}, [satRecords, time]);

	return { particlesData };
};
export default useParticles;
