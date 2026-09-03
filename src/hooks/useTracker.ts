import { useEffect, useState, type RefObject } from "react";
import { type SatelliteData } from "./useSatellites";
import type { GlobeMethods } from "react-globe.gl";

const useTracker = (
	particlesData: SatelliteData[],
	globeRef: RefObject<GlobeMethods | undefined>,
) => {
	const [trackedSat, setTrackedSat] = useState<SatelliteData | null>(null);

	// initial tracking (go to location)
	useEffect(() => {
		if (trackedSat && globeRef.current) {
			const currentSat = particlesData.find(
				(s) => s.name === trackedSat.name,
			);

			if (currentSat) {
				const coords = globeRef.current.getCoords(
					currentSat.lat,
					currentSat.lng,
					currentSat.alt,
				);

				if (coords) {
					globeRef.current.pointOfView({
						lat: currentSat.lat,
						lng: currentSat.lng,
						altitude: currentSat.alt + 0.1,
					});
				}
			}
		}
	}, [trackedSat]);

	// tracking lock
	useEffect(() => {
		let animationFrameID: number;

		const updateTracking = () => {
			if (trackedSat && globeRef.current) {
				const currentSat = particlesData.find(
					(s) => s.name === trackedSat.name,
				);

				if (currentSat) {
					const coords = globeRef.current.getCoords(
						currentSat.lat,
						currentSat.lng,
						currentSat.alt,
					);

					if (coords) {
						globeRef.current.pointOfView({
							lat: currentSat.lat,
							lng: currentSat.lng,
						});
					}
				}
			}
			animationFrameID = requestAnimationFrame(updateTracking);
		};
		animationFrameID = requestAnimationFrame(updateTracking);

		return () => cancelAnimationFrame(animationFrameID);
	}, [particlesData, trackedSat]);

	return [trackedSat, setTrackedSat] as const;
};
export default useTracker;
