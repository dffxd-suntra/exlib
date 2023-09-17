# Exlib
完成度很高，但是还没有完成用户登录的全过程（验证码难绷  
原本是要做模块化的，但是这个东西做起来也是比较简单，就算了  

对tor网站做了单独优化，不会报错了，tor没有的东西都会返回`null`  

## 打包命令
```bash
npm run build
```

## 测试脚本
运行exlib后将此代码在exhentai或e-hentai中运行
```javascript
(async function () {
    let baseUrl = new URL("/", location.href).href;
    let g1 = new Exlib.Galleries(baseUrl+"popular");
    let galleries = await g1.getGalleries();
    console.log(g1, galleries);

    let g2 = new Exlib.Gallery(galleries[0].url);
    let infos = await g2.getInfos();
    console.log(g2, infos);

    let page;
    for(let i = 1; i <= 3 && i <= infos.pages; i++) {
        page = await g2.getPageUrl(i);
        console.log(i, page);
    }

    let p1 = new Exlib.Preview(page);
    console.log(p1, await p1.getPic(), await p1.getFullPic(), await p1.getSparePageUrl());
})();
```