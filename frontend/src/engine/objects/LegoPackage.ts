/**
 * LegoPackage - represents a token transfer
 */

import * as THREE from 'three';
import { LegoObject } from './LegoObject';
import type { LegoObjectData } from '../../../backend/src/types/blockchain';

export class LegoPackage extends LegoObject {
  private labelMesh: THREE.Mesh | null = null;
  private floatOffset: number = 0;

  constructor(data: LegoObjectData) {
    super(data);
    this.baseColor = new THREE.Color(0xa8e6cf); // Green
    this.create();
  }

  /**
   * Create package structure
   */
  create(): void {
    // Main box
    const boxGeometry = new THREE.BoxGeometry(6, 6, 6);
    const boxMaterial = new THREE.MeshStandardMaterial({
      color: this.baseColor,
      metalness: 0.4,
      roughness: 0.6,
    });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.castShadow = true;
    box.receiveShadow = true;
    this.mesh.add(box);

    // Box edges (bands)
    for (let i = 0; i < 3; i++) {
      const bandGeometry = new THREE.BoxGeometry(6.3, 0.5, 0.5);
      const bandMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xff8b94),
        metalness: 0.5,
        roughness: 0.5,
      });

      const bandX = new THREE.Mesh(bandGeometry, bandMaterial);
      bandX.position.y = (i - 1) * 2;
      bandX.castShadow = true;
      this.mesh.add(bandX);

      const bandZ = new THREE.Mesh(bandGeometry, bandMaterial);
      bandZ.rotation.z = Math.PI / 2;
      bandZ.position.y = (i - 1) * 2;
      bandZ.castShadow = true;
      this.mesh.add(bandZ);
    }

    // Ribbon bow on top
    const bowGeometry = new THREE.BoxGeometry(3, 1, 3);
    const bowMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xffd700),
      metalness: 0.6,
      roughness: 0.4,
    });
    const bow = new THREE.Mesh(bowGeometry, bowMaterial);
    bow.position.y = 3.5;
    bow.castShadow = true;
    bow.receiveShadow = true;
    this.mesh.add(bow);

    // Left ribbon loop
    const loop1Geometry = new THREE.TorusGeometry(1.5, 0.3, 8, 16);
    const loopMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xff6b6b),
      metalness: 0.6,
      roughness: 0.4,
    });
    const loop1 = new THREE.Mesh(loop1Geometry, loopMaterial);
    loop1.position.set(-1.5, 3.8, 0);
    loop1.rotation.x = Math.PI / 3;
    loop1.castShadow = true;
    this.mesh.add(loop1);

    // Right ribbon loop
    const loop2 = new THREE.Mesh(loop1Geometry, loopMaterial);
    loop2.position.set(1.5, 3.8, 0);
    loop2.rotation.x = Math.PI / 3;
    loop2.castShadow = true;
    this.mesh.add(loop2);

    // Amount indicator (small spheres inside box)
    const amount = parseInt(this.data.blockchainData?.amount || '0');
    const sphereCount = Math.min(Math.ceil(amount / 1e6), 8); // Max 8 spheres

    for (let i = 0; i < sphereCount; i++) {
      const sphereGeometry = new THREE.SphereGeometry(0.3, 8, 8);
      const sphereMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(Math.random() * 0xffffff),
        metalness: 0.8,
        roughness: 0.2,
        emissive: new THREE.Color(0x667eea),
        emissiveIntensity: 0.3,
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

      // Scatter spheres inside box
      sphere.position.set(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4
      );
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      this.mesh.add(sphere);
    }

    // Add glow
    this.addGlow(new THREE.Color(0xa8e6cf), 0.4);
  }

  /**
   * Update package (float and rotate)
   */
  update(time: number) {
    // Floating animation
    this.floatOffset = Math.sin(time * 2) * 1.5;
    this.mesh.position.y += this.floatOffset * 0.01;

    // Rotation
    this.mesh.rotation.x += 0.005;
    this.mesh.rotation.y += 0.008;
    this.mesh.rotation.z += 0.003;

    // Pulsing glow
    const pulse = Math.sin(time * 3) * 0.5 + 0.5;
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material as THREE.MeshStandardMaterial;
        if (material.emissive) {
          material.emissiveIntensity = pulse * 0.4;
        }
      }
    });
  }

  /**
   * Get amount value from blockchain data
   */
  getAmount(): string {
    return this.data.blockchainData?.amount || '0';
  }

  /**
   * Get token mint
   */
  getMint(): string {
    return this.data.blockchainData?.mint || 'SOL';
  }
}

export default LegoPackage;
