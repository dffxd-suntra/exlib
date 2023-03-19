import config from "../config.js";
import LoadHTML from "./LoadHTML.js";
import checkPage from "../functions/checkPage.js";

// 页面解析类,继承LoadHTML
class Galleries extends LoadHTML {
    constructor(url) {
        super();
        // 初始化链接
        this.url = new URL(url);

        // 页面的种类
        this.pageType = checkPage(this.url);

        // 判断合法性
        if (this.pageType == -1 || 14 < this.pageType) {
            throw new Error(`您的地址不对劲: "${url}"`);
        }

        // 正整数或NaN
        this.next = parseInt(this.url.searchParams.get("next")) || null;

        // 是否初始化
        this.inited = false;
    }
    getFirstPage() {
        if (!this.inited) {
            throw new Error(`请先初始化!`);
        }
        return new Galleries(this.firstPageUrl);
    }
    getLastPage() {
        if (!this.inited) {
            throw new Error(`请先初始化!`);
        }
        return new Galleries(this.lastPageUrl);
    }
    getPrevPage() {
        if (!this.inited) {
            throw new Error(`请先初始化!`);
        }
        if (this.prevPageUrl == null) {
            return false;
        }
        return new Galleries(this.prevPageUrl);
    }
    getNextPage() {
        if (!this.inited) {
            throw new Error(`请先初始化!`);
        }
        if (this.nextPageUrl == null) {
            return false;
        }
        return new Galleries(this.nextPageUrl);
    }
    isFirstPage() {
        if (!this.inited) {
            throw new Error(`请先初始化!`);
        }
        return this.firstPageUrl == this.url.toString();
    }
    isLastPage() {
        if (!this.inited) {
            throw new Error(`请先初始化!`);
        }
        return this.lastPageUrl == this.url.toString();
    }
    async init() {
        // 获取文档
        this.pageDocuemnt = await this.getDocument(this.url.toString());

        // 一些网页的节点
        this.nodes = {};

        // 画廊的详细信息
        this.galleriesInfo = [];

        // 初始化选择器
        // 每一个页面都有的翻页
        this.selector = {
            ufirst: "#ufirst",
            uprev: "#uprev",
            ujumpBox: "#ujumpbox",
            ujump: "#ujump",
            unext: "#unext",
            ulast: "#ulast",
            dfirst: "#dfirst",
            dprev: "#dprev",
            djumpBox: "#djumpbox",
            djump: "#djump",
            dnext: "#dnext",
            dlast: "#dlast"
        };

        // 普通页面
        if (0 <= this.pageType && this.pageType <= 12) {
            this.selector.searchbox = "#searchbox";
            this.selector.rangebar = "#rangebar";
            this.selector.mode = ".searchnav > div > select";
            this.selector.container = "body > div.ido > div";
        }

        // 流行页面
        if (this.pageType == 13) {
            this.selector.mode = ".searchnav > div > select";
            this.selector.container = "body > div.ido > div";
        }

        // 特殊的收藏页面
        if (this.pageType == 14) {
            this.selector.order = ".searchnav > div > select:contains('Published Time')";
            this.selector.mode = ".searchnav > div > select:contains('Minimal')";
            this.selector.container = "#favform";
        }

        // 获取浏览模式
        this.mode = config.modeLabel[$(this.selector.mode, this.pageDocuemnt).val()];
        // 前四种本质上就是html table,解析出来会被自动添加tbody
        if (this.mode == "Minimal" || this.mode == "Minimal+") {
            this.selector.infoContainer = this.selector.container + " > table.itg.gltm";
            this.selector.infos = this.selector.infoContainer + " > tbody > tr";
        }
        if (this.mode == "Compact") {
            this.selector.infoContainer = this.selector.container + " > table.itg.gltc";
            this.selector.infos = this.selector.infoContainer + " > tbody > tr";
        }
        if (this.mode == "Extended") {
            this.selector.infoContainer = this.selector.container + " > table.itg.glte";
            this.selector.infos = this.selector.infoContainer + " > tbody > tr";
        }
        // 后一种就是真的排出来的
        if (this.mode == "Thumbnail") {
            this.selector.infoContainer = this.selector.container + " > div.itg.gld";
            this.selector.infos = this.selector.infoContainer + " > div";
        }

        // 解析页面
        // 解析节点
        // 简单粗暴
        for (let i in this.selector) {
            this.nodes[i] = $(this.selector[i], this.pageDocuemnt);
        }

        // 解析信息
        // 获取为数组形式
        let infos = this.nodes.infos.get();
        // 一个一个获取
        for (let i in infos) {
            this.galleriesInfo[i] = {};

            // 名称
            this.galleriesInfo[i].name = $(infos[i]).find(".glink").text();

            // 链接
            this.galleriesInfo[i].url = $(infos[i]).find(".glink").parent("a[href]").attr("href");

            // 种类
            this.galleriesInfo[i].categories = $(infos[i]).find(".cs").text();

            // 封面链接
            this.galleriesInfo[i].cover = $(infos[i]).find(`img[alt="${this.galleriesInfo[i].name}"]`).attr("src");

            // 页数
            this.galleriesInfo[i].pages = parseInt($($(infos[i]).find(":contains('pages')").get().find(node => /^\d+(?= pages$)/g.test($(node).text()) && !$(node).hasClass("glink") && $(node).find(".glink").length == 0)).text());

            // 是否有种子
            this.galleriesInfo[i].hasTorrents = $(infos[i]).find(".gldown").children("a").length != 0;

            // token和gid
            let temp = this.galleriesInfo[i].url.split("/");
            temp.pop();
            this.galleriesInfo[i].token = temp.pop();
            this.galleriesInfo[i].gid = parseInt(temp.pop());

            // 上传时间的时间戳
            this.galleriesInfo[i].postTime = moment($(infos[i]).find("#posted_" + this.galleriesInfo[i].gid).text()).valueOf();

            // 收藏夹名称,不在则是空字符串
            this.galleriesInfo[i].favorite = $(infos[i]).find("#posted_" + this.galleriesInfo[i].gid).attr("title") || "";

            // 模糊分数 总量5 分度值0.5
            // https://ehgt.org/img/rt.png
            // 标签的星星为正方形,边长16,第一行离图片上边框1px,两行间隔4px,最后一行离图片下边框1px,星星之间无距离,第一个星星离图片左边框无距离,第一行最后一个星星离右边框无距离,第二行比第一行少一个星星
            // 计算星星公式: score = 5-x/16-(y==-21?0.5:0); x. y分别对应css的背景定位中的x和y,别忘了字符串转int
            let [x, y] = $(infos[i]).find("div.ir").get(0).style.backgroundPosition.match(/-?\d+(?=px)/g);

            this.galleriesInfo[i].fuzzyRating = 5 - Math.abs(parseInt(x)) / 16 - (parseInt(y) == -21 ? 0.5 : 0);
        }

        // 第一页 最后一页 下一页 上一页 的链接
        this.firstPageUrl = this.nodes.ufirst.attr("href") || this.url.toString();
        this.lastPageUrl = this.nodes.ulast.attr("href") || this.url.toString();
        this.prevPageUrl = this.nodes.uprev.attr("href") || null;
        this.nextPageUrl = this.nodes.unext.attr("href") || null;

        // 成功初始化
        this.inited = true;

        return this;
    }
}

export default Galleries;