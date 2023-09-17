import * as cheerio from "cheerio";
import _ from "lodash";
import moment from "moment";

export function getPageTypeByUrl(url: string): string {
    let urlObj = new URL(url);
    let regList: { [key: string]: RegExp } = {
        // 主界面 0-14
        "galleries defalut": /^\/$/,
        "galleries tag": /^\/tag\/[^\/]+\/?$/,
        "galleries uploader": /^\/uploader\/[^\/]+\/?$/,
        "galleries doujinshi": /^\/doujinshi\/?$/,
        "galleries manga": /^\/manga\/?$/,
        "galleries artistcg": /^\/artistcg\/?$/,
        "galleries gamecg": /^\/gamecg\/?$/,
        "galleries western": /^\/western\/?$/,
        "galleries non-h": /^\/non-h\/?$/,
        "galleries imageset": /^\/imageset\/?$/,
        "galleries cosplay": /^\/cosplay\/?$/,
        "galleries asianporn": /^\/asianporn\/?$/,
        "galleries misc": /^\/misc\/?$/,
        // 特殊主页
        "popular": /^\/popular$/,
        "favorites": /^\/favorites.php\/?$/,
        // 预览界面 15
        "gallery info": /^\/g\/[^\/]+\/[^\/]+\/?$/,
        // 图片预览界面 16
        "image preview": /^\/s\/[^\/]+\/[^\/]+$/
    };
    return Object.keys(regList).find(key => regList[key].test(urlObj.pathname)) || "none";
}

export class EXJquery {
    url: string;
    Jquery: any = null;
    constructor(src: string) {
        this.url = src;
    }
    async loadDocument({ cookie = "", cache = true, url = this.url } = {}) {
        if (cache && this.Jquery != null) {
            return this.Jquery;
        }

        let html = await fetch(url, {
            headers: {
                Cookie: cookie
            }
        })
            .then(res => res.text())
            .catch(err => {
                throw new Error("网页获取错误") && console.error(err);
            });

        if (html == "") {
            throw new Error("网页为空") && console.warn("我推测和ip有关！");
        }

        let matchData;
        if (matchData = html.match(/^Your IP address has been temporarily banned for excessive pageloads which indicates that you are using automated mirroring\/harvesting software. The ban expires in (\d*) hours and (\d*) minutes$/)) {
            throw new Error(`你的ip被ban了 ${matchData[1]}时${matchData[2]}分`) && console.error(html);
        }

        if (cache) {
            return this.Jquery = cheerio.load(html);
        } else {
            return cheerio.load(html);
        }
    }
};

