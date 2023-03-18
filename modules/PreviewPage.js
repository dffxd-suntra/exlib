import config from "../config.js";
import LoadHTML from "./LoadHTML.js";
import checkPage from "../functions/checkPage.js";

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

export default PreviewPage;