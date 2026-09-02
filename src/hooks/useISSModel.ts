import { useEffect, useState } from "react";
import type { Group } from "three";
import { DRACOLoader, GLTFLoader } from "three/examples/jsm/Addons.js";

const useISSModel = () => {
	const [issScene, setISSScene] = useState<Group | null>(null);

	useEffect(() => {
        // use draco decoding for iss model (necessary)
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

	return { issScene };
};
export default useISSModel;
