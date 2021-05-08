<template>
  <component :is="tag"
             :draggable="draggable"
             @drag="emitEvent(events.drag, $event)"
             @dragstart="emitEvent(events.dragstart, $event)"
             @dragenter="emitEvent(events.dragenter, $event)"
             @dragleave="emitEvent(events.dragleave, $event)"
             @dragend="emitEvent(events.dragend, $event)">
    <slot :transfer-data="scopedData"></slot>
    <div v-if="hideImageHtml"
         :style="hideImageStyle">
      <slot name="image"
            :transfer-data="scopedData"></slot>
    </div>
    <slot v-else
          name="image"
          :transfer-data="scopedData"></slot>
  </component>
</template>

<script lang="ts">
  import {computed, defineComponent, PropType, ref} from 'vue';
  import {dropEffects, effectsAllowed, events} from './constants';
  import transferDataStore from './transferDataStore';

  export default defineComponent({
    name: 'Drag',
    props: {
      draggable: {type: Boolean as PropType<boolean>, default: true},
      transferData: {},
      dropEffect: {validator: (value: any) => value in dropEffects},
      effectAllowed: {validator: (value: any) => value in effectsAllowed},
      image: String,
      imageXOffset: {type: Number as PropType<number>, default: 0},
      imageYOffset: {type: Number as PropType<number>, default: 0},
      hideImageHtml: {type: Boolean as PropType<boolean>, default: true},
      tag: {type: String, default: 'div'}
    },
    setup(props, {slots, emit}) {
      const dragging = ref(false);
      const scopedData = computed(() => {
        return dragging.value && props.transferData;
      });
      const hideImageStyle = computed(() => {
        return {position: 'fixed', top: '-1000px'};
      });
      const emitEvent = (name, nativeEvent) => {
        const transfer = nativeEvent.dataTransfer;

        // Set drop effect on dragenter and dragover
        if ([events.dragenter, events.dragover].includes(name)) {
          if (props.dropEffect) {
            transfer.dropEffect = props.dropEffect;
          }
        }

        // A number of things need to happen on drag start
        if (name === events.dragstart) {
          // Set the allowed effects
          if (props.effectAllowed) {
            transfer.effectAllowed = props.effectAllowed;
          }

          // Set the drag image
          if (props.image || slots.image) {
            let image;
            if (props.image) {
              image = new Image();
              image.src = props.image;
            } else if (slots.image) {
              image = slots.image()[0].el;
            }
            if (transfer.setDragImage) {
              transfer.setDragImage(image, props.imageXOffset, props.imageYOffset);
            }
          }

          // Set the transfer data
          if (props.transferData !== undefined) {
            transferDataStore.data = props.transferData;
            // Set a dummy string for the real transfer data. Not actually used
            // for anything, but necesssary for browser compatibility.
            //
            // TODO: Maybe this should be the actual data serialized. But since
            // it's not actually used for anything it seems like a waste of CPU.
            nativeEvent.dataTransfer.setData('text', '');
          }

          // Indicate that we're dragging.
          dragging.value = true;
        }

        // At last, emit the event.
        emit(name, props.transferData, nativeEvent);

        // Clean up stored data on drag end after emitting.
        if (name === events.dragend) {
          transferDataStore.data = undefined;
          dragging.value = false;
        }
      };
      return {
        dragging, scopedData, hideImageStyle, events,
        emitEvent
      };
    }
  });
</script>