export class Galleries extends EXJquery {
    selector: { [key: string]: any };
    type: string;
    // next: number;
    constructor(url: string) {
        super(url);

        // let urlObj = new URL(url);
        // this.next = parseInt(urlObj.searchParams.get("next") || "NaN");

        this.type = getPageTypeByUrl(url);
        if (this.type == "none" || (!this.type.startsWith("galleries") && !["popular", "favorites"].includes(this.type))) {
            throw new Error("fuck you! you url wrong!");
        }

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
            dlast: "#dlast",
            minimal: {},
            compact: {},
            extended: {},
            thumbnail: {}
        };
        if (this.type.startsWith("galleries")) {
            this.selector.mode = ".searchnav > div > select";
            this.selector.container = "body > div.ido > div";

            this.selector.searchbox = "#searchbox";
            this.selector.rangebar = "#rangebar";
        } else if (this.type == "popular") {
            this.selector.mode = ".searchnav > div > select";
            this.selector.container = "body > div.ido > div";
        } else if (this.type == "favorites") {
            this.selector.mode = ".searchnav > div > select:contains('Minimal')";
            this.selector.container = "#favform";

            this.selector.order = ".searchnav > div > select:contains('Published Time')";
            this.selector.favorites = "div.ido > div.nosel";
            this.selector.searchbox = "body > div.ido > div > form:contains('Search')";
        } else {
            throw new Error("fuck you! you url wrong!");
        }
        this.selector.minimal.infoContainer = this.selector.container + " > table.itg.gltm";
        this.selector.minimal.infos = this.selector.minimal.infoContainer + " > tbody > tr";
        this.selector.compact.infoContainer = this.selector.container + " > table.itg.gltc";
        this.selector.compact.infos = this.selector.compact.infoContainer + " > tbody > tr";
        this.selector.extended.infoContainer = this.selector.container + " > table.itg.glte";
        this.selector.extended.infos = this.selector.extended.infoContainer + " > tbody > tr";
        this.selector.thumbnail.infoContainer = this.selector.container + " > div.itg.gld";
        this.selector.thumbnail.infos = this.selector.thumbnail.infoContainer + " > div";
    }
    async getGalleries(cache: boolean = true): Promise<{ [key: string]: any; }[]> {
        const $ = await this.loadDocument({ cache });

        let galleries: { [key: number]: any }[] = [];
        // let mode: string = ({ "m": "Minimal", "p": "Minimal+", "l": "Compact", "e": "Extended", "t": "Thumbnail" } as { [key: string]: string })[$(this.selector.mode).val()];
        let mode: string = ({ "m": "minimal", "p": "minimal", "l": "compact", "e": "extended", "t": "thumbnail" } as { [key: string]: string })[$(this.selector.mode).val()];
        let galleriesElement: [] = $(this.selector[mode].infos).get();

        galleries = galleriesElement.map((gallery, _index) => {
            let info: { [key: string]: any } = {};

            // 名称
            info.name = $(gallery).find(".glink").text();

            // 链接
            info.url = new URL($(gallery).find(".glink").parent("a[href]").attr("href"), this.url).href;

            // 种类
            info.categories = $(gallery).find(".cs").text().trim();

            // 封面链接
            // info.cover = $($(gallery).find("img").get().find((node: any) => /^\/t\/.*$/g.test(new URL($(node).attr("src")).pathname))).attr("src");
            info.cover = new URL($(gallery).find(`img[alt="${info.name.replaceAll("\"", "\\\"")}"]`).attr("src"), this.url).href;

            // 页数
            info.pages = parseInt($($(gallery).find(":contains('pages')").get().find((node: any) => /^\d+(?= pages$)/g.test($(node).text()) && !$(node).hasClass("glink") && $(node).find(".glink").length == 0)).text());

            // 是否有种子 tor版网站一律没有
            info.hasTorrents = $(gallery).find(".gldown").children("a").length != 0;

            // token和gid（gallery id
            let temp = info.url.split("/");
            temp.pop();
            info.token = temp.pop();
            info.gid = parseInt(temp.pop());

            // 上传时间的时间戳
            info.postTime = moment($(gallery).find("#posted_" + info.gid).text()).valueOf();

            // 收藏夹名称,不在则是false
            info.favorite = $(gallery).find("#posted_" + info.gid).attr("title") || null;

            // 模糊分数 总量5 分度值0.5
            // https://ehgt.org/img/rt.png
            // 标签的星星为正方形,边长16,第一行离图片上边框1px,两行间隔4px,最后一行离图片下边框1px,星星之间无距离,第一个星星离图片左边框无距离,第一行最后一个星星离右边框无距离,第二行比第一行少一个星星
            // 计算星星公式: score = 5-x/16-(y==-21?0.5:0); x. y分别对应css的背景定位中的x和y,别忘了字符串转int
            let [x, y] = $(gallery).find("div.ir").css("background-position").match(/-?\d+(?=px)/g);

            info.fuzzyRating = 5 - Math.abs(parseInt(x)) / 16 - (parseInt(y) == -21 ? 0.5 : 0);

            return info;
        });

        return galleries;
    }
    async getFirstPageUrl(cache: boolean = true): Promise<string> {
        const $ = await this.loadDocument({ cache });

        return $(this.selector.ufirst).attr("href") || this.url;
    }
    async getLastPageUrl(cache: boolean = true): Promise<string> {
        const $ = await this.loadDocument({ cache });

        return $(this.selector.ulast).attr("href") || this.url;
    }
    async getPrevPageUrl(cache: boolean = true): Promise<string> {
        const $ = await this.loadDocument({ cache });

        return $(this.selector.uprev).attr("href") || this.url;
    }
    async getNextPageUrl(cache: boolean = true): Promise<string> {
        const $ = await this.loadDocument({ cache });

        return $(this.selector.unext).attr("href") || this.url;
    }
};

