// CLJ Runtime Exports
// This file re-exports all runtime functions from the global __CLJ_* objects

export const useState = () => window.__CLJ_useState;
export const useEffect = () => window.__CLJ_useEffect;
export const useRef = () => window.__CLJ_useRef;
export const useCallback = () => window.__CLJ_useCallback;
export const useMemo = () => window.__CLJ_useMemo;
export const createElement = () => window.__CLJ_createElement;
export const mount = () => window.__CLJ_mount;
export const device = () => window.__CLJ_device;

// Also export as default object
export default {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  createElement,
  mount,
  device
};