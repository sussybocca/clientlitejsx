// CLJ COMPLETE ANIMATIONS EXPORTS - ALL 50 BACKGROUND + 5 3D + MORE
// This file provides access to ALL animations from the CLJAnimationEngine


// CLJ COMPLETE ANIMATIONS EXPORTS - ALL 50 BACKGROUND + 5 3D + MORE

console.log('🔍 3d.js: Loading...');
console.log('🔍 3d.js: window exists?', typeof window !== 'undefined');
console.log('🔍 3d.js: window.__cljUIEngine exists?', typeof window !== 'undefined' && !!window.__cljUIEngine);
console.log('🔍 3d.js: global exists?', typeof global !== 'undefined');
console.log('🔍 3d.js: global.__cljUIEngine exists?', typeof global !== 'undefined' && !!global.__cljUIEngine);

const getEngine = () => {
  if (typeof window !== 'undefined' && window.__cljUIEngine) {
    console.log('🔍 3d.js: getEngine() returning window.__cljUIEngine');
    return window.__cljUIEngine;
  }
  if (typeof global !== 'undefined' && global.cljUIEngine) {
    console.log('🔍 3d.js: getEngine() returning global.cljUIEngine');
    return global.cljUIEngine;
  }
  console.error('🔍 3d.js: getEngine() returning NULL! Engine not registered yet.');
  return null;
};

// ==================== ALL 50 BACKGROUND 2D ANIMATIONS ====================
export const particleNebula = () => { const engine = getEngine(); return engine ? engine.getParticleNebulaCode() : null; };
export const quantumWave = () => { const engine = getEngine(); return engine ? engine.getQuantumWaveCode() : null; };
export const crystalMatrix = () => { const engine = getEngine(); return engine ? engine.getCrystalMatrixCode() : null; };
export const lightTrails = () => { const engine = getEngine(); return engine ? engine.getLightTrailsCode() : null; };
export const energyField = () => { const engine = getEngine(); return engine ? engine.getEnergyFieldCode() : null; };
export const cosmicDust = () => { const engine = getEngine(); return engine ? engine.getCosmicDustCode() : null; };
export const plasmaFlow = () => { const engine = getEngine(); return engine ? engine.getPlasmaFlowCode() : null; };
export const vortexSwarm = () => { const engine = getEngine(); return engine ? engine.getVortexSwarmCode() : null; };
export const auroraBorealis = () => { const engine = getEngine(); return engine ? engine.getAuroraBorealisCode() : null; };
export const neuralNetwork = () => { const engine = getEngine(); return engine ? engine.getNeuralNetworkCode() : null; };
export const gravityWells = () => { const engine = getEngine(); return engine ? engine.getGravityWellsCode() : null; };
export const starfield = () => { const engine = getEngine(); return engine ? engine.getStarfieldCode() : null; };
export const liquidGradient = () => { const engine = getEngine(); return engine ? engine.getLiquidGradientCode() : null; };
export const fireflies = () => { const engine = getEngine(); return engine ? engine.getFirefliesCode() : null; };
export const matrixRain = () => { const engine = getEngine(); return engine ? engine.getMatrixRainCode() : null; };
export const wormhole = () => { const engine = getEngine(); return engine ? engine.getWormholeCode() : null; };
export const pulsarRings = () => { const engine = getEngine(); return engine ? engine.getPulsarRingsCode() : null; };
export const nebulaClouds = () => { const engine = getEngine(); return engine ? engine.getNebulaCloudsCode() : null; };
export const electricGrid = () => { const engine = getEngine(); return engine ? engine.getElectricGridCode() : null; };
export const ripples = () => { const engine = getEngine(); return engine ? engine.getRipplesCode() : null; };
export const galaxy = () => { const engine = getEngine(); return engine ? engine.getGalaxyCode() : null; };
export const fireworks = () => { const engine = getEngine(); return engine ? engine.getFireworksCode() : null; };
export const snowflakes = () => { const engine = getEngine(); return engine ? engine.getSnowflakesCode() : null; };
export const bubbles = () => { const engine = getEngine(); return engine ? engine.getBubblesCode() : null; };
export const lightning = () => { const engine = getEngine(); return engine ? engine.getLightningCode() : null; };
export const kaleidoscope = () => { const engine = getEngine(); return engine ? engine.getKaleidoscopeCode() : null; };
export const tentacles = () => { const engine = getEngine(); return engine ? engine.getTentaclesCode() : null; };
export const fractals = () => { const engine = getEngine(); return engine ? engine.getFractalsCode() : null; };
export const heartbeat = () => { const engine = getEngine(); return engine ? engine.getHeartbeatCode() : null; };
export const dnaHelix = () => { const engine = getEngine(); return engine ? engine.getDNAHelixCode() : null; };
export const blackHole = () => { const engine = getEngine(); return engine ? engine.getBlackHoleCode() : null; };
export const supernova = () => { const engine = getEngine(); return engine ? engine.getSupernovaCode() : null; };
export const timeWarp = () => { const engine = getEngine(); return engine ? engine.getTimeWarpCode() : null; };
export const dimensionalRift = () => { const engine = getEngine(); return engine ? engine.getDimensionalRiftCode() : null; };
export const sonicBoom = () => { const engine = getEngine(); return engine ? engine.getSonicBoomCode() : null; };
export const tectonic = () => { const engine = getEngine(); return engine ? engine.getTectonicCode() : null; };
export const bioluminescence = () => { const engine = getEngine(); return engine ? engine.getBioluminescenceCode() : null; };
export const hyperspace = () => { const engine = getEngine(); return engine ? engine.getHyperspaceCode() : null; };
export const molecularDance = () => { const engine = getEngine(); return engine ? engine.getMolecularDanceCode() : null; };
export const solarFlare = () => { const engine = getEngine(); return engine ? engine.getSolarFlareCode() : null; };
export const oceanFloor = () => { const engine = getEngine(); return engine ? engine.getOceanFloorCode() : null; };
export const thunderstorm = () => { const engine = getEngine(); return engine ? engine.getThunderstormCode() : null; };
export const northernLights = () => { const engine = getEngine(); return engine ? engine.getNorthernLightsCode() : null; };
export const lavaFlow = () => { const engine = getEngine(); return engine ? engine.getLavaFlowCode() : null; };
export const crystalCave = () => { const engine = getEngine(); return engine ? engine.getCrystalCaveCode() : null; };
export const magneticField = () => { const engine = getEngine(); return engine ? engine.getMagneticFieldCode() : null; };
export const pulseWave = () => { const engine = getEngine(); return engine ? engine.getPulseWaveCode() : null; };
export const geometricMorph = () => { const engine = getEngine(); return engine ? engine.getGeometricMorphCode() : null; };
export const constellation = () => { const engine = getEngine(); return engine ? engine.getConstellationCode() : null; };
export const phoenixRise = () => { const engine = getEngine(); return engine ? engine.getPhoenixRiseCode() : null; };

