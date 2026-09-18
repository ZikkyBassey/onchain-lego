/**
 * LegoFactory - represents a blockchain smart contract/program
 */

import * as THREE from 'three';
import { LegoObject } from './LegoObject';
import type { LegoObjectData } from '../../../backend/src/types/blockchain';

export class LegoFactory extends LegoObject {
  private chimneys: THREE.Mesh[] = [];
  private conveyorBelt: THREE.Mesh | null = null;

  constructor(data: LegoObjectData) {
    super(data);
    this.baseColor = new THREE.Color(0xffd93d); // Yellow
    this.create();
  }

  /**
   * Create factory structure
   */
  create(): void {
    // Main building
    const buildingGeometry = new THREE.BoxGeometry(25, 20, 25);
    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: this.baseColor,
      metalness: 0.3,
      roughness: 0.7,
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = 10;
    building.castShadow = true;
    building.receiveShadow = true;
    this.mesh.add(building);

    // Chimneys
    const chimneyPositions = [
      { x: -8, z: -8 },
      { x: 8, z: -8 },
      { x: -8, z: 8 },
      { x: 8, z: 8 },
    ];

    chimneyPositions.forEach((pos) => {
      const chimney = this.createChimney();
      chimney.position.set(pos.x, 0, pos.z);
      this.chimneys.push(chimney);
      this.mesh.add(chimney);
    });

    // Conveyor belt
    this.conveyorBelt = this.createConveyorBelt();
    this.mesh.add(this.conveyorBelt);

    // Windows (representing processing units)
    for (let i = 0; i < 9; i++) {
      const x = (i % 3) * 6 - 6;
      const y = Math.floor(i / 3) * 5 + 5;

      const windowGeometry = new THREE.BoxGeometry(3, 3, 0.5);
      const windowMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x667eea),
        metalness: 0.7,
        roughness: 0.3,
        emissive: new THREE.Color(0x667eea),
        emissiveIntensity: 0.3,
      });
      const window = new THREE.Mesh(windowGeometry, windowMaterial);
      window.position.set(x, y, 12.8);
      this.mesh.add(window);
    }

    // Roof
    const roofGeometry = new THREE.BoxGeometry(25, 2, 25);
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xd4a574),
      metalness: 0.2,
      roughness: 0.8,
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 21;
    roof.castShadow = true;
    roof.receiveShadow = true;
    this.mesh.add(roof);

    // Foundation
    const foundationGeometry = new THREE.BoxGeometry(27, 2, 27);
    const foundationMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x8b7355),
      metalness: 0.1,
      roughness: 0.9,
    });
    const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
    foundation.castShadow = true;
    foundation.receiveShadow = true;
    this.mesh.add(foundation);

    // Add glow
    this.addGlow(new THREE.Color(0xffd93d), 0.3);
  }

  /**
   * Create a chimney
   */
  private createChimney(): THREE.Group {
    const group = new THREE.Group();

    // Chimney shaft
    const shaftGeometry = new THREE.CylinderGeometry(2, 2, 20, 16);
    const shaftMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x666666),
      metalness: 0.1,
      roughness: 0.8,
    });
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.position.y = 15;
    shaft.castShadow = true;
    shaft.receiveShadow = true;
    group.add(shaft);

    // Chimney top
    const topGeometry = new THREE.CylinderGeometry(2.5, 2, 2, 16);
    const topMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x555555),
      metalness: 0.2,
      roughness: 0.7,
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = 25;
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    // Smoke particles effect (simple plane with animated texture)
    const smokeGeometry = new THREE.PlaneGeometry(4, 6);
    const smokeMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xcccccc),
      transparent: true,
      opacity: 0.3,
    });
    const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial);
    smoke.position.set(0, 28, 0);
    group.add(smoke);

    return group;
  }

  /**
   * Create conveyor belt
   */
  private createConveyorBelt(): THREE.Group {
    const group = new THREE.Group();

    // Belt frame
    const frameGeometry = new THREE.BoxGeometry(20, 2, 4);
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x333333),
      metalness: 0.5,
      roughness: 0.5,
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.set(0, 3, 15);
    frame.castShadow = true;
    frame.receiveShadow = true;
    group.add(frame);

    // Belt surface
    const beltGeometry = new THREE.PlaneGeometry(18, 3);
    const beltMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x444444),
      metalness: 0.3,
      roughness: 0.7,
    });
    const belt = new THREE.Mesh(beltGeometry, beltMaterial);
    belt.position.set(0, 3.1, 15);
    belt.rotation.x = 0.01;
    belt.receiveShadow = true;
    group.add(belt);

    // Rollers
    for (let i = 0; i < 3; i++) {
      const rollerGeometry = new THREE.CylinderGeometry(1.5, 1.5, 20, 16);
      const rollerMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x222222),
        metalness: 0.6,
        roughness: 0.4,
      });
      const roller = new THREE.Mesh(rollerGeometry, rollerMaterial);
      roller.position.set(0, i === 1 ? 1 : 5, 15 + (i - 1) * 8);
      roller.rotation.z = Math.PI / 2;
      roller.castShadow = true;
      roller.receiveShadow = true;
      group.add(roller);
    }

    return group;
  }

  /**
   * Update factory (chimneys emit smoke, conveyor moves)
   */
  update(time: number) {
    // Animate chimneys
    this.chimneys.forEach((chimney, index) => {
      if (chimney.children[2]) {
        chimney.children[2].position.y = 28 + Math.sin(time * 2 + index) * 2;
        chimney.children[2].position.x = Math.sin(time * 1.5 + index) * 1;
      }
    });

    // Animate conveyor belt
    if (this.conveyorBelt) {
      const belt = this.conveyorBelt.children[1];
      if (belt) {
        const rotationAmount = time * 0.5;
        belt.rotation.y = rotationAmount;
      }
    }

    // Pulsing glow
    const pulse = Math.sin(time * 2) * 0.5 + 0.5;
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh && child !== this.conveyorBelt) {
        const material = child.material as THREE.MeshStandardMaterial;
        if (material.emissive) {
          material.emissiveIntensity = pulse * 0.3;
        }
      }
    });
  }
}

export default LegoFactory;
