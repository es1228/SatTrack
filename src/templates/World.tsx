import Globe, { type GlobeMethods } from "react-globe.gl";
import useDayNight from "../hooks/useDayNight";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	degreesLat,
	degreesLong,
	eciToGeodetic,
	gstime,
	propagate,
	twoline2satrec,
} from "satellite.js";
import { Mesh, MeshBasicMaterial, SphereGeometry } from "three";

type SatelliteData = {
	name: string;
	lat: number;
	lng: number;
	alt: number;
	radius: number;
	color: string;
};

const World = () => {
	const { dt, globeMaterial } = useDayNight();
	const globeRef = useRef<GlobeMethods | undefined>(undefined);
	const [globeData, setGlobeData] = useState<SatelliteData[]>([]);
	const sampleData = [
		"ISS (ZARYA)\n1 25544U 98067A   26241.53070935  .00006055  00000+0  11827-3 0  9994\n2 25544  51.6318 297.0786 0005001  87.3553 272.8007 15.48928101583126",
	];

	useEffect(() => {
		const satRecords = sampleData.map((sat) => ({
			name: "ISS (ZARYA)",
			satrec: twoline2satrec(
				"1 25544U 98067A   26241.53070935  .00006055  00000+0  11827-3 0  9994",
				"2 25544  51.6318 297.0786 0005001  87.3553 272.8007 15.48928101583126",
			),
		}));

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

	return (
		<div>
			<Globe
				ref={globeRef}
				globeMaterial={globeMaterial}
				backgroundImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
				// Update globe rotation on shader
				onZoom={useCallback(
					({ lng, lat }) =>
						globeMaterial?.uniforms.globeRotation.value.set(
							lng,
							lat,
						),
					[globeMaterial],
				)}
				objectsData={globeData}
				objectLat={(d) => (d as SatelliteData).lat}
				objectLng={(d) => (d as SatelliteData).lng}
				objectAltitude={(d) => (d as SatelliteData).alt}
				customThreeObject={(d) =>
					new Mesh(
						new SphereGeometry((d as SatelliteData).radius),
						new MeshBasicMaterial({
							color: (d as SatelliteData).color,
						}),
					)
				}
				labelsData={globeData}
				labelLat={(d) => (d as SatelliteData).lat}
				labelLng={(d) => (d as SatelliteData).lng}
				labelAltitude={(d) => (d as SatelliteData).alt}
				labelText={(d) => (d as SatelliteData).name}
				labelSize={0.4}
				labelDotRadius={0}
				labelColor={() => "white"}
			/>
			<div id="time" className="fixed bottom-4 left-4 z-50 text-white">
				{new Date(dt).toLocaleString()}
			</div>
		</div>
	);
};
export default World;
