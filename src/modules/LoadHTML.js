export default class LoadHTML {
    //字符串转化为xml
    toDocuemnt(source) {
        return new window.DOMParser().parseFromString(source, "text/html");
    }
    async getDocument(url) {
        const response = await axios(url);
        if (response.data == "" || response.status != 200) {
            console.error(response);
            throw new Error("网页获取错误");
        }
        if (/^Your IP address has been temporarily banned for excessive pageloads which indicates that you are using automated mirroring\/harvesting software. The ban expires in \d* hours and \d* minutes$/g.test(response.data)) {
            console.error(response);
            throw new Error("你的ip被ban了");
        }
        return this.toDocuemnt(response.data);
    }
}