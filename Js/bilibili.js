let url = $request.url;
let body = $response.body;
let obj = JSON.parse(body);

if (/^https:\/\/app\.bilibili\.com\/x\/v2\/splash\/(list|show|event\/list2)/.test(url)) {
    for (let key in obj.data) {
        if (key === "show" || key === "event_list") {
            obj.data[key] = [];
        }
    }
} else if (/^https:\/\/app\.bilibili\.com\/x\/v2\/search/.test(url)) {
    obj.data = obj.data.filter(item => item.type !== "recommend");
} else if (/^https:\/\/app\.bilibili\.com\/x\/v2\/feed\/index\?/.test(url)) {
    obj.data.items = obj.data.items.filter(item => !item.banner_item && !item.ad_info && item.card_goto === "av");
} else if (/^https:\/\/app\.bilibili\.com\/x\/v2\/feed\/index\/story\?/.test(url)) {
    if (obj.data.items) {
        obj.data.items = obj.data.items
            .filter(item => !item.ad_info && !["vertical_ad_av","vertical_ad_live","vertical_ad_picture"].includes(item.card_goto))
            .map(item => {
                delete item.story_cart_icon;
                delete item.free_flow_toast;
                delete item.image_infos;
                delete item.course_info;
                delete item.game_info;
                return item;
            });
        }
    }
} else if (/^https:\/\/app\.bilibili\.com\/x\/resource\/show\/tab/.test(url)) {
    obj.data.tab = obj.data.tab.filter(t => [40, 41, 3502, 3503].includes(t.id));
    obj.data.bottom = obj.data.bottom.filter(b => [177, 179, 181].includes(b.id));
    obj.data.top = obj.data.top.filter(t => t.id === 3510);
    obj.data.top_more = [];
} else if (/^https:\/\/app\.bilibili\.com\/x\/v2\/account\/mine$/.test(url)) {
    delete obj.data.modular_vip_section;
    obj.data.show_creative = 0;
    obj.data.sections_v2 = obj.data.sections_v2.map(section => {
        delete section.button;
        if (section.title === "推荐服务") {
            delete section.title;
            section.items = section.items.filter(i => [396, 397, 3072, 2830].includes(i.id));
        } else if (section.title === "更多服务") {
            delete section.title;
            section.items = section.items.filter(i => [407, 410].includes(i.id))
                                         .map(i => {
                                             if (i.id === 407) i.title = "客服中心";
                                             if (i.id === 410) i.title = "个人设置";
                                             return i;
                                         });
        }
        return section;
    }).filter(section => section.items.length > 0);
} else if (/^https:\/\/app\.bilibili\.com\/x\/v2\/account\/mine\/ipad/.test(url)) {
    obj.data.ipad_recommend_sections = obj.data.ipad_recommend_sections.filter(s => ![758, 759, 760, 792, 793, 2542, 794].includes(s.id));
    obj.data.ipad_more_sections = obj.data.ipad_more_sections.filter(s => ![1070, 965].includes(s.id))
                                                              .map(s => { if(s.id === 798) s.title = "我的设置"; return s; });
    delete obj.data.ipad_upper_sections;
} else if (/^https:\/\/api\.bilibili\.com\/x\/pd-proxy\/tracker\?/.test(url)) {
    if (obj.data && Array.isArray(obj.data)) {
        for (let i = 0; i < obj.data.length; i++) {
            if (Array.isArray(obj.data[i])) {
                for (let j = 0; j < obj.data[i].length; j++) {
                    obj.data[i][j] = "stun.chat.bilibili.com:3478";
                }
            }
        }
    }
} else if (/^https:\/\/api\.bilibili\.com\/pgc\/view\/v2\/app\/season\?/.test(url)) {
    delete obj.data.payment;
} else if (/^https:\/\/api\.live\.bilibili\.com\/xlive\/(app-interface\/v2\/index\/feed|app-room\/v1\/index\/getInfoBy(Room|User))\?/.test(url)) {
    if (obj.data) {
        delete obj.data.play_together_info;
        delete obj.data.play_together_info_v2;
        delete obj.data.activity_banner_info;
        if (obj.data.function_card) obj.data.function_card = obj.data.function_card.map(() => null);
        if (obj.data.new_tab_info && obj.data.new_tab_info.outer_list) obj.data.new_tab_info.outer_list = obj.data.new_tab_info.outer_list.filter(item => item.biz_id !== 33);
        if (obj.data.card_list) obj.data.card_list = obj.data.card_list.filter(item => !["banner_v2", "activity_card_v1"].includes(item.card_type));
        if (obj.data.show_reserve_status !== undefined) obj.data.show_reserve_status = false;
        if (obj.data.reserve_info && obj.data.reserve_info.show_reserve_status !== undefined) obj.data.reserve_info.show_reserve_status = false;
        if (obj.data.shopping_info && obj.data.shopping_info.is_show !== undefined) obj.data.shopping_info.is_show = 0;
    }

body = JSON.stringify(obj);
$done({ body });
