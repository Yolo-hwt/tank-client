<template>
    <div class="head-portrait-container" >
        <div class="head-portrait-body" :style="{width:headWidth,height:headHeight}"></div>
        <div class="head-title">{{ headTitle }}</div>
    </div>
  </template>
  
  <script>
import {ref} from 'vue';
export default {
      name: "headPortrait",
      props: ["title","width","height"],
      setup(props) {
            let headTitle = ref(props.title);
            let headWidth = ref(props.width);
            let headHeight = ref(props.height);
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
  .head-portrait-container{
    /* display: flex;
    justify-content: center;
    align-items: center; */
  }
  .head-portrait-body{
    border-radius: 50%;
    background-color: pink;
  }
  .head-title{
    color: rgb(244, 219, 79);
    text-align: center;
  }
  </style>
  