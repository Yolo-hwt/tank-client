export const generateRandomGameName = function () {
    const firstWords = ['热血', '无敌', '霸气', '战斗', '英雄', '传说', '神话', '冒险', '勇者', '魔法'];
    const secondWords = ['王国', '帝国', '联盟', '公会', '军团', '部落', '帮派', '世界', '大陆', '天堂'];
    const thirdWords = ['传奇', '英雄', '战士', '法师', '刺客', '骑士', '神仙', '巨人', '龙族', '精灵'];
    const randomIndex1 = Math.floor(Math.random() * firstWords.length);
    const randomIndex2 = Math.floor(Math.random() * secondWords.length);
    const randomIndex3 = Math.floor(Math.random() * thirdWords.length);
    return firstWords[randomIndex1] + secondWords[randomIndex2] + thirdWords[randomIndex3];
}