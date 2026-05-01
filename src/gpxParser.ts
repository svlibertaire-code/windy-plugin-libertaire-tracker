/**
 * Parse a GPX string and extract track segments with timestamps
 */
export interface TrackPoint {
    lat: number;
    lon: number;
    ele?: number;
    time?: string;
}

export interface TrackSegment {
    points: TrackPoint[];
}

export interface ParsedGPX {
    tracks: TrackSegment[];
    waypoints: TrackPoint[];
}

export function parseGPX(gpxString: string): ParsedGPX {
    const parser = new DOMParser();
    const doc = parser.parseFromString(gpxString, 'text/xml');

    // Check for parse errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
        throw new Error('Invalid GPX file');
    }

    const tracks: TrackSegment[] = [];
    const waypoints: TrackPoint[] = [];

    // Parse tracks (trk > trkseg > trkpt)
    const trackElements = doc.querySelectorAll('trk');
    trackElements.forEach(trk => {
        const segments = trk.querySelectorAll('trkseg');
        segments.forEach(seg => {
            const points: TrackPoint[] = [];
            const trackPoints = seg.querySelectorAll('trkpt');
            trackPoints.forEach(pt => {
                const lat = parseFloat(pt.getAttribute('lat') || '0');
                const lon = parseFloat(pt.getAttribute('lon') || '0');
                const eleEl = pt.querySelector('ele');
                const timeEl = pt.querySelector('time');
                points.push({
                    lat,
                    lon,
                    ele: eleEl ? parseFloat(eleEl.textContent || '0') : undefined,
                    time: timeEl ? timeEl.textContent || undefined : undefined,
                });
            });
            if (points.length > 0) {
                tracks.push({ points });
            }
        });
    });

    // Parse waypoints (wpt)
    const waypointElements = doc.querySelectorAll('wpt');
    waypointElements.forEach(wpt => {
        const lat = parseFloat(wpt.getAttribute('lat') || '0');
        const lon = parseFloat(wpt.getAttribute('lon') || '0');
        const eleEl = wpt.querySelector('ele');
        const timeEl = wpt.querySelector('time');
        waypoints.push({
            lat,
            lon,
            ele: eleEl ? parseFloat(eleEl.textContent || '0') : undefined,
            time: timeEl ? timeEl.textContent || undefined : undefined,
        });
    });

    return { tracks, waypoints };
}

/**
 * Get date range from GPX track points
 */
export function getTrackDateRange(points: TrackPoint[]): { start?: string; end?: string } {
    const times = points
        .map(p => p.time)
        .filter((t): t is string => !!t)
        .sort();
    return {
        start: times[0],
        end: times[times.length - 1],
    };
}

/**
 * Convert TrackPoint array to Leaflet LatLng array
 */
export function toLatLngArray(points: TrackPoint[]): [number, number][] {
    return points.map(p => [p.lat, p.lon]);
}
