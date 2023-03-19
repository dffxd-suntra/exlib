import config from "../config.js";

// 获取页面类型
export default function checkPage(url) {
    if (url.constructor == String) {
        url = new URL(url);
    }
    if (!url || url.constructor != URL) {
        throw new Error(`请传url字符串或URL类`);
    }

    if (!config.domains.includes(url.host)) {
        return -1;
    }
    let regList = [
        // 主界面 0-14
        /^\/$/,
        /^\/tag\/[^\/]+$/,
        /^\/uploader\/[^\/]+$/,
        /^\/doujinshi$/,
        /^\/manga$/,
        /^\/artistcg$/,
        /^\/gamecg$/,
        /^\/western$/,
        /^\/non-h$/,
        /^\/imageset$/,
        /^\/cosplay$/,
        /^\/asianporn$/,
        /^\/misc$/,
        /^\/popular$/,
        /^\/favorites.php$/,
        // 预览界面 15
        /^\/g\/[^\/]+\/[^\/]+\/$/,
        // 图片预览界面 16
        /^\/s\/[^\/]+\/[^\/]+$/
    ];
    for (let key in regList) {
        if (regList[key].test(url.pathname)) {
            return parseInt(key);
        }
    }
    return -1;
}