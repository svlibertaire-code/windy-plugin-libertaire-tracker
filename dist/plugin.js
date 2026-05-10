const __pluginConfig =  {
  "name": "windy-plugin-libertaire-tracker",
  "version": "0.1.0",
  "icon": "⛵",
  "title": "Libertaire Tracker",
  "description": "Import and display GPX tracks for Libertaire sailing voyages. Edit track names and colors.",
  "author": "Damien Feneon",
  "repository": "https://github.com/svlibertaire-code/windy-plugin-libertaire-tracker",
  "desktopUI": "rhpane",
  "mobileUI": "fullscreen",
  "routerPath": "/libertaire-tracker",
  "private": false,
  "built": 1778398235865,
  "builtReadable": "2026-05-10T07:30:35.865Z",
  "screenshot": "screenshot.jpg"
};

// transformCode: import bcast from '@windy/broadcast';
const bcast = W.broadcast;

// transformCode: import { map } from '@windy/map';
const { map } = W.map;


/** @returns {void} */
function noop() {}

function run(fn) {
	return fn();
}

function blank_object() {
	return Object.create(null);
}

/**
 * @param {Function[]} fns
 * @returns {void}
 */
function run_all(fns) {
	fns.forEach(run);
}

/**
 * @param {any} thing
 * @returns {thing is Function}
 */
function is_function(thing) {
	return typeof thing === 'function';
}

/** @returns {boolean} */
function safe_not_equal(a, b) {
	return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
}

/** @returns {boolean} */
function is_empty(obj) {
	return Object.keys(obj).length === 0;
}

/** @type {typeof globalThis} */
const globals =
	typeof window !== 'undefined'
		? window
		: typeof globalThis !== 'undefined'
		? globalThis
		: // @ts-ignore Node typings have this
		  global;

/**
 * @param {Node} target
 * @param {Node} node
 * @returns {void}
 */
function append(target, node) {
	target.appendChild(node);
}

/**
 * @param {Node} target
 * @param {string} style_sheet_id
 * @param {string} styles
 * @returns {void}
 */
function append_styles(target, style_sheet_id, styles) {
	const append_styles_to = get_root_for_style(target);
	if (!append_styles_to.getElementById(style_sheet_id)) {
		const style = element('style');
		style.id = style_sheet_id;
		style.textContent = styles;
		append_stylesheet(append_styles_to, style);
	}
}

/**
 * @param {Node} node
 * @returns {ShadowRoot | Document}
 */
function get_root_for_style(node) {
	if (!node) return document;
	const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
	if (root && /** @type {ShadowRoot} */ (root).host) {
		return /** @type {ShadowRoot} */ (root);
	}
	return node.ownerDocument;
}

/**
 * @param {ShadowRoot | Document} node
 * @param {HTMLStyleElement} style
 * @returns {CSSStyleSheet}
 */
function append_stylesheet(node, style) {
	append(/** @type {Document} */ (node).head || node, style);
	return style.sheet;
}

/**
 * @param {Node} target
 * @param {Node} node
 * @param {Node} [anchor]
 * @returns {void}
 */
function insert(target, node, anchor) {
	target.insertBefore(node, anchor || null);
}

/**
 * @param {Node} node
 * @returns {void}
 */
function detach(node) {
	if (node.parentNode) {
		node.parentNode.removeChild(node);
	}
}

/**
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} name
 * @returns {HTMLElementTagNameMap[K]}
 */
function element(name) {
	return document.createElement(name);
}

/**
 * @param {string} data
 * @returns {Text}
 */
function text(data) {
	return document.createTextNode(data);
}

/**
 * @returns {Text} */
function space() {
	return text(' ');
}

/**
 * @param {EventTarget} node
 * @param {string} event
 * @param {EventListenerOrEventListenerObject} handler
 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
 * @returns {() => void}
 */
function listen(node, event, handler, options) {
	node.addEventListener(event, handler, options);
	return () => node.removeEventListener(event, handler, options);
}

/**
 * @param {Element} node
 * @param {string} attribute
 * @param {string} [value]
 * @returns {void}
 */
function attr(node, attribute, value) {
	if (value == null) node.removeAttribute(attribute);
	else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
}

/**
 * @param {Element} element
 * @returns {ChildNode[]}
 */
function children(element) {
	return Array.from(element.childNodes);
}

/**
 * @param {Text} text
 * @param {unknown} data
 * @returns {void}
 */
function set_data(text, data) {
	data = '' + data;
	if (text.data === data) return;
	text.data = /** @type {string} */ (data);
}

/**
 * @returns {void} */
function toggle_class(element, name, toggle) {
	// The `!!` is required because an `undefined` flag means flipping the current state.
	element.classList.toggle(name, !!toggle);
}

/**
 * @typedef {Node & {
 * 	claim_order?: number;
 * 	hydrate_init?: true;
 * 	actual_end_child?: NodeEx;
 * 	childNodes: NodeListOf<NodeEx>;
 * }} NodeEx
 */

/** @typedef {ChildNode & NodeEx} ChildNodeEx */

/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

/**
 * @typedef {ChildNodeEx[] & {
 * 	claim_info?: {
 * 		last_index: number;
 * 		total_claimed: number;
 * 	};
 * }} ChildNodeArray
 */

let current_component;

/** @returns {void} */
function set_current_component(component) {
	current_component = component;
}

function get_current_component() {
	if (!current_component) throw new Error('Function called outside component initialization');
	return current_component;
}

/**
 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
 * it can be called from an external module).
 *
 * If a function is returned _synchronously_ from `onMount`, it will be called when the component is unmounted.
 *
 * `onMount` does not run inside a [server-side component](https://svelte.dev/docs#run-time-server-side-component-api).
 *
 * https://svelte.dev/docs/svelte#onmount
 * @template T
 * @param {() => import('./private.js').NotFunction<T> | Promise<import('./private.js').NotFunction<T>> | (() => any)} fn
 * @returns {void}
 */
function onMount(fn) {
	get_current_component().$$.on_mount.push(fn);
}

