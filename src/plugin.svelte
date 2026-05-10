<div class="plugin__mobile-header">
    { title }
</div>
<section class="plugin__content">
    <div
        class="plugin__title plugin__title--chevron-back"
        on:click={ () => bcast.emit('rqstOpen', 'menu') }
    >
        { title }
    </div>

    <!-- Autoload status -->
    <div class="autoload-status">
        {#if isLoadingPreloaded}
            <div class="loading">Loading Libertaire tracks automatically...</div>
        {:else if tracks.length > 0}
            <div class="loaded-status">Libertaire tracks loaded automatically.</div>
        {/if}
        {#if preloadError}
            <div class="preload-error">{ preloadError }</div>
        {/if}
    </div>

    <!-- Track List -->
    {#if tracks.length > 0}
        <div class="track-list">
            <div class="list-header">
                <span>Tracks ({ tracks.length })</span>
                <button class="btn-clear" on:click={ clearAll }>Clear all</button>
            </div>
            {#each tracks as track (track.id)}
                <div class="track-item" class:hidden={ !track.visible }>
                    <div class="track-color-wrapper">
                        <input
                            type="color"
                            class="track-color"
                            value={ track.color }
                            on:input={ (e) => updateColor(track.id, e.currentTarget.value) }
                            title="Change color"
                        />
                    </div>
                    <div class="track-info">
                        <input
                            type="text"
                            class="track-name"
                            value={ track.name }
                            on:input={ (e) => updateName(track.id, e.currentTarget.value) }
                            title="Edit name"
                        />
                        <div class="track-meta">
                            { track.points.length } points
                            {#if track.dateRange.start}
                                · { formatDate(track.dateRange.start) }
                            {/if}
                        </div>
                    </div>
                    <div class="track-actions">
                        <button
                            class="btn-toggle"
                            class:active={ track.visible }
                            on:click={ () => toggleVisibility(track.id) }
                            title={ track.visible ? 'Hide' : 'Show' }
                        >
                            { track.visible ? '👁' : '🚫' }
                        </button>
                        <button
                            class="btn-delete"
                            on:click={ () => deleteTrack(track.id) }
                            title="Remove"
                        >
                            🗑
                        </button>
                    </div>
                </div>
            {/each}
        </div>

        <div class="actions">
            <button class="btn-fit" on:click={ fitAllTracks }>
                Fit all tracks
            </button>
        </div>
    {:else}
        <div class="empty-state">
            {#if isLoadingPreloaded}
                <div class="loading">Loading Libertaire tracks...</div>
            {:else}
                <div>Tracks did not load automatically.</div>
                <button class="btn-preload" on:click={ loadPreloadedTracks }>
                    Retry loading Libertaire tracks
                </button>
            {/if}
        </div>
    {/if}
</section>

<script lang="ts">
    import bcast from '@windy/broadcast';
    import { map } from '@windy/map';
    import { onDestroy, onMount } from 'svelte';

    import config from './pluginConfig';
    import {
        getTracks,
        addTrackFromGPX,
        updateTrack,
        removeTrack,
        clearAllTracks,
        parseGPX,
        toLatLngArray,
        loadRemoteGPX,
    } from './trackManager';
    import type { DisplayTrack } from './trackManager';

    const { title } = config;

    let tracks: DisplayTrack[] = [];
    let isDragging = false;
    let fileInput: HTMLInputElement;
    let dragCounter = 0;

    // Map layers storage
    const polylines: Map<string, L.Polyline[]> = new Map();
    const markers: Map<string, L.Marker[]> = new Map();

    function splitAntimeridian(latLngs: [number, number][]): [number, number][][] {
        if (!latLngs || latLngs.length < 2) return latLngs ? [latLngs] : [];

        const segments: [number, number][][] = [];
        let current: [number, number][] = [latLngs[0]];

        for (let i = 1; i < latLngs.length; i++) {
            const prev = latLngs[i - 1];
            const curr = latLngs[i];
            const prevLat = prev[0];
            const prevLng = prev[1];
            const currLat = curr[0];
            const currLng = curr[1];

            if (Math.abs(currLng - prevLng) > 180) {
                const prevDist = Math.abs(180 - Math.abs(prevLng));
                const currDist = Math.abs(180 - Math.abs(currLng));
                const frac = prevDist / (prevDist + currDist);
                const edgeLat = prevLat + (currLat - prevLat) * frac;
                const edgeLng1 = prevLng > 0 ? 180 : -180;
                const edgeLng2 = currLng > 0 ? 180 : -180;

                current.push([edgeLat, edgeLng1]);
                segments.push(current);
                current = [[edgeLat, edgeLng2], curr];
            } else {
                current.push(curr);
            }
        }

        segments.push(current);
        return segments.filter(segment => segment.length >= 2);
    }

    function renderTrack(track: DisplayTrack): void {
        // Remove existing if any
        removeFromMap(track.id);

        if (!track.visible || track.points.length === 0) {
            tracks = getTracks();
            return;
        }

        const latLngs = toLatLngArray(track.points);
        const splitSegments = splitAntimeridian(latLngs);

        // Create split polylines so tracks crossing ±180° do not draw across the whole map
        const trackPolylines = splitSegments.map(segment => new L.Polyline(segment, {
            color: track.color,
            weight: 3,
            opacity: 0.85,
            lineJoin: 'round',
        }).addTo(map));

        // Highlight all split segments together on hover
        trackPolylines.forEach(polyline => {
            polyline.on('mouseover', () => trackPolylines.forEach(p => p.setStyle({ weight: 5, opacity: 1 })));
            polyline.on('mouseout', () => trackPolylines.forEach(p => p.setStyle({ weight: 3, opacity: 0.85 })));
        });

        // Start/end markers
        const trackMarkers: L.Marker[] = [];

        if (latLngs.length > 0) {
            const startMarker = new L.CircleMarker(latLngs[0], {
                radius: 5,
                fillColor: track.color,
                color: '#fff',
                weight: 2,
                fillOpacity: 1,
            }).addTo(map);
            startMarker.bindPopup(`<b>${track.name}</b><br/>Start`);
            trackMarkers.push(startMarker);

            if (latLngs.length > 1) {
                const endMarker = new L.CircleMarker(latLngs[latLngs.length - 1], {
                    radius: 5,
                    fillColor: track.color,
                    color: '#fff',
                    weight: 2,
                    fillOpacity: 1,
                }).addTo(map);
                endMarker.bindPopup(`<b>${track.name}</b><br/>End`);
                trackMarkers.push(endMarker);
            }
        }

        polylines.set(track.id, trackPolylines);
        markers.set(track.id, trackMarkers);
        tracks = getTracks();
    }

    function removeFromMap(trackId: string): void {
        const trackPolylines = polylines.get(trackId);
        if (trackPolylines) {
            trackPolylines.forEach(polyline => map.removeLayer(polyline));
            polylines.delete(trackId);
        }
        const trackMarkers = markers.get(trackId);
        if (trackMarkers) {
            trackMarkers.forEach(m => map.removeLayer(m));
            markers.delete(trackId);
        }
    }

    function refreshAllTracks(): void {
        // Clear all existing
        polylines.forEach(ps => ps.forEach(p => map.removeLayer(p)));
        markers.forEach(ms => ms.forEach(m => map.removeLayer(m)));
        polylines.clear();
        markers.clear();

        // Re-render
        tracks.forEach(renderTrack);
    }

    function handleFileSelect(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files) {
            processFiles(Array.from(input.files));
        }
        input.value = '';
    }

    function processFiles(files: File[]): void {
        files.forEach(file => {
            if (!file.name.toLowerCase().endsWith('.gpx')) {
                console.warn(`Skipping non-GPX file: ${file.name}`);
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const parsed = parseGPX(content);
                    const baseName = file.name.replace(/\.gpx$/i, '');
                    addTrackFromGPX(parsed, baseName);
                    tracks = getTracks();
                    // Render new tracks
                    tracks.slice(-parsed.tracks.length).forEach(renderTrack);
                } catch (err) {
                    console.error(`Failed to parse ${file.name}:`, err);
                    alert(`Failed to parse ${file.name}. Make sure it's a valid GPX file.`);
                }
            };
            reader.readAsText(file);
        });
    }

    // Drag and drop handlers
    function handleDragEnter(e: DragEvent): void {
        e.preventDefault();
        dragCounter++;
        isDragging = true;
    }

    function handleDragLeave(e: DragEvent): void {
        e.preventDefault();
        dragCounter--;
        if (dragCounter === 0) {
            isDragging = false;
        }
    }

    function handleDragOver(e: DragEvent): void {
        e.preventDefault();
    }

    function handleDrop(e: DragEvent): void {
        e.preventDefault();
        dragCounter = 0;
        isDragging = false;
        const files = e.dataTransfer?.files;
        if (files) {
            processFiles(Array.from(files));
        }
    }

    function triggerFileInput(): void {
        fileInput?.click();
    }

    function handleKeydown(e: KeyboardEvent): void {
        if (e.key === 'Enter' || e.key === ' ') {
            triggerFileInput();
        }
    }

    // Track editing
    function updateName(id: string, name: string): void {
        updateTrack(id, { name });
        tracks = getTracks();
        // Update popup content if markers exist
        const trackMarkers = markers.get(id);
        if (trackMarkers) {
            trackMarkers.forEach(m => {
                const popup = m.getPopup();
                if (popup) {
                    const content = popup.getContent() as string;
                    const newContent = content.replace(/<b>.*?<\/b>/, `<b>${name}</b>`);
                    m.setPopupContent(newContent);
                }
            });
        }
    }

    function updateColor(id: string, color: string): void {
        updateTrack(id, { color });
        tracks = getTracks();
        // Re-render to apply new color
        const track = tracks.find(t => t.id === id);
        if (track) {
            renderTrack(track);
        }
    }

    function toggleVisibility(id: string): void {
        const track = tracks.find(t => t.id === id);
        if (!track) return;
        const newVisible = !track.visible;
        updateTrack(id, { visible: newVisible });
        if (newVisible) {
            renderTrack({ ...track, visible: true });
        } else {
            removeFromMap(id);
        }
        tracks = getTracks();
    }

    function deleteTrack(id: string): void {
        removeFromMap(id);
        removeTrack(id);
        tracks = getTracks();
    }

    function clearAll(): void {
        polylines.forEach(ps => ps.forEach(p => map.removeLayer(p)));
        markers.forEach(ms => ms.forEach(m => map.removeLayer(m)));
        polylines.clear();
        markers.clear();
        clearAllTracks();
        tracks = getTracks();
    }

    function fitAllTracks(): void {
        const allLatLngs: [number, number][] = [];
        tracks.filter(t => t.visible).forEach(t => {
            allLatLngs.push(...toLatLngArray(t.points));
        });
        if (allLatLngs.length > 0) {
            const bounds = L.latLngBounds(allLatLngs);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
        }
    }

    function formatDate(dateStr: string): string {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return dateStr;
        }
    }

    export const onopen = () => {
        refreshAllTracks();
    };


    // Preloaded Libertaire tracks
    const PRELOADED_TRACKS = [
        { url: 'https://libertairesailing.com/gpx/2011_0.5nm.gpx', name: '2011' },
        { url: 'https://libertairesailing.com/gpx/2012_0.5nm.gpx', name: '2012' },
        { url: 'https://libertairesailing.com/gpx/2013_0.5nm.gpx', name: '2013' },
        { url: 'https://libertairesailing.com/gpx/2016_complete_0.5nm.gpx', name: '2016' },
        { url: 'https://libertairesailing.com/gpx/2017_complete_0.5nm.gpx', name: '2017' },
        { url: 'https://libertairesailing.com/gpx/2018_0.5nm.gpx', name: '2018' },
        { url: 'https://libertairesailing.com/gpx/2019_0.5nm.gpx', name: '2019' },
        { url: 'https://libertairesailing.com/gpx/2021_0.5nm.gpx', name: '2021' },
        { url: 'https://libertairesailing.com/gpx/2022_0.5nm.gpx', name: '2022' },
        { url: 'https://libertairesailing.com/gpx/2023_0.5nm.gpx', name: '2023' },
        { url: 'https://libertairesailing.com/gpx/2024_0.5nm.gpx', name: '2024' },
    ];

    let isLoadingPreloaded = false;
    let preloadError = '';

    async function loadPreloadedTracks(): Promise<void> {
        if (isLoadingPreloaded) return;
        isLoadingPreloaded = true;
        preloadError = '';
        const failed: string[] = [];
        try {
            for (const track of PRELOADED_TRACKS) {
                try {
                    const newTracks = await loadRemoteGPX(track.url, track.name);
                    tracks = getTracks();
                    newTracks.forEach(renderTrack);
                } catch (err) {
                    failed.push(track.name);
                    console.warn(`Failed to load ${track.name}:`, err);
                }
            }
            tracks = getTracks();
            if (tracks.length === 0) {
                preloadError = 'No tracks loaded. Check network access to libertairesailing.com/gpx/.';
            } else if (failed.length > 0) {
                preloadError = `Loaded ${tracks.length} track(s), but failed: ${failed.join(', ')}`;
            }
            // Fit all tracks after loading
            setTimeout(fitAllTracks, 500);
        } catch (err) {
            preloadError = 'Failed to load Libertaire tracks';
            console.error('Preload error:', err);
        } finally {
            isLoadingPreloaded = false;
            tracks = getTracks();
        }
    }
    onMount(() => {
        tracks = getTracks();
        // Auto-load preloaded tracks if none exist yet
        if (tracks.length === 0) {
            loadPreloadedTracks();
        }
    });

    onDestroy(() => {
        polylines.forEach(ps => ps.forEach(p => map.removeLayer(p)));
        markers.forEach(ms => ms.forEach(m => map.removeLayer(m)));
        polylines.clear();
        markers.clear();
    });
</script>

<style lang="less">
    .plugin__content {
        padding: 10px;
    }

    .autoload-status {
        margin-bottom: 12px;
        min-height: 18px;

        .loaded-status {
            color: rgba(255, 255, 255, 0.55);
            font-size: 12px;
        }
    }

    .import-area {
        border: 2px dashed rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s;
        margin-bottom: 15px;

        &:hover, &.dragover {
            border-color: #3498db;
            background: rgba(52, 152, 219, 0.1);
        }

        .import-icon {
            font-size: 32px;
            margin-bottom: 8px;
        }

        .import-text {
            font-size: 14px;
            color: #fff;
            margin-bottom: 4px;
        }

        .import-hint {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.5);
        }
    }

    .hidden-input {
        display: none;
    }

    .track-list {
        margin-bottom: 15px;

        .list-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 8px;
            padding: 0 4px;

            .btn-clear {
                background: transparent;
                border: none;
                color: #e74c3c;
                cursor: pointer;
                font-size: 11px;
                padding: 2px 6px;
                border-radius: 4px;

                &:hover {
                    background: rgba(231, 76, 60, 0.1);
                }
            }
        }
    }

    .track-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.05);
        margin-bottom: 6px;
        transition: opacity 0.2s;

        &.hidden {
            opacity: 0.4;
        }

        .track-color-wrapper {
            flex-shrink: 0;

            .track-color {
                width: 24px;
                height: 24px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                padding: 0;
                background: none;

                &::-webkit-color-swatch-wrapper {
                    padding: 0;
                }

                &::-webkit-color-swatch {
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 4px;
                }
            }
        }

        .track-info {
            flex: 1;
            min-width: 0;

            .track-name {
                width: 100%;
                background: transparent;
                border: 1px solid transparent;
                border-radius: 4px;
                color: #fff;
                font-size: 13px;
                padding: 2px 6px;
                margin: 0;

                &:hover, &:focus {
                    border-color: rgba(255, 255, 255, 0.2);
                    background: rgba(255, 255, 255, 0.05);
                    outline: none;
                }
            }

            .track-meta {
                font-size: 10px;
                color: rgba(255, 255, 255, 0.4);
                margin-top: 2px;
            }
        }

        .track-actions {
            display: flex;
            gap: 4px;
            flex-shrink: 0;

            button {
                background: transparent;
                border: none;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                font-size: 14px;
                line-height: 1;

                &:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                &.btn-toggle {
                    opacity: 0.6;

                    &.active {
                        opacity: 1;
                    }
                }

                &.btn-delete {
                    color: #e74c3c;

                    &:hover {
                        background: rgba(231, 76, 60, 0.15);
                    }
                }
            }
        }
    }

    .actions {
        display: flex;
        gap: 8px;

        .btn-fit {
            flex: 1;
            background: #3498db;
            color: #fff;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;

            &:hover {
                background: #2980b9;
            }
        }
    }

    .empty-state {
        text-align: center;
        padding: 30px 20px;
        color: rgba(255, 255, 255, 0.4);
        font-size: 13px;
        line-height: 1.6;
    }

    .btn-preload {
        margin-top: 12px;
        background: #2ecc71;
        color: #fff;
        border: none;
        padding: 10px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;

        &:hover {
            background: #27ae60;
        }
    }

    .loading {
        color: rgba(255, 255, 255, 0.6);
        font-size: 13px;
    }

    .preload-error {
        margin-top: 8px;
        color: #e74c3c;
        font-size: 12px;
    }
</style>
