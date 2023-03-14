class LoadHTML {
    removeXSS(str) {
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
            $val = preg_replace('/(&#[xX]0{0,8}' . dechex(ord($search[$i])) . ';?)/i', $search[$i], $val); // with a ; 
            // @ @ 0{0,7} matches '0' zero to seven times  
            $val = preg_replace('/(&#0{0,8}' . ord($search[$i]) . ';?)/', $search[$i], $val); // with a ; 
        }
    
        // now the only remaining whitespace attacks are \t, \n, and \r 
        // 这个可能是上古时代产物了, 连blink都有
        // let ra1 = ['javascript', 'vbscript', 'expression', 'applet', 'meta', 'xml', 'blink', 'link', 'style', 'script', 'embed', 'object', 'iframe', 'frame', 'frameset', 'ilayer', 'layer', 'bgsound', 'title', 'base'];
        
        let ra1 =  ['javascript', 'vbscript', 'expression','script']; // 过多,误判
        let ra2 = ['onabort', 'onactivate', 'onafterprint', 'onafterupdate', 'onbeforeactivate', 'onbeforecopy', 'onbeforecut', 'onbeforedeactivate', 'onbeforeeditfocus', 'onbeforepaste', 'onbeforeprint', 'onbeforeunload', 'onbeforeupdate', 'onblur', 'onbounce', 'oncellchange', 'onchange', 'onclick', 'oncontextmenu', 'oncontrolselect', 'oncopy', 'oncut', 'ondataavailable', 'ondatasetchanged', 'ondatasetcomplete', 'ondblclick', 'ondeactivate', 'ondrag', 'ondragend', 'ondragenter', 'ondragleave', 'ondragover', 'ondragstart', 'ondrop', 'onerror', 'onerrorupdate', 'onfilterchange', 'onfinish', 'onfocus', 'onfocusin', 'onfocusout', 'onhelp', 'onkeydown', 'onkeypress', 'onkeyup', 'onlayoutcomplete', 'onload', 'onlosecapture', 'onmousedown', 'onmouseenter', 'onmouseleave', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onmousewheel', 'onmove', 'onmoveend', 'onmovestart', 'onpaste', 'onpropertychange', 'onreadystatechange', 'onreset', 'onresize', 'onresizeend', 'onresizestart', 'onrowenter', 'onrowexit', 'onrowsdelete', 'onrowsinserted', 'onscroll', 'onselect', 'onselectionchange', 'onselectstart', 'onstart', 'onstop', 'onsubmit', 'onunload'];
        let ra = ra1.concat(ra2);
    
        found = true; // 存储是否还需搜索, 避免有任何可以钻空子的地方, 例如: "windwindowow" => "window" => ""
        while (found == true) {
            $val_before = $val;
            str_before = str;
            for (i = 0; i < sizeof(ra); i++) {
                $pattern = '/';
                for ($j = 0; $j < strlen($ra[$i]); $j++) {
                    if ($j > 0) {
                        $pattern .= '(';
                        $pattern .= '(&#[xX]0{0,8}([9ab]);)';
                        $pattern .= '|';
                        $pattern .= '|(&#0{0,8}([9|10|13]);)';
                        $pattern .= ')*';
                    }
                    $pattern .= $ra[$i][$j];
                }
                $pattern .= '/i';
                $replacement = substr($ra[$i], 0, 2) . '_' . substr($ra[$i], 2); // add in <> to nerf the tag  
                $val = preg_replace($pattern, $replacement, $val); // filter out the hex tags  
                if ($val_before == $val) {
                    // no replacements were made, so exit the loop  
                    found = false;
                }
            }
        }
        return str;
    }
    // 去除script标签(可选
    strRemoveScript(str) {
        return str.replace(/(<script(.*?)>)(.|\n)*?(<\/script>)/g, "");
    }
    //字符串转化为xml
    toDocuemnt(source) {
        return new window.DOMParser().parseFromString(source, "text/html");
    }
    getDocument(url, script = true) {
        let that = this;
        return fetch(url)
            .then(response => response.text())
            .then(function (data) {
                if (!script) {
                    data = that.toDocuemnt(that.strRemoveScript(data));
                }
                return that.toDocuemnt(data);
            });
    }
}

exports = LoadHTML;