// 版本：2025-03-19 | 优化版

const scriptName = "入口落地查询";

(async () => {
  try {
    // 获取Loon环境信息
    const loon = $loon.split(" ");

    // 设置超时时间和IP隐藏配置
    let timein = parseInt($persistentStore.read("入口查询超时时间ms") ?? 2000),
        timei = parseInt($persistentStore.read("落地查询超时时间ms") ?? 5000),
        hideIP = $persistentStore.read("是否隐藏真实IP") === "隐藏";

    // 获取环境参数和节点信息
    inputParams = $environment.params;
    nodeName = inputParams.node;
    nodeIp = inputParams.nodeInfo.address;
    INIPS = false; 
    INFailed = ""; 
    ins = ""; 
    outs = ""; 
    serverip = serverTF(nodeIp);
    cfw = ``;  // 移除中转防火墙的内容

    // DNS解析
    if (serverip === "domain") {
      const Ali = await tKey(
        `http://223.5.5.5/resolve?name=${nodeIp}&type=A&short=1`,
        "",
        timein
      );
      if (Ali?.length > 0) {
        console.log("Ali inIp: " + Ali[0]);
        nodeIp = Ali[0];
        serverip = serverTF(nodeIp);
      } else {
        console.log("Ali Dns Failed: " + JSON.stringify(Ali, "", 2));
      }
    }

    // 获取落地信息
    const LD = await tKey(
      "http://ip-api.com/json/?lang=zh-CN",
      nodeName,
      timei
    );
    if (LD?.status === "success") {
      LDTF = true;
      console.log("LD: " + JSON.stringify(LD, "", 2));
      let { country, countryCode, regionName, city, query, isp, as, tk } = LD;
      hideIP && (query = HIP(query));
      var lquery = query;
      outs = `<p style="font-family: -apple-system; font-size: 16px; color: #333;">
        <b>落地位置:</b> <span style="color: #FF5733;">${getflag(countryCode)}${country}</span> &nbsp; ${tk}ms<br><br>
        <b>落地地区:</b> <span>${countryCode} ${regionName} ${city}</span><br><br>
        <b>落地IP地址:</b> <span style="color: #FF5733;">${query}</span><br><br>
        <b>落地ISP:</b> <span>${isp}</span><br><br>
        <b>落地ASN:</b> <span>${as}</span><br></p>`;
    } else {
      let LDFailed = "LD: " + JSON.stringify(LD);
      outs = `<br>LDFailed 查询超时<br><br>`;
      console.log(LDFailed);
    }

    // 获取本机入口信息
    if (nodeIp == lquery) {
      const LO = await tKey(
        "https://api.live.bilibili.com/ip_service/v1/ip_service/get_ip_addr",
        "",
        timein
      );
      if (LO.code === 0) {
        let { addr, province, city, isp, country } = LO.data,
            tk = LO.tk;
        hideIP && (addr = HIP(addr));
        province == city && (province = "");
        country == "中国" && (country = "🇨🇳中国");
        isp = isp.replace(/.*广电.*/g, "广电");
        ins = `<p style="font-family: -apple-system; font-size: 16px; color: #333;">
        <b>本机国家:</b> <span style="color: #007BFF;">${country}</span> &nbsp; ${tk}ms<br><br>
        <b>本机入口:</b> <span>${isp}</span><br><br>
        <b>本机IP:</b> <span style="color: #007BFF;">${addr}</span><br><br>
        <b>本机位置:</b> <span>${province} ${city}</span><br><br></p>`;
      } else {
        console.log("BIli api Failed: " + JSON.stringify(LO, "", 2));
        ins = `<br>BIli Api Failed 查询超时<br><br>`;
      }
    } else {
      // 获取入口信息
      if (serverip === "v4") {
        console.log("v4");
        const SP = await tKey(
          `https://api-v3.speedtest.cn/ip?ip=${nodeIp}`,
          "",
          timein
        );
        if (SP?.data?.country === "中国") {
          console.log("SP: " + JSON.stringify(SP.data, "", 2));
          let { country, city, province, district, countryCode, isp, ip } =
              SP.data,
              tk = SP.tk;
          hideIP && (nodeIp = HIP(nodeIp));
          city == district && (city = "");
          city == province && (city = "");
          ins = `<p style="font-family: -apple-system; font-size: 16px; color: #333;">
            <b>入口ISP:</b> <span>${isp}</span><br><br>
            <b>入口位置:</b> <span style="color: #FF5733;">${getflag(countryCode)}${country}</span> &nbsp; ${tk}ms<br><br>
            <b>入口CNAPI:</b> <span style="color: #FF5733;">${nodeIp}</span><br><br>
            <b>入口地区:</b> <span>${province} ${city} ${district}</span><br><br></p>`;
        } else {
          INFailed = "SP Api Failed: " + JSON.stringify(SP);
          ins = `<br>SPFailed 查询超时<br><br>`;
          INIPS = true;
          console.log(INFailed);
        }
      } else {
        INIPS = true;
        console.log("v6");
      }

      // 获取IPv6入口信息
      if (INIPS) {
        const IO = await tKey(
          `http://ip-api.com/json/${nodeIp}?lang=zh-CN`,
          "",
          timei
        );
        if (IO?.status === "success") {
          console.log("IO: " + JSON.stringify(IO, "", 2));
          let { country, city, regionName, countryCode, isp, query } = IO,
              tk = IO.tk;
          hideIP && (query = HIP(query));
          regionName == city && (city = "");
          ins = `<p style="font-family: -apple-system; font-size: 16px; color: #333;">
            <b>入口位置:</b> <span style="color: #FF5733;">${getflag(countryCode)}${country}</span> &nbsp; ${tk}ms<br><br>
            <b>入口ISP:</b> <span>${isp}</span><br><br>
            <b>入口IPAPI:</b> <span style="color: #FF5733;">${query}</span><br><br>
            <b>入口地区:</b> <span>${regionName} ${city}</span><br><br></p>`;
        } else {
          INFailed = "IPApi Failed: " + JSON.stringify(IO);
          ins = `<br>INFailed 查询超时<br><br>`;
          console.log(INFailed);
        }
      }
    }

    // 拼接最终消息内容
    let message = `<p style="text-align: center; font-family: -apple-system; font-size: 16px; font-weight: normal; color: #333;">
    ${ins}
    ${outs}
    <b style="font-size: 16px;">节点</b> ➟ <span style="font-size: 16px;">${nodeName}</span></p>`;

    // 返回结果
    $done({ title: scriptName, htmlMessage: message });
  } catch (error) {
    console.log("Errk: " + error.message);
    $done({
      title: scriptName,
      htmlMessage: error.message + "<br><br> 查询失败 反馈@Key",
    });
  } finally {
    $done({ title: scriptName, htmlMessage: 'See Log' });
  }
})();

