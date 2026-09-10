/* ══════════════════════════════════════════════════════════════
   Lab 03　機率與機率分配（W11–W15）
   雙向表、篩檢滑桿、二項分配、常態分配、中央極限定理模擬、五台練習機
   ══════════════════════════════════════════════════════════════ */
(function () {
"use strict";

/* ─── 數學工具 ───────────────────────────────────── */
function erf(x){                       /* Abramowitz & Stegun 7.1.26 */
  var s = x < 0 ? -1 : 1; x = Math.abs(x);
  var t = 1/(1+0.3275911*x);
  var y = 1 - (((((1.061405429*t - 1.453152027)*t) + 1.421413741)*t - 0.284496736)*t + 0.254829592)*t*Math.exp(-x*x);
  return s*y;
}
function Phi(z){ return 0.5*(1+erf(z/Math.SQRT2)); }
/* 反查標準常態：Acklam 近似 */
function invPhi(p){
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  var a=[-3.969683028665376e+01,2.209460984245205e+02,-2.759285104469687e+02,1.383577518672690e+02,-3.066479806614716e+01,2.506628277459239e+00],
      b=[-5.447609879822406e+01,1.615858368580409e+02,-1.556989798598866e+02,6.680131188771972e+01,-1.328068155288572e+01],
      c=[-7.784894002430293e-03,-3.223964580411365e-01,-2.400758277161838e+00,-2.549732539343734e+00,4.374664141464968e+00,2.938163982698783e+00],
      d=[7.784695709041462e-03,3.224671290700398e-01,2.445134137142996e+00,3.754408661907416e+00];
  var pl=0.02425, q, r;
  if (p < pl){ q = Math.sqrt(-2*Math.log(p));
    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
  if (p > 1-pl){ q = Math.sqrt(-2*Math.log(1-p));
    return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
  q = p-0.5; r = q*q;
  return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q / (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
}
function comb(n,k){
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n-k);
  var r = 1;
  for (var i = 1; i <= k; i++) r = r*(n-k+i)/i;
  return Math.round(r);
}
function binomP(n,k,p){ return comb(n,k)*Math.pow(p,k)*Math.pow(1-p,n-k); }
function fmt(x,d){ if (d===undefined) d=2; return Number(x).toFixed(d); }
function ri(a,b){ return a + Math.floor(Math.random()*(b-a+1)); }
function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
function mean(a){ return a.reduce(function(s,x){return s+x;},0)/a.length; }
function sdev(a){ var m=mean(a); return Math.sqrt(a.reduce(function(s,x){return s+(x-m)*(x-m);},0)/a.length); }

/* ══════════════ 01 雙向表 ══════════════ */
var TW_SETS = {
  gear:  { r:["拖網","刺網"], c:["目標種為主","混獲為主"], v:[180,120,160,40] },
  pond:  { r:["A 池","B 池"], c:["健康","有寄生蟲"],       v:[210,90,70,30] },
  indep: { r:["上午作業","下午作業"], c:["有目標魚","無目標魚"], v:[120,80,90,60] }
};
var twIds = ["tw-a","tw-b","tw-c","tw-d"];
function twRead(){ return twIds.map(function(id){ return Math.max(0, parseInt(document.getElementById(id).value,10) || 0); }); }
function twDraw(){
  var v = twRead();
  var r1 = v[0]+v[1], r2 = v[2]+v[3], c1 = v[0]+v[2], c2 = v[1]+v[3], N = r1+r2;
  document.getElementById("tw-r1t").textContent = r1;
  document.getElementById("tw-r2t").textContent = r2;
  document.getElementById("tw-c1t").textContent = c1;
  document.getElementById("tw-c2t").textContent = c2;
  document.getElementById("tw-n").textContent = N;

  var out = document.getElementById("tw-out"), note = document.getElementById("tw-note");
  if (!N){ out.innerHTML = ""; note.textContent = "請至少填入一個大於 0 的數字。"; return; }

  var R1 = document.getElementById("tw-r1").textContent, C2 = document.getElementById("tw-c2").textContent;
  var pR1 = r1/N, pC2 = c2/N, pJ = v[1]/N;
  var pU = pR1 + pC2 - pJ;
  var pCond = r1 ? v[1]/r1 : 0;
  var pCond2 = r2 ? v[3]/r2 : 0;

  out.innerHTML =
    '<div class="p"><span class="n">P(' + R1 + ')</span><span class="val">' + fmt(pR1,4) + '</span></div>' +
    '<div class="p"><span class="n">P(' + C2 + ')</span><span class="val">' + fmt(pC2,4) + '</span></div>' +
    '<div class="p"><span class="n">P(' + R1 + ' ∩ ' + C2 + ')</span><span class="val">' + fmt(pJ,4) + '</span></div>' +
    '<div class="p"><span class="n">P(' + R1 + ' ∪ ' + C2 + ')</span><span class="val">' + fmt(pU,4) + '</span></div>' +
    '<div class="p hi"><span class="n">P(' + C2 + ' | ' + R1 + ')</span><span class="val">' + fmt(pCond,4) + '</span></div>' +
    '<div class="p"><span class="n">P(' + C2 + ' | ' + document.getElementById("tw-r2").textContent + ')</span><span class="val">' + fmt(pCond2,4) + '</span></div>';

  var indep = Math.abs(pCond - pC2) < 0.005;
  note.innerHTML =
    "加法規則：" + fmt(pR1,4) + " + " + fmt(pC2,4) + " − " + fmt(pJ,4) + " = <strong>" + fmt(pU,4) + "</strong>。<br>" +
    "獨立性判定：P(" + C2 + ") = " + fmt(pC2,4) + "　vs　P(" + C2 + "|" + R1 + ") = " + fmt(pCond,4) + "　→　<strong>" +
    (indep ? "兩者相等，可視為獨立" : "兩者不等，<em>不獨立</em>") + "</strong>" +
    (indep ? "。" : "——知道是「" + R1 + "」就能改變你對「" + C2 + "」的預期。");
}
twIds.forEach(function(id){ document.getElementById(id).addEventListener("input", twDraw); });
Array.prototype.forEach.call(document.querySelectorAll("[data-tw]"), function(b){
  b.addEventListener("click", function(){
    Array.prototype.forEach.call(document.querySelectorAll("[data-tw]"), function(x){ x.classList.remove("on"); });
    b.classList.add("on");
    var s = TW_SETS[b.dataset.tw];
    document.getElementById("tw-r1").textContent = s.r[0];
    document.getElementById("tw-r2").textContent = s.r[1];
    document.getElementById("tw-c1").textContent = s.c[0];
    document.getElementById("tw-c2").textContent = s.c[1];
    twIds.forEach(function(id,i){ document.getElementById(id).value = s.v[i]; });
    twDraw();
  });
});
twIds.forEach(function(id,i){ document.getElementById(id).value = TW_SETS.gear.v[i]; });
twDraw();

/* ══════════════ 02 篩檢 ══════════════ */
var GRID_N = 2000;      /* 與講義的範例同基數，四格恰為 90/10/1805/95 */
function screenDraw(){
  var prev = +document.getElementById("in-prev").value / 100;
  var sens = +document.getElementById("in-sens").value / 100;
  var spec = +document.getElementById("in-spec").value / 100;
  document.getElementById("v-prev").textContent = fmt(prev*100,1) + "%";
  document.getElementById("v-sens").textContent = Math.round(sens*100) + "%";
  document.getElementById("v-spec").textContent = Math.round(spec*100) + "%";

  var D = Math.round(GRID_N*prev), Hn = GRID_N - D;
  var TP = Math.round(D*sens), FN = D - TP;
  var TN = Math.round(Hn*spec), FP = Hn - TN;
  var pos = TP + FP, neg = TN + FN;
  /* PPV / NPV 由未取整的比例算，避免點陣圖的四捨五入讓數字與講義對不上 */
  var eTP = prev*sens, eFN = prev*(1-sens), eTN = (1-prev)*spec, eFP = (1-prev)*(1-spec);
  var ppv = (eTP+eFP) ? eTP/(eTP+eFP) : 0;
  var npv = (eTN+eFN) ? eTN/(eTN+eFN) : 0;

  /* 點陣圖：TP → FP → FN → TN 依序排列，一眼看出偽陽性有多少 */
  var cells = [];
  function push(cls, n){ for (var i = 0; i < n; i++) cells.push('<i class="'+cls+'"></i>'); }
  push("dg-tp", TP); push("dg-fp", FP); push("dg-fn", FN); push("dg-tn", TN);
  document.getElementById("dotgrid").innerHTML = cells.join("");

  document.getElementById("fourbox").innerHTML =
    '<div class="c tp"><span class="t">真陽性 TP（有病・陽性）</span><span class="n">'+TP+'</span></div>' +
    '<div class="c"><span class="t">偽陰性 FN（有病・陰性）</span><span class="n">'+FN+'</span></div>' +
    '<div class="c fp"><span class="t">偽陽性 FP（沒病・陽性）</span><span class="n">'+FP+'</span></div>' +
    '<div class="c"><span class="t">真陰性 TN（沒病・陰性）</span><span class="n">'+TN+'</span></div>';

  document.getElementById("scr-out").innerHTML =
    '<div class="p"><span class="n">實際患病</span><span class="val">'+D+' / '+GRID_N.toLocaleString()+'</span></div>' +
    '<div class="p"><span class="n">檢驗陽性總數</span><span class="val">'+pos+'</span></div>' +
    '<div class="p hi"><span class="n">陽性預測值 PPV</span><span class="val">'+fmt(ppv*100,1)+'%</span></div>' +
    '<div class="p"><span class="n">陰性預測值 NPV</span><span class="val">'+fmt(npv*100,2)+'%</span></div>';

  var note = document.getElementById("scr-note");
  if (!pos){ note.textContent = "在這組參數下沒有任何陽性結果。"; return; }
  note.innerHTML =
    "檢驗出 <strong>" + pos + "</strong> 個陽性，其中真正患病的只有 <strong>" + TP + "</strong> 個——" +
    "所以驗出陽性、真的有病的機率是 <strong>" + fmt(ppv*100,1) + "%</strong>。" +
    (FP > TP
      ? "　<em>偽陽性（" + FP + "）比真陽性（" + TP + "）還多</em>，因為健康的族群實在太大了。"
      : "　真陽性多於偽陽性，這組參數下的陽性結果相對可信。");
}
["in-prev","in-sens","in-spec"].forEach(function(id){
  document.getElementById(id).addEventListener("input", screenDraw);
});
screenDraw();

/* ══════════════ 03 二項分配 ══════════════ */
function binDraw(){
  var n = +document.getElementById("in-n").value;
  var p = +document.getElementById("in-p").value;
  var xs = document.getElementById("in-x");
  xs.max = n;
  if (+xs.value > n) xs.value = n;
  var xh = +xs.value;
  document.getElementById("v-n").textContent = n;
  document.getElementById("v-p").textContent = fmt(p,2);
  document.getElementById("v-x").textContent = xh;

  var probs = [];
  for (var k = 0; k <= n; k++) probs.push(binomP(n,k,p));
  var maxP = Math.max.apply(null, probs);
  var mu = n*p, sg = Math.sqrt(n*p*(1-p));

  /* 長條圖 */
  var W = 660, H = 250, ml = 46, mr = 20, mt = 20, mb = 42;
  var pw = W-ml-mr, ph = H-mt-mb;
  var s = "";
  for (var g = 0; g <= 4; g++){
    var v = maxP*g/4, y = mt + ph - (v/maxP)*ph;
    s += '<line class="grid" x1="'+ml+'" y1="'+y.toFixed(1)+'" x2="'+(W-mr)+'" y2="'+y.toFixed(1)+'"/>';
    s += '<text x="'+(ml-7)+'" y="'+(y+3.5).toFixed(1)+'" text-anchor="end">'+fmt(v,3)+'</text>';
  }
  var bw = pw/(n+1);
  probs.forEach(function(pr,k){
    var bh = (pr/maxP)*ph, x = ml + k*bw;
    s += '<rect class="bar'+(k===xh?" hl":"")+'" x="'+(x+0.6).toFixed(1)+'" y="'+(mt+ph-bh).toFixed(1)+
         '" width="'+Math.max(bw-1.2,1).toFixed(1)+'" height="'+bh.toFixed(1)+
         '"><title>P(X='+k+') = '+fmt(pr,4)+'</title></rect>';
  });
  /* 平均數標線 */
  var xmu = ml + (mu+0.5)*bw;
  s += '<line class="meanline" x1="'+xmu.toFixed(1)+'" y1="'+mt+'" x2="'+xmu.toFixed(1)+'" y2="'+(mt+ph)+'"/>';
  s += '<text class="lbl" x="'+xmu.toFixed(1)+'" y="'+(mt-6)+'" text-anchor="middle">μ = '+fmt(mu,2)+'</text>';
  /* x 軸標籤（依 n 疏密調整） */
  var stepK = n <= 20 ? 1 : n <= 40 ? 2 : 5;
  for (var k2 = 0; k2 <= n; k2 += stepK){
    s += '<text x="'+(ml+k2*bw+bw/2).toFixed(1)+'" y="'+(mt+ph+15)+'" text-anchor="middle">'+k2+'</text>';
  }
  s += '<line class="axis" x1="'+ml+'" y1="'+(mt+ph)+'" x2="'+(W-mr)+'" y2="'+(mt+ph)+'"/>';
  s += '<text x="'+(ml+pw/2)+'" y="'+(H-6)+'" text-anchor="middle">成功次數 x　（橘色為你標示的 x = '+xh+'）</text>';
  document.getElementById("binchart").innerHTML = s;

  var cum = 0; for (var k3 = 0; k3 <= xh; k3++) cum += probs[k3];
  document.getElementById("bin-out").innerHTML =
    '<div class="p hi"><span class="n">P(X = '+xh+')</span><span class="val">'+fmt(probs[xh],4)+'</span></div>' +
    '<div class="p"><span class="n">P(X ≤ '+xh+')</span><span class="val">'+fmt(cum,4)+'</span></div>' +
    '<div class="p"><span class="n">P(X ≥ 1)</span><span class="val">'+fmt(1-probs[0],4)+'</span></div>' +
    '<div class="p"><span class="n">平均數 μ = np</span><span class="val">'+fmt(mu,2)+'</span></div>' +
    '<div class="p"><span class="n">標準差 σ = √(npq)</span><span class="val">'+fmt(sg,3)+'</span></div>';

  /* 前幾項機率表 */
  var lim = Math.min(n, 8);
  var t = '<table><thead><tr><th>x</th>';
  for (var i = 0; i <= lim; i++) t += '<th>'+i+'</th>';
  t += '</tr></thead><tbody><tr class="'+(xh<=lim?"":"")+'"><td>P(X=x)</td>';
  for (var i2 = 0; i2 <= lim; i2++) t += '<td'+(i2===xh?' style="color:var(--flag);font-weight:700"':'')+'>'+fmt(probs[i2],4)+'</td>';
  t += '</tr></tbody></table>';
  document.getElementById("bin-tbl").innerHTML = t;

  var peak = probs.indexOf(maxP);
  document.getElementById("bin-note").innerHTML =
    "最高點落在 x = <strong>" + peak + "</strong>，就在期望值 μ = np = " + fmt(mu,2) + " 附近。" +
    (p < 0.45 ? "　p < 0.5，分配<strong>右偏</strong>。" :
     p > 0.55 ? "　p > 0.5，分配<strong>左偏</strong>。" :
                "　p 接近 0.5，分配<strong>幾乎對稱</strong>——已經很像鐘形了。") +
    (n*p >= 5 && n*(1-p) >= 5
      ? "　np = " + fmt(n*p,1) + "、nq = " + fmt(n*(1-p),1) + " 都 ≥ 5，可以用常態近似（第 16 週）。"
      : "　np = " + fmt(n*p,1) + "、nq = " + fmt(n*(1-p),1) + "，<em>還不能</em>用常態近似。");
}
["in-n","in-p","in-x"].forEach(function(id){ document.getElementById(id).addEventListener("input", binDraw); });
binDraw();

/* ══════════════ 04 常態分配 ══════════════ */
var nmMode = "lt";
function normDraw(){
  var mu = +document.getElementById("in-mu").value;
  var sg = +document.getElementById("in-sg").value;
  var a  = +document.getElementById("in-a").value;
  var b  = +document.getElementById("in-b").value;
  document.getElementById("v-mu").textContent = mu;
  document.getElementById("v-sg").textContent = sg;
  document.getElementById("v-a").textContent = a;
  document.getElementById("v-b").textContent = b;
  document.getElementById("wrap-b").style.display = nmMode === "bt" ? "" : "none";

  var lo = mu - 4*sg, hi = mu + 4*sg;
  var W = 660, H = 230, ml = 40, mr = 24, mt = 20, mb = 40;
  var pw = W-ml-mr, ph = H-mt-mb;
  function X(v){ return ml + (v-lo)/(hi-lo)*pw; }
  function pdf(v){ return Math.exp(-0.5*Math.pow((v-mu)/sg,2)); }
  function Y(d){ return mt + ph - d*ph*0.92; }

  var s = "", pts = [], N = 160;
  for (var i = 0; i <= N; i++){
    var v = lo + (hi-lo)*i/N;
    pts.push([X(v), Y(pdf(v))]);
  }
  /* 塗色區域 */
  var loS, hiS;
  if (nmMode === "lt"){ loS = lo; hiS = a; }
  else if (nmMode === "gt"){ loS = a; hiS = hi; }
  else { loS = Math.min(a,b); hiS = Math.max(a,b); }
  var shade = "M " + X(loS).toFixed(1) + " " + (mt+ph);
  for (var j = 0; j <= N; j++){
    var v2 = loS + (hiS-loS)*j/N;
    shade += " L " + X(v2).toFixed(1) + " " + Y(pdf(v2)).toFixed(1);
  }
  shade += " L " + X(hiS).toFixed(1) + " " + (mt+ph) + " Z";
  s += '<path class="shade" d="'+shade+'"/>';
  s += '<polyline class="curve" points="'+pts.map(function(p){return p[0].toFixed(1)+","+p[1].toFixed(1);}).join(" ")+'"/>';

  /* 切線 */
  s += '<line class="vline" x1="'+X(a).toFixed(1)+'" y1="'+mt+'" x2="'+X(a).toFixed(1)+'" y2="'+(mt+ph)+'"/>';
  s += '<text class="lbl" x="'+X(a).toFixed(1)+'" y="'+(mt-5)+'" text-anchor="middle" fill="var(--flag)">a = '+a+'</text>';
  if (nmMode === "bt"){
    s += '<line class="vline" x1="'+X(b).toFixed(1)+'" y1="'+mt+'" x2="'+X(b).toFixed(1)+'" y2="'+(mt+ph)+'"/>';
    s += '<text class="lbl" x="'+X(b).toFixed(1)+'" y="'+(mt-5)+'" text-anchor="middle" fill="var(--flag)">b = '+b+'</text>';
  }
  /* 軸與 σ 刻度 */
  s += '<line class="axis" x1="'+ml+'" y1="'+(mt+ph)+'" x2="'+(W-mr)+'" y2="'+(mt+ph)+'"/>';
  for (var k = -3; k <= 3; k++){
    var v3 = mu + k*sg, x3 = X(v3);
    s += '<line class="grid" x1="'+x3.toFixed(1)+'" y1="'+(mt+ph)+'" x2="'+x3.toFixed(1)+'" y2="'+(mt+ph+5)+'"/>';
    s += '<text x="'+x3.toFixed(1)+'" y="'+(mt+ph+17)+'" text-anchor="middle">'+Math.round(v3)+'</text>';
    s += '<text x="'+x3.toFixed(1)+'" y="'+(mt+ph+29)+'" text-anchor="middle" opacity="0.7">'+(k>0?"+"+k:k)+'σ</text>';
  }
  document.getElementById("normchart").innerHTML = s;

  /* 機率 */
  var za = (a-mu)/sg, zb = (b-mu)/sg, prob, expr;
  if (nmMode === "lt"){ prob = Phi(za); expr = "P(X < "+a+") = P(Z < "+fmt(za,2)+")"; }
  else if (nmMode === "gt"){ prob = 1-Phi(za); expr = "P(X > "+a+") = 1 − P(Z < "+fmt(za,2)+")"; }
  else {
    var z1 = Math.min(za,zb), z2 = Math.max(za,zb);
    prob = Phi(z2)-Phi(z1);
    expr = "P("+Math.min(a,b)+" < X < "+Math.max(a,b)+") = P("+fmt(z1,2)+" < Z < "+fmt(z2,2)+")";
  }
  document.getElementById("nm-out").innerHTML =
    '<div class="p"><span class="n">z 值 (a)</span><span class="val">'+fmt(za,3)+'</span></div>' +
    (nmMode==="bt" ? '<div class="p"><span class="n">z 值 (b)</span><span class="val">'+fmt(zb,3)+'</span></div>' : '') +
    '<div class="p hi"><span class="n">機率</span><span class="val">'+fmt(prob,4)+'</span></div>' +
    '<div class="p"><span class="n">佔百分比</span><span class="val">'+fmt(prob*100,2)+'%</span></div>';

  var p10 = mu + 1.28*sg, p05 = mu - 1.645*sg;
  document.getElementById("nm-note").innerHTML =
    "<strong>" + expr + " = " + fmt(prob,4) + "</strong>（塗色面積就是這個機率）。<br>" +
    "反向查表練習：最大的 10% 門檻在 <strong>" + fmt(p10,1) + "</strong>（z = 1.28）；" +
    "最小的 5% 門檻在 <strong>" + fmt(p05,1) + "</strong>（z = −1.645）。";
}
["in-mu","in-sg","in-a","in-b"].forEach(function(id){ document.getElementById(id).addEventListener("input", normDraw); });
Array.prototype.forEach.call(document.querySelectorAll("[data-nm]"), function(b){
  b.addEventListener("click", function(){
    Array.prototype.forEach.call(document.querySelectorAll("[data-nm]"), function(x){ x.classList.remove("on"); });
    b.classList.add("on"); nmMode = b.dataset.nm; normDraw();
  });
});
normDraw();

/* ══════════════ 05 中央極限定理模擬器 ══════════════ */
var POPS = {
  skew:    { name:"右偏母體",  gen:function(){ return 180 + Math.pow(Math.random(),2.6)*260; } },
  bimodal: { name:"雙峰母體",  gen:function(){ return Math.random()<0.5 ? 210+Math.random()*50 : 330+Math.random()*50; } },
  uniform: { name:"均勻母體",  gen:function(){ return 190 + Math.random()*200; } },
  normal:  { name:"常態母體",  gen:function(){
              var u=1-Math.random(), v=Math.random();
              return 290 + Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)*38; } }
};
var popCur = "skew", popSample = [], xbars = [];

function genPop(){
  popSample = [];
  for (var i = 0; i < 6000; i++) popSample.push(POPS[popCur].gen());
}
function hist(data, svgId, cls, forceRange){
  var lo = forceRange ? forceRange[0] : Math.min.apply(null, data);
  var hi = forceRange ? forceRange[1] : Math.max.apply(null, data);
  if (hi - lo < 1e-9) hi = lo + 1;
  var bins = 34, cnt = new Array(bins).fill(0);
  data.forEach(function(v){
    var b = Math.floor((v-lo)/(hi-lo)*bins);
    if (b < 0) b = 0; if (b >= bins) b = bins-1;
    cnt[b]++;
  });
  var mx = Math.max.apply(null, cnt) || 1;
  var W = 400, H = 200, ml = 30, mr = 12, mt = 12, mb = 30;
  var pw = W-ml-mr, ph = H-mt-mb;
  var bw = pw/bins, s = "";
  cnt.forEach(function(c,i){
    var bh = c/mx*ph;
    s += '<rect class="'+cls+'" x="'+(ml+i*bw+0.4).toFixed(1)+'" y="'+(mt+ph-bh).toFixed(1)+
         '" width="'+(bw-0.8).toFixed(1)+'" height="'+bh.toFixed(1)+'"/>';
  });
  s += '<line class="axis" x1="'+ml+'" y1="'+(mt+ph)+'" x2="'+(W-mr)+'" y2="'+(mt+ph)+'"/>';
  for (var g = 0; g <= 4; g++){
    var v = lo + (hi-lo)*g/4, x = ml + pw*g/4;
    s += '<text x="'+x.toFixed(1)+'" y="'+(mt+ph+15)+'" text-anchor="middle">'+Math.round(v)+'</text>';
  }
  var m = mean(data);
  var xm = ml + (m-lo)/(hi-lo)*pw;
  s += '<line class="meanline" x1="'+xm.toFixed(1)+'" y1="'+mt+'" x2="'+xm.toFixed(1)+'" y2="'+(mt+ph)+'"/>';
  document.getElementById(svgId).innerHTML = s;
  return [lo,hi];
}
function cltRedraw(){
  document.getElementById("v-cn").textContent = document.getElementById("in-cn").value;
  var range = [Math.min.apply(null,popSample), Math.max.apply(null,popSample)];
  hist(popSample, "popchart", "popbar", range);
  if (xbars.length) hist(xbars, "xbchart", "xbbar", range);
  else document.getElementById("xbchart").innerHTML =
    '<text x="200" y="100" text-anchor="middle" fill="var(--ink-3)">按「抽 1000 次」開始</text>';

  var pm = mean(popSample), ps = sdev(popSample);
  var out = document.getElementById("clt-out");
  var n = +document.getElementById("in-cn").value;
  var theorySE = ps/Math.sqrt(n);
  if (!xbars.length){
    out.innerHTML =
      '<div class="p"><span class="n">母體平均 μ</span><span class="val">'+fmt(pm,1)+'</span></div>' +
      '<div class="p"><span class="n">母體標準差 σ</span><span class="val">'+fmt(ps,1)+'</span></div>' +
      '<div class="p"><span class="n">理論標準誤 σ/√n</span><span class="val">'+fmt(theorySE,2)+'</span></div>';
    document.getElementById("clt-note").innerHTML = "兩張圖用的是<strong>同一個橫軸範圍</strong>，所以待會你會直接看到 x̄ 的分布窄很多。";
    return;
  }
  var xm2 = mean(xbars), xs = sdev(xbars);
  out.innerHTML =
    '<div class="p"><span class="n">母體平均 μ</span><span class="val">'+fmt(pm,1)+'</span></div>' +
    '<div class="p"><span class="n">x̄ 的平均</span><span class="val">'+fmt(xm2,1)+'</span></div>' +
    '<div class="p"><span class="n">母體標準差 σ</span><span class="val">'+fmt(ps,1)+'</span></div>' +
    '<div class="p hi"><span class="n">x̄ 的標準差（實測）</span><span class="val">'+fmt(xs,2)+'</span></div>' +
    '<div class="p"><span class="n">理論標準誤 σ/√n</span><span class="val">'+fmt(theorySE,2)+'</span></div>';

  document.getElementById("clt-note").innerHTML =
    "① <strong>不偏</strong>：x̄ 的平均 " + fmt(xm2,1) + " 幾乎等於母體平均 " + fmt(pm,1) + "。<br>" +
    "② <strong>標準誤</strong>：實測 " + fmt(xs,2) + " 對照理論 σ/√n = " + fmt(theorySE,2) + "——" +
    (Math.abs(xs-theorySE)/theorySE < 0.12 ? "非常吻合。" : "接近。") +
    "　x̄ 的散布只有母體的 <strong>" + fmt(ps/xs,1) + " 分之一</strong>。<br>" +
    "③ <strong>形狀</strong>：" + (n >= 30
      ? "n = " + n + " ≥ 30，右圖已經是很漂亮的鐘形——<em>不管左邊的母體多歪</em>。"
      : n >= 5
        ? "n = " + n + " 還不到 30，但右圖已經明顯比母體對稱多了。試著把 n 拉大。"
        : "n = " + n + " 太小，右圖幾乎複製了母體的形狀。把 n 拉大再抽一次。");
}
function runCLT(){
  var n = +document.getElementById("in-cn").value;
  xbars = [];
  for (var t = 0; t < 1000; t++){
    var s = 0;
    for (var i = 0; i < n; i++) s += POPS[popCur].gen();
    xbars.push(s/n);
  }
  document.getElementById("clt-status").innerHTML =
    "已完成 <b>1000</b> 次抽樣，每次抽 <b>" + n + "</b> 個（" + POPS[popCur].name + "）。";
  cltRedraw();
}
Array.prototype.forEach.call(document.querySelectorAll("[data-pop]"), function(b){
  b.addEventListener("click", function(){
    Array.prototype.forEach.call(document.querySelectorAll("[data-pop]"), function(x){ x.classList.remove("on"); });
    b.classList.add("on");
    popCur = b.dataset.pop; xbars = []; genPop();
    document.getElementById("clt-status").textContent = "已切換為「" + POPS[popCur].name + "」。按「抽 1000 次」開始。";
    cltRedraw();
  });
});
document.getElementById("in-cn").addEventListener("input", function(){
  document.getElementById("v-cn").textContent = this.value;
});
document.getElementById("clt-run").addEventListener("click", runCLT);
document.getElementById("clt-clear").addEventListener("click", function(){
  xbars = [];
  document.getElementById("clt-status").textContent = "已清空。按「抽 1000 次」重新開始。";
  cltRedraw();
});
genPop(); cltRedraw();

/* ══════════════ 06 練習機 ══════════════ */
function stepHTML(list){
  var h = '<div class="steps">';
  list.forEach(function(st,i){
    h += '<div class="step"><div class="step-n">' + (st[2] || "STEP " + (i+1)) + '</div>' +
         '<div class="step-b"><h5>' + st[0] + '</h5><p>' + st[1] + '</p></div></div>';
  });
  return h + '</div>';
}
var GEN = {};

/* 1 雙向表 */
GEN[1] = function(){
  var sc = pick([
    {r:["拖網","刺網"], c:["目標種","混獲"], u:"網次", t:"某漁區作業紀錄"},
    {r:["A 池","B 池"], c:["健康","罹病"],  u:"尾",   t:"某養殖場健檢結果"},
    {r:["上午","下午"], c:["有漁獲","無漁獲"], u:"航次", t:"某漁船作業紀錄"}
  ]);
  var a = ri(6,26)*10, b = ri(3,18)*10, c = ri(5,22)*10, d = ri(2,14)*10;
  var r1 = a+b, r2 = c+d, c1 = a+c, c2 = b+d, N = r1+r2;
  document.getElementById("g1-q").innerHTML =
    sc.t + "共 <b>" + N + "</b> " + sc.u + "：<br>" +
    sc.r[0] + "：" + sc.c[0] + " <b>" + a + "</b>、" + sc.c[1] + " <b>" + b + "</b>　｜　" +
    sc.r[1] + "：" + sc.c[0] + " <b>" + c + "</b>、" + sc.c[1] + " <b>" + d + "</b><br>" +
    "求 P(" + sc.r[0] + ")、P(" + sc.c[1] + ")、P(" + sc.r[0] + " ∩ " + sc.c[1] + ")、" +
    "P(" + sc.r[0] + " ∪ " + sc.c[1] + ")、P(" + sc.c[1] + " | " + sc.r[0] + ")，並判斷是否獨立。";

  var pR = r1/N, pC = c2/N, pJ = b/N, pU = pR+pC-pJ, pCd = b/r1;
  document.getElementById("g1-s").innerHTML = stepHTML([
    ["先把雙向表補完整（含合計欄列）",
     '<div class="eq">' + sc.r[0] + ' 合計 = ' + a + ' + ' + b + ' = <b>' + r1 + '</b>　　' +
     sc.r[1] + ' 合計 = <b>' + r2 + '</b>　　' + sc.c[1] + ' 合計 = <b>' + c2 + '</b>　　總計 = <b>' + N + '</b></div>', "STEP 1"],
    ["邊際機率：看合計欄列",
     '<div class="eq">P(' + sc.r[0] + ') = ' + r1 + '/' + N + ' = <b>' + fmt(pR,4) + '</b>　　' +
     'P(' + sc.c[1] + ') = ' + c2 + '/' + N + ' = <b>' + fmt(pC,4) + '</b></div>', "STEP 2"],
    ["聯合機率：直接看交叉格",
     '<div class="eq">P(' + sc.r[0] + ' ∩ ' + sc.c[1] + ') = ' + b + '/' + N + ' = <b>' + fmt(pJ,4) + '</b></div>', "STEP 3"],
    ["加法規則（重疊的那格被算了兩次，要減掉）",
     '<div class="eq">' + fmt(pR,4) + ' + ' + fmt(pC,4) + ' − ' + fmt(pJ,4) + ' = <b>' + fmt(pU,4) + '</b></div>' +
     '驗算：直接數 ' + a + ' + ' + b + ' + ' + d + ' = ' + (a+b+d) + ' → ' + (a+b+d) + '/' + N + ' = ' + fmt((a+b+d)/N,4) + ' ✓', "STEP 4"],
    ["條件機率：樣本空間縮小成 " + sc.r[0] + " 的 " + r1 + " " + sc.u,
     '<div class="eq">P(' + sc.c[1] + '|' + sc.r[0] + ') = ' + b + '/' + r1 + ' = <b>' + fmt(pCd,4) + '</b></div>' +
     '獨立性：P(' + sc.c[1] + ') = ' + fmt(pC,4) + ' vs P(' + sc.c[1] + '|' + sc.r[0] + ') = ' + fmt(pCd,4) +
     ' → <b>' + (Math.abs(pC-pCd) < 0.005 ? "相等，獨立" : "不相等，不獨立") + '</b>', "STEP 5"]
  ]);
};

/* 2 篩檢 */
GEN[2] = function(){
  var sc = pick(["魚病","白點病","弧菌感染","寄生蟲感染"]);
  var prev = pick([0.01,0.02,0.04,0.05,0.08,0.10]);
  var sens = pick([0.85,0.90,0.95,0.98]);
  var spec = pick([0.85,0.90,0.92,0.95]);
  var N = 10000;
  var D = Math.round(N*prev), Hn = N-D;
  var TP = Math.round(D*sens), FN = D-TP, TN = Math.round(Hn*spec), FP = Hn-TN;
  var ppv = TP/(TP+FP), npv = TN/(TN+FN);

  document.getElementById("g2-q").innerHTML =
    "某養殖區" + sc + "的盛行率為 <b>" + fmt(prev*100,0) + "%</b>。<br>" +
    "檢驗試劑：敏感度 <b>" + fmt(sens*100,0) + "%</b>、特異度 <b>" + fmt(spec*100,0) + "%</b>。<br>" +
    "請以 " + N.toLocaleString() + " 尾為總數建立四格表，並計算陽性預測值 PPV 與陰性預測值 NPV。";

  var tbl = '<div class="tw"><table><thead><tr><th></th><th class="num">檢驗陽性</th><th class="num">檢驗陰性</th><th class="num">合計</th></tr></thead><tbody>' +
    '<tr><td>實際患病</td><td class="num">'+TP+'</td><td class="num">'+FN+'</td><td class="num">'+D+'</td></tr>' +
    '<tr><td>實際健康</td><td class="num">'+FP+'</td><td class="num">'+TN+'</td><td class="num">'+Hn+'</td></tr>' +
    '<tr class="total"><td>合計</td><td class="num">'+(TP+FP)+'</td><td class="num">'+(TN+FN)+'</td><td class="num">'+N+'</td></tr>' +
    '</tbody></table></div>';

  document.getElementById("g2-s").innerHTML = stepHTML([
    ["用盛行率把總數切成患病與健康",
     '<div class="eq">患病 = ' + N.toLocaleString() + ' × ' + fmt(prev*100,0) + '% = <b>' + D + '</b>　　健康 = <b>' + Hn + '</b></div>', "STEP 1"],
    ["患病的用敏感度切開",
     '<div class="eq">真陽性 TP = ' + D + ' × ' + fmt(sens*100,0) + '% = <b>' + TP + '</b>　　偽陰性 FN = <b>' + FN + '</b></div>', "STEP 2"],
    ["健康的用特異度切開",
     '<div class="eq">真陰性 TN = ' + Hn + ' × ' + fmt(spec*100,0) + '% = <b>' + TN + '</b>　　偽陽性 FP = <b>' + FP + '</b></div>' +
     '驗算：' + TP + ' + ' + FN + ' + ' + TN + ' + ' + FP + ' = ' + (TP+FN+TN+FP) + ' ✓', "STEP 3"],
    ["完成四格表", tbl, "STEP 4"],
    ["由表直接讀出答案",
     '<div class="eq">PPV = ' + TP + ' / (' + TP + ' + ' + FP + ') = ' + TP + '/' + (TP+FP) + ' = <b>' + fmt(ppv*100,2) + '%</b></div>' +
     '<div class="eq">NPV = ' + TN + ' / (' + TN + ' + ' + FN + ') = <b>' + fmt(npv*100,2) + '%</b></div>' +
     (FP > TP ? '偽陽性 ' + FP + ' 比真陽性 ' + TP + ' 還多——因為健康族群太大，所以 PPV 偏低。'
              : '真陽性多於偽陽性，這組參數下的陽性結果相對可信。'), "STEP 5"]
  ]);
};

/* 3 二項 */
GEN[3] = function(){
  var sc = pick([
    {t:"標識放流魚的回收", s:"回收", u:"尾"},
    {t:"魚苗的存活", s:"存活", u:"尾"},
    {t:"漁獲中雌性個體", s:"為雌性", u:"尾"},
    {t:"檢疫抽驗不合格", s:"不合格", u:"件"}
  ]);
  var n = pick([8,10,12,15,20]);
  var p = pick([0.1,0.15,0.2,0.25,0.3,0.5]);
  var x = ri(1, Math.min(5, n));
  var P = binomP(n,x,p), P0 = binomP(n,0,p);
  var mu = n*p, sg = Math.sqrt(n*p*(1-p));

  document.getElementById("g3-q").innerHTML =
    sc.t + "機率為 <b>" + p + "</b>，隨機觀察 <b>" + n + "</b> " + sc.u + "，各次互相獨立。<br>" +
    "(a) 恰好 <b>" + x + "</b> " + sc.u + sc.s + "的機率　(b) 至少 1 " + sc.u + sc.s + "的機率　(c) 平均數與標準差";

  document.getElementById("g3-s").innerHTML = stepHTML([
    ["確認四項條件與參數",
     'n 固定 = ' + n + '　只有兩種結果　每次 p = ' + p + ' 相同　各次獨立 → 是二項實驗<br>' +
     '<div class="eq">n = ' + n + '　p = ' + p + '　q = ' + fmt(1-p,2) + '　x = ' + x + '</div>', "STEP 1"],
    ["計算組合數",
     '<div class="eq">' + n + 'C' + x + ' = <b>' + comb(n,x) + '</b></div>', "STEP 2"],
    ["代入二項機率公式 P(X=x) = nCx · p^x · q^(n−x)",
     '<div class="eq">P(X=' + x + ') = ' + comb(n,x) + ' × ' + p + '^' + x + ' × ' + fmt(1-p,2) + '^' + (n-x) +
     ' = <b>' + fmt(P,4) + '</b></div>', "STEP 3"],
    ["(b)「至少 1」用餘事件最快",
     '<div class="eq">P(X ≥ 1) = 1 − P(X = 0) = 1 − ' + fmt(1-p,2) + '^' + n + ' = 1 − ' + fmt(P0,4) +
     ' = <b>' + fmt(1-P0,4) + '</b></div>不要硬加 ' + n + ' 項——算「一次都沒有」只有一項。', "STEP 4"],
    ["(c) 二項分配有現成公式",
     '<div class="eq">μ = np = ' + n + ' × ' + p + ' = <b>' + fmt(mu,2) + '</b>　　' +
     'σ = √(npq) = √' + fmt(n*p*(1-p),3) + ' = <b>' + fmt(sg,3) + '</b></div>', "STEP 5"]
  ]);
};

/* 4 常態 */
GEN[4] = function(){
  var sc = pick([
    {t:"虱目魚體重", u:"g",  mu:ri(20,32)*10, sg:pick([20,25,30,35]) },
    {t:"石斑魚體長", u:"cm", mu:ri(24,34),    sg:pick([2,3,4]) },
    {t:"魚苗體長",   u:"mm", mu:ri(70,95),    sg:pick([6,8,10]) }
  ]);
  var reverse = Math.random() < 0.4;
  if (reverse){
    var pct = pick([5,10,15,20,25]);
    var z = invPhi(1 - pct/100);
    var xv = sc.mu + z*sc.sg;
    document.getElementById("g4-q").innerHTML =
      sc.t + "服從常態分配，μ = <b>" + sc.mu + "</b> " + sc.u + "、σ = <b>" + sc.sg + "</b> " + sc.u + "。<br>" +
      "若要挑出<b>最大的 " + pct + "%</b> 作為親魚，門檻應訂在多少？　<em>（反向題）</em>";
    document.getElementById("g4-s").innerHTML = stepHTML([
      ["把「最大的 " + pct + "%」翻譯成累積機率",
       '<div class="eq">最大 ' + pct + '% → 它左邊有 ' + (100-pct) + '% → 找 P(Z < z) = ' + fmt(1-pct/100,4) + '</div>', "STEP 1"],
      ["反查 Z 表", '<div class="eq">z ≈ <b>' + fmt(z,2) + '</b></div>', "STEP 2"],
      ["由 z 還原成 x（把標準化公式反過來用）",
       '<div class="eq">x = μ + z·σ = ' + sc.mu + ' + ' + fmt(z,2) + ' × ' + sc.sg + ' = <b>' + fmt(xv,2) + ' ' + sc.u + '</b></div>', "STEP 3"],
      ["檢查合理性",
       '門檻 ' + fmt(xv,1) + ' 比平均 ' + sc.mu + ' 高 ' + fmt(xv-sc.mu,1) + ' ' + sc.u +
       '（約 ' + fmt(z,2) + ' 個標準差）——只挑最大的 ' + pct + '%，門檻本來就該在平均之上。', "STEP 4"]
    ]);
  } else {
    var a = sc.mu + pick([-2,-1.5,-1,1,1.5,2])*sc.sg;
    a = Math.round(a);
    var za = (a-sc.mu)/sc.sg;
    var gt = Math.random() < 0.5;
    document.getElementById("g4-q").innerHTML =
      sc.t + "服從常態分配，μ = <b>" + sc.mu + "</b> " + sc.u + "、σ = <b>" + sc.sg + "</b> " + sc.u + "。<br>" +
      "隨機抽出一尾，求體" + (sc.u==="g"?"重":"長") + (gt?"<b>超過</b>":"<b>低於</b>") + " <b>" + a + "</b> " + sc.u + " 的機率。　<em>（正向題）</em>";
    document.getElementById("g4-s").innerHTML = stepHTML([
      ["標準化",
       '<div class="eq">z = (x − μ) / σ = (' + a + ' − ' + sc.mu + ') / ' + sc.sg + ' = <b>' + fmt(za,2) + '</b></div>', "STEP 1"],
      ["查 Z 表（表給的是左側累積機率）",
       '<div class="eq">P(Z < ' + fmt(za,2) + ') = <b>' + fmt(Phi(za),4) + '</b></div>', "STEP 2"],
      [gt ? "題目要「超過」，所以用 1 減掉" : "題目要「低於」，查到的就是答案",
       '<div class="eq">' + (gt ? "P(X > " + a + ") = 1 − " + fmt(Phi(za),4) + " = <b>" + fmt(1-Phi(za),4) + "</b>"
                                : "P(X < " + a + ") = <b>" + fmt(Phi(za),4) + "</b>") + '</div>' +
       '約 <b>' + fmt((gt?1-Phi(za):Phi(za))*100,1) + '%</b>', "STEP 3"]
    ]);
  }
};

/* 5 中央極限定理 */
GEN[5] = function(){
  var sc = pick([
    {t:"虱目魚體重", u:"g",  mu:ri(22,30)*10, sg:pick([24,30,36,48]) },
    {t:"石斑魚體長", u:"cm", mu:ri(26,32),    sg:pick([2.4,3.6,4.8]) }
  ]);
  var n = pick([4,9,16,25,36,64,100]);
  var se = sc.sg/Math.sqrt(n);
  var askMean = Math.random() < 0.65;
  var zPick = pick([1,1.5,2,-1,-1.5,-2]);
  var val = askMean ? sc.mu + zPick*se : sc.mu + zPick*sc.sg;
  val = Math.round(val*10)/10;
  var z = askMean ? (val-sc.mu)/se : (val-sc.mu)/sc.sg;
  var p = 1-Phi(z);

  document.getElementById("g5-q").innerHTML =
    sc.t + "：μ = <b>" + sc.mu + "</b> " + sc.u + "、σ = <b>" + sc.sg + "</b> " + sc.u + "。<br>" +
    (askMean
      ? "隨機抽取 <b>" + n + "</b> 尾，求其<b>平均</b>體" + (sc.u==="g"?"重":"長") + "超過 <b>" + val + "</b> " + sc.u + " 的機率。"
      : "隨機抽取 <b>一尾</b>，求其體" + (sc.u==="g"?"重":"長") + "超過 <b>" + val + "</b> " + sc.u + " 的機率。") +
    "<br><em>先想清楚：分母該用 σ 還是 σ/√n？</em>";

  document.getElementById("g5-s").innerHTML = stepHTML([
    [askMean ? "問的是「n 尾的平均」→ 要用標準誤" : "問的是「一尾」→ 直接用 σ",
     askMean
       ? '<div class="eq">SE = σ/√n = ' + sc.sg + '/√' + n + ' = ' + sc.sg + '/' + Math.sqrt(n) + ' = <b>' + fmt(se,3) + '</b></div>' +
         'x̄ ~ N(' + sc.mu + ', ' + fmt(se,2) + '²)'
       : '<div class="eq">單一個體用母體標準差 σ = <b>' + sc.sg + '</b></div>', "STEP 1"],
    ["標準化",
     '<div class="eq">z = (' + val + ' − ' + sc.mu + ') / ' + (askMean ? fmt(se,3) : sc.sg) +
     ' = <b>' + fmt(z,2) + '</b></div>', "STEP 2"],
    ["查表求機率",
     '<div class="eq">P(Z < ' + fmt(z,2) + ') = ' + fmt(Phi(z),4) + '　→　P(' + (askMean?"x̄":"X") + ' > ' + val +
     ') = 1 − ' + fmt(Phi(z),4) + ' = <b>' + fmt(p,4) + '</b></div>', "STEP 3"],
    ["對照：同一個切點，另一種問法的答案",
     (function(){
        var other = askMean ? (val-sc.mu)/sc.sg : (val-sc.mu)/se;
        return '若改問「' + (askMean ? "隨機一尾" : n + " 尾的平均") + '」，z 會變成 ' + fmt(other,2) +
               '，機率 = <b>' + fmt(1-Phi(other),4) + '</b>。<br>' +
               '同一個切點，兩種問法差了 ' + fmt(Math.max(p,1-Phi(other))/Math.max(Math.min(p,1-Phi(other)),1e-6),1) +
               ' 倍——<em>因為平均數會把極端值抵消掉</em>。';
     })(), "重點"]
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
GEN[1](); GEN[2](); GEN[3](); GEN[4](); GEN[5]();

})();