/**
 * Schedules a callback to run immediately before the component is unmounted.
 *
 * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
 * only one that runs inside a server-side component.
 *
 * https://svelte.dev/docs/svelte#ondestroy
 * @param {() => any} fn
 * @returns {void}
 */
function onDestroy(fn) {
	get_current_component().$$.on_destroy.push(fn);
}

const dirty_components = [];
const binding_callbacks = [];

let render_callbacks = [];

const flush_callbacks = [];

const resolved_promise = /* @__PURE__ */ Promise.resolve();

let update_scheduled = false;

/** @returns {void} */
function schedule_update() {
	if (!update_scheduled) {
		update_scheduled = true;
		resolved_promise.then(flush);
	}
}

/** @returns {void} */
function add_render_callback(fn) {
	render_callbacks.push(fn);
}

// flush() calls callbacks in this order:
// 1. All beforeUpdate callbacks, in order: parents before children
// 2. All bind:this callbacks, in reverse order: children before parents.
// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
//    for afterUpdates called during the initial onMount, which are called in
//    reverse order: children before parents.
// Since callbacks might update component values, which could trigger another
// call to flush(), the following steps guard against this:
// 1. During beforeUpdate, any updated components will be added to the
//    dirty_components array and will cause a reentrant call to flush(). Because
//    the flush index is kept outside the function, the reentrant call will pick
//    up where the earlier call left off and go through all dirty components. The
//    current_component value is saved and restored so that the reentrant call will
//    not interfere with the "parent" flush() call.
// 2. bind:this callbacks cannot trigger new flush() calls.
// 3. During afterUpdate, any updated components will NOT have their afterUpdate
//    callback called a second time; the seen_callbacks set, outside the flush()
//    function, guarantees this behavior.
const seen_callbacks = new Set();

let flushidx = 0; // Do *not* move this inside the flush() function

/** @returns {void} */
function flush() {
	// Do not reenter flush while dirty components are updated, as this can
	// result in an infinite loop. Instead, let the inner flush handle it.
	// Reentrancy is ok afterwards for bindings etc.
	if (flushidx !== 0) {
		return;
	}
	const saved_component = current_component;
	do {
		// first, call beforeUpdate functions
		// and update components
		try {
			while (flushidx < dirty_components.length) {
				const component = dirty_components[flushidx];
				flushidx++;
				set_current_component(component);
				update(component.$$);
			}
		} catch (e) {
			// reset dirty state to not end up in a deadlocked state and then rethrow
			dirty_components.length = 0;
			flushidx = 0;
			throw e;
		}
		set_current_component(null);
		dirty_components.length = 0;
		flushidx = 0;
		while (binding_callbacks.length) binding_callbacks.pop()();
		// then, once components are updated, call
		// afterUpdate functions. This may cause
		// subsequent updates...
		for (let i = 0; i < render_callbacks.length; i += 1) {
			const callback = render_callbacks[i];
			if (!seen_callbacks.has(callback)) {
				// ...so guard against infinite loops
				seen_callbacks.add(callback);
				callback();
			}
		}
		render_callbacks.length = 0;
	} while (dirty_components.length);
	while (flush_callbacks.length) {
		flush_callbacks.pop()();
	}
	update_scheduled = false;
	seen_callbacks.clear();
	set_current_component(saved_component);
}

/** @returns {void} */
function update($$) {
	if ($$.fragment !== null) {
		$$.update();
		run_all($$.before_update);
		const dirty = $$.dirty;
		$$.dirty = [-1];
		$$.fragment && $$.fragment.p($$.ctx, dirty);
		$$.after_update.forEach(add_render_callback);
	}
}

/**
 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
 * @param {Function[]} fns
 * @returns {void}
 */
function flush_render_callbacks(fns) {
	const filtered = [];
	const targets = [];
	render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
	targets.forEach((c) => c());
	render_callbacks = filtered;
}

const outroing = new Set();

/**
 * @param {import('./private.js').Fragment} block
 * @param {0 | 1} [local]
 * @returns {void}
 */
function transition_in(block, local) {
	if (block && block.i) {
		outroing.delete(block);
		block.i(local);
	}
}

/** @typedef {1} INTRO */
/** @typedef {0} OUTRO */
/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

/**
 * @typedef {Object} Outro
 * @property {number} r
 * @property {Function[]} c
 * @property {Object} p
 */

/**
 * @typedef {Object} PendingProgram
 * @property {number} start
 * @property {INTRO|OUTRO} b
 * @property {Outro} [group]
 */

/**
 * @typedef {Object} Program
 * @property {number} a
 * @property {INTRO|OUTRO} b
 * @property {1|-1} d
 * @property {number} duration
 * @property {number} start
 * @property {number} end
 * @property {Outro} [group]
 */

// general each functions:

function ensure_array_like(array_like_or_iterator) {
	return array_like_or_iterator?.length !== undefined
		? array_like_or_iterator
		: Array.from(array_like_or_iterator);
}

// keyed each functions:

/** @returns {void} */
function destroy_block(block, lookup) {
	block.d(1);
	lookup.delete(block.key);
}

/** @returns {any[]} */
function update_keyed_each(
	old_blocks,
	dirty,
	get_key,
	dynamic,
	ctx,
	list,
	lookup,
	node,
	destroy,
	create_each_block,
	next,
	get_context
) {
	let o = old_blocks.length;
	let n = list.length;
	let i = o;
	const old_indexes = {};
	while (i--) old_indexes[old_blocks[i].key] = i;
	const new_blocks = [];
	const new_lookup = new Map();
	const deltas = new Map();
	const updates = [];
	i = n;
	while (i--) {
		const child_ctx = get_context(ctx, list, i);
		const key = get_key(child_ctx);
		let block = lookup.get(key);
		if (!block) {
			block = create_each_block(key, child_ctx);
			block.c();
		} else {
			// defer updates until all the DOM shuffling is done
			updates.push(() => block.p(child_ctx, dirty));
		}
		new_lookup.set(key, (new_blocks[i] = block));
		if (key in old_indexes) deltas.set(key, Math.abs(i - old_indexes[key]));
	}
	const will_move = new Set();
	const did_move = new Set();
	/** @returns {void} */
	function insert(block) {
		transition_in(block, 1);
		block.m(node, next);
		lookup.set(block.key, block);
		next = block.first;
		n--;
	}
	while (o && n) {
		const new_block = new_blocks[n - 1];
		const old_block = old_blocks[o - 1];
		const new_key = new_block.key;
		const old_key = old_block.key;
		if (new_block === old_block) {
			// do nothing
			next = new_block.first;
			o--;
			n--;
		} else if (!new_lookup.has(old_key)) {
			// remove old block
			destroy(old_block, lookup);
			o--;
		} else if (!lookup.has(new_key) || will_move.has(new_key)) {
			insert(new_block);
		} else if (did_move.has(old_key)) {
			o--;
		} else if (deltas.get(new_key) > deltas.get(old_key)) {
			did_move.add(new_key);
			insert(new_block);
		} else {
			will_move.add(old_key);
			o--;
		}
	}
	while (o--) {
		const old_block = old_blocks[o];
		if (!new_lookup.has(old_block.key)) destroy(old_block, lookup);
	}
	while (n) insert(new_blocks[n - 1]);
	run_all(updates);
	return new_blocks;
}

