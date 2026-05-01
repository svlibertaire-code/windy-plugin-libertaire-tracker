import { parseGPX, toLatLngArray, getTrackDateRange } from './gpxParser';
import type { TrackPoint, ParsedGPX } from './gpxParser';

export interface DisplayTrack {
    id: string;
    name: string;
    color: string;
    visible: boolean;
    points: TrackPoint[];
    dateRange: { start?: string; end?: string };
    polyline?: L.Polyline;
    markers?: L.Marker[];
}

let tracks: DisplayTrack[] = [];
let nextId = 1;

const COLORS = [
    '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
    '#1abc9c', '#e91e63', '#ff5722', '#795548', '#607d8b',
];

function getNextColor(): string {
    return COLORS[(nextId - 1) % COLORS.length];
}

function generateId(): string {
    return `track-${nextId++}`;
}

export function getTracks(): DisplayTrack[] {
    return tracks;
}

export function addTrackFromGPX(parsed: ParsedGPX, name?: string): DisplayTrack[] {
    const newTracks: DisplayTrack[] = [];

    parsed.tracks.forEach((segment, index) => {
        const id = generateId();
        const color = getNextColor();
        const dateRange = getTrackDateRange(segment.points);
        const trackName = name
            ? parsed.tracks.length > 1
                ? `${name} - Segment ${index + 1}`
                : name
            : `Track ${nextId - 1}`;

        newTracks.push({
            id,
            name: trackName,
            color,
            visible: true,
            points: segment.points,
            dateRange,
        });
    });

    tracks = [...tracks, ...newTracks];
    return newTracks;
}

export function updateTrack(id: string, updates: Partial<Pick<DisplayTrack, 'name' | 'color' | 'visible'>>): void {
    const track = tracks.find(t => t.id === id);
    if (!track) return;

    if (updates.name !== undefined) track.name = updates.name;
    if (updates.color !== undefined) track.color = updates.color;
    if (updates.visible !== undefined) track.visible = updates.visible;
}

export function removeTrack(id: string): void {
    tracks = tracks.filter(t => t.id !== id);
}

export function clearAllTracks(): void {
    tracks = [];
    nextId = 1;
}

export { parseGPX, toLatLngArray, getTrackDateRange };
export type { TrackPoint, ParsedGPX };
