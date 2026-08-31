import Globe, { type GlobeMethods } from "react-globe.gl";
import useDayNight from "../hooks/useDayNight";
import { useCallback, useMemo, useRef } from "react";
import { Mesh, MeshBasicMaterial, SphereGeometry } from "three";
import useSatellites, {
	type OrbitPath,
	type SatelliteData,
} from "../hooks/useSatellites";
import rawTle from "../data/sample.tle?raw";
import { splitIntoLineChunks } from "../utils/splitIntoLineChunks";

const World = () => {
	const { dt, globeMaterial } = useDayNight();

	const sampleData = useMemo(() => splitIntoLineChunks(rawTle), []);

	const { globeData, pathData } = useSatellites(sampleData);
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
				objectsData={globeData as SatelliteData[]}
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
				objectLabel={(d) => (d as SatelliteData).text}
				pathsData={pathData}
				pathPoints="coords"
				pathPointLat={(p) => p.lat}
				pathPointLng={(p) => p.lng}
				pathPointAlt={(p) => p.alt}
				pathColor={(p: any) => (p as OrbitPath).color}
				pathTransitionDuration={0}
			/>
			<div id="time" className="fixed bottom-4 left-4 z-50 text-white">
				{new Date(dt).toLocaleString()}
			</div>
		</div>
	);
};
export default World;
