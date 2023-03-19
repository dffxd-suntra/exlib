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
        return this.toDocuemnt(response.data);
    }
}