// 隐藏真实IP
function HIP(ip) { return ip.replace(/(\w{1,4})(\.|\:)(\w{1,4}|\*)$/, (_, x, y, z) => `${"∗".repeat(x.length)}.${"∗".repeat(z.length)}`); }

// 判断IP类型
function serverTF(t) {
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(t)) {
    return "v4";
  } else if (/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(t)) {
    return "v6";
  } else {
    return "domain";
  }
}

// 获取国旗
function getflag(t) {
  const n = t.toUpperCase().split("").map((t => 127397 + t.charCodeAt()));
  return String.fromCodePoint(...n).replace(/🇹🇼/g, "🇨🇳");
}

// 异步请求处理
async function tKey(t, e, o) {
  let r = 1, s = 1;
  const i = new Promise(((i, l) => {
    const a = async f => {
      try {
        const r = await Promise.race([new Promise(((n, o) => {
          let r = Date.now();
          $httpClient.get({ url: t, node: e }, ((t, e, s) => {
            if (t) {
              o(t)
            } else {
              let t = Date.now() - r;
              let o = e.status;
              switch (o) {
                case 200:
                  let o = e.headers["Content-Type"];
                  switch (true) {
                    case o.includes("application/json"):
                      let e = JSON.parse(s);
                      e.tk = t;
                      n(e);
                      break;
                    case o.includes("text/html"):
                      n("text/html");
                      break;
                    case o.includes("text/plain"):
                      let r = s.split("\n");
                      let i = r.reduce(((n, e) => {
                        let [o, r] = e.split("=");
                        n[o] = r;
                        n.tk = t;
                        return n;
                      }), {});
                      n(i);
                      break;
                    case o.includes("image/svg+xml"):
                      n("image/svg+xml");
                      break;
                    default:
                      n("未知");
                      break
                  }
                  break;
                case 204:
                  let r = { tk: t };
                  n(r);
                  break;
                default:
                  n("nokey");
                  break
              }
            }
          }))
        })), new Promise(((t, n) => {
          setTimeout(() => n(new Error("timeout")), o)
        }))]);
        if (r) {
          i(r)
        } else {
          i("超时");
          l(new Error(n.message))
        }
      } catch (t) {
        if (f < r) {
          s++;
          a(f + 1)
        } else {
          i("检测失败, 重试次数" + s);
          l(t)
        }
      }
    };
    a(0)
  }));
  return i;
}