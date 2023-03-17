// 获取页面类型
function getPageType(url) {
    if (url.constructor === String) {
        url = new URL(url);
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

exports = getPageType;