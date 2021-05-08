<template>
  <component :is="tag"
             @dragenter="emitEvent(events.dragenter, $event)"
             @dragleave="emitEvent(events.dragleave, $event)"
             @dragover.prevent="emitEvent(events.dragover, $event)"
             @drop.prevent="emitEvent(events.drop, $event)">
    <slot :transfer-data="scopedData"></slot>
  </component>
</template>

<script lang="tsx">
  import {computed, defineComponent, getCurrentInstance, ref} from 'vue';
  import {events} from './constants';
  import transferDataStore from './transferDataStore';

  const insideElements = new Set();

  export default defineComponent({
    name: 'drop',
    props: {
      tag: {type: String, default: 'div'}
    },
    setup(props, {emit}) {
      const transferData = ref(undefined);
      const isDraggingOver = ref(false);
      const scopedData = computed(() => {
        return isDraggingOver.value && transferData.value;
      });
      const instance = getCurrentInstance();
      const emitEvent = (name, nativeEvent) => {
        transferData.value = transferDataStore.data;
        emit(name, transferData.value, nativeEvent);

        /**
         * After emitting the event, we need to determine if we're still
         * dragging inside this Drop. We keep a Set of all elements that we've
         * dragged into, then clear the data if that set is empty.
         */

        // Add to the set on dragenter.
        if (name === events.dragenter) {
          if (insideElements.size || nativeEvent.target === instance.vnode.el) {
            insideElements.add(nativeEvent.target);
          }
        }

        // Remove from the set on dragleave.
        if (name === events.dragleave) {
          insideElements.delete(nativeEvent.target);
        }

        // A drop resets everything.
        if (name === events.drop) {
          insideElements.clear();
        }

        // Finally, since Vue can't react to Set changes, set a flag indicating drag status.
        isDraggingOver.value = Boolean(insideElements.size);
      };
      return {transferData, isDraggingOver, events, scopedData, emitEvent};
    },
    methods: {}
  });
</script>
