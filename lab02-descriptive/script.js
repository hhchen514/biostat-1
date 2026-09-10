/* ══════════════════════════════════════════════════════════════
   Lab 02　資料的描述（W7–W10）
   拖曳數線、離差圖、經驗法則實測、箱型圖產生器、四台練習機
   ══════════════════════════════════════════════════════════════ */
(function () {
"use strict";

/* ─── 資料集 ─────────────────────────────────────── */
var DATA = {
  A40: [16.4,18.2,14.7,20.1,15.3,17.8,13.2,19.6,16.4,21.4,15.8,18.7,12.5,17.1,20.8,
        14.1,19.2,16.2,22.3,15.0,17.5,13.8,18.9,16.7,20.4,11.2,19.8,15.6,17.3,21.9,
        14.4,18.4,16.0,23.6,17.9,13.5,19.0,24.8,16.4,18.1],
  E50: [248,312,196,285,341,223,267,398,254,301,189,276,332,215,289,356,241,298,207,324,
        263,381,229,294,318,182,272,347,236,305,258,291,213,368,244,283,327,201,279,336,
        225,296,251,309,421,266,288,234,314,270],
  A:   [248,262,255,241,270,258,246,264,252,259],
  B:   [196,241,178,265,213,289,205,252,224,232],
  H:   [236,248,255,241,262,250,244,258,253,247,259,412],
  K:   [318,325,331,322,340,328,335,319,344,330,196]
};

/* ─── 統計工具 ───────────────────────────────────── */
function mean(a){ return a.reduce(function(s,x){return s+x;},0)/a.length; }
function median(a){
  var s = a.slice().sort(function(x,y){return x-y;}), n = s.length, m = Math.floor(n/2);
  return n % 2 ? s[m] : (s[m-1]+s[m])/2;
}
function modes(a){
  var c = {}, mx = 0;
  a.forEach(function(x){ c[x] = (c[x]||0)+1; if (c[x] > mx) mx = c[x]; });
  if (mx < 2) return { list: [], n: 0 };
  return { list: Object.keys(c).filter(function(k){ return c[k] === mx; }).map(Number).sort(function(x,y){return x-y;}), n: mx };
}
function sd(a){
  var m = mean(a);
  return Math.sqrt(a.reduce(function(s,x){ return s + (x-m)*(x-m); }, 0) / (a.length-1));
}
/* 位置 = (n+1)p，非整數時線性內插 */
function quantile(a, p){
  var s = a.slice().sort(function(x,y){return x-y;}), n = s.length;
  var pos = (n+1)*p;
  if (pos <= 1) return s[0];
  if (pos >= n) return s[n-1];
  var lo = Math.floor(pos), fr = pos - lo;
  return fr ? s[lo-1] + fr*(s[lo]-s[lo-1]) : s[lo-1];
}
function fmt(x, d){
  if (d === undefined) d = Math.abs(x) >= 100 ? 1 : 2;
  return Number(x).toFixed(d);
}
function ri(a,b){ return a + Math.floor(Math.random()*(b-a+1)); }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

/* ══════════════ 01 拖曳數線 ══════════════ */
var PRESETS = {
  pond: { d: DATA.H.slice(), lo: 220, hi: 440, unit: "g",   name: "養殖池 12 尾" },
  even: { d: [242,246,249,251,253,255,257,259,262,266],     lo: 230, hi: 280, unit: "g", name: "大致對稱" },
  skew: { d: [205,212,218,221,225,229,234,241,258,296,340], lo: 190, hi: 360, unit: "g", name: "明顯右偏" }
};
var cur = "pond", pts = PRESETS.pond.d.slice(), orig = PRESETS.pond.d.slice();
var SVG = document.getElementById("dragline");
var W = 660, H = 190, ML = 40, MR = 30, AY = 128;

function xScale(v){
  var p = PRESETS[cur];
  return ML + (v - p.lo) / (p.hi - p.lo) * (W - ML - MR);
}
function xInv(px){
  var p = PRESETS[cur];
  return p.lo + (px - ML) / (W - ML - MR) * (p.hi - p.lo);
}

function drawLine(){
  var p = PRESETS[cur];
  var m = mean(pts), md = median(pts);
  var q1 = quantile(pts, .25), q3 = quantile(pts, .75), iqr = q3 - q1;
  var loF = q1 - 1.5*iqr, hiF = q3 + 1.5*iqr;
  var s = "";

  /* 軸與刻度 */
  s += '<line class="axis" x1="'+ML+'" y1="'+AY+'" x2="'+(W-MR)+'" y2="'+AY+'"/>';
  var ticks = 6;
  for (var i = 0; i <= ticks; i++){
    var v = p.lo + (p.hi-p.lo)*i/ticks, x = xScale(v);
    s += '<line class="grid" x1="'+x.toFixed(1)+'" y1="'+AY+'" x2="'+x.toFixed(1)+'" y2="'+(AY+6)+'"/>';
    s += '<text x="'+x.toFixed(1)+'" y="'+(AY+20)+'" text-anchor="middle">'+Math.round(v)+'</text>';
  }
  s += '<text x="'+(W-MR)+'" y="'+(AY+38)+'" text-anchor="end">'+p.unit+'</text>';

  /* 平均數與中位數的標線 */
  var xm = xScale(m), xd = xScale(md);
  s += '<line class="mark-mean" x1="'+xm.toFixed(1)+'" y1="30" x2="'+xm.toFixed(1)+'" y2="'+AY+'"/>';
  s += '<text class="mark-lbl" x="'+xm.toFixed(1)+'" y="24" text-anchor="middle" fill="var(--flag)">x̄ '+fmt(m,1)+'</text>';
  s += '<line class="mark-med" x1="'+xd.toFixed(1)+'" y1="46" x2="'+xd.toFixed(1)+'" y2="'+AY+'"/>';
  s += '<text class="mark-lbl" x="'+xd.toFixed(1)+'" y="60" text-anchor="middle" fill="var(--accent)">中位 '+fmt(md,1)+'</text>';

  /* 資料點（同值時上下錯開避免重疊） */
  var seen = {};
  pts.forEach(function(v, i){
    var x = xScale(v);
    var key = Math.round(x/8);
    seen[key] = (seen[key]||0) + 1;
    var y = AY - 10 - (seen[key]-1)*13;
    var isOut = v < loF || v > hiF;
    s += '<circle class="dot'+(isOut?' out':'')+'" cx="'+x.toFixed(1)+'" cy="'+y+'" r="7" data-i="'+i+'"><title>'+fmt(v,1)+' '+p.unit+'</title></circle>';
  });
  SVG.innerHTML = s;
}

function statsLine(){
  var m = mean(pts), md = median(pts), mo = modes(pts);
  var mr = (Math.min.apply(null,pts) + Math.max.apply(null,pts)) / 2;
  var om = mean(orig), omd = median(orig);
  var dm = m - om, dmd = md - omd;
  function delta(d){
    if (Math.abs(d) < 0.05) return '<span class="d">未變動</span>';
    return '<span class="d up">'+(d>0?"+":"")+fmt(d,1)+'</span>';
  }
  document.getElementById("d1-stats").innerHTML =
    '<div class="s hi"><span class="k">平均數 x̄</span><span class="v flag">'+fmt(m,1)+'</span>'+delta(dm)+'</div>' +
    '<div class="s"><span class="k">中位數</span><span class="v acc">'+fmt(md,1)+'</span>'+delta(dmd)+'</div>' +
    '<div class="s"><span class="k">眾數</span><span class="v">'+(mo.n ? mo.list.map(function(v){return fmt(v,1);}).join(", ") : "無")+'</span></div>' +
    '<div class="s"><span class="k">中列數</span><span class="v">'+fmt(mr,1)+'</span></div>' +
    '<div class="s"><span class="k">標準差 s</span><span class="v flag">'+fmt(sd(pts),2)+'</span></div>';

  var note = document.getElementById("d1-note");
  if (Math.abs(dm) > 0.05 || Math.abs(dmd) > 0.05){
    if (Math.abs(dmd) < 0.05){
      note.innerHTML = "你把資料改動之後，<strong>平均數移動了 " + fmt(Math.abs(dm),2) +
        "</strong>，而<strong>中位數完全沒有動</strong>。這就是「穩健」——" +
        "中位數只看排在中間的是誰，最外側那筆再怎麼極端都影響不了它。";
    } else {
      note.innerHTML = "你把資料改動之後，<strong>平均數移動了 " + fmt(Math.abs(dm),2) +
        "</strong>，<strong>中位數移動了 " + fmt(Math.abs(dmd),2) + "</strong>——" +
        "平均數的移動量是中位數的 <strong>" + Math.abs(dm/dmd).toFixed(1) + " 倍</strong>。";
    }
  } else {
    note.innerHTML = "拖動任何一個點看看。特別建議把<strong>最右邊那個</strong>往右拉到底。";
  }
}

/* 拖曳（滑鼠與觸控通用） */
var dragging = null;
function svgX(evt){
  var r = SVG.getBoundingClientRect();
  return (evt.clientX - r.left) / r.width * W;
}
SVG.addEventListener("pointerdown", function(e){
  var t = e.target;
  if (!t.classList || !t.classList.contains("dot")) return;
  dragging = +t.dataset.i;
  t.classList.add("dragging");
  SVG.setPointerCapture(e.pointerId);
  e.preventDefault();
});
SVG.addEventListener("pointermove", function(e){
  if (dragging === null) return;
  var p = PRESETS[cur];
  var v = Math.max(p.lo, Math.min(p.hi, xInv(svgX(e))));
  pts[dragging] = Math.round(v);
  drawLine(); statsLine();
});
function endDrag(e){
  if (dragging === null) return;
  dragging = null;
  try { SVG.releasePointerCapture(e.pointerId); } catch (err) {}
  drawLine(); statsLine();
}
SVG.addEventListener("pointerup", endDrag);
SVG.addEventListener("pointercancel", endDrag);

Array.prototype.forEach.call(document.querySelectorAll("[data-preset]"), function(b){
  b.addEventListener("click", function(){
    Array.prototype.forEach.call(document.querySelectorAll("[data-preset]"), function(x){ x.classList.remove("on"); });
    b.classList.add("on");
    cur = b.dataset.preset;
    pts = PRESETS[cur].d.slice();
    orig = PRESETS[cur].d.slice();
    drawLine(); statsLine();
  });
});
document.getElementById("d1-reset").addEventListener("click", function(){
  pts = orig.slice(); drawLine(); statsLine();
});
drawLine(); statsLine();

/* ══════════════ 02 離差圖 ══════════════ */
var SD_SET = { A: {d: DATA.A, name:"甲池", unit:"g"}, B: {d: DATA.B, name:"乙池", unit:"g"}, H: {d: DATA.H, name:"含離群值的池", unit:"g"} };
var sdCur = "A";
function drawDev(){
  var set = SD_SET[sdCur], a = set.d;
  var m = mean(a), s = sd(a);
  var lo = Math.min.apply(null, a), hi = Math.max.apply(null, a);
  var pad = (hi-lo)*0.12 || 5;
  lo -= pad; hi += pad;
  var svg = document.getElementById("devchart");
  var w = 660, h = 230, ml = 46, mr = 24, mt = 18, mb = 34;
  var pw = w-ml-mr, ph = h-mt-mb;
  function Y(v){ return mt + ph - (v-lo)/(hi-lo)*ph; }
  var out = "";
  /* 軸 */
  for (var g = 0; g <= 4; g++){
    var v = lo + (hi-lo)*g/4, y = Y(v);
    out += '<line class="grid" x1="'+ml+'" y1="'+y.toFixed(1)+'" x2="'+(w-mr)+'" y2="'+y.toFixed(1)+'"/>';
    out += '<text x="'+(ml-7)+'" y="'+(y+3.5).toFixed(1)+'" text-anchor="end">'+Math.round(v)+'</text>';
  }
  out += '<line class="axis" x1="'+ml+'" y1="'+mt+'" x2="'+ml+'" y2="'+(mt+ph)+'"/>';
  /* 平均線 */
  var ym = Y(m);
  out += '<line class="meanline" x1="'+ml+'" y1="'+ym.toFixed(1)+'" x2="'+(w-mr)+'" y2="'+ym.toFixed(1)+'"/>';
  out += '<text class="lbl" x="'+(w-mr)+'" y="'+(ym-6).toFixed(1)+'" text-anchor="end">x̄ = '+fmt(m,1)+'</text>';
  /* 離差線與點 */
  var step = pw/(a.length+1);
  a.forEach(function(v,i){
    var x = ml + step*(i+1), y = Y(v);
    out += '<line class="dev'+(v<m?' neg':'')+'" x1="'+x.toFixed(1)+'" y1="'+ym.toFixed(1)+'" x2="'+x.toFixed(1)+'" y2="'+y.toFixed(1)+'"/>';
    out += '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="4" fill="'+(v<m?'var(--accent)':'var(--flag)')+'"><title>'+v+'　離差 '+fmt(v-m,1)+'</title></circle>';
  });
  out += '<text x="'+(ml+pw/2)+'" y="'+(h-6)+'" text-anchor="middle">每一條垂直線＝該筆資料的離差 (x − x̄)　｜　'+set.name+'　n = '+a.length+'</text>';
  svg.innerHTML = out;

  var ss = a.reduce(function(t,x){ return t + (x-m)*(x-m); }, 0);
  document.getElementById("d2-stats").innerHTML =
    '<div class="s"><span class="k">平均數 x̄</span><span class="v">'+fmt(m,1)+'</span></div>' +
    '<div class="s"><span class="k">Σ(x−x̄)²</span><span class="v">'+fmt(ss,1)+'</span></div>' +
    '<div class="s"><span class="k">變異數 s²</span><span class="v">'+fmt(ss/(a.length-1),2)+'</span></div>' +
    '<div class="s hi"><span class="k">標準差 s</span><span class="v flag">'+fmt(s,2)+'</span></div>' +
    '<div class="s"><span class="k">變異係數 CV</span><span class="v acc">'+fmt(s/m*100,2)+'%</span></div>' +
    '<div class="s"><span class="k">全距 R</span><span class="v">'+(Math.max.apply(null,a)-Math.min.apply(null,a))+'</span></div>';
}
Array.prototype.forEach.call(document.querySelectorAll("[data-sd]"), function(b){
  b.addEventListener("click", function(){
    Array.prototype.forEach.call(document.querySelectorAll("[data-sd]"), function(x){ x.classList.remove("on"); });
    b.classList.add("on"); sdCur = b.dataset.sd; drawDev();
  });
});
drawDev();

/* ══════════════ 03 經驗法則 ══════════════ */
var empK = 1, empSet = "A40";
function drawEmp(){
  var a = DATA[empSet];
  var m = mean(a), s = sd(a);
  var loB = m - empK*s, hiB = m + empK*s;
  var inN = a.filter(function(x){ return x >= loB && x <= hiB; }).length;
  var lo = Math.min.apply(null,a), hi = Math.max.apply(null,a);
  var span = Math.max(hi, m+3.2*s) - Math.min(lo, m-3.2*s);
  var L = Math.min(lo, m-3.2*s), Hh = Math.max(hi, m+3.2*s);
  var w = 660, h = 210, ml = 34, mr = 24, base = 150;
  function X(v){ return ml + (v-L)/(Hh-L)*(w-ml-mr); }
  var out = "";
  /* 三層帶狀 */
  [3,2,1].forEach(function(k){
    out += '<rect class="band'+k+'" x="'+X(m-k*s).toFixed(1)+'" y="28" width="'+(X(m+k*s)-X(m-k*s)).toFixed(1)+'" height="'+(base-28)+'"/>';
  });
  /* 選定區間外框 */
  out += '<rect x="'+X(loB).toFixed(1)+'" y="28" width="'+(X(hiB)-X(loB)).toFixed(1)+'" height="'+(base-28)+
         '" fill="none" stroke="var(--flag)" stroke-width="2"/>';
  out += '<text class="mark-lbl" x="'+X(m).toFixed(1)+'" y="20" text-anchor="middle" fill="var(--flag)">x̄ ± '+empK+'s　['+fmt(loB,1)+', '+fmt(hiB,1)+']</text>';
  /* 軸 */
  out += '<line class="axis" x1="'+ml+'" y1="'+base+'" x2="'+(w-mr)+'" y2="'+base+'"/>';
  for (var g = 0; g <= 5; g++){
    var v = L + (Hh-L)*g/5, x = X(v);
    out += '<line class="grid" x1="'+x.toFixed(1)+'" y1="'+base+'" x2="'+x.toFixed(1)+'" y2="'+(base+6)+'"/>';
    out += '<text x="'+x.toFixed(1)+'" y="'+(base+20)+'" text-anchor="middle">'+Math.round(v)+'</text>';
  }
  /* 資料點 */
  var seen = {};
  a.forEach(function(v){
    var x = X(v), key = Math.round(x/6);
    seen[key] = (seen[key]||0)+1;
    var y = base - 8 - (seen[key]-1)*8;
    var inside = v >= loB && v <= hiB;
    out += '<circle cx="'+x.toFixed(1)+'" cy="'+y+'" r="3.4" fill="'+(inside?'var(--accent)':'var(--flag)')+
           '" opacity="'+(inside?0.9:1)+'"><title>'+v+'</title></circle>';
  });
  out += '<text x="'+(ml+(w-ml-mr)/2)+'" y="'+(h-6)+'" text-anchor="middle">藍點＝落在區間內　橘點＝落在區間外</text>';
  document.getElementById("empchart").innerHTML = out;

  var theory = [68, 95, 99.7][empK-1];
  var actual = inN/a.length*100;
  document.getElementById("d3-stats").innerHTML =
    '<div class="s"><span class="k">n</span><span class="v">'+a.length+'</span></div>' +
    '<div class="s"><span class="k">x̄</span><span class="v">'+fmt(m,2)+'</span></div>' +
    '<div class="s"><span class="k">s</span><span class="v">'+fmt(s,3)+'</span></div>' +
    '<div class="s hi"><span class="k">實際落入</span><span class="v flag">'+inN+' / '+a.length+'</span></div>' +
    '<div class="s"><span class="k">實測比例</span><span class="v flag">'+fmt(actual,1)+'%</span></div>' +
    '<div class="s"><span class="k">理論值</span><span class="v acc">'+theory+'%</span></div>';

  var diff = Math.abs(actual - theory);
  document.getElementById("d3-note").innerHTML =
    "實測 <strong>" + fmt(actual,1) + "%</strong> 對照理論 <strong>" + theory + "%</strong>，" +
    "相差 " + fmt(diff,1) + " 個百分點——" +
    (diff < 4 ? "非常接近，這批資料確實近似鐘形。" : "有些差距，代表這批資料的形狀離常態還有一段距離。") +
    "　柴比雪夫定理保證的下限是 " + (empK === 1 ? "（k = 1 時不適用）" : fmt(100*(1-1/(empK*empK)),1) + "%") + "。";
}
Array.prototype.forEach.call(document.querySelectorAll("[data-band]"), function(b){
  b.addEventListener("click", function(){
    Array.prototype.forEach.call(document.querySelectorAll("[data-band]"), function(x){ x.classList.remove("on"); });
    b.classList.add("on"); empK = +b.dataset.band; drawEmp();
  });
});
Array.prototype.forEach.call(document.querySelectorAll("[data-emp]"), function(b){
  b.addEventListener("click", function(){
    Array.prototype.forEach.call(document.querySelectorAll("[data-emp]"), function(x){ x.classList.remove("on"); });
    b.classList.add("on"); empSet = b.dataset.emp; drawEmp();
  });
});
drawEmp();

/* ══════════════ 04 箱型圖 ══════════════ */
var BP_PRESETS = {
  H:   DATA.H.join("  "),
  K:   DATA.K.join("  "),
  A40: DATA.A40.join("  "),
  AB:  DATA.A.join("  ") + " ;\n" + DATA.B.join("  ")
};
var bpArea = document.getElementById("bpdata");

function parseGroups(txt){
  return txt.split(";").map(function(g){
    return g.split(/[\s,，、]+/).map(function(t){ return parseFloat(t); })
            .filter(function(v){ return !isNaN(v); });
  }).filter(function(g){ return g.length > 0; });
}

function drawBox(){
  var groups = parseGroups(bpArea.value);
  var err = document.getElementById("bperr");
  if (!groups.length || groups.some(function(g){ return g.length < 4; })){
    err.textContent = "每一組至少需要 4 筆數字才畫得出箱型圖。";
    document.getElementById("boxplot").innerHTML = "";
    document.getElementById("bpfive").innerHTML = "";
    document.getElementById("d4-stats").innerHTML = "";
    document.getElementById("bpnote").innerHTML = "";
    return;
  }
  err.textContent = "";

  var all = [].concat.apply([], groups);
  var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
  var pad = (hi-lo)*0.08 || 1;
  lo -= pad; hi += pad;

  var w = 660, h = groups.length > 1 ? 230 : 190;
  var ml = 60, mr = 26, mt = 24, base = h - 44;
  function X(v){ return ml + (v-lo)/(hi-lo)*(w-ml-mr); }
  var rowH = (base-mt) / groups.length;
  var out = "";

  var stats = groups.map(function(a, gi){
    var s = a.slice().sort(function(x,y){return x-y;});
    var q1 = quantile(a,.25), q2 = median(a), q3 = quantile(a,.75), iqr = q3-q1;
    var loF = q1 - 1.5*iqr, hiF = q3 + 1.5*iqr;
    var outs = a.filter(function(v){ return v < loF || v > hiF; });
    var ins = a.filter(function(v){ return v >= loF && v <= hiF; });
    var wLo = Math.min.apply(null, ins), wHi = Math.max.apply(null, ins);

    var cy = mt + rowH*gi + rowH/2;
    var bh = Math.min(38, rowH*0.5);
    /* 柵欄 */
    out += '<line class="fence" x1="'+X(loF).toFixed(1)+'" y1="'+(cy-bh/2-8)+'" x2="'+X(loF).toFixed(1)+'" y2="'+(cy+bh/2+8)+'"/>';
    out += '<line class="fence" x1="'+X(hiF).toFixed(1)+'" y1="'+(cy-bh/2-8)+'" x2="'+X(hiF).toFixed(1)+'" y2="'+(cy+bh/2+8)+'"/>';
    /* 鬍鬚 */
    out += '<line class="whisk" x1="'+X(wLo).toFixed(1)+'" y1="'+cy+'" x2="'+X(q1).toFixed(1)+'" y2="'+cy+'"/>';
    out += '<line class="whisk" x1="'+X(q3).toFixed(1)+'" y1="'+cy+'" x2="'+X(wHi).toFixed(1)+'" y2="'+cy+'"/>';
    out += '<line class="whisk" x1="'+X(wLo).toFixed(1)+'" y1="'+(cy-8)+'" x2="'+X(wLo).toFixed(1)+'" y2="'+(cy+8)+'"/>';
    out += '<line class="whisk" x1="'+X(wHi).toFixed(1)+'" y1="'+(cy-8)+'" x2="'+X(wHi).toFixed(1)+'" y2="'+(cy+8)+'"/>';
    /* 箱子與中位數 */
    out += '<rect class="box" x="'+X(q1).toFixed(1)+'" y="'+(cy-bh/2)+'" width="'+(X(q3)-X(q1)).toFixed(1)+'" height="'+bh+'"/>';
    out += '<line class="medline" x1="'+X(q2).toFixed(1)+'" y1="'+(cy-bh/2)+'" x2="'+X(q2).toFixed(1)+'" y2="'+(cy+bh/2)+'"/>';
    /* 離群值 */
    outs.forEach(function(v){
      out += '<circle class="outlier" cx="'+X(v).toFixed(1)+'" cy="'+cy+'" r="4.5"><title>離群值 '+v+'</title></circle>';
    });
    /* 組名 */
    out += '<text class="lbl" x="'+(ml-10)+'" y="'+(cy+4)+'" text-anchor="end">第 '+(gi+1)+' 組</text>';
    return { q1:q1, q2:q2, q3:q3, iqr:iqr, loF:loF, hiF:hiF, outs:outs,
             min:s[0], max:s[s.length-1], n:a.length, mean:mean(a), sd:sd(a) };
  });

  /* 座標軸 */
  out += '<line class="axis" x1="'+ml+'" y1="'+base+'" x2="'+(w-mr)+'" y2="'+base+'"/>';
  for (var g = 0; g <= 5; g++){
    var v = lo + (hi-lo)*g/5, x = X(v);
    out += '<line class="grid" x1="'+x.toFixed(1)+'" y1="'+base+'" x2="'+x.toFixed(1)+'" y2="'+(base+6)+'"/>';
    out += '<text x="'+x.toFixed(1)+'" y="'+(base+20)+'" text-anchor="middle">'+fmt(v, Math.abs(hi-lo) > 50 ? 0 : 1)+'</text>';
  }
  out += '<text x="'+(w-mr)+'" y="'+(h-6)+'" text-anchor="end">灰虛線＝柵欄 Q1−1.5×IQR ／ Q3+1.5×IQR</text>';
  document.getElementById("boxplot").innerHTML = out;

  /* 五數綜合（只顯示第一組） */
  var f = stats[0];
  document.getElementById("bpfive").innerHTML =
    '<div><span class="k">最小值</span><span class="v">'+fmt(f.min,1)+'</span></div>' +
    '<div><span class="k">Q1</span><span class="v">'+fmt(f.q1,2)+'</span></div>' +
    '<div><span class="k">中位數</span><span class="v" style="color:var(--flag)">'+fmt(f.q2,2)+'</span></div>' +
    '<div><span class="k">Q3</span><span class="v">'+fmt(f.q3,2)+'</span></div>' +
    '<div><span class="k">最大值</span><span class="v">'+fmt(f.max,1)+'</span></div>';

  document.getElementById("d4-stats").innerHTML =
    '<div class="s"><span class="k">n</span><span class="v">'+f.n+'</span></div>' +
    '<div class="s"><span class="k">IQR</span><span class="v acc">'+fmt(f.iqr,2)+'</span></div>' +
    '<div class="s"><span class="k">下柵欄</span><span class="v">'+fmt(f.loF,2)+'</span></div>' +
    '<div class="s"><span class="k">上柵欄</span><span class="v">'+fmt(f.hiF,2)+'</span></div>' +
    '<div class="s'+(f.outs.length?' hi':'')+'"><span class="k">離群值</span><span class="v '+(f.outs.length?'flag':'')+'">'+
      (f.outs.length ? f.outs.map(function(v){return fmt(v,1);}).join(", ") : "無") + '</span></div>';

  /* 解讀 */
  var note = "";
  if (f.outs.length){
    var o = f.outs[0];
    var clean = groups[0].filter(function(v){ return f.outs.indexOf(v) < 0; });
    note = "偵測到離群值 <strong>" + fmt(o,1) + "</strong>。" +
      "移除後平均數由 <strong>" + fmt(f.mean,2) + "</strong> 變成 <strong>" + fmt(mean(clean),2) + "</strong>、" +
      "標準差由 <strong>" + fmt(f.sd,2) + "</strong> 變成 <strong>" + fmt(sd(clean),2) + "</strong>（縮為 " +
      (f.sd/sd(clean)).toFixed(1) + " 分之一），但中位數只從 " + fmt(f.q2,1) + " 變成 " + fmt(median(clean),1) + "。";
  } else {
    var pos = (f.q2 - f.q1) / f.iqr;
    note = "本組沒有離群值。中位數落在箱子的 " + fmt(pos*100,0) + "% 位置——" +
      (pos < 0.42 ? "偏左，代表右偏（正偏）。" : pos > 0.58 ? "偏右，代表左偏（負偏）。" : "接近正中央，分布大致對稱。");
  }
  document.getElementById("bpnote").innerHTML = note;
}
bpArea.addEventListener("input", drawBox);
Array.prototype.forEach.call(document.querySelectorAll("[data-bp]"), function(b){
  b.addEventListener("click", function(){
    Array.prototype.forEach.call(document.querySelectorAll("[data-bp]"), function(x){ x.classList.remove("on"); });
    b.classList.add("on");
    bpArea.value = BP_PRESETS[b.dataset.bp];
    drawBox();
  });
});
bpArea.value = BP_PRESETS.H;
drawBox();

/* ══════════════ 05 練習機 ══════════════ */
function stepHTML(list){
  var h = '<div class="steps">';
  list.forEach(function(st,i){
    h += '<div class="step"><div class="step-n">' + (st[2] || "STEP " + (i+1)) + '</div>' +
         '<div class="step-b"><h5>' + st[0] + '</h5><p>' + st[1] + '</p></div></div>';
  });
  return h + '</div>';
}
var GEN = {};

/* 練習機 1：四種集中趨勢量數 */
GEN[1] = function(){
  var ctx = pick([["吳郭魚體長","cm",1],["虱目魚體重","g",0],["石斑魚體長","cm",1],["單網次漁獲量","kg",0]]);
  var n = pick([7,9,11]);                     /* 奇數，中位數直接取中間 */
  var base = ctx[2] ? ri(120,260)/10 : ri(180,320);
  var a = [];
  for (var i = 0; i < n; i++){
    a.push(ctx[2] ? Math.round((base + ri(-35,35)/10)*10)/10 : base + ri(-40,40));
  }
  a[ri(0,n-1)] = a[0];                        /* 製造一個眾數 */
  var s = a.slice().sort(function(x,y){return x-y;});
  var m = mean(a), md = s[(n-1)/2], mo = modes(a);
  var mr = (s[0]+s[n-1])/2;
  var d = ctx[2] ? 1 : 0;
  document.getElementById("g1-q").innerHTML =
    "某研究測量 <b>" + n + "</b> 尾" + ctx[0] + "（" + ctx[1] + "）：<br><b>" + a.join("　") + "</b><br>" +
    "請計算平均數、中位數、眾數與中列數。";
  document.getElementById("g1-s").innerHTML = stepHTML([
    ["先排序（這一步最常被忘記）", '<div class="eq">' + s.join("　") + '</div>', "STEP 1"],
    ["平均數 = 總和 ÷ 個數",
     '<div class="eq">Σx = ' + fmt(a.reduce(function(t,x){return t+x;},0), d) + '　→　x̄ = ' +
     fmt(a.reduce(function(t,x){return t+x;},0), d) + ' / ' + n + ' = <b>' + fmt(m, d+2) + '</b></div>', "STEP 2"],
    ["中位數：n = " + n + " 是奇數 → 取正中間第 " + ((n+1)/2) + " 筆",
     '<div class="eq">中位數 = <b>' + fmt(md, d) + '</b></div>', "STEP 3"],
    ["眾數：出現最多次的值",
     mo.n > 1 ? '<div class="eq">' + mo.list.map(function(v){return fmt(v,d);}).join("、") + ' 各出現 ' + mo.n + ' 次　→　眾數 = <b>' + mo.list.map(function(v){return fmt(v,d);}).join("、") + '</b></div>'
              : '<div class="eq">每個值都只出現一次　→　<b>無眾數</b></div>', "STEP 4"],
    ["中列數：只用最大與最小",
     '<div class="eq">MR = (' + fmt(s[n-1],d) + ' + ' + fmt(s[0],d) + ') / 2 = <b>' + fmt(mr, d+1) + '</b></div>', "STEP 5"]
  ]);
};

/* 練習機 2：加權平均 */
GEN[2] = function(){
  var scen = pick([
    {t:"某日拍賣", u:"尾", g:["虱目魚","吳郭魚","白蝦","烏魚"], p:"元/尾"},
    {t:"某漁船漁獲", u:"尾", g:["白帶魚","小卷","赤鯮","竹筴魚"], p:"元/尾"},
    {t:"混合飼料", u:"kg", g:["魚粉","黃豆粉","小麥粉","添加劑"], p:"元/kg"}
  ]);
  var w = [], x = [];
  for (var i = 0; i < 4; i++){ w.push(ri(3,32)*10); x.push(ri(4,32)*10); }
  var sw = w.reduce(function(a,b){return a+b;},0);
  var swx = w.reduce(function(a,b,i){ return a + b*x[i]; }, 0);
  var wm = swx/sw, simple = x.reduce(function(a,b){return a+b;},0)/4;

  document.getElementById("g2-q").innerHTML =
    scen.t + "，各品項的數量與單價如下：<br>" +
    scen.g.map(function(g,i){ return g + " <b>" + w[i] + "</b> " + scen.u + " @ <b>" + x[i] + "</b> 元"; }).join("　｜　") +
    "<br>請計算加權平均單價，並與「單價的簡單平均」比較。";

  var rows = '<div class="tw"><table><thead><tr><th>品項</th><th class="num">權重 w</th><th class="num">數值 x</th><th class="num">w × x</th></tr></thead><tbody>';
  scen.g.forEach(function(g,i){
    rows += '<tr><td>'+g+'</td><td class="num">'+w[i]+'</td><td class="num">'+x[i]+'</td><td class="num">'+(w[i]*x[i])+'</td></tr>';
  });
  rows += '<tr class="total"><td>合計</td><td class="num">'+sw+'</td><td></td><td class="num">'+swx+'</td></tr></tbody></table></div>';

  document.getElementById("g2-s").innerHTML = stepHTML([
    ["認出「權重」是什麼", "題目問的是「平均每 " + scen.u + " 的單價」，所以<strong>數量就是權重 w</strong>，單價是數值 x。", "STEP 1"],
    ["逐項計算 w × x 並加總", rows, "STEP 2"],
    ["加權平均 = Σ(w × x) / Σw",
     '<div class="eq">' + swx + ' / ' + sw + ' = <b>' + fmt(wm,2) + ' ' + scen.p + '</b></div>', "STEP 3"],
    ["對照錯誤做法（單價的簡單平均）",
     '<div class="eq">(' + x.join(" + ") + ') / 4 = <b>' + fmt(simple,2) + '</b>　→　' +
     (simple > wm ? "高估" : "低估") + ' ' + fmt(Math.abs(simple-wm),2) + ' 元（' +
     fmt(Math.abs(simple-wm)/wm*100,1) + '%）</div>' +
     "簡單平均把數量最少的品項和數量最多的當成一樣重要，所以會失真。", "STEP 4"]
  ]);
};

/* 練習機 3：變異數、標準差與變異係數 */
GEN[3] = function(){
  var ctx = pick([["某養殖池魚體體重","g"],["某網次漁獲重量","kg"],["某批魚苗體長","mm"]]);
  var n = pick([6,8,10]);
  var base = ri(150,320);
  var a = [];
  for (var i = 0; i < n; i++) a.push(base + ri(-28,28));
  var sx = a.reduce(function(t,v){return t+v;},0);
  var sx2 = a.reduce(function(t,v){return t+v*v;},0);
  var m = sx/n;
  var v = (sx2 - sx*sx/n)/(n-1), s = Math.sqrt(v);

  document.getElementById("g3-q").innerHTML =
    ctx[0] + "（" + ctx[1] + "）隨機抽測 <b>" + n + "</b> 筆：<br><b>" + a.join("　") + "</b><br>" +
    "請用<b>計算公式法</b>求樣本變異數 s² 與標準差 s，並計算變異係數 CV。";

  document.getElementById("g3-s").innerHTML = stepHTML([
    ["由計算機一次取得兩個總和",
     '<div class="eq">Σx = <b>' + sx + '</b>　　Σx² = <b>' + sx2 + '</b>　　n = ' + n + '</div>', "STEP 1"],
    ["平均數", '<div class="eq">x̄ = ' + sx + ' / ' + n + ' = <b>' + fmt(m,2) + '</b></div>', "STEP 2"],
    ["代入計算公式（注意分母是 n − 1）",
     '<div class="eq">s² = [ Σx² − (Σx)²/n ] / (n − 1)</div>' +
     '<div class="eq">= [ ' + sx2 + ' − ' + fmt(sx*sx/n,1) + ' ] / ' + (n-1) + ' = ' + fmt(sx2 - sx*sx/n,1) +
     ' / ' + (n-1) + ' = <b>' + fmt(v,3) + '</b></div>', "STEP 3"],
    ["開根號求標準差", '<div class="eq">s = √' + fmt(v,3) + ' = <b>' + fmt(s,3) + ' ' + ctx[1] + '</b></div>', "STEP 4"],
    ["變異係數（無單位，可跨變數比較）",
     '<div class="eq">CV = (' + fmt(s,3) + ' / ' + fmt(m,2) + ') × 100% = <b>' + fmt(s/m*100,2) + '%</b></div>', "STEP 5"]
  ]);
};

/* 練習機 4：四分位數與離群值 */
GEN[4] = function(){
  var ctx = pick([["某養殖池體重","g"],["某批魚苗體長","mm"],["單網次漁獲量","kg"]]);
  /* n 交替：整除位置與需內插的位置各半 */
  var n = pick([11, 12, 15, 10]);
  var base = ri(200,330);
  var a = [];
  for (var i = 0; i < n; i++) a.push(base + ri(-22,22));
  var withOut = Math.random() < 0.55;
  if (withOut) a[ri(0,n-1)] = Math.random() < 0.5 ? base - ri(90,150) : base + ri(90,150);
  var s = a.slice().sort(function(x,y){return x-y;});
  var q1 = quantile(a,.25), q2 = median(a), q3 = quantile(a,.75), iqr = q3-q1;
  var loF = q1-1.5*iqr, hiF = q3+1.5*iqr;
  var outs = a.filter(function(v){ return v < loF || v > hiF; });
  var p1 = (n+1)*0.25, p3 = (n+1)*0.75;
  function posDesc(p){
    var lo = Math.floor(p), fr = p - lo;
    if (!fr) return "位置 = (" + n + "+1)(0.25) = " + p + " → 剛好整數，直接取第 " + p + " 筆";
    return "位置 = " + fmt(p,2) + " → 落在第 " + lo + " 與第 " + (lo+1) + " 筆之間，需<strong>線性內插</strong>";
  }
  function interp(p){
    var lo = Math.floor(p), fr = p - lo;
    if (!fr) return s[lo-1] + "";
    return s[lo-1] + " + " + fmt(fr,2) + " × (" + s[lo] + " − " + s[lo-1] + ") = " + fmt(s[lo-1] + fr*(s[lo]-s[lo-1]), 3);
  }

  document.getElementById("g4-q").innerHTML =
    ctx[0] + "（" + ctx[1] + "）抽測 <b>" + n + "</b> 筆，排序後為：<br><b>" + s.join("　") + "</b><br>" +
    "請求 Q1、Q2、Q3 與 IQR，計算上下柵欄並判定有無離群值。";

  document.getElementById("g4-s").innerHTML = stepHTML([
    ["Q1：" + posDesc(p1), '<div class="eq">Q1 = ' + interp(p1) + '　→　<b>' + fmt(q1,3) + '</b></div>', "STEP 1"],
    ["Q2（中位數）", '<div class="eq">Q2 = <b>' + fmt(q2,2) + '</b></div>', "STEP 2"],
    ["Q3：" + posDesc(p3).replace("0.25","0.75"), '<div class="eq">Q3 = ' + interp(p3) + '　→　<b>' + fmt(q3,3) + '</b></div>', "STEP 3"],
    ["四分位距與柵欄",
     '<div class="eq">IQR = ' + fmt(q3,3) + ' − ' + fmt(q1,3) + ' = <b>' + fmt(iqr,3) + '</b></div>' +
     '<div class="eq">下柵欄 = ' + fmt(q1,3) + ' − 1.5(' + fmt(iqr,3) + ') = <b>' + fmt(loF,3) + '</b>　　' +
     '上柵欄 = ' + fmt(q3,3) + ' + 1.5(' + fmt(iqr,3) + ') = <b>' + fmt(hiF,3) + '</b></div>', "STEP 4"],
    ["判定離群值",
     outs.length
       ? '<div class="eq">' + outs.map(function(v){ return v + (v < loF ? " < " + fmt(loF,2) : " > " + fmt(hiF,2)); }).join("　") +
         '　→　離群值：<b>' + outs.join("、") + '</b></div>' +
         "找到離群值後<strong>不可以直接刪掉</strong>，要先查原始紀錄確認是誤植、特殊個體，還是正常變異。"
       : '<div class="eq">所有資料都落在 [' + fmt(loF,2) + ', ' + fmt(hiF,2) + '] 之內　→　<b>無離群值</b></div>', "STEP 5"]
  ]);
};

Array.prototype.forEach.call(document.querySelectorAll("[data-gen]"), function(b){
  b.addEventListener("click", function(){
    var i = b.dataset.gen;
    GEN[i]();
    document.getElementById("g"+i+"-s").classList.remove("show");
    var sb = document.querySelector('[data-sol="'+i+'"]');
    if (sb) sb.textContent = "顯示計算步驟";
  });
});
Array.prototype.forEach.call(document.querySelectorAll("[data-sol]"), function(b){
  b.addEventListener("click", function(){
    var el = document.getElementById("g"+b.dataset.sol+"-s");
    b.textContent = el.classList.toggle("show") ? "隱藏計算步驟" : "顯示計算步驟";
  });
});
GEN[1](); GEN[2](); GEN[3](); GEN[4]();

})();
