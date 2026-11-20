import {startFx} from './fx.js';
// Site-specific interaction settings; the visual treatment lives in styles.css.
export function startMotion() { startFx({cursor: 'bubble', prefix: 'sp', tilt: 5, magnet: 0.3}); }