/** @returns {void} */
function mount_component(component, target, anchor) {
	const { fragment, after_update } = component.$$;
	fragment && fragment.m(target, anchor);
	// onMount happens before the initial afterUpdate
	add_render_callback(() => {
		const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
		// if the component was destroyed immediately
		// it will update the `$$.on_destroy` reference to `null`.
		// the destructured on_destroy may still reference to the old array
		if (component.$$.on_destroy) {
			component.$$.on_destroy.push(...new_on_destroy);
		} else {
			// Edge case - component was destroyed immediately,
			// most likely as a result of a binding initialising
			run_all(new_on_destroy);
		}
		component.$$.on_mount = [];
	});
	after_update.forEach(add_render_callback);
}

/** @returns {void} */
function destroy_component(component, detaching) {
	const $$ = component.$$;
	if ($$.fragment !== null) {
		flush_render_callbacks($$.after_update);
		run_all($$.on_destroy);
		$$.fragment && $$.fragment.d(detaching);
		// TODO null out other refs, including component.$$ (but need to
		// preserve final state?)
		$$.on_destroy = $$.fragment = null;
		$$.ctx = [];
	}
}

/** @returns {void} */
function make_dirty(component, i) {
	if (component.$$.dirty[0] === -1) {
		dirty_components.push(component);
		schedule_update();
		component.$$.dirty.fill(0);
	}
	component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
}

// TODO: Document the other params
/**
 * @param {SvelteComponent} component
 * @param {import('./public.js').ComponentConstructorOptions} options
 *
 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
 * This will be the `add_css` function from the compiled component.
 *
 * @returns {void}
 */
function init(
	component,
	options,
	instance,
	create_fragment,
	not_equal,
	props,
	append_styles = null,
	dirty = [-1]
) {
	const parent_component = current_component;
	set_current_component(component);
	/** @type {import('./private.js').T$$} */
	const $$ = (component.$$ = {
		fragment: null,
		ctx: [],
		// state
		props,
		update: noop,
		not_equal,
		bound: blank_object(),
		// lifecycle
		on_mount: [],
		on_destroy: [],
		on_disconnect: [],
		before_update: [],
		after_update: [],
		context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
		// everything else
		callbacks: blank_object(),
		dirty,
		skip_bound: false,
		root: options.target || parent_component.$$.root
	});
	append_styles && append_styles($$.root);
	let ready = false;
	$$.ctx = instance
		? instance(component, options.props || {}, (i, ret, ...rest) => {
				const value = rest.length ? rest[0] : ret;
				if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
					if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
					if (ready) make_dirty(component, i);
				}
				return ret;
		  })
		: [];
	$$.update();
	ready = true;
	run_all($$.before_update);
	// `false` as a special case of no DOM component
	$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
	if (options.target) {
		if (options.hydrate) {
			// TODO: what is the correct type here?
			// @ts-expect-error
			const nodes = children(options.target);
			$$.fragment && $$.fragment.l(nodes);
			nodes.forEach(detach);
		} else {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			$$.fragment && $$.fragment.c();
		}
		if (options.intro) transition_in(component.$$.fragment);
		mount_component(component, options.target, options.anchor);
		flush();
	}
	set_current_component(parent_component);
}

/**
 * Base class for Svelte components. Used when dev=false.
 *
 * @template {Record<string, any>} [Props=any]
 * @template {Record<string, any>} [Events=any]
 */
class SvelteComponent {
	/**
	 * ### PRIVATE API
	 *
	 * Do not use, may change at any time
	 *
	 * @type {any}
	 */
	$$ = undefined;
	/**
	 * ### PRIVATE API
	 *
	 * Do not use, may change at any time
	 *
	 * @type {any}
	 */
	$$set = undefined;

	/** @returns {void} */
	$destroy() {
		destroy_component(this, 1);
		this.$destroy = noop;
	}

	/**
	 * @template {Extract<keyof Events, string>} K
	 * @param {K} type
	 * @param {((e: Events[K]) => void) | null | undefined} callback
	 * @returns {() => void}
	 */
	$on(type, callback) {
		if (!is_function(callback)) {
			return noop;
		}
		const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
		callbacks.push(callback);
		return () => {
			const index = callbacks.indexOf(callback);
			if (index !== -1) callbacks.splice(index, 1);
		};
	}

	/**
	 * @param {Partial<Props>} props
	 * @returns {void}
	 */
	$set(props) {
		if (this.$$set && !is_empty(props)) {
			this.$$.skip_bound = true;
			this.$$set(props);
			this.$$.skip_bound = false;
		}
	}
}

/**
 * @typedef {Object} CustomElementPropDefinition
 * @property {string} [attribute]
 * @property {boolean} [reflect]
 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
 */

// generated during release, do not modify

const PUBLIC_VERSION = '4';