export class Gallery extends EXJquery {
    selector: { [key: string]: any };
    type: string;
    private pagesUrl: any[] = [];
    constructor(url: string) {
        url = new URL("?hc=1", url).href;
        super(url);

        this.type = getPageTypeByUrl(url);

        if (this.type != "gallery info") {
            throw new Error("fuck you! you url wrong!");
        }

        this.selector = {
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
            headSidebar: "#gd5", // 侧栏不细分，因为tor模式的网站下没有侧栏

            rows: "#gdo2",
            mode: "#gdo4",

            comments: "#cdiv",

            normal: { preview: ".gdtl" },
            large: { preview: ".gdtm" }
        };
    }
    async getInfos(): Promise<{ [key: string]: any }> {
        let $ = await this.loadDocument();

        let infos: { [key: string]: any } = {};
        let infoElements: { [key: string]: any } = {};
        $(this.selector.infos).find("tr").each((_index: any, node: Element) => {
            infoElements[$(node).find(".gdt1").text().split(":")[0].trim()] = $(node).find(".gdt2");
        });

        // mode
        infos.mode = $(this.selector.mode).find(".tha").text().trim().toLowerCase();

        // 主名称
        infos.mainName = $(this.selector.mainName).text();
        // 副名称
        infos.secondaryName = $(this.selector.secondaryName).text();
        // 封面地址 因为不同解析器的原因，有的解析出来是url(xxx) 有的是url("xxx") 所以做出适配（真是奇怪
        infos.cover = new URL($(this.selector.cover).css("background").match(/(?<=url\("*).*(?="*\))/g)[0].replaceAll("\"", ""), this.url).href;
        // 画廊类别(例如 Image Set
        infos.categories = $(this.selector.categories).text().trim();
        // 作者名
        infos.uploader = $(this.selector.uploader).text() || null;
        // 作者链接
        infos.uploaderUrl = $(this.selector.uploader).attr("href") || null;
        // 发送时间(时间戳
        infos.postTime = moment(infoElements.Posted.text()).valueOf();
        // 画廊继承的画廊(gid)(正整数或NaN
        infos.parent = parseInt(infoElements.Parent.text()) || null;
        // 画廊继承的画廊的链接
        infos.parentUrl = infoElements.Parent.children("a").attr("href") || null;
        // 是否可见(bool
        infos.visible = infoElements.Visible.text() == "Yes";
        // 语言
        infos.language = infoElements.Language.text().split(" ")[0].trim();
        // 是否是翻译过来的
        infos.isTranslation = infoElements.Language.children("span").length != 0;
        // 文件大小
        infos.fileSize = infoElements["File Size"].text();
        // 图片页数
        infos.pages = parseInt(infoElements.Length.text());
        // 放进收藏夹的人数
        infos.favorited = parseInt(infoElements.Favorited.text());
        // 放在哪个收藏夹里 null或具体名字(总共就十个嘛)
        infos.favorites = $(this.selector.addToFavorites).find("div[title]").attr("title") || null;
        // 每一页显示多少图片
        infos.limit = $(this.selector.body).children(this.selector[infos.mode].preview).length;
        // 种子的个数, null为tor,没有显示
        if ($(this.selector.headSidebar).length != 0) {
            infos.torrentNum = parseInt($(this.selector.headSidebar).find("a:contains('Torrent Download ')").text().match(/(?<=^Torrent Download \().*(?=\)$)/g)[0]);
        } else {
            infos.torrentNum = null;
        }
        // 详细分数 总值5 分度值0.01
        infos.rating = parseFloat($(this.selector.rating).find("#rating_label").text().split(" ")[1]);
        // 投票的人数
        infos.ragingCount = parseInt($(this.selector.rating).find("#rating_count").text());

        // tags
        infos.tags = {};
        $(this.selector.tags).find("tr").each(function (_index: number, node: any) {
            let title = $(node).children("td.tc").text().split(":")[0];
            infos.tags[title] = [];
            $(node).find("td > div").each(function (_index: number, node: any) {
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
                infos.tags[title].push({
                    credit: credit,
                    name: $(node).text(),
                    url: $(node).find("a").attr("href")
                });
            });
        });

        // comments
        infos.comments = [];
        $(this.selector.comments).children(".c1").each(function (_index: number, node: any) {
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
            infos.comments.push({
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

        return infos;
    }
    async getPageUrl(pages: number): Promise<string> {
        let infos = await this.getInfos();
        if (pages < 1 || infos.pages < pages) {
            throw new Error("fuck you! you page range wrong!");
        }
        if (this.pagesUrl[pages] != undefined) {
            return this.pagesUrl[pages];
        }

        let galleryPage = Math.floor((pages - 1) / infos.limit);
        let galleryPageUrl = new URL(this.url);
        galleryPageUrl.searchParams.set("p", galleryPage.toString());
        let $ = await this.loadDocument({ cache: false, url: galleryPageUrl.href });
        $(this.selector.body).find(this.selector[infos.mode].preview).each((index: number, node: any) => {
            this.pagesUrl[galleryPage * infos.limit + index + 1] = $(node).find("a").attr("href");
        });

        return this.pagesUrl[pages];
    }
};

export class Preview extends EXJquery {
    type: string;
    selector: { [key: string]: any };
    // 错误检查，509代表推测你是爬虫
    is509: boolean = false;
    constructor(url: string) {
        super(url);

        this.type = getPageTypeByUrl(url);

        if (this.type != "image preview") {
            throw new Error("fuck you! you url wrong!");
        }

        this.selector = {
            image: "#img",
            page: "#i2 > div.sn > div",
            fullImage: "#i7 > a"
        };
    }
    async getPic(): Promise<{ [key: string]: any; }> {
        let $ = await this.loadDocument();

        let pic: { [key: string]: any } = {};

        pic.url = new URL($(this.selector.image).attr("src"), this.url).href;
        pic.name = pic.url.split("/").pop();
        if (pic.name == "509.gif") {
            this.is509 = true;
            throw new Error(`509超限`);
        }
        let sp = new URL(pic.url).pathname.split("/");
        if (sp[1] == "om") {
            // 从源服务器获取
            pic.fileIndex = parseInt(sp[2]);
        } else {
            // h@h
            pic.fileIndex = parseInt(pic.url.match(/(?<=fileindex=).*(?=;xres=)/g)[0]);
        }
        pic.width = parseInt($(this.selector.image).css("width"));
        pic.height = parseInt($(this.selector.image).css("height"));

        return pic;
    }
    async getFullPic(): Promise<{ [key: string]: any; } | null> {
        let $ = await this.loadDocument();

        let pic: { [key: string]: any } = {};

        if ($(this.selector.fullImage).length == 0) {
            return null;
        }


        pic.url = new URL($(this.selector.fullImage).attr("href"), this.url).href;
        let temp1 = $(this.selector.fullImage).text().match(/^Download original (\d+) x (\d+) (.*) source$/);
        pic.width = parseInt(temp1[1]);
        pic.height = parseInt(temp1[2]);

        return pic;
    }
    // 这个东西可能有多个，比如打开备用图片后显示的备用图片的链接和这个不是一个之类的
    async getSparePageUrl(): Promise<string | null> {
        let $ = await this.loadDocument();

        if ($("#loadfail").length == 0) {
            return null;
        }

        let nl = $("#loadfail").prop("outerHTML").match(/(?<=nl\(').*(?='\))/g)[0];
        let url = new URL(this.url);
        url.searchParams.set("nl", nl);
        return url.href;
    }
};