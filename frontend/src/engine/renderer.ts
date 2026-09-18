/**
 * Three.js based 3D renderer for the LEGO world
 */

import * as THREE from 'three';
import { LegoHouse } from './objects/LegoHouse';
import { LegoCar } from './objects/LegoCar';
import { LegoFactory } from './objects/LegoFactory';
import { LegoPackage } from './objects/LegoPackage';
import type { LegoObjectData, Vector3 } from '../../backend/src/types/blockchain';

export class Renderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private container: HTMLElement;
  private objects: Map<string, any> = new Map();
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouse: THREE.Vector2 = new THREE.Vector2();
  private isPaused: boolean = false;
  private animationSpeed: number = 1;
  private time: number = 0;

  constructor(container: HTMLElement) {
    this.container = container;

    // Setup scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x667eea);
    this.scene.fog = new THREE.Fog(0x667eea, 500, 1500);

    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );
    this.camera.position.set(0, 50, 100);
    this.camera.lookAt(0, 0, 0);

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Add lighting
    this.setupLighting();

    // Add ground
    this.addGround();

    // Add example objects (demo)
    this.addDemoObjects();
  }

  /**
   * Setup lighting
   */
  private setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;
    this.scene.add(directionalLight);

    // Point lights for ambient glow
    const pointLight1 = new THREE.PointLight(0x667eea, 0.5);
    pointLight1.position.set(50, 50, 50);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x764ba2, 0.5);
    pointLight2.position.set(-50, 50, -50);
    this.scene.add(pointLight2);
  }

  /**
   * Add ground plane
   */
  private addGround() {
    const geometry = new THREE.PlaneGeometry(500, 500);
    const material = new THREE.MeshStandardMaterial({
      color: 0x1a1f3a,
      metalness: 0.3,
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  /**
   * Add demo LEGO objects for visualization
   */
  private addDemoObjects() {
    // Add some demo houses (wallets)
    const house1 = new LegoHouse({
      id: 'house-1',
      label: 'Wallet A',
      position: { x: -30, y: 0, z: -40 },
      blockchainData: {
        address: '11111111111111111111111111111111',
        balance: 5000000000,
        totalTransactions: 42,
      },
    });
    this.addObject(house1);

    const house2 = new LegoHouse({
      id: 'house-2',
      label: 'Wallet B',
      position: { x: 30, y: 0, z: -40 },
      blockchainData: {
        address: 'TokenkegQfeZyiNwAJsyFbPKLrRQQj6R82cLrTmUu6',
        balance: 8000000000,
        totalTransactions: 156,
      },
    });
    this.addObject(house2);

    // Add factory (smart contract)
    const factory = new LegoFactory({
      id: 'factory-1',
      label: 'Raydium Swap',
      position: { x: 0, y: 0, z: 0 },
      blockchainData: {
        address: '5Q544fKrFoe6tsEbD7K5DKibxD87djqN84Q6BTnSMwV',
        name: 'Raydium',
        transactionCount: 1000,
      },
    });
    this.addObject(factory);

    // Add a demo car (transaction)
    const car = new LegoCar({
      id: 'car-1',
      label: 'TX: 0x123...abc',
      position: { x: -30, y: 5, z: -40 },
      blockchainData: {
        signature: '5R4xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        fee: 5000,
        success: true,
      },
    });
    this.addObject(car);

    // Add a demo package (token transfer)
    const pkg = new LegoPackage({
      id: 'pkg-1',
      label: 'USDC: 100',
      position: { x: 0, y: 10, z: -20 },
      blockchainData: {
        mint: 'EPjFWaLb3odccccccccccccccccccccccbonkbonk',
        amount: '100000000',
        decimals: 6,
      },
    });
    this.addObject(pkg);
  }

  /**
   * Add a LEGO object to the scene
   */
  addObject(object: any) {
    const mesh = object.getMesh();
    this.scene.add(mesh);
    this.objects.set(object.data.id, object);
  }

  /**
   * Remove a LEGO object from the scene
   */
  removeObject(id: string) {
    const object = this.objects.get(id);
    if (object) {
      const mesh = object.getMesh();
      this.scene.remove(mesh);
      this.objects.delete(id);
    }
  }

  /**
   * Update scene (called every frame)
   */
  update(deltaTime: number = 0.016) {
    this.time += deltaTime * this.animationSpeed;

    // Update all objects
    this.objects.forEach((object) => {
      if (object.update) {
        object.update(this.time);
      }
    });

    // Rotate camera around world
    const angle = this.time * 0.05;
    this.camera.position.x = Math.cos(angle) * 120;
    this.camera.position.z = Math.sin(angle) * 120;
    this.camera.lookAt(0, 20, 0);
  }

  /**
   * Render the scene
   */
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Get object at mouse position
   */
  getObjectAtMouse(x: number, y: number): LegoObjectData | null {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = (x / rect.width) * 2 - 1;
    this.mouse.y = -(y / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    for (const intersection of intersects) {
      // Find parent LEGO object
      let obj = intersection.object;
      while (obj.parent) {
        obj = obj.parent;
        const legoObject = Array.from(this.objects.values()).find(
          (lego) => lego.getMesh() === obj
        );
        if (legoObject) {
          return legoObject.data;
        }
      }
    }

    return null;
  }

  /**
   * Handle window resize
   */
  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Set pause state
   */
  setPaused(paused: boolean) {
    this.isPaused = paused;
  }

  /**
   * Set animation speed
   */
  setAnimationSpeed(speed: number) {
    this.animationSpeed = speed;
  }

  /**
   * Dispose resources
   */
  dispose() {
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}

export default Renderer;
