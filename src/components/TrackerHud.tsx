import type { City, SatelliteData } from "../types/types";
// @ts-ignore
import { nearestCity } from "cityjs";

type TrackerHudProps = {
	trackedSat: SatelliteData | null;
    particlesData: SatelliteData[];
};

const TrackerHud = ({ trackedSat, particlesData }: TrackerHudProps) => {
	if (!trackedSat) return null;

    const activeSat = particlesData.find(s => s.name === trackedSat.name)

    if (!activeSat) return null;

	const EARTH_RADIUS_M = 6.371e6;
	const EARTH_MASS_KG = 5.9722e24;
	const GRAV_CONST = 6.674e-11;

	const alt = Math.round(activeSat.alt * EARTH_RADIUS_M);
	const period =
		2 *
		Math.PI *
		Math.sqrt((EARTH_RADIUS_M + alt) ** 3 / (GRAV_CONST * EARTH_MASS_KG));

	// format period
	const days = Math.floor(period / 86400);
	const hours = Math.floor((period % 86400) / 3600);
	const minutes = Math.floor((period % 3600) / 60);
	const seconds = Math.floor(period % 60);

	const formattedPeriod = `${days}d ${hours}h ${minutes}m ${seconds}s`;

	const closestCity: City = nearestCity({
		latitude: activeSat.lat,
		longitude: activeSat.lng,
	});

    const alt_km = Math.round(alt / 1000);

    let classification;

    if (alt_km < 2000) classification = "LEO (Low Earth Orbit)";
    else if (alt_km < 35760) classification = "MEO (Medium Earth Orbit)"
    else if (alt_km > 35760 && alt_km < 35800 && activeSat.lat < 1) classification = "GEO (Geostationary)"
    else if (alt_km > 35760 && alt_km < 35800 && activeSat.lat >= 1) classification = "GEO (Geosynchronous)"
    else classification = "HEO (High Earth Orbit)"

	return (
		<div className="fixed top-5 right-5 space-y-2 rounded-3xl bg-neutral-950/80 p-4 text-white backdrop-blur-3xl w-80">
			<h1 className="text-3xl">{activeSat.name}</h1>
			<p>Latitude: {activeSat.lat.toFixed(2)}</p>
			<p>Longitude: {activeSat.lng.toFixed(2)}</p>
			<p>
				Closest City: {closestCity.name}, {closestCity.countryCode}
			</p>
			<p>Altitude: {alt_km} km</p>
			<p>Period: {formattedPeriod}</p>
            <p>Classification: {classification}</p>
		</div>
	);
};
export default TrackerHud;
