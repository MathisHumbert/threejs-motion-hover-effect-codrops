import * as THREE from 'three';
import { gsap } from 'gsap';

import vertex from '../gls/vertex.glsl';
import fragment from '../gls/rgb-shift-fragment.glsl';

export default class Plane {
  constructor(scene) {
    this.scene = scene.scene;
    this.width = scene.width;
    this.height = scene.height;
    this.textures = scene.textures;

    this.isHover = false;
    this.currentIndex = 0;
    this.initPlane();
  }

  initPlane() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 10, 10);
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      defines: { PI: 3.1415926535897932384626433832795 },
      uniforms: {
        uTexture: { value: null },
        uAlpha: { value: 0 },
        uOffset: { value: new THREE.Vector2(1, 1) },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  onWindowResize({ width, height }) {
    this.width = width;
    this.height = height;
  }

  onMouseMove({ x, y }) {
    this.position = new THREE.Vector3(x, y, 0);

    gsap.to(this.mesh.position, {
      x: x,
      y: y,
      duration: 1,
      ease: 'power4',
      onUpdate: this.onPositionUpdate.bind(this),
    });
  }

  onMouseEnter(index) {
    if (this.currentIndex === index && this.isHover) return;

    this.currentIndex = index;
    this.isHover = true;

    gsap.to(this.material.uniforms.uAlpha, { value: 1, ease: 'power4' });

    const texture = this.textures[index];

    const scale =
      this.width / texture.image.naturalWidth +
      this.height / texture.image.naturalHeight;

    this.mesh.scale.set(
      texture.image.naturalWidth * scale * 0.15,
      texture.image.naturalHeight * scale * 0.15,
      1
    );

    this.material.uniforms.uTexture.value = texture;
  }

  onMouseLeave() {
    this.isHover = false;

    gsap.to(this.material.uniforms.uAlpha, { value: 0, ease: 'power4' });
  }

  onPositionUpdate() {
    let offset = this.mesh.position
      .clone()
      .sub(this.position)
      .multiplyScalar(-0.001);
    this.material.uniforms.uOffset.value = offset;
  }
}
