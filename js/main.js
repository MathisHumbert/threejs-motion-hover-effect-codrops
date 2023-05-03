import Effect from './article/Effect';

const container = document.body;
const itemsWrapper = document.querySelector('.grid');

new Effect({ container, itemsWrapper, isTrail: true });
