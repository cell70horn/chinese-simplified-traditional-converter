/* 简繁转换器 — 纯前端转换逻辑
 * 词库数据来自 OpenCC (Apache-2.0)，见 opencc-data.js / NOTICE。
 * 算法：简->繁 先按词组最长匹配(STPhrases)，未命中再单字(STCharacters)；
 *      繁->简 用单字表(TSCharacters)。取每条映射的首选值。
 */
(function () {
  "use strict";

  function buildMap(raw) {
    var m = new Map();
    if (!raw) return m;
    var lines = raw.split("\n");
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (!line || line.charAt(0) === "#") continue;
      var t = line.indexOf("\t");
      if (t < 0) continue;
      var key = line.slice(0, t);
      var val = line.slice(t + 1).split(" ")[0];
      if (key && val) m.set(key, val);
    }
    return m;
  }

  var D = window.OPENCC || {};
  var stChars = buildMap(D.stChars);
  var tsChars = buildMap(D.tsChars);
  var stPhrases = buildMap(D.stPhrases);

  // 合并词组+单字用于简->繁的最长匹配；记录最长词组长度上限
  var maxPhrase = 1;
  stPhrases.forEach(function (_v, k) { if (k.length > maxPhrase) maxPhrase = k.length; });
  if (maxPhrase > 12) maxPhrase = 12; // 安全上限，兼顾性能

  function s2t(text) {
    var out = [];
    var n = text.length;
    var i = 0;
    while (i < n) {
      var matched = false;
      var hi = Math.min(maxPhrase, n - i);
      for (var L = hi; L >= 2; L--) {
        var seg = text.substr(i, L);
        var hit = stPhrases.get(seg);
        if (hit) { out.push(hit); i += L; matched = true; break; }
      }
      if (matched) continue;
      var ch = text.charAt(i);
      out.push(stChars.get(ch) || ch);
      i += 1;
    }
    return out.join("");
  }

  function t2s(text) {
    var out = "";
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      out += tsChars.get(ch) || ch;
    }
    return out;
  }

  var $in = document.getElementById("in");
  var $out = document.getElementById("out");
  var $stat = document.getElementById("stat");
  var $copy = document.getElementById("copy");
  var $s2t = document.getElementById("s2t");
  var $t2s = document.getElementById("t2s");

  var ready = stChars.size > 0 && stPhrases.size > 0;
  if (ready) {
    $stat.textContent =
      "词库就绪：" + stPhrases.size.toLocaleString() + " 词组 / " +
      stChars.size.toLocaleString() + " 简字 / " + tsChars.size.toLocaleString() + " 繁字";
  } else {
    $stat.textContent = "词库加载失败，请刷新重试";
    $s2t.disabled = true; $t2s.disabled = true;
  }

  function run(fn) {
    var src = $in.value || "";
    if (!src) { $out.textContent = ""; $copy.disabled = true; return; }
    var res = fn(src);
    $out.textContent = res;
    $copy.disabled = !res;
  }

  $s2t.addEventListener("click", function () { run(s2t); });
  $t2s.addEventListener("click", function () { run(t2s); });

  $copy.addEventListener("click", function () {
    var txt = $out.textContent || "";
    if (!txt) return;
    function done() {
      var old = $copy.textContent;
      $copy.textContent = "已复制 ✓";
      setTimeout(function () { $copy.textContent = old; }, 1400);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(done, fallback);
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = txt; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) {}
      document.body.removeChild(ta);
    }
  });

  // JSON-LD：WebApplication + FAQPage（与页面可见内容一致）
  try {
    var ld = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          "name": "简繁转换器",
          "url": "https://cell70horn.github.io/chinese-simplified-traditional-converter/",
          "applicationCategory": "UtilitiesApplication",
          "operatingSystem": "Web browser",
          "inLanguage": "zh-Hans",
          "description": "基于 OpenCC 词库的在线简体↔繁体中文互转工具，词组优先、单字兜底，纯前端本地转换。",
          "isAccessibleForFree": true,
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            { "@type": "Question", "name": "简繁转换结果准确吗？",
              "acceptedAnswer": { "@type": "Answer", "text": "常用文本准确度很高，先用近5万条词组做整词匹配；但中文简繁存在语境歧义，少数情况仍需人工核对。" } },
            { "@type": "Question", "name": "一简对多繁怎么处理？",
              "acceptedAnswer": { "@type": "Answer", "text": "靠词组表整词匹配，例如头发命中頭髮、发现命中發現；字不在任何词组里时才退回单字表取最常用对应字。" } },
            { "@type": "Question", "name": "词库数据来自哪里、能商用吗？",
              "acceptedAnswer": { "@type": "Answer", "text": "转换词库来自开源项目 OpenCC（Apache-2.0），页面源码以 MIT 开放，均可商用，需保留版权与许可声明。" } },
            { "@type": "Question", "name": "会上传我的文字吗？",
              "acceptedAnswer": { "@type": "Answer", "text": "不会，词库随页面加载到浏览器，转换在本地完成，文本不发往服务器，可断网使用。" } }
          ]
        }
      ]
    };
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);
  } catch (e) {}
})();
