<template>
  <div class="head-portrait-container">
    <div class="head-portrait-body" :style="{ width: headWidth, height: headHeight }"></div>
    <div class="head-title">{{ headTitle }}</div>
  </div>
</template>
  
<script>
import { ref, watch } from 'vue';
export default {
  name: "headPortrait",
  props: ["title", "width", "height"],
  setup(props) {
    let headTitle = ref(props.title);
    let headWidth = ref(props.width);
    let headHeight = ref(props.height);
    watch(() => props.title, (newValue) => {
      headTitle.value = newValue;
    })
    return {
      headTitle,
      headWidth,
      headHeight
    }
  }
}
</script>
  
<style>
/* Your CSS styles here */
.head-portrait-container {
  /* display: flex;
    justify-content: center;
    align-items: center; */
  padding: 0 20px;
}

.head-portrait-body {
  border-radius: 50%;
  background-color: pink;
  margin-bottom: 5px;
}

.head-title {
  color: rgb(244, 219, 79);
  text-align: center;
  font-size: 13px;
}
</style>
  