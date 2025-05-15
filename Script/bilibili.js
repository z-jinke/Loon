let url = $request.url;
let body = $response.body;

try {
    if (/x\/resource\/show\/tab\/v2/.test(url)) {
        let obj = JSON.parse(body);
        if (obj.data && obj.data.tab) {
            let originalTabs = obj.data.tab;
            let newTabs = [];

            for (let tab of originalTabs) {
                if (tab.name === "推荐" && $argument.showTabRecommend === "true") {
                    newTabs.push(tab);
                } else if (tab.name === "热门" && $argument.showTabHot === "true") {
                    newTabs.push(tab);
                } else if (tab.name === "动画" && $argument.showTabBangumi === "true") {
                    newTabs.push(tab);
                } else if (tab.name === "影视" && $argument.showTabCinema === "true") {
                    newTabs.push(tab);
                } else if (tab.name === "直播" && $argument.showTabLive === "true") {
                    newTabs.push(tab);
                }
                // 可以根据 tab.tab_id 或其他属性进行更精确的匹配
            }

            obj.data.tab = newTabs;

        }
        body = JSON.stringify(obj);
    }

    if (/x\/v2\/account\/mine/.test(url)) {
        let obj = JSON.parse(body);
        if (url.includes("/ipad")) {
            if (obj.data) {
                delete obj.data.ipad_upper_sections;
                obj.data.ipad_recommend_sections = [
                    {"id":789,"title":"关注列表","uri":"bilibili://user_center/myfollows","icon":"http://i0.hdslb.com/bfs/feed-admin/fdd7f676030c6996d36763a078442a210fc5a8c0.png","mng_resource":{}},
                    {"id":790,"title":"消息列表","uri":"bilibili://link/im_home","icon":"http://i0.hdslb.com/bfs/feed-admin/e1471740130a08a48b02a4ab29ed9d5f2281e3bf.png","mng_resource":{}}
                ];
                obj.data.ipad_more_sections = [
                    {"id":797,"title":"官方客服","uri":"bilibili://user_center/feedback","icon":"http://i0.hdslb.com/bfs/feed-admin/7801a6180fb67cf5f8ee05a66a4668e49fb38788.png","mng_resource":{}},
                    {"id":798,"title":"设置中心","uri":"bilibili://user_center/setting","icon":"http://i0.hdslb.com/bfs/feed-admin/34e8faea00b3dd78977266b58d77398b0ac9410b.png","mng_resource":{}}
                ];
            }
        } else {
            if (obj.data) {
                delete obj.data.vip_section_v2;
                delete obj.data.vip_section;
                delete obj.data.modular_vip_section;
                delete obj.data.rework_v1;
                obj.data.sections_v2 = [
                    {
                        "items":[
                            {"id":396,"title":"离线缓存","icon":"http://i0.hdslb.com/bfs/archive/5fc84565ab73e716d20cd2f65e0e1de9495d56f8.png","common_op_item":{},"uri":"bilibili://user_center/download"},
                            {"id":397,"title":"历史记录","icon":"http://i0.hdslb.com/bfs/archive/8385323c6acde52e9cd52514ae13c8b9481c1a16.png","common_op_item":{},"uri":"bilibili://user_center/history"},
                            {"id":3072,"title":"我的收藏","icon":"http://i0.hdslb.com/bfs/archive/d79b19d983067a1b91614e830a7100c05204a821.png","common_op_item":{},"uri":"bilibili://user_center/favourite?version=2"},
                            {"id":2830,"title":"稍后再看","icon":"http://i0.hdslb.com/bfs/archive/63bb768caa02a68cb566a838f6f2415f0d1d02d6.png","need_login":1,"uri":"bilibili://user_center/watch_later_v2","common_op_item":{}}
                        ],
                        "style":1,"button":{}
                    },
                    {
                        "items":[
                            {"id":407,"title":"客服中心","icon":"http://i0.hdslb.com/bfs/feed-admin/7801a6180fb67cf5f8ee05a66a4668e49fb38788.png","common_op_item":{},"uri":"bilibili://user_center/feedback"},
                            {"id":410,"title":"我的设置","icon":"https://i0.hdslb.com/bfs/feed-admin/34e8faea00b3dd78977266b58d77398b0ac9410b.png","common_op_item":{},"uri":"bilibili://user_center/setting"}
                        ],
                        "style":2,"button":{}
                    }
                ];
            }
        }
        body = JSON.stringify(obj);
    }

    $done({ body });
} catch (e) {
    $notify("脚本运行错误", `请求URL: ${url}`, `错误信息: ${e.message}`);
    $done({ body });
}