// ==================== 5 REAL 3D WEBGL ANIMATIONS ====================
export const rotatingCube3D = () => { const engine = getEngine(); return engine ? engine.getRotatingCube3DCode() : null; };
export const sphereWave3D = () => { const engine = getEngine(); return engine ? engine.getSphereWave3DCode() : null; };
export const torusKnot3D = () => { const engine = getEngine(); return engine ? engine.getTorusKnot3DCode() : null; };
export const particleField3D = () => { const engine = getEngine(); return engine ? engine.getParticleField3DCode() : null; };
export const galaxySpiral3D = () => { const engine = getEngine(); return engine ? engine.getGalaxySpiral3DCode() : null; };

// ==================== ALIASES ====================
export const spiral3D = galaxySpiral3D;

// ==================== DEFAULT EXPORT WITH EVERYTHING ====================
export default {
  // All 50 background animations
  particleNebula, quantumWave, crystalMatrix, lightTrails, energyField, cosmicDust, plasmaFlow, vortexSwarm,
  auroraBorealis, neuralNetwork, gravityWells, starfield, liquidGradient, fireflies, matrixRain, wormhole,
  pulsarRings, nebulaClouds, electricGrid, ripples, galaxy, fireworks, snowflakes, bubbles, lightning,
  kaleidoscope, tentacles, fractals, heartbeat, dnaHelix, blackHole, supernova, timeWarp, dimensionalRift,
  sonicBoom, tectonic, bioluminescence, hyperspace, molecularDance, solarFlare, oceanFloor, thunderstorm,
  northernLights, lavaFlow, crystalCave, magneticField, pulseWave, geometricMorph, constellation, phoenixRise,
  // 5 3D animations
  rotatingCube3D, sphereWave3D, torusKnot3D, particleField3D, galaxySpiral3D, spiral3D
};