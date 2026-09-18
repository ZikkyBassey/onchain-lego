/**
 * LegoCar - represents a blockchain transaction
 */

import * as THREE from 'three';
import { LegoObject } from './LegoObject';
import type { LegoObjectData } from '../../../backend/src/types/blockchain';

export class LegoCar extends LegoObject {
  private wheels: THREE.Mesh[] = [];
  private startPosition: THREE.Vector3;
  private endPosition: THREE.Vector3;
  private travelProgress: number = 0;

  constructor(data: LegoObjectData) {
    super(data);
    this.baseColor = new THREE.Color(0x4ecdc4); // Teal
    this.startPosition = new THREE.Vector3(data.position.x, data.position.y, data.position.z);
    this.endPosition = new THREE.Vector3(data.position.x + 40, data.position.y, data.position.z + 40);
    this.create();
  }

  /**
   * Create car structure
   */
  create(): void {
    // Main body
    const bodyGeometry = new THREE.BoxGeometry(8, 6, 4);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: this.baseColor,
      metalness: 0.6,
      roughness: 0.4,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 4;
    body.castShadow = true;
    body.receiveShadow = true;
    this.mesh.add(body);

    // Cabin (top part)
    const cabinGeometry = new THREE.BoxGeometry(5, 4, 3);
    const cabinMaterial = new THREE.MeshStandardMaterial({
      color: this.baseColor,
      metalness: 0.7,
      roughness: 0.3,
    });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(0, 8, 0);
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    this.mesh.add(cabin);

    // Windows
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x87ceeb),
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.7,
    });

    const windowGeometry = new THREE.PlaneGeometry(2, 2);
    const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
    window1.position.set(-1.5, 8, 1.6);
    this.mesh.add(window1);

    const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
    window2.position.set(1.5, 8, 1.6);
    this.mesh.add(window2);

    // Headlights
    const headlightGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16);
    const headlightMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xffff00),
      metalness: 0.8,
      roughness: 0.2,
      emissive: new THREE.Color(0xffff00),
      emissiveIntensity: 0.5,
    });

    const headlight1 = new THREE.Mesh(headlightGeometry, headlightMaterial);
    headlight1.position.set(-2, 5, -4.2);
    headlight1.rotation.z = Math.PI / 2;
    this.mesh.add(headlight1);

    const headlight2 = new THREE.Mesh(headlightGeometry, headlightMaterial);
    headlight2.position.set(2, 5, -4.2);
    headlight2.rotation.z = Math.PI / 2;
    this.mesh.add(headlight2);

    // Wheels
    for (let i = 0; i < 4; i++) {
      const wheel = this.createWheel();
      const xPos = i < 2 ? -3.5 : 3.5;
      const zPos = i % 2 === 0 ? -3 : 3;
      wheel.position.set(xPos, 1.5, zPos);
      this.wheels.push(wheel);
      this.mesh.add(wheel);
    }

    // Add glow based on transaction status
    if (this.data.blockchainData?.success) {
      this.addGlow(new THREE.Color(0x51cf66), 0.5);
    } else {
      this.addGlow(new THREE.Color(0xff6b6b), 0.5);
    }
  }

  /**
   * Create a wheel
   */
  private createWheel(): THREE.Mesh {
    const wheelGeometry = new THREE.CylinderGeometry(2, 2, 1, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x333333),
      metalness: 0.4,
      roughness: 0.8,
    });
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.castShadow = true;
    wheel.receiveShadow = true;
    return wheel;
  }

  /**
   * Set car path
   */
  setPath(start: THREE.Vector3, end: THREE.Vector3) {
    this.startPosition = start.clone();
    this.endPosition = end.clone();
    this.travelProgress = 0;
  }

  /**
   * Update car (wheels rotate, follows path)
   */
  update(time: number) {
    // Rotate wheels
    this.wheels.forEach((wheel) => {
      wheel.rotation.y += 0.1;
    });

    // Move along path
    this.travelProgress += 0.002;
    if (this.travelProgress <= 1) {
      const startPos = this.startPosition;
      const endPos = this.endPosition;

      this.mesh.position.x = startPos.x + (endPos.x - startPos.x) * this.travelProgress;
      this.mesh.position.y = startPos.y + (endPos.y - startPos.y) * this.travelProgress;
      this.mesh.position.z = startPos.z + (endPos.z - startPos.z) * this.travelProgress;

      // Rotate to face direction of travel
      const direction = new THREE.Vector3(
        endPos.x - startPos.x,
        0,
        endPos.z - startPos.z
      ).normalize();
      this.mesh.lookAt(
        this.mesh.position.x + direction.x,
        this.mesh.position.y,
        this.mesh.position.z + direction.z
      );
    } else {
      // Reset car
      this.travelProgress = -0.5; // Wait before restarting
    }

    // Bounce effect
    const bounce = Math.sin(time * 4) * 0.3;
    this.mesh.position.y += bounce * 0.01;
  }
}

export default LegoCar;
