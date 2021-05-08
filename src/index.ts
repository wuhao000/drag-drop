import {App} from 'vue';
import Drag from './drag.vue';
import Drop from './drop.vue';

export function install(app: App) {
  app.component('drag', Drag);
  app.component('drop', Drop);
}

export {Drag, Drop};

const plugin = {
  install
};

export default plugin;
