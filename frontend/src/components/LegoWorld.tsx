/**
 * Main LEGO world component - renders the 3D scene
 */

import React, { useEffect, useRef, useState } from 'react';
import { Renderer } from '../engine/renderer';
import type { LegoObjectData, WorldEvent } from '../../backend/src/types/blockchain';
import '../styles/LegoWorld.css';

interface LegoWorldProps {
  onObjectClick?: (object: LegoObjectData) => void;
  isPaused?: boolean;
  animationSpeed?: number;
}

export const LegoWorld: React.FC<LegoWorldProps> = ({
  onObjectClick,
  isPaused = false,
  animationSpeed = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize renderer
    const renderer = new Renderer(containerRef.current);
    rendererRef.current = renderer;

    // Start animation loop
    const animate = () => {
      if (!isPaused) {
        renderer.update(animationSpeed);
      }
      renderer.render();
      requestAnimationFrame(animate);
    };

    animate();
    setIsReady(true);

    // Handle window resize
    const handleResize = () => {
      renderer.onWindowResize();
    };

    window.addEventListener('resize', handleResize);

    // Handle object clicks
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const object = renderer.getObjectAtMouse(x, y);
      if (object && onObjectClick) {
        onObjectClick(object);
      }
    };

    containerRef.current.addEventListener('click', handleClick);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeEventListener('click', handleClick);
      }
      renderer.dispose();
    };
  }, []);

  // Handle pause changes
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setPaused(isPaused);
    }
  }, [isPaused]);

  // Handle animation speed changes
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setAnimationSpeed(animationSpeed);
    }
  }, [animationSpeed]);

  return (
    <div
      ref={containerRef}
      className="lego-world-container"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {!isReady && (
        <div className="loading-overlay">
          <div className="loading-spinner">Loading LEGO World...</div>
        </div>
      )}
    </div>
  );
};

export default LegoWorld;
