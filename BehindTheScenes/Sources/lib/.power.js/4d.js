// CLJ 4D Animation Exports
// This file provides access to all 4D animations (2D + 3D combined)

const getEngine = () => {
  if (typeof window !== 'undefined' && window.__cljUIEngine) {
    return window.__cljUIEngine;
  }
  if (typeof global !== 'undefined' && global.cljUIEngine) {
    return global.cljUIEngine;
  }
  return null;
};

export const quantumDimension4D = () => {
  const engine = getEngine();
  return engine ? engine.getQuantumDimension4DCode() : null;
};

export const timeWarp4D = () => {
  const engine = getEngine();
  return engine ? engine.getTimeWarp4DCode() : null;
};

export const hypercube4D = () => {
  const engine = getEngine();
  return engine ? engine.getHypercube4DCode() : null;
};

export const nebulaVortex4D = () => {
  const engine = getEngine();
  return engine ? engine.getNebulaVortex4DCode() : null;
};

export const dimensionalRift4D = () => {
  const engine = getEngine();
  return engine ? engine.getDimensionalRift4DCode() : null;
};

// Export all as default object
export default {
  quantumDimension4D,
  timeWarp4D,
  hypercube4D,
  nebulaVortex4D,
  dimensionalRift4D
};