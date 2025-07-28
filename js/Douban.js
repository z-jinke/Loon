// 豆瓣实时榜单组件
WidgetMetadata = {
  id: "douban",
  title: "豆瓣实时榜单",
  modules: [
    {
      title: "实时剧集榜",
      requiresWebView: false,
      functionName: "loadItemsFromApi",
      params: [
        {
          name: "start",
          title: "开始",
          type: "count",
        },
        {
          name: "limit",
          title: "每页数量",
          type: "constant",
          value: "20",
        },
        {
          name: "url",
          title: "列表地址",
          type: "constant",
          value:
            "https://m.douban.com/rexxar/api/v2/subject_collection/tv_real_time_hotest/items",
        },
        {
          name: "type",
          title: "类型",
          type: "constant",
          value: "tv",
        },
      ],
    },
    {
      title: "实时电影榜",
      requiresWebView: false,
      functionName: "loadItemsFromApi",
      params: [
        {
          name: "start",
          title: "开始",
          type: "count",
        },
        {
          name: "limit",
          title: "每页数量",
          type: "constant",
          value: "20",
        },
        {
          name: "url",
          title: "列表地址",
          type: "constant",
          value:
            "https://m.douban.com/rexxar/api/v2/subject_collection/movie_real_time_hotest/items",
        },
        {
          name: "type",
          title: "类型",
          type: "constant",
          value: "movie",
        },
      ],
    },
  ],
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "解析豆瓣实时榜单，支持无限翻页",
  author: "pack1r",
  site: "https://github.com/pack1r/ForwardWidgets"
};

// 通用的榜单加载函数，支持无限翻页
async function loadItemsFromApi(params = {}) {
  const start = Number(params.start) || 0;
  const limit = Number(params.limit) || 20;
  const url = params.url;
  const type = params.type || "movie";

  console.log("请求 API 页面:", url);

  const listId = url.match(/subject_collection\/(\w+)/)?.[1];
  const response = await Widget.http.get(`${url}?start=${start}&count=${limit}`, {
    headers: {
      Referer: `https://m.douban.com/subject_collection/${listId}/`,
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });

  if (response.data && response.data.subject_collection_items) {
    const items = response.data.subject_collection_items;

    const results = items
      .filter((item) => item.id != null)
      .map((item) => ({
        id: item.id,
        type: "douban",
        title: item.title || "",
        cover: item.cover_url || item.pic?.normal || "",
        rating: item.rating?.value || null,
        url: `https://movie.douban.com/subject/${item.id}/`
      }));

    return {
      hasMore: items.length >= limit,
      nextStart: start + limit,
      results: results,
    };
  }

  return { hasMore: false, nextStart: start, results: [] };
}
