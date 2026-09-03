import Globe, { type GlobeMethods } from "react-globe.gl";
import useDayNight from "../hooks/useDayNight";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Mesh, MeshBasicMaterial, SphereGeometry } from "three";
import useSatellites from "../hooks/useSatellites";
import rawTle from "../data/sample.tle?raw";
import fullTle from "../data/lowDetail.tle?raw";
import { splitIntoLineChunks } from "../utils/splitIntoLineChunks";
import useParticles from "../hooks/useParticles";
import useTracker from "../hooks/useTracker";
import useISSModel from "../hooks/useISSModel";
import useSatellitePath from "../hooks/useSatellitePath";
import SearchContainer from "../components/SearchContainer";
import type { OrbitPath, SatelliteData } from "../types/types";
import TrackerHud from "../components/TrackerHud";

const World = () => {
	const globeRef = useRef<GlobeMethods | undefined>(undefined);

	const { dt, globeMaterial } = useDayNight();

	// high-detail satellites (3d) and low detail satellites (particles)
	const sampleData = useMemo(() => splitIntoLineChunks(rawTle), []);
	const ldData = useMemo(() => splitIntoLineChunks(fullTle), []);

	// update particle satellites every 3 seconds
	const [particlesUpdateTime, setParticlesUpdateTime] = useState(new Date());

	useEffect(() => {
		const interval = setInterval(() => {
			setParticlesUpdateTime(new Date());
		}, 3000);

		return () => clearInterval(interval);
	}, []);

	// high res satellites data + paths
	const { globeData } = useSatellites(sampleData);

	// low res satellites (particles) data
	const { particlesData } = useParticles(ldData, particlesUpdateTime);

	const [trackedSat, setTrackedSat] = useTracker(
		particlesData.flat().filter((s) => s !== null),
		globeRef,
	);
	const { pathData } = useSatellitePath(trackedSat);

	// iss 3d model
	const { issScene } = useISSModel();

	const handleZoom = useCallback(
		({ lng, lat }: { lng: number; lat: number }) =>
			globeMaterial?.uniforms.globeRotation.value.set(lng, lat),
		[globeMaterial],
	);

	// cache iss 3d model to improve performance
	const cachedISSObj = useMemo(() => {
		if (!issScene) return null;
		return issScene.clone();
	}, [issScene]);

	if (!globeData || globeData.length === 0) return null;

	return (
		<div>
			<Globe
				ref={globeRef}
				globeMaterial={globeMaterial}
				backgroundImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
				// Update globe rotation on shader
				onZoom={handleZoom}
				particlesData={particlesData}
				particleLat={(d) => (d as SatelliteData).lat}
				particleLng={(d) => (d as SatelliteData).lng}
				particleAltitude={(d) => (d as SatelliteData).alt}
				particlesColor={() => "palegreen"}
				particleLabel={(d) => (d as SatelliteData).text}
				objectsData={globeData as SatelliteData[]}
				objectLat={(d) => (d as SatelliteData).lat}
				objectLng={(d) => (d as SatelliteData).lng}
				objectAltitude={(d) => (d as SatelliteData).alt}
				objectThreeObject={(d) => {
					const sat = d as SatelliteData;

					// console.log(
					// 	"Name: " + sat.name,
					// 	"ISS Loaded: " + !!issScene,
					// );

					if (sat.name.includes("ISS") && cachedISSObj)
						return cachedISSObj;
					else
						return new Mesh(
							new SphereGeometry(sat.radius),
							new MeshBasicMaterial({
								color: sat.color,
							}),
						);
				}}
				objectLabel={(d) => (d as SatelliteData).text}
				onParticleClick={(d) => setTrackedSat(d as SatelliteData)}
				onObjectClick={(d) => setTrackedSat(d as SatelliteData)}
				pathsData={pathData}
				pathPoints="coords"
				pathPointLat={(p) => p.lat}
				pathPointLng={(p) => p.lng}
				pathPointAlt={(p) => p.alt}
				pathColor={(p: any) => (p as OrbitPath).color}
				pathTransitionDuration={0}
				pathDashLength={(p: any) =>
					(p as OrbitPath).type === "dashed" ? 0.0005 : 1
				}
				pathDashGap={(p: any) =>
					(p as OrbitPath).type === "dashed" ? 0.0003 : 1
				}
			/>
			<TrackerHud trackedSat={trackedSat} particlesData={particlesData.flat()}/>
			<SearchContainer
				satelliteRecords={particlesData
					.flat()
					.filter((sat) => sat !== null)}
				onClick={(sat: SatelliteData) => setTrackedSat(sat)}
			/>
			<div id="time" className="fixed bottom-4 left-4 z-50 text-white">
				{new Date(dt).toLocaleString()}
			</div>
			<div
				id="tracking"
				className="fixed right-4 bottom-4 z-50 text-white"
			>
				<button
					onClick={() => setTrackedSat(null)}
					className="mr-2 rounded-3xl bg-neutral-950/40 p-2 backdrop-blur-3xl hover:cursor-pointer"
				>
					{trackedSat && `Unlock`}
				</button>
				{trackedSat && `Currently Tracking: ${trackedSat.name.trim()}`}
			</div>
		</div>
	);
};
export default World;
