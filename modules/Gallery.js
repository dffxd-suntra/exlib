import config from "../config.js";
import LoadHTML from "./LoadHTML.js";
import PreviewPage from "./PreviewPage.js";
import checkPage from "../functions/checkPage.js";
import toByte from "../functions/toByte.js";

class Gallery extends LoadHTML {
    constructor(url) {
        super();
        // 初始化链接
        this.url = new URL(url);

        // 页面的种类
        this.pageType = checkPage(this.url);

        // 判断合法性
        if (this.pageType != 15) {
            throw new Error(`您的地址不对劲: "${url}"`);
        }

        // token和gid
        let temp = url.split("/");
        temp.pop();
        this.token = temp.pop();
        this.gid = parseInt(temp.pop());
    }
    async init() {
        // 获取文档
        this.pageDocuemnt = await this.getDocument(this.url.origin + this.url.pathname + "?hc=1");

        // 一些网页的节点
        this.nodes = {};

        // 图片页面的链接
        this.pageUrl = [];

        // 图片页面的信息
        this.pageInfo = [];

        // 获取解析器字符串
        this.selector = {
            // 没有head是因为head的东西太多了,会影响判断,而且大部分都有对应的id
            body: "#gdt",
            foot: "#cdiv",

            mainName: "#gn",
            secondaryName: "#gj",
            cover: "#gd1 > div",
            categories: "#gdc > div",
            uploader: "#gdn > a",
            infos: "#gdd > table",
            rating: "#gdr > table",
            addToFavorites: "#gdf",
            tags: "#taglist > table",
            headSidebar: "#gd5", // 太多了,自己找去吧

            rows: "#gdo2", // 我从来没见过能调几行的时候,可能我等级太低了把
            mode: "#gdo4",

            comments: "#cdiv"
        };

        // 获取页面浏览模式
        this.mode = $(this.selector.mode, this.pageDocuemnt).find(".tha").text();
        // 根据浏览模式获取合适的解析器
        if (this.mode == "Normal") {
            this.selector.preview = ".gdtl";
        } else {
            this.selector.preview = ".gdtm";
        }

        // 解析页面
        // 解析节点
        // 简单粗暴*2
        for (let i in this.selector) {
            this.nodes[i] = $(this.selector[i], this.pageDocuemnt);
        }

        // 解析信息
        // 先解析画廊图片旁边显示的详细信息
        let temp1 = {};
        $("tr", this.nodes.infos).each(function (index, node) {
            temp1[$(node).find(".gdt1").text().split(":")[0]] = $(node).find(".gdt2");
        });

        // 主名称
        this.mainName = this.nodes.mainName.text();

        // 副名称
        this.secondaryName = this.nodes.secondaryName.text();

        // 封面地址
        this.cover = this.nodes.cover.get(0).style.background.match(/(?<=url\("*).*(?="*\))/g)[0].replaceAll("\"", "");

        // 画廊类别(例如 Image Set
        this.categories = this.nodes.categories.text();

        // 作者名
        this.uploader = this.nodes.uploader.text() || null;

        // 作者链接
        this.uploaderUrl = this.nodes.uploader.attr("href") || null;

        // 发送时间(时间戳
        this.postTime = moment(temp1.Posted.text()).valueOf();

        // 画廊继承的画廊(gid)(正整数或NaN
        this.parent = parseInt(temp1.Parent.text()) || null;

        // 画廊继承的画廊的链接
        this.parentUrl = temp1.Parent.children("a").attr("href") || null;

        // 是否可见(bool
        this.visible = temp1.Visible.text() == "Yes";

        // 语言
        this.language = temp1.Language.text().split(" ")[0];

        // 是否是翻译过来的
        this.isTranslation = temp1.Language.children("span").length != 0;

        // 文件大小
        this.fileSize = toByte(temp1["File Size"].text().split(" "));

        // 图片页数
        this.pages = parseInt(temp1.Length.text());

        // 放进收藏夹的人数
        this.favorited = parseInt(temp1.Favorited.text());

        // 放在哪个收藏夹里 空字符串或具体名字(总共就十个嘛)
        this.favorites = this.nodes.addToFavorites.text().trim().replace("Add to Favorites", "");

        // 每一页显示多少图片
        this.limit = this.nodes.body.children(this.selector.preview).length;

        // 种子的个数
        this.torrentNum = parseInt(this.nodes.headSidebar.find("a:contains('Torrent Download ')").text().match(/(?<=^Torrent Download \().*(?=\)$)/g)[0]);

        // 详细分数 总值5 分度值0.01
        this.rating = parseFloat(this.nodes.rating.find("#rating_label").text().split(" ")[1]);

        // 投票的人数
        this.ragingCount = parseInt(this.nodes.rating.find("#rating_count").text());

        let that = this;

        // 解析标签
        this.tags = {};
        $("tr", this.nodes.tags).each(function (index, node) {
            let title = $(node).children("td.tc").text().split(":")[0];
            that.tags[title] = [];
            $(node).find("td > div").each(function (index, node) {
                let credit;
                // 完整的边框
                if ($(node).hasClass("gt")) {
                    credit = 0;
                }
                // 长条边框
                if ($(node).hasClass("gtl")) {
                    credit = 1;
                }
                // 点边框
                if ($(node).hasClass("gtw")) {
                    credit = 2;
                }
                that.tags[title].push({
                    credit: credit,
                    name: $(node).text(),
                    url: $(node).find("a").attr("href")
                });
            });
        });

        // 解析评论
        this.comments = [];
        $(this.nodes.comments).children(".c1").each(function (index, node) {
            let id = parseInt($(node).prev().attr("name").substring(1));
            let sp = $(node).find(".c2 > .c3").text().split(" ");
            let spt = sp[5].split(":");
            let timestamp = moment()
                .year(parseInt(sp[4]))
                .month(sp[3])
                .date(parseInt(sp[2]))
                .hour(parseInt(spt[0]))
                .minute(parseInt(spt[1]));
            let score = null;
            let type;
            if (id == 0) {
                type = 0;
            } else {
                type = 1;
                score = parseInt($(node).find("#comment_score_" + id).text());
            }
            that.comments.push({
                id: id,
                uploder: {
                    name: $(node).find(".c2 > .c3 > a").text() || null,
                    url: $(node).find(".c2 > .c3 > a").attr("href") || null
                },
                content: $(node).find(".c6").text(),
                score: score,
                type: type,
                postTime: timestamp.valueOf()
            });
        });

        return this;
    }
    // 获取图片页面信息
    async get(page, cache = true) {
        // 检测范围
        if (page < 1 || this.pages < page) {
            throw new Error(`输入的正确的范围1-${this.pages}`);
        }

        let pageInfo = this.pageInfo;
        let pageUrl = this.pageUrl;

        // 获取某一张图片所在页面对应的url
        if (pageUrl[page - 1] == undefined) {
            let pager = Math.floor((page - 1) / this.limit);
            let pageDocuemnt = await this.getDocument(this.url.origin + this.url.pathname + "?p=" + pager);
            let start = this.limit * pager;
            $(this.selector.body + " > " + this.selector.preview, pageDocuemnt).each(function (index, node) {
                pageUrl[start + index] = $(node).find("a").attr("href");
            });
        }

        // 获取图片信息(如果没有存起来的话
        if (pageInfo[page - 1] == undefined || !cache) {
            pageInfo[page - 1] = new PreviewPage(pageUrl[page - 1]);
        }
        return pageInfo[page - 1];
    }
}

export default Gallery;