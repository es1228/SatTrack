import Globe, { type GlobeMethods } from "react-globe.gl";
import useDayNight from "../hooks/useDayNight";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Group, Mesh, MeshBasicMaterial, SphereGeometry } from "three";
import useSatellites, {
	type OrbitPath,
	type SatelliteData,
} from "../hooks/useSatellites";
import rawTle from "../data/sample.tle?raw";
import fullTle from "../data/lowDetail.tle?raw";
import { splitIntoLineChunks } from "../utils/splitIntoLineChunks";
import useParticles from "../hooks/useParticles";
import { DRACOLoader, GLTFLoader } from "three/examples/jsm/Addons.js";

const World = () => {
	const { dt, globeMaterial } = useDayNight();

	const sampleData = useMemo(() => splitIntoLineChunks(rawTle), []);
	const ldData = useMemo(() => splitIntoLineChunks(fullTle), []);

	const [time, setTime] = useState(new Date());
	useEffect(() => {
		const interval = setInterval(() => {
			setTime(new Date());
		}, 3000);

		return () => clearInterval(interval);
	}, []);

	const { globeData, pathData } = useSatellites(sampleData);
	const { particlesData } = useParticles(ldData, time);
	const globeRef = useRef<GlobeMethods | undefined>(undefined);

	const [issScene, setISSScene] = useState<Group | null>(null);
	useEffect(() => {
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath(
			"https://www.gstatic.com/draco/versioned/decoders/1.5.6/",
		);

		const loader = new GLTFLoader();
		loader.setDRACOLoader(dracoLoader);

		loader.load(
			`${import.meta.env.BASE_URL}3d/iss.glb`,
			(gltf) => {
				gltf.scene.scale.set(0.1, 0.1, 0.1);
				setISSScene(gltf.scene);
			},
			undefined,
			(error) => {
				console.error("Unable to load ISS 3D Model:", error);
			},
		);
	}, []);

	const trackedSatRef = useRef<SatelliteData | null>(null);

	useEffect(() => {
		let animationFrameID: number;

		const updateTracking = () => {
			if (trackedSatRef.current && globeRef.current) {
				const currentTracked = trackedSatRef.current;

				const currentSat = globeData.find(
					(s) => s.name === currentTracked.name,
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
						}, 300);
					}
				}
			}
			animationFrameID = requestAnimationFrame(updateTracking);
		};
		animationFrameID = requestAnimationFrame(updateTracking);

		return () => cancelAnimationFrame(animationFrameID);
	}, [globeData]);

	const handleZoom = useCallback(
		({ lng, lat }: { lng: number; lat: number }) =>
			globeMaterial?.uniforms.globeRotation.value.set(lng, lat),
		[globeMaterial],
	);

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

					if (sat.name.trim() === "ISS (ZARYA)" && cachedISSObj)
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
				onObjectClick={(d) => {
					const sat = d as SatelliteData;
					trackedSatRef.current = sat;
				}}
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
			<div id="tracking" className="fixed bottom-4 right-4 z-50 text-white">
				{trackedSatRef.current && `Currently Tracking: ${trackedSatRef.current?.name.trim()}`}
			</div>
		</div>
	);
};
export default World;
