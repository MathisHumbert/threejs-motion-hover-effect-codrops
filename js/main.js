import imagesLoaded from 'imagesloaded';

import Effect from './article/Effect';
import Scene from './my-code/Scene';

import rgbShiftFragment from '../gls/rgb-shift-fragment.glsl';
import trailFragment from '../gls/trail-fragment.glsl';
import stretchFragment from '../gls/stretch-fragment.glsl';

const shaders = [rgbShiftFragment, trailFragment, stretchFragment];

const container = document.body;
const itemsWrapper = document.querySelector('.grid');
const shaderNumber = Number(container.dataset.shader);

const preloadImages = () => {
  return new Promise((resolve) => {
    imagesLoaded(document.querySelectorAll('img'), resolve);
  });
};

preloadImages().then(() => {
  // new Effect({
  //   container,
  //   itemsWrapper,
  //   isTrail: shaderNumber === 1,
  //   fragment: shaders[shaderNumber],
  // });

  new Scene({
    container,
    itemsWrapper,
    isTrail: shaderNumber === 1,
    fragment: shaders[shaderNumber],
  });
});
