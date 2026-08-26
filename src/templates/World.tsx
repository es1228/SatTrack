import Globe from "react-globe.gl";
import useDayNight from "../hooks/useDayNight";
import { useCallback } from "react";

const World = () => {
	const { dt, globeMaterial } = useDayNight();

	return (
		<div>
			<Globe
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
			/>
			<div id="time" className="fixed bottom-4 left-4 z-50 text-white">
				{new Date(dt).toLocaleString()}
			</div>
		</div>
	);
};
export default World;
