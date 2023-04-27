import * as THREE from 'three';
import { gsap } from 'gsap';

import EffectShell from './EffectShell';

export default class Effect extends EffectShell {
  constructor(contianer = document.body, itemsWrapper = null, options = {}) {
    super(contianer, itemsWrapper);

    // if (!this.container || !this.itemsWrapper) return;

    options.strength = options.strength || 0.25;
    this.options = options;

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
      transparent: true,
      uniforms: this.uniforms,
      vertexShader: `
      uniform vec2 uOffset;

      varying vec2 vUv;

      #define PI 3.1415926535897932384626433832795

      vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
        position.x = position.x + (sin(uv.y * PI) * offset.x);
        position.y = position.y + (sin(uv.x * PI) * offset.y);
        return position;
      }

      void main(){
        vec3 newPosition = deformationCurve(position, uv, uOffset);

        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
      `,
      fragmentShader: `
      uniform sampler2D uTexture;
      uniform float uAlpha;
      varying vec2 vUv;

      void main(){
        vec3 color = texture2D(uTexture, vUv).rgb;
        gl_FragColor = vec4(color, uAlpha);
      }`,
    });

    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);
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

    this.position = new THREE.Vector3(x, y, 0);

    gsap.to(this.plane.position, {
      x: x,
      y: y,
      duration: 1,
      ease: 'power4',
      onUpdate: this.onPositionUpdate.bind(this),
    });
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

    this.plane.scale.set(imageRatio, 1, 1);
  }
}
