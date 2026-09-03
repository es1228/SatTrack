import type { SatRec } from "satellite.js";

export type OrbitPath = {
    name: string;
    type: string;
    color: string;
    coords: { lat: number; lng: number; alt: number }[];
};

export type SatelliteData = {
    name: string;
    satrec: SatRec;
    text: string;
    lat: number;
    lng: number;
    alt: number;
    radius: number;
    color: string;
};

export type City = {
    latitude: number;
    longitude: number;
    name: string;
    countryCode: string;
    distance: number;
};

export type SatRecord = {
    name: string;
    satrec: SatRec;
}
