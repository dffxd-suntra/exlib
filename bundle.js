(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.exlib = factory());
})(this, (function () { 'use strict';

    class LoadHTML {
        /* removeXSS(str) { // 删除XSS暂时不可用,懒得搞,exhentai也不用这玩意
            // 销特殊字符, 如换行
            str = str.replaceAll('/([\x00-\x08\x0b-\x0c\x0e-\x19])/', '');
            
            // 搜索字符串
            let search =
                'abcdefghijklmnopqrstuvwxyz' +
                'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
                '1234567890!@#$%^&*()' +
                '~`";:?+/={}[]-_|\'\\';
            
            // 暂未翻译, 其意为转换unicode等16进制的字符串为正常字符
            for (i = 0; i < search.length; i++) {
                // ;? matches the ;, which is optional 
                // 0{0,7} matches any padded zeros, which are optional and go up to 8 chars 
                // @ @ search for the hex values 
                str = str.replaceAll('/(&#[xX]0{0,8}' + dechex(ord(search[i])) + ';?)/i', search[i]);
                // @ @ 0{0,7} matches '0' zero to seven times  
                str = str.replaceAll('/(&#0{0,8}' + ord(search[i]) + ';?)/', search[i]);
            }
        
            // now the only remaining whitespace attacks are \t, \n, and \r 
            // 这个可能是上古时代产物了, 连blink都有
            // let ra1 = ['javascript', 'vbscript', 'expression', 'applet', 'meta', 'xml', 'blink', 'link', 'style', 'script', 'embed', 'object', 'iframe', 'frame', 'frameset', 'ilayer', 'layer', 'bgsound', 'title', 'base'];
            
            let ra1 =  ['javascript', 'vbscript', 'expression','script']; // 过多,误判
            let ra2 = ['onabort', 'onactivate', 'onafterprint', 'onafterupdate', 'onbeforeactivate', 'onbeforecopy', 'onbeforecut', 'onbeforedeactivate', 'onbeforeeditfocus', 'onbeforepaste', 'onbeforeprint', 'onbeforeunload', 'onbeforeupdate', 'onblur', 'onbounce', 'oncellchange', 'onchange', 'onclick', 'oncontextmenu', 'oncontrolselect', 'oncopy', 'oncut', 'ondataavailable', 'ondatasetchanged', 'ondatasetcomplete', 'ondblclick', 'ondeactivate', 'ondrag', 'ondragend', 'ondragenter', 'ondragleave', 'ondragover', 'ondragstart', 'ondrop', 'onerror', 'onerrorupdate', 'onfilterchange', 'onfinish', 'onfocus', 'onfocusin', 'onfocusout', 'onhelp', 'onkeydown', 'onkeypress', 'onkeyup', 'onlayoutcomplete', 'onload', 'onlosecapture', 'onmousedown', 'onmouseenter', 'onmouseleave', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onmousewheel', 'onmove', 'onmoveend', 'onmovestart', 'onpaste', 'onpropertychange', 'onreadystatechange', 'onreset', 'onresize', 'onresizeend', 'onresizestart', 'onrowenter', 'onrowexit', 'onrowsdelete', 'onrowsinserted', 'onscroll', 'onselect', 'onselectionchange', 'onselectstart', 'onstart', 'onstop', 'onsubmit', 'onunload'];
            let ra = ra1.concat(ra2);
        
            let found = true; // 存储是否还需搜索, 避免有任何可以钻空子的地方, 例如: "windwindowow" => "window" => ""
            while (found == true) {
                let str_before = str;
                for (let i = 0; i < ra.length; i++) {
                    let pattern = '/';
                    for (let j = 0; j < ra[i].length; j++) {
                        if (j > 0) {
                            pattern =
                                '(' +
                                '(&#[xX]0{0,8}([9ab]);)' +
                                '|' +
                                '|(&#0{0,8}([9|10|13]);)'+
                                ')*';
                        }
                        pattern += ra[i][j];
                    }
                    pattern += '/i';
                    let replacement = ra[i].substring(0, 2) + '_' + ra[i].substring(2); // add in <> to nerf the tag  
                    str = str.preg_replace(pattern, replacement); // filter out the hex tags  
                    if (str_before == str) {
                        // no replacements were made, so exit the loop  
                        found = false;
                    }
                }
            }
            return str;
        } */
        //字符串转化为xml
        toDocuemnt(source) {
            return new window.DOMParser().parseFromString(source, "text/html");
        }
        async getDocument(url) {
            const response = await axios(url);
            const data = await response.text();
            return this.toDocuemnt(data);
        }
    }

    // api的默认配置
    const config = {
        domains: [
            "e-hentai.org",
            "exhentai.org",
            "exhentai55ld2wyap5juskbm67czulomrouspdacjamjeloj7ugjbsad.onion"
        ],
        ehgt: "ehgt.org",
        modeLabel: { "m": "Minimal", "p": "Minimal+", "l": "Compact", "e": "Extended", "t": "Thumbnail" }
    };

    // 获取页面类型
    function checkPage(url) {
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
            this.next = parseInt(this.url.searchParams.get("next"));

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
            return new Galleries(this.prevPageUrl);
        }
        getNextPage() {
            if (!this.inited) {
                throw new Error(`请先初始化!`);
            }
            return new Galleries(this.nextPageUrl);
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
                let temp = url.split("/");
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
            this.prevPageUrl = this.nodes.uprev.attr("href");
            this.nextPageUrl = this.nodes.unext.attr("href");

            // 成功初始化
            this.inited = true;

            return this;
        }
    }

    class PreviewPage extends LoadHTML {
        constructor(url) {
            super();
            // 初始化链接
            this.url = new URL(url);

            // 页面的种类
            this.pageType = checkPage(this.url);

            // 判断合法性
            if (this.pageType != 16) {
                throw new Error(`您的地址不对劲: "${url}"`);
            }

            // 检查是否被屏蔽
            this.is509 = false;
        }
        // 获取备用图片(从exhentai自己的图床里调,会消耗积分?
        async loadSpare() {
            // 获取备用图片的页面地址
            let url = new URL(this.url.origin + this.url.pathname);
            url.searchParams.set("nl", this.pic.nl);

            let spare = {};

            // 获取文档
            spare.pageDocuemnt = await this.getDocument(url.toString());

            // 获取图片
            spare.pic = $("#img", spare.pageDocuemnt).get(0);

            // 图片链接
            spare.url = $(spare.pic).attr("src");

            // 图片名称
            spare.name = new URL(spare.url).pathname.split("/").pop();
            if (spare.name == "509.gif") {
                this.is509 = true;
                throw new Error(`509超限`);
            }

            // 图片宽度
            spare.width = parseInt(spare.pic.style.width);

            // 图片高度
            spare.height = parseInt(spare.pic.style.height);

            this.spare = spare;

            return this;
        }
        async init() {
            this.is509 = false;

            let pic = {};

            // 获取文档
            pic.pageDocuemnt = await this.getDocument(this.url.origin + this.url.pathname);

            // 图片信息
            // 解析页面

            // 图片节点
            pic.pic = $("#img", pic.pageDocuemnt).get(0);

            // 图片链接
            pic.url = $(pic).attr("src");

            // 图片名称
            pic.name = new URL(pic.url).pathname.split("/").pop();
            if (pic.name == "509.gif") {
                this.is509 = true;
                throw new Error(`509超限`);
            }

            pic.width = parseInt(pic.style.width);
            pic.height = parseInt(pic.style.height);

            this.pic = pic;
            
            // 当前为第几页
            this.page = parseInt($("#i2 > div.sn > div", pic.pageDocuemnt).text());

            // 图片索引值
            this.fileIndex = parseInt(pic.url.match(/(?<=fileindex=).*(?=;xres=)/g)[0]);

            // 图片的一个奇奇怪怪的字符串,可以加载备用图片
            this.nl = $("#loadfail", pic.pageDocuemnt).prop("outerHTML").match(/(?<=nl\(').*(?='\))/g)[0];

            // 图片对应的画廊链接
            this.galleryUrl = $("#i5 > div > a", pic.pageDocuemnt).attr("href");

            // 初始化原图
            let full = {};

            full.url = $("#i7 > a", pic.pageDocuemnt).attr("href") || null;
            full.width = null;
            full.height = null;

            if (full.url != null) {
                // 正则表达式获取完整图片宽高
                let temp1 = $("#i7 > a", this.pageDocuemnt).text().match(/^Download original (\d+) x (\d+) (.*) source$/);
                full.width = parseInt(temp1[1]);
                full.height = parseInt(temp1[2]);
            }

            this.full = full;

            return this;
        }
    }

    function toByte(size, type) {
        if (!type) {
            [size, type] = size;
        }
        size = new Number(size);
        let unit = {
            "BYTE": 1,
            "KB": 1024,
            "MB": 1048576,
            "GB": 1073741824,
            "TB": 1099511627776,
            "PB": 1125899906842600,
        };
        return size * unit[type];
    }

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

    var main = {
        LoadHTML,
        Galleries,
        Gallery,
        PreviewPage
    };

    return main;

}));
