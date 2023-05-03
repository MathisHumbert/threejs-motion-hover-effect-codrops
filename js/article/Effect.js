import * as THREE from 'three';
import { gsap } from 'gsap';

import EffectShell from './EffectShell';

import vertex from '../../gls/vertex.glsl';
import rgbShiftFragment from '../../gls/rgb-shift-fragment.glsl';
import stretchFragmentS from '../../gls/stretch-fragment.glsl';
import trailFragment from '../../gls/trail-fragment.glsl';

export default class Effect extends EffectShell {
  constructor({
    contianer = document.body,
    itemsWrapper = null,
    options = {},
    isTrail,
  }) {
    super(contianer, itemsWrapper);

    if (!this.container || !this.itemsWrapper) return;

    options.strength = options.strength || 0.25;
    options.amount = options.amount || 5;
    options.duration = options.duration || 0.5;
    this.options = options;
    this.isTrail = isTrail;

    this.init();
  }

  init() {
    this.position = new THREE.Vector3(0, 0, 0);
    this.scale = new THREE.Vector3(1, 1, 1);

    this.geometry = new THREE.PlaneGeometry(1, 1, 32, 32);

    this.uniforms = {
      uTexture: {
        value: null,
      },
      uOffset: {
        value: new THREE.Vector2(0, 0),
      },
      uAlpha: {
        value: 0,
      },
    };

    this.material = new THREE.ShaderMaterial({
      // wireframe: true,
      transparent: true,
      uniforms: this.uniforms,
      defines: { PI: 3.1415926535897932384626433832795 },
      vertexShader: vertex,
      fragmentShader: trailFragment,
    });

    this.plane = new THREE.Mesh(this.geometry, this.material);

    if (this.isTrail) {
      this.trails = [];

      for (let i = 0; i < this.options.amount; i++) {
        let plane = this.plane.clone();
        this.trails.push(plane);
        this.scene.add(plane);
      }
    } else {
      this.scene.add(this.plane);
    }
  }

  onMouseEnter() {
    if (!this.currentItem || !this.isMouseOver) {
      this.isMouseOver = true;

      gsap.to(this.uniforms.uAlpha, { value: 1, ease: 'power4' });
    }
  }

  onMouseLeave() {
    gsap.to(this.uniforms.uAlpha, { value: 0, ease: 'power4' });
  }

  onMouseOver(index, e) {
    if (!this.isLoaded) return;

    this.onMouseEnter();

    if (this.currentItem && this.currentItem.index === index) return;

    this.onTargetChange(index);
  }

  onMouseMove(event) {
    let x = this.mouse.x.map(
      -1,
      1,
      -this.viewSize.width / 2,
      this.viewSize.width / 2
    );
    let y = this.mouse.y.map(
      -1,
      1,
      -this.viewSize.height / 2,
      this.viewSize.height / 2
    );

    if (this.isTrail) {
      gsap.to(this.position, {
        x: x,
        y: y,
        duration: 1,
        ease: 'power4',
        onUpdate: () => {
          let offset = this.position
            .clone()
            .sub(new THREE.Vector3(x, y, 0))
            .multiplyScalar(-this.options.strength);
          this.uniforms.uOffset.value = offset;
        },
      });

      this.trails.forEach((trail, index) => {
        const duration =
          this.options.duration * this.options.amount -
          this.options.duration * index;

        gsap.to(trail.position, {
          x: x,
          y: y,
          duration: duration,
          ease: 'power4',
        });
      });
    } else {
      this.position = new THREE.Vector3(x, y, 0);

      gsap.to(this.plane.position, {
        x: x,
        y: y,
        duration: 1,
        ease: 'power4',
        onUpdate: this.onPositionUpdate.bind(this),
      });
    }
  }

  onPositionUpdate() {
    let offset = this.plane.position
      .clone()
      .sub(this.position)
      .multiplyScalar(-this.options.strength);
    this.uniforms.uOffset.value = offset;
  }

  onTargetChange(index) {
    this.currentItem = this.items[index];

    if (!this.currentItem.texture) return;

    this.uniforms.uTexture.value = this.currentItem.texture;

    let imageRatio =
      this.currentItem.img.naturalWidth / this.currentItem.img.naturalHeight;

    if (this.isTrail) {
      this.trails.forEach((trail) => {
        trail.scale.set(imageRatio, 1, 1);
      });
    } else {
      this.plane.scale.set(imageRatio, 1, 1);
    }
  }
}
