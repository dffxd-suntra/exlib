import config from "../config";

// 获取页面类型
function checkPage(url) {
    if (url.constructor === String) {
        url = new URL(url);
    }
    if (!config.domains.includes(url.host)) {
        throw new Error(``);
    }
    let pathname = url.pathname;
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
        if (regList[key].test(pathname)) {
            return parseInt(key);
        }
    }
    return -1;
}

exports = checkPage;