if (typeof window !== 'undefined')
	// @ts-ignore
	(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

const config = {
    title: 'Libertaire Tracker'};

/**
 * Parse a GPX string and extract track segments with timestamps
 */ function parseGPX(gpxString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(gpxString, 'text/xml');
    // Check for parse errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
        throw new Error('Invalid GPX file');
    }
    const tracks = [];
    const waypoints = [];
    // Parse tracks (trk > trkseg > trkpt)
    const trackElements = doc.querySelectorAll('trk');
    trackElements.forEach((trk)=>{
        const segments = trk.querySelectorAll('trkseg');
        segments.forEach((seg)=>{
            const points = [];
            const trackPoints = seg.querySelectorAll('trkpt');
            trackPoints.forEach((pt)=>{
                const lat = parseFloat(pt.getAttribute('lat') || '0');
                const lon = parseFloat(pt.getAttribute('lon') || '0');
                const eleEl = pt.querySelector('ele');
                const timeEl = pt.querySelector('time');
                points.push({
                    lat,
                    lon,
                    ele: eleEl ? parseFloat(eleEl.textContent || '0') : undefined,
                    time: timeEl ? timeEl.textContent || undefined : undefined
                });
            });
            if (points.length > 0) {
                tracks.push({
                    points
                });
            }
        });
    });
    // Parse waypoints (wpt)
    const waypointElements = doc.querySelectorAll('wpt');
    waypointElements.forEach((wpt)=>{
        const lat = parseFloat(wpt.getAttribute('lat') || '0');
        const lon = parseFloat(wpt.getAttribute('lon') || '0');
        const eleEl = wpt.querySelector('ele');
        const timeEl = wpt.querySelector('time');
        waypoints.push({
            lat,
            lon,
            ele: eleEl ? parseFloat(eleEl.textContent || '0') : undefined,
            time: timeEl ? timeEl.textContent || undefined : undefined
        });
    });
    return {
        tracks,
        waypoints
    };
}
/**
 * Get date range from GPX track points
 */ function getTrackDateRange(points) {
    const times = points.map((p)=>p.time).filter((t)=>!!t).sort();
    return {
        start: times[0],
        end: times[times.length - 1]
    };
}
/**
 * Convert TrackPoint array to Leaflet LatLng array
 */ function toLatLngArray(points) {
    return points.map((p)=>[
            p.lat,
            p.lon
        ]);
}

let tracks = [];
let nextId = 1;
const COLORS = [
    '#e74c3c',
    '#3498db',
    '#2ecc71',
    '#f39c12',
    '#9b59b6',
    '#1abc9c',
    '#e91e63',
    '#ff5722',
    '#795548',
    '#607d8b'
];
function getNextColor() {
    return COLORS[(nextId - 1) % COLORS.length];
}
function generateId() {
    return `track-${nextId++}`;
}
function getTracks() {
    return tracks;
}
function addTrackFromGPX(parsed, name) {
    const newTracks = [];
    parsed.tracks.forEach((segment, index)=>{
        const id = generateId();
        const color = getNextColor();
        const dateRange = getTrackDateRange(segment.points);
        const trackName = name ? parsed.tracks.length > 1 ? `${name} - Segment ${index + 1}` : name : `Track ${nextId - 1}`;
        newTracks.push({
            id,
            name: trackName,
            color,
            visible: true,
            points: segment.points,
            dateRange
        });
    });
    tracks = [
        ...tracks,
        ...newTracks
    ];
    return newTracks;
}
function updateTrack(id, updates) {
    const track = tracks.find((t)=>t.id === id);
    if (!track) return;
    if (updates.name !== undefined) track.name = updates.name;
    if (updates.color !== undefined) track.color = updates.color;
    if (updates.visible !== undefined) track.visible = updates.visible;
}
function removeTrack(id) {
    tracks = tracks.filter((t)=>t.id !== id);
}
function clearAllTracks() {
    tracks = [];
    nextId = 1;
}
async function loadRemoteGPX(url, name) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    const gpxText = await response.text();
    const parsed = parseGPX(gpxText);
    return addTrackFromGPX(parsed, name);
}

/* src/plugin.svelte generated by Svelte v4.2.20 */

const { Map: Map_1 } = globals;

