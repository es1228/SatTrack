import { useEffect, useState } from "react";
import { ShaderMaterial, TextureLoader, Vector2 } from "three";
import { dayNightShader } from "../utils/dayNightShader";
// @ts-ignore
import * as solar from "solar-calculator";

const useDayNight = () => {
	const [dt, setDt] = useState(Date.now());
	const [globeMaterial, setGlobeMaterial] = useState<ShaderMaterial>();

	useEffect(() => {
		(function updateToRealTime() {
			setDt(Date.now());
			requestAnimationFrame(updateToRealTime);
		})();
	}, []);

	useEffect(() => {
		Promise.all([
			new TextureLoader().loadAsync(
				"//cdn.jsdelivr.net/npm/three-globe/example/img/earth-day.jpg",
			),
			new TextureLoader().loadAsync(
				"//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg",
			),
		]).then(([dayTexture, nightTexture]) => {
			setGlobeMaterial(
				new ShaderMaterial({
					uniforms: {
						dayTexture: { value: dayTexture },
						nightTexture: { value: nightTexture },
						sunPosition: { value: new Vector2() },
						globeRotation: { value: new Vector2() },
					},
					vertexShader: dayNightShader.vertexShader,
					fragmentShader: dayNightShader.fragmentShader,
				}),
			);
		});
	}, []);

	useEffect(() => {
		// Update Sun position
		globeMaterial?.uniforms.sunPosition.value.set(...sunPosAt(dt));
	}, [dt, globeMaterial]);

	const sunPosAt = (dt: number) => {
		const day = new Date(+dt).setUTCHours(0, 0, 0, 0);
		const t = solar.century(dt);
		const longitude = ((day - dt) / 864e5) * 360 - 180;
		return [longitude - solar.equationOfTime(t) / 4, solar.declination(t)];
	};

	return { dt, globeMaterial };
};
export default useDayNight;
