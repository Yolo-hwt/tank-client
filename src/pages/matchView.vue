<template>
<div class="match-main-container">
  <div class="match-psd-container">
    <passWordItem v-for="(item,index) in psdInstances" 
    :key="index"
    :index="index"
    :width="psdWidth" 
  :height="psdHeight" 
  v-model:value="psdInstances[index].value"
    />
</div>
<div class="match-head-container">
  <headPortrait v-for=" player in isReadyPlayers" 
  :key="player.index"
  :width="headWidth" 
  :height="headHeight" 
  :title="player.name"/>

</div>
</div>
</template>

  <script>
  import headPortrait from "@/components/headPortrait.vue";
  import passWordItem from "@/components/passWordItem.vue";
  import { computed, reactive,watch} from "vue";
  export default {
    components: { headPortrait, passWordItem },
    name: "matchView",
    setup() {
        const headWidth = "80px";
        const headHeight = "80px";
        const psdWidth = "100px";
        const psdHeight = "100px";
        let players = reactive([
            {
            index: 0,
              name:"player1",
              isReady: false
          },
          {
            index: 1,
              name:"player2",
            isReady:false
          },
            {
              index:2,
              name:"player3",
            isReady:false
          },
            {
              index: 3,
              name:"player4",
            isReady:false
          }
        ]);
        let psdInstances = reactive([
          { id: "psd1", value: "-1" },
          { id: "psd2", value: "-1" },
          { id: "psd3", value: "-1" },
          { id: "psd4", value: "-1" }
        ]);

        let isReadyPlayers = computed(() => {
          return players.filter((item) => {
            if (item.isReady) {
              return true;
            } else {
              // return false;
              return true;
            }
            })
      });
        let matchCodes = computed(() => {
            let codes = "";
            for (let i = 0; i < psdInstances.length; i++) {
              codes += psdInstances[i].value;
            }
            return codes;
          });
        let lastMatchCode = computed(() => psdInstances[psdInstances.length - 1].value);
        watch(lastMatchCode, (newValue) => {
          console.log("psd输入完毕", newValue);
          //通知服务器匹配code输入完毕
      });
      return {
        isReadyPlayers,
        psdInstances,
        headWidth,
        headHeight,
        psdWidth,
        psdHeight,
        matchCodes
      };
    },
  };
  </script>
  
  <style>
  .match-main-container{
    display: flex;
    flex-direction: column;
    width: 512px;
    height: 448px;
    padding: 0 30px;
    background: url("../assets/images/tank-menu.jpg") no-repeat;
  }
  .match-psd-container{
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items:flex-end;
    padding-bottom: 20px;
    /* background-color: blue; */
  }
.match-head-container{
  flex: 1;
  display: flex;
    justify-content: space-around;
    align-items: flex-start;
    padding-top: 20px;
  /* background-color: red; */
}
  </style>
  