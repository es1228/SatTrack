import Globe, { type GlobeMethods } from "react-globe.gl";
import useDayNight from "../hooks/useDayNight";
import { useCallback, useRef } from "react";
import { Mesh, MeshBasicMaterial, SphereGeometry } from "three";
import useSatellites, { type SatelliteData } from "../hooks/useSatellites";

const World = () => {
	const { dt, globeMaterial } = useDayNight();
	const sampleData = [
		"ISS (ZARYA)\n1 25544U 98067A   26241.53070935  .00006055  00000+0  11827-3 0  9994\n2 25544  51.6318 297.0786 0005001  87.3553 272.8007 15.48928101583126",
	];
	const { globeData } = useSatellites(sampleData);
	const globeRef = useRef<GlobeMethods | undefined>(undefined);

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
