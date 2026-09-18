/**
 * Animation system for LEGO objects
 */

import * as THREE from 'three';
import type { LegoObjectData, Vector3, Transaction } from '../../backend/src/types/blockchain';

export interface AnimationConfig {
  duration: number;
  delay?: number;
  easing?: (t: number) => number;
  loop?: boolean;
  yoyo?: boolean;
}

export class AnimationSystem {
  private animations: Map<string, Animation> = new Map();
  private time: number = 0;

  /**
   * Create a movement animation
   */
  createMovementAnimation(
    mesh: THREE.Object3D,
    startPos: Vector3,
    endPos: Vector3,
    config: AnimationConfig
  ): Animation {
    const animation = new Animation(
      mesh,
      'position',
      startPos,
      endPos,
      config,
      this.easeInOutCubic
    );
    return animation;
  }

  /**
   * Create a rotation animation
   */
  createRotationAnimation(
    mesh: THREE.Object3D,
    startRot: Vector3,
    endRot: Vector3,
    config: AnimationConfig
  ): Animation {
    const animation = new Animation(
      mesh,
      'rotation',
      startRot,
      endRot,
      config,
      this.easeInOutCubic
    );
    return animation;
  }

  /**
   * Create a scale animation
   */
  createScaleAnimation(
    mesh: THREE.Object3D,
    startScale: number,
    endScale: number,
    config: AnimationConfig
  ): Animation {
    const animation = new Animation(
      mesh,
      'scale',
      { x: startScale, y: startScale, z: startScale },
      { x: endScale, y: endScale, z: endScale },
      config,
      this.easeInOutCubic
    );
    return animation;
  }

  /**
   * Create a color animation
   */
  createColorAnimation(
    mesh: THREE.Mesh,
    startColor: THREE.Color,
    endColor: THREE.Color,
    config: AnimationConfig
  ): Animation {
    const animation = new ColorAnimation(
      mesh,
      startColor,
      endColor,
      config,
      this.easeInOutCubic
    );
    return animation;
  }

  /**
   * Add animation to system
   */
  addAnimation(id: string, animation: Animation) {
    this.animations.set(id, animation);
  }

  /**
   * Remove animation
   */
  removeAnimation(id: string) {
    this.animations.delete(id);
  }

  /**
   * Update all animations
   */
  update(deltaTime: number) {
    this.time += deltaTime;

    const toRemove: string[] = [];

    this.animations.forEach((animation, id) => {
      animation.update(deltaTime);
      if (animation.isFinished() && !animation.config.loop) {
        toRemove.push(id);
      }
    });

    toRemove.forEach((id) => this.removeAnimation(id));
  }

  /**
   * Easing functions
   */
  private easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  private easeInOutQuad = (t: number): number => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  };

  private easeOutBounce = (t: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  };
}

/**
 * Individual animation
 */
export class Animation {
  mesh: THREE.Object3D;
  property: string;
  startValue: any;
  endValue: any;
  config: AnimationConfig;
  easing: (t: number) => number;
  elapsed: number = 0;
  finished: boolean = false;

  constructor(
    mesh: THREE.Object3D,
    property: string,
    startValue: any,
    endValue: any,
    config: AnimationConfig,
    easing: (t: number) => number
  ) {
    this.mesh = mesh;
    this.property = property;
    this.startValue = startValue;
    this.endValue = endValue;
    this.config = config;
    this.easing = easing;
  }

  update(deltaTime: number) {
    if (this.config.delay && this.elapsed < this.config.delay) {
      this.elapsed += deltaTime;
      return;
    }

    this.elapsed += deltaTime;
    const adjustedElapsed = Math.max(this.elapsed - (this.config.delay || 0), 0);
    const progress = Math.min(adjustedElapsed / this.config.duration, 1);
    const easedProgress = this.easing(progress);

    if (this.property === 'position') {
      this.mesh.position.x =
        this.startValue.x + (this.endValue.x - this.startValue.x) * easedProgress;
      this.mesh.position.y =
        this.startValue.y + (this.endValue.y - this.startValue.y) * easedProgress;
      this.mesh.position.z =
        this.startValue.z + (this.endValue.z - this.startValue.z) * easedProgress;
    } else if (this.property === 'rotation') {
      this.mesh.rotation.x =
        this.startValue.x + (this.endValue.x - this.startValue.x) * easedProgress;
      this.mesh.rotation.y =
        this.startValue.y + (this.endValue.y - this.startValue.y) * easedProgress;
      this.mesh.rotation.z =
        this.startValue.z + (this.endValue.z - this.startValue.z) * easedProgress;
    } else if (this.property === 'scale') {
      this.mesh.scale.x =
        this.startValue.x + (this.endValue.x - this.startValue.x) * easedProgress;
      this.mesh.scale.y =
        this.startValue.y + (this.endValue.y - this.startValue.y) * easedProgress;
      this.mesh.scale.z =
        this.startValue.z + (this.endValue.z - this.startValue.z) * easedProgress;
    }

    if (progress >= 1) {
      this.finished = true;
    }
  }

  isFinished(): boolean {
    return this.finished;
  }
}

/**
 * Color animation
 */
class ColorAnimation {
  mesh: THREE.Mesh;
  startColor: THREE.Color;
  endColor: THREE.Color;
  config: AnimationConfig;
  easing: (t: number) => number;
  elapsed: number = 0;
  finished: boolean = false;

  constructor(
    mesh: THREE.Mesh,
    startColor: THREE.Color,
    endColor: THREE.Color,
    config: AnimationConfig,
    easing: (t: number) => number
  ) {
    this.mesh = mesh;
    this.startColor = startColor.clone();
    this.endColor = endColor.clone();
    this.config = config;
    this.easing = easing;
  }

  update(deltaTime: number) {
    this.elapsed += deltaTime;
    const adjustedElapsed = Math.max(this.elapsed - (this.config.delay || 0), 0);
    const progress = Math.min(adjustedElapsed / this.config.duration, 1);
    const easedProgress = this.easing(progress);

    const material = this.mesh.material as THREE.MeshStandardMaterial;
    material.color.copy(this.startColor).lerp(this.endColor, easedProgress);

    if (progress >= 1) {
      this.finished = true;
    }
  }

  isFinished(): boolean {
    return this.finished;
  }
}

export default AnimationSystem;