function add_css(target) {
	append_styles(target, "svelte-1y8sfbv", ".plugin__content.svelte-1y8sfbv.svelte-1y8sfbv{padding:10px}.autoload-status.svelte-1y8sfbv.svelte-1y8sfbv{margin-bottom:12px;min-height:18px}.autoload-status.svelte-1y8sfbv .loaded-status.svelte-1y8sfbv{color:rgba(255, 255, 255, 0.55);font-size:12px}.track-list.svelte-1y8sfbv.svelte-1y8sfbv{margin-bottom:15px}.track-list.svelte-1y8sfbv .list-header.svelte-1y8sfbv{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:rgba(255, 255, 255, 0.6);margin-bottom:8px;padding:0 4px}.track-list.svelte-1y8sfbv .list-header .btn-clear.svelte-1y8sfbv{background:transparent;border:none;color:#e74c3c;cursor:pointer;font-size:11px;padding:2px 6px;border-radius:4px}.track-list.svelte-1y8sfbv .list-header .btn-clear.svelte-1y8sfbv:hover{background:rgba(231, 76, 60, 0.1)}.track-item.svelte-1y8sfbv.svelte-1y8sfbv{display:flex;align-items:center;gap:8px;padding:8px;border-radius:6px;background:rgba(255, 255, 255, 0.05);margin-bottom:6px;transition:opacity 0.2s}.track-item.hidden.svelte-1y8sfbv.svelte-1y8sfbv{opacity:0.4}.track-item.svelte-1y8sfbv .track-color-wrapper.svelte-1y8sfbv{flex-shrink:0}.track-item.svelte-1y8sfbv .track-color-wrapper .track-color.svelte-1y8sfbv{width:24px;height:24px;border:none;border-radius:4px;cursor:pointer;padding:0;background:none}.track-item.svelte-1y8sfbv .track-color-wrapper .track-color.svelte-1y8sfbv::-webkit-color-swatch-wrapper{padding:0}.track-item.svelte-1y8sfbv .track-color-wrapper .track-color.svelte-1y8sfbv::-webkit-color-swatch{border:2px solid rgba(255, 255, 255, 0.3);border-radius:4px}.track-item.svelte-1y8sfbv .track-info.svelte-1y8sfbv{flex:1;min-width:0}.track-item.svelte-1y8sfbv .track-info .track-name.svelte-1y8sfbv{width:100%;background:transparent;border:1px solid transparent;border-radius:4px;color:#fff;font-size:13px;padding:2px 6px;margin:0}.track-item.svelte-1y8sfbv .track-info .track-name.svelte-1y8sfbv:hover,.track-item.svelte-1y8sfbv .track-info .track-name.svelte-1y8sfbv:focus{border-color:rgba(255, 255, 255, 0.2);background:rgba(255, 255, 255, 0.05);outline:none}.track-item.svelte-1y8sfbv .track-info .track-meta.svelte-1y8sfbv{font-size:10px;color:rgba(255, 255, 255, 0.4);margin-top:2px}.track-item.svelte-1y8sfbv .track-actions.svelte-1y8sfbv{display:flex;gap:4px;flex-shrink:0}.track-item.svelte-1y8sfbv .track-actions button.svelte-1y8sfbv{background:transparent;border:none;cursor:pointer;padding:4px;border-radius:4px;font-size:14px;line-height:1}.track-item.svelte-1y8sfbv .track-actions button.svelte-1y8sfbv:hover{background:rgba(255, 255, 255, 0.1)}.track-item.svelte-1y8sfbv .track-actions button.btn-toggle.svelte-1y8sfbv{opacity:0.6}.track-item.svelte-1y8sfbv .track-actions button.btn-toggle.active.svelte-1y8sfbv{opacity:1}.track-item.svelte-1y8sfbv .track-actions button.btn-delete.svelte-1y8sfbv{color:#e74c3c}.track-item.svelte-1y8sfbv .track-actions button.btn-delete.svelte-1y8sfbv:hover{background:rgba(231, 76, 60, 0.15)}.actions.svelte-1y8sfbv.svelte-1y8sfbv{display:flex;gap:8px}.actions.svelte-1y8sfbv .btn-fit.svelte-1y8sfbv{flex:1;background:#3498db;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:500}.actions.svelte-1y8sfbv .btn-fit.svelte-1y8sfbv:hover{background:#2980b9}.empty-state.svelte-1y8sfbv.svelte-1y8sfbv{text-align:center;padding:30px 20px;color:rgba(255, 255, 255, 0.4);font-size:13px;line-height:1.6}.btn-preload.svelte-1y8sfbv.svelte-1y8sfbv{margin-top:12px;background:#2ecc71;color:#fff;border:none;padding:10px 16px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:500}.btn-preload.svelte-1y8sfbv.svelte-1y8sfbv:hover{background:#27ae60}.loading.svelte-1y8sfbv.svelte-1y8sfbv{color:rgba(255, 255, 255, 0.6);font-size:13px}.preload-error.svelte-1y8sfbv.svelte-1y8sfbv{margin-top:8px;color:#e74c3c;font-size:12px}");
}

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[33] = list[i];
	return child_ctx;
}

// (16:36)
function create_if_block_5(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			div.textContent = "Libertaire tracks loaded automatically.";
			attr(div, "class", "loaded-status svelte-1y8sfbv");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (14:8) {#if isLoadingPreloaded}
function create_if_block_4(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			div.textContent = "Loading Libertaire tracks automatically...";
			attr(div, "class", "loading svelte-1y8sfbv");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (19:8) {#if preloadError}
function create_if_block_3(ctx) {
	let div;
	let t;

	return {
		c() {
			div = element("div");
			t = text(/*preloadError*/ ctx[2]);
			attr(div, "class", "preload-error svelte-1y8sfbv");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*preloadError*/ 4) set_data(t, /*preloadError*/ ctx[2]);
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (83:4) {:else}
function create_else_block(ctx) {
	let div;

	function select_block_type_2(ctx, dirty) {
		if (/*isLoadingPreloaded*/ ctx[1]) return create_if_block_2;
		return create_else_block_1;
	}

	let current_block_type = select_block_type_2(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			div = element("div");
			if_block.c();
			attr(div, "class", "empty-state svelte-1y8sfbv");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if_block.m(div, null);
		},
		p(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(div, null);
				}
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}

			if_block.d();
		}
	};
}

// (25:4) {#if tracks.length > 0}
function create_if_block(ctx) {
	let div1;
	let div0;
	let span;
	let t0;
	let t1_value = /*tracks*/ ctx[0].length + "";
	let t1;
	let t2;
	let t3;
	let button0;
	let t5;
	let each_blocks = [];
	let each_1_lookup = new Map_1();
	let t6;
	let div2;
	let button1;
	let mounted;
	let dispose;
	let each_value = ensure_array_like(/*tracks*/ ctx[0]);
	const get_key = ctx => /*track*/ ctx[33].id;

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context(ctx, each_value, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
	}

	return {
		c() {
			div1 = element("div");
			div0 = element("div");
			span = element("span");
			t0 = text("Tracks (");
			t1 = text(t1_value);
			t2 = text(")");
			t3 = space();
			button0 = element("button");
			button0.textContent = "Clear all";
			t5 = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t6 = space();
			div2 = element("div");
			button1 = element("button");
			button1.textContent = "Fit all tracks";
			attr(button0, "class", "btn-clear svelte-1y8sfbv");
			attr(div0, "class", "list-header svelte-1y8sfbv");
			attr(div1, "class", "track-list svelte-1y8sfbv");
			attr(button1, "class", "btn-fit svelte-1y8sfbv");
			attr(div2, "class", "actions svelte-1y8sfbv");
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, div0);
			append(div0, span);
			append(span, t0);
			append(span, t1);
			append(span, t2);
			append(div0, t3);
			append(div0, button0);
			append(div1, t5);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(div1, null);
				}
			}

			insert(target, t6, anchor);
			insert(target, div2, anchor);
			append(div2, button1);

			if (!mounted) {
				dispose = [
					listen(button0, "click", /*clearAll*/ ctx[8]),
					listen(button1, "click", /*fitAllTracks*/ ctx[9])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*tracks*/ 1 && t1_value !== (t1_value = /*tracks*/ ctx[0].length + "")) set_data(t1, t1_value);

			if (dirty[0] & /*tracks, deleteTrack, toggleVisibility, updateName, updateColor*/ 241) {
				each_value = ensure_array_like(/*tracks*/ ctx[0]);
				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, destroy_block, create_each_block, null, get_each_context);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div1);
				detach(t6);
				detach(div2);
			}

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}

			mounted = false;
			run_all(dispose);
		}
	};
}

