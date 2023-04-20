// import { getCurrentInstance } from 'vue';
// export const getEventBus = () => {
//     console.log(getCurrentInstance());
//     return getCurrentInstance().appContext.config.globalProperties.$bus;
// }

import mitt from 'mitt'

export const eventBus = mitt()