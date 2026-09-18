/**
 * Base class for all LEGO objects
 */

import * as THREE from 'three';
import type { LegoObjectData, Vector3 } from '../../../backend/src/types/blockchain';

export abstract class LegoObject {
  protected data: LegoObjectData;
  protected mesh: THREE.Group;
  protected baseColor: THREE.Color;
  protected isAnimating: boolean = false;

  constructor(data: LegoObjectData) {
    this.data = data;
    this.mesh = new THREE.Group();
    this.baseColor = new THREE.Color(0x667eea);
    this.mesh.position.set(data.position.x, data.position.y, data.position.z);
    if (data.rotation) {
      this.mesh.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
    }
    if (data.scale) {
      this.mesh.scale.set(data.scale, data.scale, data.scale);
    }
  }

  /**
   * Get the mesh
   */
  getMesh(): THREE.Group {
    return this.mesh;
  }

  /**
   * Get object data
   */
  getData(): LegoObjectData {
    return this.data;
  }

  /**
   * Create a LEGO brick
   */
  protected createBrick(
    width: number,
    height: number,
    depth: number,
    color: THREE.Color,
    position?: Vector3
  ): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.3,
      roughness: 0.7,
    });
    const brick = new THREE.Mesh(geometry, material);
    brick.castShadow = true;
    brick.receiveShadow = true;

    if (position) {
      brick.position.set(position.x, position.y, position.z);
    }

    return brick;
  }

  /**
   * Create rounded brick (with beveled edges)
   */
  protected createRoundedBrick(
    width: number,
    height: number,
    depth: number,
    color: THREE.Color,
    position?: Vector3,
    radius: number = 0.2
  ): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const geometry2 = new THREE.SphereGeometry(radius, 8, 8);

    // Create edge mesh using a custom approach
    const material = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.3,
      roughness: 0.7,
    });

    const brick = new THREE.Mesh(geometry, material);
    brick.castShadow = true;
    brick.receiveShadow = true;

    if (position) {
      brick.position.set(position.x, position.y, position.z);
    }

    return brick;
  }

  /**
   * Create a cylindrical brick
   */
  protected createCylinder(
    radius: number,
    height: number,
    color: THREE.Color,
    position?: Vector3
  ): THREE.Mesh {
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 16);
    const material = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.3,
      roughness: 0.7,
    });
    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;

    if (position) {
      cylinder.position.set(position.x, position.y, position.z);
    }

    return cylinder;
  }

  /**
   * Add emission to object for glow effect
   */
  protected addGlow(color: THREE.Color, intensity: number = 0.5) {
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        (child.material as THREE.MeshStandardMaterial).emissive = color;
        (child.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
      }
    });
  }

  /**
   * Update object (called each frame)
   */
  update(time: number) {
    // Default no-op, override in subclasses
  }

  /**
   * Animate to position
   */
  animateTo(targetPosition: Vector3, duration: number = 1) {
    const startPosition = { ...this.mesh.position };
    const startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      this.mesh.position.x = startPosition.x + (targetPosition.x - startPosition.x) * progress;
      this.mesh.position.y = startPosition.y + (targetPosition.y - startPosition.y) * progress;
      this.mesh.position.z = startPosition.z + (targetPosition.z - startPosition.z) * progress;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * Rotate object
   */
  rotateTo(targetRotation: Vector3, duration: number = 1) {
    const startRotation = { ...this.mesh.rotation };
    const startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      this.mesh.rotation.x = startRotation.x + (targetRotation.x - startRotation.x) * progress;
      this.mesh.rotation.y = startRotation.y + (targetRotation.y - startRotation.y) * progress;
      this.mesh.rotation.z = startRotation.z + (targetRotation.z - startRotation.z) * progress;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * Abstract method - must be implemented by subclasses
   */
  abstract create(): void;
}

export default LegoObject;
