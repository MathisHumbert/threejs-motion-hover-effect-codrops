import * as THREE from 'three';

import Plane from './Plane';

export default class Scene {
  constructor({ container, itemsWrapper, isTrail, fragment }) {
    this.container = container;
    this.wrapper = itemsWrapper;
    this.isTrail = isTrail;
    this.fragment = fragment;

    this.width = container.offsetWidth;
    this.height = container.offsetHeight;
    this.aspectRatio = this.width / this.height;
    this.mouse = { x: 0, y: 0 };

    this.links = [...this.wrapper.querySelectorAll('.grid__items__link')];

    this.load();
  }

  load() {
    const textureLoader = new THREE.TextureLoader();

    Promise.all(
      this.links.map((link) => {
        const img = link.querySelector('img');

        return new Promise((res) => {
          textureLoader.load(img.attributes.src.value, (texture) => {
            res(texture);
          });
        });
      })
    ).then((data) => {
      this.textures = data;
      this.container.classList.remove('loading');
      this.init();
    });
  }

  init() {
    this.initThree();
    this.initPlane();
    this.addEvents();
  }

  initThree() {
    this.scene = new THREE.Scene();

    this.perspective = 800;
    this.fov =
      2 * Math.atan(this.height / 2 / this.perspective) * (180 / Math.PI);

    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      this.width / this.height,
      0.1,
      1000
    );

    this.camera.position.z = this.perspective;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setAnimationLoop(this.render.bind(this));

    this.container.appendChild(this.renderer.domElement);

    this.getViewSize();
  }

  initPlane() {
    this.plane = new Plane(this);
  }

  addEvents() {
    window.addEventListener('resize', this.onWindowResize.bind(this));

    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.wrapper.addEventListener('mouseleave', () => this.onMouseLeave());

    this.links.forEach((link, index) => {
      link.addEventListener('mouseenter', (e) => this.onMouseEnter(e, index));
    });
  }

  onMouseEnter(_, index) {
    this.plane.onMouseEnter(index);
  }

  onMouseLeave() {
    this.plane.onMouseLeave();
  }

  onMouseMove(e) {
    this.mouse.x = (e.clientX / this.width) * 2 - 1;
    this.mouse.y = -(e.clientY / this.height) * 2 + 1;

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

    this.plane.onMouseMove({ x, y });
  }

  onWindowResize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.aspectRatio = this.width / this.height;

    this.camera.aspect = this.aspectRatio;
    this.camera.fov =
      2 * Math.atan(this.height / 2 / this.perspective) * (180 / Math.PI);
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.getViewSize();

    this.plane.onWindowResize({ width: this.width, height: this.height });
  }

  getViewSize() {
    let distance = this.camera.position.z;
    let vFov = (this.camera.fov * Math.PI) / 180;
    let height = 2 * Math.tan(vFov / 2) * distance;
    let width = height * this.aspectRatio;

    this.viewSize = { width, height, vFov };
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