// (87:12) {:else}
function create_else_block_1(ctx) {
	let div;
	let t1;
	let button;
	let mounted;
	let dispose;

	return {
		c() {
			div = element("div");
			div.textContent = "Tracks did not load automatically.";
			t1 = space();
			button = element("button");
			button.textContent = "Retry loading Libertaire tracks";
			attr(button, "class", "btn-preload svelte-1y8sfbv");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			insert(target, t1, anchor);
			insert(target, button, anchor);

			if (!mounted) {
				dispose = listen(button, "click", /*loadPreloadedTracks*/ ctx[10]);
				mounted = true;
			}
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(div);
				detach(t1);
				detach(button);
			}

			mounted = false;
			dispose();
		}
	};
}

// (85:12) {#if isLoadingPreloaded}
function create_if_block_2(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			div.textContent = "Loading Libertaire tracks...";
			attr(div, "class", "loading svelte-1y8sfbv");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (52:28) {#if track.dateRange.start}
function create_if_block_1(ctx) {
	let t0;
	let t1_value = formatDate(/*track*/ ctx[33].dateRange.start) + "";
	let t1;

	return {
		c() {
			t0 = text("· ");
			t1 = text(t1_value);
		},
		m(target, anchor) {
			insert(target, t0, anchor);
			insert(target, t1, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*tracks*/ 1 && t1_value !== (t1_value = formatDate(/*track*/ ctx[33].dateRange.start) + "")) set_data(t1, t1_value);
		},
		d(detaching) {
			if (detaching) {
				detach(t0);
				detach(t1);
			}
		}
	};
}

// (31:12) {#each tracks as track (track.id)}
function create_each_block(key_1, ctx) {
	let div4;
	let div0;
	let input0;
	let input0_value_value;
	let t0;
	let div2;
	let input1;
	let input1_value_value;
	let t1;
	let div1;
	let t2_value = /*track*/ ctx[33].points.length + "";
	let t2;
	let t3;
	let t4;
	let div3;
	let button0;
	let t5_value = (/*track*/ ctx[33].visible ? '👁' : '🚫') + "";
	let t5;
	let button0_title_value;
	let t6;
	let button1;
	let t8;
	let mounted;
	let dispose;

	function input_handler(...args) {
		return /*input_handler*/ ctx[13](/*track*/ ctx[33], ...args);
	}

	function input_handler_1(...args) {
		return /*input_handler_1*/ ctx[14](/*track*/ ctx[33], ...args);
	}

	let if_block = /*track*/ ctx[33].dateRange.start && create_if_block_1(ctx);

	function click_handler_1() {
		return /*click_handler_1*/ ctx[15](/*track*/ ctx[33]);
	}

	function click_handler_2() {
		return /*click_handler_2*/ ctx[16](/*track*/ ctx[33]);
	}

	return {
		key: key_1,
		first: null,
		c() {
			div4 = element("div");
			div0 = element("div");
			input0 = element("input");
			t0 = space();
			div2 = element("div");
			input1 = element("input");
			t1 = space();
			div1 = element("div");
			t2 = text(t2_value);
			t3 = text(" points\n                            ");
			if (if_block) if_block.c();
			t4 = space();
			div3 = element("div");
			button0 = element("button");
			t5 = text(t5_value);
			t6 = space();
			button1 = element("button");
			button1.textContent = "🗑";
			t8 = space();
			attr(input0, "type", "color");
			attr(input0, "class", "track-color svelte-1y8sfbv");
			input0.value = input0_value_value = /*track*/ ctx[33].color;
			attr(input0, "title", "Change color");
			attr(div0, "class", "track-color-wrapper svelte-1y8sfbv");
			attr(input1, "type", "text");
			attr(input1, "class", "track-name svelte-1y8sfbv");
			input1.value = input1_value_value = /*track*/ ctx[33].name;
			attr(input1, "title", "Edit name");
			attr(div1, "class", "track-meta svelte-1y8sfbv");
			attr(div2, "class", "track-info svelte-1y8sfbv");
			attr(button0, "class", "btn-toggle svelte-1y8sfbv");
			attr(button0, "title", button0_title_value = /*track*/ ctx[33].visible ? 'Hide' : 'Show');
			toggle_class(button0, "active", /*track*/ ctx[33].visible);
			attr(button1, "class", "btn-delete svelte-1y8sfbv");
			attr(button1, "title", "Remove");
			attr(div3, "class", "track-actions svelte-1y8sfbv");
			attr(div4, "class", "track-item svelte-1y8sfbv");
			toggle_class(div4, "hidden", !/*track*/ ctx[33].visible);
			this.first = div4;
		},
		m(target, anchor) {
			insert(target, div4, anchor);
			append(div4, div0);
			append(div0, input0);
			append(div4, t0);
			append(div4, div2);
			append(div2, input1);
			append(div2, t1);
			append(div2, div1);
			append(div1, t2);
			append(div1, t3);
			if (if_block) if_block.m(div1, null);
			append(div4, t4);
			append(div4, div3);
			append(div3, button0);
			append(button0, t5);
			append(div3, t6);
			append(div3, button1);
			append(div4, t8);

			if (!mounted) {
				dispose = [
					listen(input0, "input", input_handler),
					listen(input1, "input", input_handler_1),
					listen(button0, "click", click_handler_1),
					listen(button1, "click", click_handler_2)
				];

				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (dirty[0] & /*tracks*/ 1 && input0_value_value !== (input0_value_value = /*track*/ ctx[33].color)) {
				input0.value = input0_value_value;
			}

			if (dirty[0] & /*tracks*/ 1 && input1_value_value !== (input1_value_value = /*track*/ ctx[33].name) && input1.value !== input1_value_value) {
				input1.value = input1_value_value;
			}

			if (dirty[0] & /*tracks*/ 1 && t2_value !== (t2_value = /*track*/ ctx[33].points.length + "")) set_data(t2, t2_value);

			if (/*track*/ ctx[33].dateRange.start) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_1(ctx);
					if_block.c();
					if_block.m(div1, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty[0] & /*tracks*/ 1 && t5_value !== (t5_value = (/*track*/ ctx[33].visible ? '👁' : '🚫') + "")) set_data(t5, t5_value);

			if (dirty[0] & /*tracks*/ 1 && button0_title_value !== (button0_title_value = /*track*/ ctx[33].visible ? 'Hide' : 'Show')) {
				attr(button0, "title", button0_title_value);
			}

			if (dirty[0] & /*tracks*/ 1) {
				toggle_class(button0, "active", /*track*/ ctx[33].visible);
			}

			if (dirty[0] & /*tracks*/ 1) {
				toggle_class(div4, "hidden", !/*track*/ ctx[33].visible);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div4);
			}

			if (if_block) if_block.d();
			mounted = false;
			run_all(dispose);
		}
	};
}

function create_fragment(ctx) {
	let div0;
	let t1;
	let section;
	let div1;
	let t3;
	let div2;
	let t4;
	let t5;
	let mounted;
	let dispose;

	function select_block_type(ctx, dirty) {
		if (/*isLoadingPreloaded*/ ctx[1]) return create_if_block_4;
		if (/*tracks*/ ctx[0].length > 0) return create_if_block_5;
	}

	let current_block_type = select_block_type(ctx);
	let if_block0 = current_block_type && current_block_type(ctx);
	let if_block1 = /*preloadError*/ ctx[2] && create_if_block_3(ctx);

	function select_block_type_1(ctx, dirty) {
		if (/*tracks*/ ctx[0].length > 0) return create_if_block;
		return create_else_block;
	}

	let current_block_type_1 = select_block_type_1(ctx);
	let if_block2 = current_block_type_1(ctx);

	return {
		c() {
			div0 = element("div");
			div0.textContent = `${/*title*/ ctx[3]}`;
			t1 = space();
			section = element("section");
			div1 = element("div");
			div1.textContent = `${/*title*/ ctx[3]}`;
			t3 = space();
			div2 = element("div");
			if (if_block0) if_block0.c();
			t4 = space();
			if (if_block1) if_block1.c();
			t5 = space();
			if_block2.c();
			attr(div0, "class", "plugin__mobile-header");
			attr(div1, "class", "plugin__title plugin__title--chevron-back");
			attr(div2, "class", "autoload-status svelte-1y8sfbv");
			attr(section, "class", "plugin__content svelte-1y8sfbv");
		},
		m(target, anchor) {
			insert(target, div0, anchor);
			insert(target, t1, anchor);
			insert(target, section, anchor);
			append(section, div1);
			append(section, t3);
			append(section, div2);
			if (if_block0) if_block0.m(div2, null);
			append(div2, t4);
			if (if_block1) if_block1.m(div2, null);
			append(section, t5);
			if_block2.m(section, null);

			if (!mounted) {
				dispose = listen(div1, "click", /*click_handler*/ ctx[12]);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
				if (if_block0) if_block0.d(1);
				if_block0 = current_block_type && current_block_type(ctx);

				if (if_block0) {
					if_block0.c();
					if_block0.m(div2, t4);
				}
			}

			if (/*preloadError*/ ctx[2]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_3(ctx);
					if_block1.c();
					if_block1.m(div2, null);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block2) {
				if_block2.p(ctx, dirty);
			} else {
				if_block2.d(1);
				if_block2 = current_block_type_1(ctx);

				if (if_block2) {
					if_block2.c();
					if_block2.m(section, null);
				}
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) {
				detach(div0);
				detach(t1);
				detach(section);
			}

			if (if_block0) {
				if_block0.d();
			}

			if (if_block1) if_block1.d();
			if_block2.d();
			mounted = false;
			dispose();
		}
	};
}

function splitAntimeridian(latLngs) {
	if (!latLngs || latLngs.length < 2) return latLngs ? [latLngs] : [];
	const segments = [];
	let current = [latLngs[0]];

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

function formatDate(dateStr) {
	try {
		const d = new Date(dateStr);

		return d.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	} catch {
		return dateStr;
	}
}

function instance($$self, $$props, $$invalidate) {
	const { title } = config;
	let tracks = [];
	const polylines = new Map();
	const markers = new Map();

	function renderTrack(track) {
		removeFromMap(track.id);

		if (!track.visible || track.points.length === 0) {
			$$invalidate(0, tracks = getTracks());
			return;
		}

		const latLngs = toLatLngArray(track.points);
		const splitSegments = splitAntimeridian(latLngs);

		const trackPolylines = splitSegments.map(segment => new L.Polyline(segment,
		{
				color: track.color,
				weight: 3,
				opacity: 0.85,
				lineJoin: 'round'
			}).addTo(map));

		trackPolylines.forEach(polyline => {
			polyline.on('mouseover', () => trackPolylines.forEach(p => p.setStyle({ weight: 5, opacity: 1 })));
			polyline.on('mouseout', () => trackPolylines.forEach(p => p.setStyle({ weight: 3, opacity: 0.85 })));
		});

		const trackMarkers = [];

		if (latLngs.length > 0) {
			const startMarker = new L.CircleMarker(latLngs[0],
			{
					radius: 5,
					fillColor: track.color,
					color: '#fff',
					weight: 2,
					fillOpacity: 1
				}).addTo(map);

			startMarker.bindPopup(`<b>${track.name}</b><br/>Start`);
			trackMarkers.push(startMarker);

			if (latLngs.length > 1) {
				const endMarker = new L.CircleMarker(latLngs[latLngs.length - 1],
				{
						radius: 5,
						fillColor: track.color,
						color: '#fff',
						weight: 2,
						fillOpacity: 1
					}).addTo(map);

				endMarker.bindPopup(`<b>${track.name}</b><br/>End`);
				trackMarkers.push(endMarker);
			}
		}

		polylines.set(track.id, trackPolylines);
		markers.set(track.id, trackMarkers);
		$$invalidate(0, tracks = getTracks());
	}

	function removeFromMap(trackId) {
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

	function refreshAllTracks() {
		polylines.forEach(ps => ps.forEach(p => map.removeLayer(p)));
		markers.forEach(ms => ms.forEach(m => map.removeLayer(m)));
		polylines.clear();
		markers.clear();
		tracks.forEach(renderTrack);
	}

	function updateName(id, name) {
		updateTrack(id, { name });
		$$invalidate(0, tracks = getTracks());
		const trackMarkers = markers.get(id);

		if (trackMarkers) {
			trackMarkers.forEach(m => {
				const popup = m.getPopup();

				if (popup) {
					const content = popup.getContent();
					const newContent = content.replace(/<b>.*?<\/b>/, `<b>${name}</b>`);
					m.setPopupContent(newContent);
				}
			});
		}
	}

	function updateColor(id, color) {
		updateTrack(id, { color });
		$$invalidate(0, tracks = getTracks());
		const track = tracks.find(t => t.id === id);

		if (track) {
			renderTrack(track);
		}
	}

	function toggleVisibility(id) {
		const track = tracks.find(t => t.id === id);
		if (!track) return;
		const newVisible = !track.visible;
		updateTrack(id, { visible: newVisible });

		if (newVisible) {
			renderTrack({ ...track, visible: true });
		} else {
			removeFromMap(id);
		}

		$$invalidate(0, tracks = getTracks());
	}

	function deleteTrack(id) {
		removeFromMap(id);
		removeTrack(id);
		$$invalidate(0, tracks = getTracks());
	}

	function clearAll() {
		polylines.forEach(ps => ps.forEach(p => map.removeLayer(p)));
		markers.forEach(ms => ms.forEach(m => map.removeLayer(m)));
		polylines.clear();
		markers.clear();
		clearAllTracks();
		$$invalidate(0, tracks = getTracks());
	}

	function fitAllTracks() {
		const allLatLngs = [];

		tracks.filter(t => t.visible).forEach(t => {
			allLatLngs.push(...toLatLngArray(t.points));
		});

		if (allLatLngs.length > 0) {
			const bounds = L.latLngBounds(allLatLngs);
			map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
		}
	}

	const onopen = () => {
		refreshAllTracks();
	};

	const PRELOADED_TRACKS = [
		{
			url: 'https://libertairesailing.com/gpx/2011_0.5nm.gpx',
			name: '2011'
		},
		{
			url: 'https://libertairesailing.com/gpx/2012_0.5nm.gpx',
			name: '2012'
		},
		{
			url: 'https://libertairesailing.com/gpx/2013_0.5nm.gpx',
			name: '2013'
		},
		{
			url: 'https://libertairesailing.com/gpx/2016_complete_0.5nm.gpx',
			name: '2016'
		},
		{
			url: 'https://libertairesailing.com/gpx/2017_complete_0.5nm.gpx',
			name: '2017'
		},
		{
			url: 'https://libertairesailing.com/gpx/2018_0.5nm.gpx',
			name: '2018'
		},
		{
			url: 'https://libertairesailing.com/gpx/2019_0.5nm.gpx',
			name: '2019'
		},
		{
			url: 'https://libertairesailing.com/gpx/2021_0.5nm.gpx',
			name: '2021'
		},
		{
			url: 'https://libertairesailing.com/gpx/2022_0.5nm.gpx',
			name: '2022'
		},
		{
			url: 'https://libertairesailing.com/gpx/2023_0.5nm.gpx',
			name: '2023'
		},
		{
			url: 'https://libertairesailing.com/gpx/2024_0.5nm.gpx',
			name: '2024'
		}
	];

	let isLoadingPreloaded = false;
	let preloadError = '';

	async function loadPreloadedTracks() {
		if (isLoadingPreloaded) return;
		$$invalidate(1, isLoadingPreloaded = true);
		$$invalidate(2, preloadError = '');
		const failed = [];

		try {
			for (const track of PRELOADED_TRACKS) {
				try {
					const newTracks = await loadRemoteGPX(track.url, track.name);
					$$invalidate(0, tracks = getTracks());
					newTracks.forEach(renderTrack);
				} catch(err) {
					failed.push(track.name);
					console.warn(`Failed to load ${track.name}:`, err);
				}
			}

			$$invalidate(0, tracks = getTracks());

			if (tracks.length === 0) {
				$$invalidate(2, preloadError = 'No tracks loaded. Check network access to libertairesailing.com/gpx/.');
			} else if (failed.length > 0) {
				$$invalidate(2, preloadError = `Loaded ${tracks.length} track(s), but failed: ${failed.join(', ')}`);
			}

			setTimeout(fitAllTracks, 500);
		} catch(err) {
			$$invalidate(2, preloadError = 'Failed to load Libertaire tracks');
			console.error('Preload error:', err);
		} finally {
			$$invalidate(1, isLoadingPreloaded = false);
			$$invalidate(0, tracks = getTracks());
		}
	}

	onMount(() => {
		$$invalidate(0, tracks = getTracks());

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

	const click_handler = () => bcast.emit('rqstOpen', 'menu');
	const input_handler = (track, e) => updateColor(track.id, e.currentTarget.value);
	const input_handler_1 = (track, e) => updateName(track.id, e.currentTarget.value);
	const click_handler_1 = track => toggleVisibility(track.id);
	const click_handler_2 = track => deleteTrack(track.id);

	return [
		tracks,
		isLoadingPreloaded,
		preloadError,
		title,
		updateName,
		updateColor,
		toggleVisibility,
		deleteTrack,
		clearAll,
		fitAllTracks,
		loadPreloadedTracks,
		onopen,
		click_handler,
		input_handler,
		input_handler_1,
		click_handler_1,
		click_handler_2
	];
}

class Plugin extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, { onopen: 11 }, add_css, [-1, -1]);
	}

	get onopen() {
		return this.$$.ctx[11];
	}
}


// transformCode: Export statement was modified
export { __pluginConfig, Plugin as default };
//# sourceMappingURL=plugin.js.map
