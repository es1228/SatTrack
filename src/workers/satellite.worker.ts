import {
	degreesLat,
	degreesLong,
	eciToGeodetic,
	gstime,
	propagate,
	twoline2satrec,
} from "satellite.js";

const EARTH_RADIUS_KM = 6371;

self.onmessage = (event: MessageEvent) => {
	const { satChunks } = event.data;
	const now = new Date();
    const gmst = gstime(now);

	const updatedSats = satChunks
		.map((sat: string) => {
			const lines = sat.split("\n");
			const satRec = twoline2satrec(lines[1], lines[2]);
			const name = lines[0];

			const posAndVelo = propagate(satRec, now);
			const posEci = posAndVelo?.position;

			if (posEci) {
				const posGd = eciToGeodetic(posEci, gmst);

				const lat = degreesLat(posGd.latitude);
				const lng = degreesLong(posGd.longitude);

				const altFactor = posGd.height / EARTH_RADIUS_KM;

				return {
					name: name,
					lat: lat,
					lng: lng,
					alt: altFactor,
					radius: 0.01,
					color: "green",
				};
			}
			return null;
		})
		.filter(Boolean);

	self.postMessage(updatedSats);
};
