<template>
    <div class="psd-container" >
        <input 
        type="text" 
        class="psd-body" 
        v-model="inputValue"
       ref="psdInput"
        :style="{width:psdWidth,height:psdHeight}">
    </div>
  </template>
  
  <script>
import {ref,watch,onMounted} from 'vue';
export default {
      name: "passWordItem",
      props: ["width","height","value","index"],
      setup(props,{emit}) {
            let psdHeight = ref(props.height);
            let psdWidth = ref(props.width);
            let inputValue = ref("");
            let inputIndex = ref(props.index);
            let psdInput = ref(null);
            watch(inputValue, (newValue, oldValue) => {
                  emit('update:value', newValue)
            });
            onMounted(() => {
                  if (inputIndex.value == 0) {
                    psdInput.value.focus()
                }
            });
        return {
            psdHeight,
            psdWidth,
            inputValue,
            inputIndex,
            psdInput
        }
    }
}
  </script>
  
  <style>
  /* Your CSS styles here */
  .psd-body{
    border-radius: 10%;
    border: 2px solid black;
    font-size: 35px;
    text-align: center;
    color: pink;
    background-color: rgba(255,255,255,.5);
  }
  .psd-body:focus{
    border: 5px solid rgb(244, 219, 79);
  }
  </style>
  