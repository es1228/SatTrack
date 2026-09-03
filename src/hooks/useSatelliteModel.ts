import { useEffect, useState } from "react";
import type { Group } from "three";
import { DRACOLoader, GLTFLoader } from "three/examples/jsm/Addons.js";

const useSatelliteModel = () => {
	const [satelliteScene, setSatelliteScene] = useState<Group | null>(null);

	useEffect(() => {
        // use draco decoding for iss model (necessary)
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath(
			"https://www.gstatic.com/draco/versioned/decoders/1.5.6/",
		);

		const loader = new GLTFLoader();
		loader.setDRACOLoader(dracoLoader);

		loader.load(
			`${import.meta.env.BASE_URL}3d/satellite.glb`,
			(gltf) => {
				gltf.scene.scale.set(5, 5, 5);
                gltf.scene.rotateX(45);
				setSatelliteScene(gltf.scene);
			},
			undefined,
			(error) => {
				console.error("Unable to load Satellite 3D Model:", error);
			},
		);
	}, []);

	return { satelliteScene };
};
export default useSatelliteModel;
