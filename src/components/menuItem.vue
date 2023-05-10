<template>
    <div 
    class="menu-item-container" 
    :style="{width:gameWidth,height:gameHeight}" 
    @click="clickToRoutePage(type)">
    {{ gameTitle }}
    </div>
    </template>
      
    <script>
      //hook，事件总线引入
    import { eventBus } from "@/hook/eventBus";
    import {ref} from 'vue';
     export default {
        name: "menuItem",
        props:["menuItemInfo"],
            
        setup(props) {
              const gameMenuItemInfo = ref(props.menuItemInfo);
              const { type,index,title:gameTitle, height:gameHeight,width: gameWidth } = gameMenuItemInfo.value;
              function clickToRoutePage(type) {
                //发送消息到app页面通知跳转
                  eventBus.emit("routeToPage", type);
              }
              return {
                    index,
            type,
            gameTitle,
            gameWidth,
            gameHeight,
            clickToRoutePage
          };
        },
      };
      </script>
      
      <style scoped>
      .menu-item-container{
        text-align: center;
        line-height: 60px;
        margin-bottom: 15px;
        color:  rgb(183, 177, 148);
        font-size: 15px;
    background-color: rgba(0,0,0,.5);
    border-radius: 20%;
    border:2px solid rgb(146, 142, 120)
      }
      .menu-item-container:hover{
        color: rgb(231, 207, 109);
        border-color: rgb(234, 219, 137);
        border-width: 2.5px;
        font-weight: 600;
        cursor: pointer;
        
      }
      </style>
      