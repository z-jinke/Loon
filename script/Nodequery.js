//2025.03.19 | 优化版

const scriptName = "查询";

(async () => {
  try {
    // 设置超时时间
    let timein = parseInt($persistentStore.read("入口查询超时时间ms") ?? 2000),
        timei = parseInt($persistentStore.read("落地查询超时时间ms") ?? 5000);

    // 获取环境参数和节点信息
    let { node: nodeName, nodeInfo: { address: nodeIp } } = $environment.params;
    let serverip = getIPType(nodeIp);
    let ins = "", outs = "";

    // DNS解析
    if (serverip === "domain") {
      const Ali = await fetchJSON(`http://223.5.5.5/resolve?name=${nodeIp}&type=A&short=1`, timein);
      if (Ali?.length > 0) {
        nodeIp = Ali[0];
        serverip = getIPType(nodeIp);
      }
    }

    // 获取落地信息
    const LD = await fetchJSON("http://ip-api.com/json/?lang=zh-CN", timei);
    if (LD?.status === "success") {
      outs = `<p style="font-family: -apple-system; font-size: 16px; color: #FFFFFF;">
        <b style="font-size: 16px; color: #FFA500;">落地信息</b><br>
        <b>国家/地区:</b> ${getFlag(LD.countryCode)} ${LD.country}<br>
        <b>省份/城市:</b> ${LD.regionName} ${LD.city}<br>
        <b>IP 地址:</b> <span style="color: #FF5733;">${LD.query}</span><br>
        <b>ISP:</b> ${LD.isp}<br>
        <b>ASN:</b> ${LD.as}<br>
        <b>查询延迟:</b> <span style="color: #32CD32;">${LD.tk}ms</span>
      </p>`;
    } else {
      outs = `<p style="color: #FFFFFF;">落地信息查询超时</p>`;
    }

    // 获取入口信息
    if (nodeIp === LD.query) {
      const LO = await fetchJSON("https://api.live.bilibili.com/ip_service/v1/ip_service/get_ip_addr", timein);
      if (LO?.code === 0) {
        ins = `<p style="font-family: -apple-system; font-size: 16px; color: #FFFFFF;">
          <b style="font-size: 16px; color: #1E90FF;">入口信息</b><br>
          <b>国家:</b> ${LO.data.country}<br>
          <b>省份/城市:</b> ${LO.data.province} ${LO.data.city}<br>
          <b>ISP:</b> ${LO.data.isp}<br>
          <b>IP 地址:</b> <span style="color: #007BFF;">${LO.data.addr}</span><br>
          <b>查询延迟:</b> <span style="color: #32CD32;">${LO.tk}ms</span>
        </p>`;
      } else {
        ins = `<p style="color: #FFFFFF;">入口信息查询超时</p>`;
      }
    } else {
      const SP = await fetchJSON(`https://api-v3.speedtest.cn/ip?ip=${nodeIp}`, timein);
      if (SP?.data?.country === "中国") {
        ins = `<p style="font-family: -apple-system; font-size: 16px; color: #FFFFFF;">
          <b style="font-size: 16px; color: #1E90FF;"> 入口信息</b><br>
          <b>国家/地区:</b> ${getFlag(SP.data.countryCode)} ${SP.data.country}<br>
          <b>省份/城市:</b> ${SP.data.province} ${SP.data.city} ${SP.data.district}<br>
          <b>ISP:</b> ${SP.data.isp}<br>
          <b>IP 地址:</b> <span style="color: #FF5733;">${nodeIp}</span><br>
          <b>查询延迟:</b> <span style="color: #32CD32;">${SP.tk}ms</span>
        </p>`;
      } else {
        ins = `<p style="color: #FFFFFF;">入口信息查询超时</p>`;
      }
    }

    // 拼接最终消息内容
    let message = `<p style="text-align: center; font-family: -apple-system; font-size: 16px; color: #FFFFFF;">
      ${ins}
      ${outs}
      <b style="font-size: 16px;">当前节点:</b> <span style="font-size: 16px;">${nodeName}</span>
    </p>`;

    // 返回结果
    $done({ title: scriptName, htmlMessage: message });
  } catch (error) {
    $done({ title: scriptName, htmlMessage: `<p style="color: #FFFFFF;">查询失败: ${error.message}</p>` });
  }
})();

// 判断IP类型
function getIPType(ip) {
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) return "v4";
  if (/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(ip)) return "v6";
  return "domain";
}

// 获取国旗
function getFlag(code) {
  return String.fromCodePoint(...code.toUpperCase().split("").map(t => 127397 + t.charCodeAt())).replace(/🇹🇼/g, "🇨🇳");
}

// 异步请求处理
async function fetchJSON(url, timeout) {
  return new Promise(resolve => {
    let start = Date.now();
    $httpClient.get({ url }, (error, response, body) => {
      if (error) return resolve(null);
      try {
        let data = JSON.parse(body);
        data.tk = Date.now() - start;
        resolve(data);
      } catch (e) {
        resolve(null);
      }
    });
    setTimeout(() => resolve(null), timeout);
  });
}