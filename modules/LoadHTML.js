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
        const response = await fetch(url);
        const data = await response.text();
        return this.toDocuemnt(data);
    }
}

export default LoadHTML;