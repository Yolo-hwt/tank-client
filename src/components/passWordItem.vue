<template>
  <div class="psd-container">
    <input type="text" class="psd-body" v-model="inputValue" ref="psdInput"
      :style="{ width: psdWidth, height: psdHeight }">
  </div>
</template>
  
<script>
import { ref, watch, nextTick } from 'vue';
export default {
  name: "passWordItem",
  props: ["width", "height", "value", "focus"],
  setup(props, { emit }) {
    let psdHeight = ref(props.height);
    let psdWidth = ref(props.width);
    let psdFocus = ref(props.focus);
    let inputValue = ref("");
    let psdInput = ref(null);

    //watch
    watch(() => props.value, (newValue) => {
      if (newValue == "-1") {
        inputValue.value = "";
      }
    })
    watch(inputValue, (newValue, oldValue) => {
      if (newValue != "") {
        emit('update:value', newValue)
      }
    });
    watch(() => props.focus, async (newValue, oldValue) => {
      if (newValue == true) {
        if (psdInput.value == null) {
          await nextTick()
        }
        // console.log("isFocus change fcous", newValue);
        psdInput.value.focus();
      } else if (newValue == false) {
        if (psdInput.value == null) {
          await nextTick()
        }
        psdInput.value.blur();
        // console.log("isFocus change blur", newValue);
      }
    }, { immediate: true });

    return {
      psdHeight,
      psdWidth,
      psdFocus,
      inputValue,
      psdInput
    }
  }
}
</script>
  
<style>
/* Your CSS styles here */
.psd-body {
  border-radius: 10%;
  border: 2px solid black;
  font-size: 35px;
  text-align: center;
  color: pink;
  background-color: rgba(255, 255, 255, .5);
}

.psd-body:focus {
  border: 5px solid rgb(244, 219, 79);
}
</style>
  