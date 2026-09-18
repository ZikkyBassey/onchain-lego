/**
 * LegoHouse - represents a blockchain wallet
 */

import * as THREE from 'three';
import { LegoObject } from './LegoObject';
import type { LegoObjectData } from '../../../backend/src/types/blockchain';

export class LegoHouse extends LegoObject {
  constructor(data: LegoObjectData) {
    super(data);
    this.baseColor = new THREE.Color(0xff6b6b); // Red
    this.create();
  }

  /**
   * Create house structure
   */
  create(): void {
    // Main walls
    const wall1 = this.createBrick(20, 15, 2, this.baseColor, { x: 0, y: 7.5, z: -10 });
    const wall2 = this.createBrick(20, 15, 2, this.baseColor, { x: 0, y: 7.5, z: 10 });
    const wall3 = this.createBrick(2, 15, 20, this.baseColor, { x: -10, y: 7.5, z: 0 });
    const wall4 = this.createBrick(2, 15, 20, this.baseColor, { x: 10, y: 7.5, z: 0 });

    this.mesh.add(wall1, wall2, wall3, wall4);

    // Roof (pyramid)
    const roofGeometry = new THREE.ConeGeometry(15, 10, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xff4444),
      metalness: 0.2,
      roughness: 0.8,
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 20;
    roof.castShadow = true;
    roof.receiveShadow = true;
    this.mesh.add(roof);

    // Door
    const doorGeometry = new THREE.BoxGeometry(4, 8, 0.5);
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xffb84d),
      metalness: 0.5,
      roughness: 0.5,
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 4, -10.3);
    door.castShadow = true;
    door.receiveShadow = true;
    this.mesh.add(door);

    // Window 1
    const window1 = this.createBrick(3, 3, 0.5, new THREE.Color(0x87ceeb), { x: -4, y: 10, z: -10.3 });
    this.mesh.add(window1);

    // Window 2
    const window2 = this.createBrick(3, 3, 0.5, new THREE.Color(0x87ceeb), { x: 4, y: 10, z: -10.3 });
    this.mesh.add(window2);

    // Door knob
    const knobGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const knobMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xffd700),
      metalness: 0.8,
      roughness: 0.2,
    });
    const knob = new THREE.Mesh(knobGeometry, knobMaterial);
    knob.position.set(2, 4, -10.6);
    knob.castShadow = true;
    knob.receiveShadow = true;
    this.mesh.add(knob);

    // Foundation
    const foundationGeometry = new THREE.BoxGeometry(22, 2, 22);
    const foundationMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x8b7355),
      metalness: 0.1,
      roughness: 0.9,
    });
    const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
    foundation.position.y = 0;
    foundation.castShadow = true;
    foundation.receiveShadow = true;
    this.mesh.add(foundation);

    // Add wallet status indicator (glow intensity based on balance)
    const balance = (this.data.blockchainData?.balance || 0) / 1e9;
    const glowIntensity = Math.min(balance / 100, 1);
    this.addGlow(new THREE.Color(0x667eea), glowIntensity);
  }

  /**
   * Update house (pulse animation)
   */
  update(time: number) {
    const pulse = Math.sin(time * 2) * 0.1;
    this.mesh.scale.set(1 + pulse * 0.05, 1 + pulse * 0.05, 1 + pulse * 0.05);
  }
}

export default LegoHouse;
