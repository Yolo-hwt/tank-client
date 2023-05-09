<template>
    <div class="menu-container">
    <div class="menu-items">
    <menu-item :menuItemInfo="MenuObj[0]"/>
    <menu-item :menuItemInfo="MenuObj[1]"/>
    <menu-item :menuItemInfo="MenuObj[2]"/>
    </div>
    </div>
</template>

  <script>
  import menuItem from '@/components/menuItem.vue';
  import {GAME_MODE}from "@/hook/globalParams"
  export default {
  components: { menuItem },
    name: "menuView",
    setup() {
        let MenuObj = [
            { index: 0, type:GAME_MODE.LOCAL_GAME,title: "单机游戏", width: "160px", height: "60px" },
            { index: 1, type:GAME_MODE.ADVENTURE_GAME,title: "双人冒险", width: "160px", height: "60px" },
            { index: 2, type:GAME_MODE.MULTIPLAER_GAME,title:"多人对战",width:"160px",height:"60px"}
        ];
      return {
        MenuObj
      };
    },
  };
  </script>
  
  <style scoped>
  .menu-container{
    position: relative;
    width: 512px;
    height: 448px;
    background: url("../assets/images/tank-menu.jpg") no-repeat;
    padding-top: 80px;
    /* background: url("../assets/images/tank-menu2.jpg") no-repeat; */
  }
  .menu-items{
    position: absolute;
    right: 0;
    transform: translateX(-15px);
  }
  </style>
  