import * as THREE from 'three';

export default class EffectShell {
  constructor(container = document.body, itemsWrapper = null) {
    this.container = container;
    this.itemsWrapper = itemsWrapper;

    if (!this.container || !this.itemsWrapper) return;

    this.setup();
    this.initEffectShell().then(() => {
      this.isLoaded = true;

      if (this.isMouseOver) this.onMouseOver(this.tempItemIndex);

      this.tempItemIndex = null;
    });
    this.createEventsListeners();
  }

  setup() {
    window.addEventListener('resize', this.onWindowResize.bind(this), false);

    // renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.viewport.width, this.viewport.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    // scene
    this.scene = new THREE.Scene();

    // camera
    this.camera = new THREE.PerspectiveCamera(
      40,
      this.viewport.aspectRatio,
      0.1,
      100
    );
    this.camera.position.set(0, 0, 3);

    //mouse
    this.mouse = new THREE.Vector2();

    // time
    // this.timeSpeed = 2;
    // this.time = 0;
    // this.clock = new THREE.Clock();

    // animation loop
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  render() {
    // this.time += this.clock.getDelta() * this.timeSpeed;
    this.renderer.render(this.scene, this.camera);
  }

  initEffectShell() {
    let promises = [];

    this.items = this.itemsElements;

    const TextureLoader = new THREE.TextureLoader();

    this.items.forEach((item, index) => {
      promises.push(
        this.loadTexture(TextureLoader, item.img ? item.img.src : null, index)
      );
    });

    return new Promise((resolve, reject) => {
      Promise.all(promises).then((promises) => {
        promises.forEach((promise, index) => {
          this.items[index].texture = promise.texture;
        });
        resolve();
      });
    });
  }

  createEventsListeners() {
    this.items.forEach((item, index) => {
      item.element.addEventListener(
        'mouseover',
        this._onMouseOver.bind(this, index),
        false
      );
    });

    this.container.addEventListener(
      'mousemove',
      this._onMouseMove.bind(this),
      false
    );

    this.itemsWrapper.addEventListener(
      'mouseleave',
      this._onMouseLeave.bind(this),
      false
    );
  }

  _onMouseLeave(event) {
    this.isMouseOver = false;
    this.onMouseLeave(event);
  }

  _onMouseMove(event) {
    this.mouse.x = (event.clientX / this.viewport.width) * 2 - 1;
    this.mouse.y = -(event.clientY / this.viewport.height) * 2 + 1;

    this.onMouseMove(event);
  }

  _onMouseOver(index, event) {
    this.tempItemIndex = index;
    this.onMouseOver(index, event);
  }

  onWindowResize() {
    this.camera.aspect = this.viewport.aspectRatio;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.viewport.width, this.viewport.height);
  }

  get viewport() {
    let width = this.container.clientWidth;
    let height = this.container.clientHeight;
    let aspectRatio = width / height;

    return {
      width,
      height,
      aspectRatio,
    };
  }

  get viewSize() {
    let distance = this.camera.position.z;
    let vFov = (this.camera.fov * Math.PI) / 180;
    let height = 2 * Math.tan(vFov / 2) * distance;
    let width = height * this.viewport.aspectRatio;

    return { width, height, vFov };
  }

  get itemsElements() {
    const items = [...this.itemsWrapper.querySelectorAll('.grid__items__link')];

    return items.map((item, index) => ({
      element: item,
      img: item.querySelector('img') || null,
      index: index,
    }));
  }

  loadTexture(loader, url, index) {
    return new Promise((resolve, reject) => {
      if (!url) {
        resolve({ texture: null, index });
        return;
      }

      loader.load(
        url,
        (texture) => {
          resolve({ texture, index });
        },
        () => {},
        (error) => {
          console.error('An error happened.', error);
          reject(error);
        }
      );
    });
  }
}
