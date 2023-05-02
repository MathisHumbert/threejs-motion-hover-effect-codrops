import * as THREE from 'three';
import { gsap } from 'gsap';
export default class Plane {
  constructor(scene) {
    this.scene = scene.scene;
    this.textures = scene.textures;
    this.viewSize = scene.viewSize;

    this.isHover = false;
    this.initPlane();
  }

  initPlane() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 10, 10);
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      // wireframe: true,
      uniforms: {
        uTexture: { value: null },
      },
      vertexShader: `
      varying vec2 vUv;

      void main(){
        vUv = uv;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
      `,
      fragmentShader: `
      uniform sampler2D uTexture;
      varying vec2 vUv;

      void main(){
      vec4 texture = texture2D(uTexture, vUv);

      gl_FragColor = vec4(0., 0., 0., 1.);
      // gl_FragColor = texture;
      }`,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  onMouseMove({ x, y }) {
    // do the offset
    gsap.to(this.mesh.position, { x, y, duration: 1, ease: 'power4' });
  }

  onMouseEnter(index) {
    this.isHover = true;
    const texture = this.textures[index];

    console.log(this.viewSize);
    this.mesh.scale.set(
      texture.image.naturalWidth / texture.image.naturalHeight,
      1,
      1
    );
    this.material.uniforms.uTexture.value = texture;
  }

  onMouseLeave() {
    this.isHover = false;
  }
}
