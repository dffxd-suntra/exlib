import LoadHTML from "./LoadHTML";
import getPageType from "../functions/getPageType";

class PreviewPage extends LoadHTML {
    constructor(url) {
        super();
        // 初始化链接
        this.url = new URL(url);

        // 页面的种类
        this.pageType = getPageType(this.url);

        // 判断合法性
        if (this.pageType != 16) {
            throw new Error(`您的地址不对劲: "${url}"`);
        }

        // 图片信息
        this.pic = {};

        // 检查是否被屏蔽
        this.is509 = false;
    }
    // 解析页面和图片信息
    parse() {
        // 当前为第几页
        this.page = parseInt($("#i2 > div.sn > div", this.pageDocuemnt).text());

        // 图片节点
        let pic = $("#img", this.pageDocuemnt).get(0);

        let picInfo = this.pic;

        // 图片链接
        picInfo.url = $(pic).attr("src");

        // 图片名称
        picInfo.name = new URL(picInfo.url).pathname.split("/").pop();
        if (picInfo.name == "509.gif") {
            this.pic = {};
            this.is509 = true;
            return false;
        }

        // 图片宽度
        picInfo.width = parseInt(pic.style.width);

        // 图片高度
        picInfo.height = parseInt(pic.style.height);

        // 原图链接
        picInfo.full = $("#i7 > a", this.pageDocuemnt).attr("href") || null;

        if (picInfo.full != null) {
            // 正则表达式获取完整图片宽高
            let temp1 = $("#i7 > a", this.pageDocuemnt).text().match(/^Download original (\d+) x (\d+) (.*) source$/);
            picInfo.fullWidth = parseInt(temp1[1]);
            picInfo.fullHeight = parseInt(temp1[2]);
        } else {
            picInfo.fullWidth = null;
            picInfo.fullHeight = null;
        }

        // 图片索引值
        picInfo.fileIndex = parseInt(picInfo.url.match(/(?<=fileindex=).*(?=;xres=)/g)[0]);

        // 图片的一个奇奇怪怪的字符串,可以加载备用图片
        picInfo.nl = $("#loadfail", this.pageDocuemnt).prop("outerHTML").match(/(?<=nl\(').*(?='\))/g)[0];

        // 图片对应的画廊链接
        picInfo.galleryUrl = $("#i5 > div > a", this.pageDocuemnt).attr("href");
    }
    // 获取备用图片(从exhentai自己的图床里调,会消耗积分?
    async loadSpare() {
        // 获取备用图片的页面地址
        let url = new URL(this.url.origin + this.url.pathname);
        url.searchParams.set("nl", this.pic.nl);

        // 获取文档
        let pageDocuemnt = await this.getDocument(url.toString());

        // 获取图片
        let pic = $("#img", pageDocuemnt).get(0);

        let picInfo = {};

        // 图片链接
        picInfo.url = $(pic).attr("src");

        // 图片名称
        picInfo.name = new URL(picInfo.url).pathname.split("/").pop();

        // 图片宽度
        picInfo.width = parseInt(pic.style.width);

        // 图片高度
        picInfo.height = parseInt(pic.style.height);

        // 完整图片链接
        picInfo.full = this.pic.full;

        // 完整宽度
        picInfo.fullWidth = this.pic.fullWidth;

        // 完整高度
        picInfo.fullHeight = this.pic.fullHeight;

        // 图片索引
        picInfo.fileIndex = this.pic.fileIndex;

        // 画廊地址
        picInfo.galleryUrl = this.pic.galleryUrl;

        return picInfo;
    }
    async init() {
        // 获取文档
        this.pageDocuemnt = await this.getDocument(this.url.origin + this.url.pathname);

        // 解析页面
        this.parse();

        return this;
    }
}

exports = PreviewPage;