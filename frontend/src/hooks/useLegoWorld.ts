/**
 * Hook for managing LEGO world state
 */

import { useState, useCallback, useRef } from 'react';
import type { LegoObjectData, Transaction, Wallet } from '../../backend/src/types/blockchain';

interface UseLegoWorldReturn {
  objects: Map<string, LegoObjectData>;
  selectedObject: LegoObjectData | null;
  isPaused: boolean;
  animationSpeed: number;
  filterType: string;
  addObject: (object: LegoObjectData) => void;
  removeObject: (id: string) => void;
  selectObject: (object: LegoObjectData | null) => void;
  setPaused: (paused: boolean) => void;
  setAnimationSpeed: (speed: number) => void;
  setFilterType: (type: string) => void;
  clearObjects: () => void;
}

/**
 * Hook for managing LEGO world state
 */
export const useLegoWorld = (): UseLegoWorldReturn => {
  const [objects, setObjects] = useState<Map<string, LegoObjectData>>(new Map());
  const [selectedObject, setSelectedObject] = useState<LegoObjectData | null>(null);
  const [isPaused, setIsPausedState] = useState(false);
  const [animationSpeed, setAnimationSpeedState] = useState(1);
  const [filterType, setFilterTypeState] = useState('all');

  /**
   * Add object to world
   */
  const addObject = useCallback((object: LegoObjectData) => {
    setObjects((prev) => {
      const updated = new Map(prev);
      updated.set(object.id, object);
      return updated;
    });
  }, []);

  /**
   * Remove object from world
   */
  const removeObject = useCallback((id: string) => {
    setObjects((prev) => {
      const updated = new Map(prev);
      updated.delete(id);
      return updated;
    });
  }, []);

  /**
   * Select object
   */
  const selectObject = useCallback((object: LegoObjectData | null) => {
    setSelectedObject(object);
  }, []);

  /**
   * Set paused state
   */
  const setPaused = useCallback((paused: boolean) => {
    setIsPausedState(paused);
  }, []);

  /**
   * Set animation speed
   */
  const setAnimationSpeed = useCallback((speed: number) => {
    setAnimationSpeedState(Math.max(0.1, Math.min(speed, 10)));
  }, []);

  /**
   * Set filter type
   */
  const setFilterType = useCallback((type: string) => {
    setFilterTypeState(type);
  }, []);

  /**
   * Clear all objects
   */
  const clearObjects = useCallback(() => {
    setObjects(new Map());
    setSelectedObject(null);
  }, []);

  return {
    objects,
    selectedObject,
    isPaused,
    animationSpeed,
    filterType,
    addObject,
    removeObject,
    selectObject,
    setPaused,
    setAnimationSpeed,
    setFilterType,
    clearObjects,
  };
};

export default useLegoWorld;
