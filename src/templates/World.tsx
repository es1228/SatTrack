import Globe from "react-globe.gl"
import { useState, useEffect, useCallback } from "react";
import { TextureLoader, ShaderMaterial, Vector2 } from "three";
// @ts-ignore
import * as solar from "solar-calculator";

// Custom shader:  Blends night and day images to simulate day/night cycle
const dayNightShader = {
	vertexShader: `
      varying vec3 vNormal;
      varying vec2 vUv;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
	fragmentShader: `
      #define PI 3.141592653589793
      uniform sampler2D dayTexture;
      uniform sampler2D nightTexture;
      uniform vec2 sunPosition;
      uniform vec2 globeRotation;
      varying vec3 vNormal;
      varying vec2 vUv;

      float toRad(in float a) {
        return a * PI / 180.0;
      }

      vec3 Polar2Cartesian(in vec2 c) { // [lng, lat]
        float theta = toRad(90.0 - c.x);
        float phi = toRad(90.0 - c.y);
        return vec3( // x,y,z
          sin(phi) * cos(theta),
          cos(phi),
          sin(phi) * sin(theta)
        );
      }

      void main() {
        float invLon = toRad(globeRotation.x);
        float invLat = -toRad(globeRotation.y);
        mat3 rotX = mat3(
          1, 0, 0,
          0, cos(invLat), -sin(invLat),
          0, sin(invLat), cos(invLat)
        );
        mat3 rotY = mat3(
          cos(invLon), 0, sin(invLon),
          0, 1, 0,
          -sin(invLon), 0, cos(invLon)
        );
        vec3 rotatedSunDirection = rotX * rotY * Polar2Cartesian(sunPosition);
        float intensity = dot(normalize(vNormal), normalize(rotatedSunDirection));
        vec4 dayColor = texture2D(dayTexture, vUv);
        vec4 nightColor = texture2D(nightTexture, vUv);
        float blendFactor = smoothstep(-0.1, 0.1, intensity);
        gl_FragColor = mix(nightColor, dayColor, blendFactor);
      }
    `,
};

const sunPosAt = (dt: number) => {
	const day = new Date(+dt).setUTCHours(0, 0, 0, 0);
	const t = solar.century(dt);
	const longitude = ((day - dt) / 864e5) * 360 - 180;
	return [longitude - solar.equationOfTime(t) / 4, solar.declination(t)];
};

const World = () => {
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
			<div id="time" className="fixed bottom-4 left-4 z-50 text-white">{new Date(dt).toLocaleString()}</div>
		</div>
	);
};
export default World;
