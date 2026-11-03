#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""V5.3：导出清晰度可视化
   1) 预览图上叠加实时倍率徽标（导出尺寸 + 放大系数 + 清晰度判定）
   2) 1:1 像素检视面板：按当前导出倍率渲染整张，1:1 像素显示，可滚动
   3) 同区域 1:1 对比：1× 与当前倍率同一画面区域放一起，肉眼比软硬
   4) 建议原图最低像素阈值 + 「自动选最大无损倍率」一键切换
   5) 倍率 chip 上标出哪些会糊
"""
import pathlib
import sys

P = pathlib.Path(__file__).parent
F = P / 'index.html'
s = F.read_text(encoding='utf-8')


def sub(old, new, cnt=1):
    global s
    assert old in s, 'NOT FOUND:\n' + old[:300]
    s = s.replace(old, new, cnt)


# ================================================================ 1. CSS
sub(""".scaleq .ok{color:#12a150;font-weight:700}""",
    """.scaleq .ok{color:#12a150;font-weight:700}
.pxbtns{display:flex;gap:7px;margin-top:9px;flex-wrap:wrap}
.pxbtns .sbtn{flex:1 1 auto;text-align:center}
.pxpanel{margin-top:10px;border-top:1px dashed var(--line);padding-top:10px}
.pxpanel[hidden]{display:none}
.pxinfo{font-size:11px;color:var(--muted);line-height:1.6;margin-bottom:7px}
.pxinfo b{color:var(--txt2)}
.pxwrap{max-height:300px;overflow:auto;background:var(--thumb-bg);border:1px solid var(--line);border-radius:6px}
.pxwrap canvas{display:block}
.pxcmp{display:flex;gap:9px;margin-top:9px;flex-wrap:wrap}
.pxcmp figure{margin:0;flex:0 0 auto}
.pxcmp canvas{border:1px solid var(--line);border-radius:4px;display:block;background:var(--thumb-bg)}
.pxcmp figcaption{font-size:10px;color:var(--muted);margin-top:4px;text-align:center}
.chip.unsafe{border-color:#f0b49a}
.chip.unsafe b{color:#c2410c}
.chip .wmark{font-size:10px;color:#c2410c;font-weight:700;margin-left:3px}""")

# ================================================================ 2. HTML
sub("""          <div class="scalebox">
            <div class="st">导出清晰度</div>
            <div class="chips" id="scales"></div>
            <div class="scaleq" id="scaleQ"></div>
          </div>""",
    """          <div class="scalebox">
            <div class="st">导出清晰度</div>
            <div class="chips" id="scales"></div>
            <div class="scaleq" id="scaleQ"></div>
            <div class="pxbtns">
              <button class="sbtn" id="pxInspect">🔍 像素检视</button>
              <button class="sbtn" id="pxSafe">⚡ 选最大无损倍率</button>
            </div>
            <div class="pxpanel" id="pxPanel" hidden>
              <div class="pxinfo" id="pxInfo"></div>
              <div class="pxwrap"><canvas id="pxCv"></canvas></div>
              <div class="pxcmp">
                <figure><canvas id="pxA" width="300" height="300"></canvas><figcaption id="pxALab">1× 导出 · 局部 1:1</figcaption></figure>
                <figure><canvas id="pxB" width="300" height="300"></canvas><figcaption id="pxBLab">当前倍率 · 同区域</figcaption></figure>
              </div>
            </div>
          </div>""")

# ================================================================ 3. JS：清晰度信息 / 徽标 / 检视
sub("""/* 导出倍率提示 */
function updateScaleQ(up){""",
    """/* ---------- v5.3 清晰度可视化 ---------- */
/* 当前倍率的清晰度档案：放大系数 / 最大无损倍率 / 建议原图像素 */
function blurProfile(){
  const m=measureBlur();
  const sc=state.exportScale;
  if(!m) return null;
  const blur=m.up*sc;
  const needW=Math.round(G().W*sc), needH=Math.round(G().H*sc);
  /* 想要不糊，选框源像素至少要等于输出像素 */
  const gapW=Math.max(0,needW-m.sw), gapH=Math.max(0,needH-m.sh);
  return {
    up:m.up, sc:sc, blur:blur,
    sw:m.sw, sh:m.sh, iw:m.iw, ih:m.ih,
    needW:needW, needH:needH,
    safe:Math.max(1,Math.floor((1/m.up)+1e-6)),   /* 最大无损倍率（只取 1/2/3） */
    needMoreW:gapW, needMoreH:gapH
  };
}

/* 预览图上的实时倍率徽标：一眼看清「导出多大 + 会不会糊」 */
function drawPvBadge(ctx,Gg){
  const sc=state.exportScale;
  const p=blurProfile();
  const blur=p?p.blur:1;
  const t1='导出 '+sc+'× · '+Math.round(Gg.W*sc)+'×'+Math.round(Gg.H*sc);
  const t2= blur>1.5 ? ('⚠ 放大系数 '+blur.toFixed(2)+' · 会发软')
            : blur>1.1 ? ('● 放大系数 '+blur.toFixed(2)+' · 略糊')
            : ('✓ 放大系数 '+blur.toFixed(2)+' · 清晰');
  const fs=42, lh=fs*1.32, pad=20;
  ctx.save();
  ctx.font='700 '+fs+'px -apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
  const w=Math.max(ctx.measureText(t1).width,ctx.measureText(t2).width)+pad*2;
  const h=lh*2+pad*1.1;
  const x=Gg.W-w-pad*0.8, y=pad*0.8;
  ctx.fillStyle='rgba(0,0,0,.66)';
  roundRectPath(ctx,x,y,w,h,16); ctx.fill();
  ctx.textBaseline='top'; ctx.fillStyle='#fff';
  ctx.fillText(t1,x+pad,y+pad*0.55);
  ctx.fillStyle= blur>1.5?'#ffb09c': blur>1.1?'#ffd08a':'#7fe8b0';
  ctx.font='700 '+Math.round(fs*0.78)+'px -apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
  ctx.fillText(t2,x+pad,y+pad*0.55+lh);
  ctx.restore();
}

/* 1:1 像素检视 + 同区域对比 */
function pxRender(){
  const p=blurProfile();
  const sc=state.exportScale;
  const Gg=G();
  const info=document.getElementById('pxInfo');
  /* ① 当前倍率整张 1:1 */
  const cv=document.getElementById('pxCv');
  const Gs=geo(state.ratio,sc);
  cv.width=Gs.W; cv.height=Gs.H;
  cv.style.width=Gs.W+'px';
  const x=cv.getContext('2d');
  x.setTransform(1,0,0,1,0,0);
  x.clearRect(0,0,cv.width,cv.height);
  drawDesign(x,state.layout,false,Gs);
  /* ② 局部对比：1× 与当前倍率取同一块画面区域 */
  const A=document.getElementById('pxA'), B=document.getElementById('pxB');
  const S=300;
  const rx=Math.round(Gg.W*0.18), ry=Math.round(Gg.H*0.30);
  const rw=Math.min(S,Math.round(Gg.W*0.9)-rx), rh=Math.min(S,Math.round(Gg.H*0.9)-ry);
  const one=document.createElement('canvas'); one.width=Gg.W; one.height=Gg.H;
  const ox=one.getContext('2d');
  ox.setTransform(1,0,0,1,0,0); ox.clearRect(0,0,Gg.W,Gg.H);
  drawDesign(ox,state.layout,false,Gg);
  const ax=A.getContext('2d');
  ax.imageSmoothingEnabled=false;
  ax.clearRect(0,0,A.width,A.height);
  ax.drawImage(one,rx,ry,rw,rh,0,0,A.width,A.height);
  const bx=B.getContext('2d');
  bx.imageSmoothingEnabled=true;
  if('imageSmoothingQuality' in bx) bx.imageSmoothingQuality='high';
  bx.clearRect(0,0,B.width,B.height);
  bx.drawImage(cv,rx*sc,ry*sc,rw*sc,rh*sc,0,0,B.width,B.height);
  document.getElementById('pxALab').textContent='1× 标准导出 · 局部 1:1';
  document.getElementById('pxBLab').textContent=sc+'× 导出 · 同一区域';
  if(info){
    const blur=p?p.blur:1;
    info.innerHTML='当前导出 <b>'+sc+'×</b> · 输出 <b>'+p.needW+'×'+p.needH+'</b> px（1:1 显示，可滚动看真实像素）<br>'+
      '放大系数 <b>'+blur.toFixed(2)+'</b> '+(blur>1.5?'<span class="warn">→ 明显发软</span>':blur>1.1?'<span style="color:#b45309;font-weight:700">→ 略糊但可用</span>':'<span class="ok">✓ 清晰</span>')+
      (p?('<br>左＝1× 标准导出的局部，右＝当前 '+sc+'× 导出的同一区域：右图每个像素更松软，说明这只是「变大」不是「变清楚」。'):'');
  }
}

/* 导出倍率提示 */
function updateScaleQ(up){""")

# ================================================================ 4. updateScaleQ 文案升级
sub("""  let q='导出 <b>'+needW+'×'+needH+'</b> px';
  const im=state.img;
  if(im&&im.width&&up){
    const c=getCrop();
    const sw=Math.round(c.w*im.width), sh=Math.round(c.h*im.height);
    const blur=up*sc;
    q+='<br>原图 '+im.width+'×'+im.height+' · 选框 '+sw+'×'+sh;
    q+='<br>图片区域放大系数 <b>'+blur.toFixed(2)+'</b> ';
    q+= blur>1.5  ? '<span class="warn">→ 明显发软，建议换更大原图</span>'
       : blur>1.1 ? '<span style="color:#b45309;font-weight:700">→ 略糊但可用</span>'
                  : '<span class="ok">✓ 清晰</span>';
  }else{
    q+='<br>未上传图片时使用内置示例图';
  }
  el.innerHTML=q;""",
    """  let q='导出 <b>'+needW+'×'+needH+'</b> px';
  const im=state.img;
  if(im&&im.width&&up){
    const c=getCrop();
    const sw=Math.round(c.w*im.width), sh=Math.round(c.h*im.height);
    const blur=up*sc;
    q+='<br>原图 '+im.width+'×'+im.height+' · 选框 '+sw+'×'+sh;
    q+='<br>图片区域放大系数 <b>'+blur.toFixed(2)+'</b> ';
    q+= blur>1.5  ? '<span class="warn">→ 明显发软，建议换更大原图</span>'
       : blur>1.1 ? '<span style="color:#b45309;font-weight:700">→ 略糊但可用</span>'
                  : '<span class="ok">✓ 清晰</span>';
    /* 建议原图最低像素阈值 + 最大无损倍率 */
    const safe=Math.max(1,Math.floor((1/up)+1e-6));
    q+='<br>最大无损倍率：<b>'+safe+'×</b>';
    if(sc>safe) q+='（当前 '+sc+'× 会放大 '+blur.toFixed(2)+' 倍）';
    if(sw<needW||sh<needH){
      q+='<br><span class="warn">要 '+sc+'× 不糊，裁剪选框至少需 '+needW+'×'+needH+' 源像素</span>';
      q+='<br>当前选框 '+sw+'×'+sh+'，还差 '+(needW-sw)+'×'+(needH-sh)+' px → 换更大原图，或点「选最大无损倍率」';
    }else{
      q+='<br><span class="ok">✓ 源像素已达 '+sc+'× 门槛，够清晰</span>';
    }
  }else{
    q+='<br>未上传图片时使用内置示例图';
  }
  el.innerHTML=q;""")

# ================================================================ 5. 倍率 chip 标注
sub("""function buildScales(){
  const box=document.getElementById('scales');
  if(!box) return;
  box.innerHTML='';
  SCALES.forEach(sc=>{
    const b=document.createElement('div');
    b.className='chip'+(state.exportScale===sc.v?' on':'');
    b.innerHTML='<b>'+sc.t+'</b><small>'+Math.round(G().W*sc.v)+'×'+Math.round(G().H*sc.v)+'</small>';
    b.onclick=()=>{ state.exportScale=sc.v; buildScales(); updateCropRes(); };
    box.appendChild(b);
  });""",
    """function buildScales(){
  const box=document.getElementById('scales');
  if(!box) return;
  box.innerHTML='';
  const up=(measureBlur()||{}).up||1;
  const safe=Math.max(1,Math.floor((1/up)+1e-6));
  SCALES.forEach(sc=>{
    const b=document.createElement('div');
    const blur=up*sc.v;
    const unsafe=sc.v>safe;
    b.className='chip'+(state.exportScale===sc.v?' on':'')+(unsafe?' unsafe':'');
    b.innerHTML='<b>'+sc.t+(unsafe?'<span class="wmark">⚠糊</span>':'')+'</b>'+
      '<small>'+Math.round(G().W*sc.v)+'×'+Math.round(G().H*sc.v)+
      ' · 放大'+blur.toFixed(2)+'×</small>';
    b.onclick=()=>{ state.exportScale=sc.v; buildScales(); updateCropRes(); refresh(); if(pxOpen()) pxRender(); };
    box.appendChild(b);
  });""")

# ================================================================ 6. refresh 里画徽标
sub("""  mx.drawImage(c,(Gg.W-sw)/2,(Gg.H-mh)/2,sw,mh,0,0,132,176);
  check();""",
    """  mx.drawImage(c,(Gg.W-sw)/2,(Gg.H-mh)/2,sw,mh,0,0,132,176);
  /* 预览图上叠加实时倍率徽标（只画在预览，不进导出文件） */
  drawPvBadge(x,Gg);
  check();""")

# ================================================================ 7. 按钮接线
sub("""/* ---------- 主题：跟随系统 / 手动覆盖 / 记忆选择 ----------""",
    """/* ---------- v5.3 像素检视按钮 ---------- */
function pxOpen(){ const el=document.getElementById('pxPanel'); return el && !el.hidden; }
(function(){
  var btn=document.getElementById('pxInspect');
  var panel=document.getElementById('pxPanel');
  var safe=document.getElementById('pxSafe');
  if(btn&&panel){
    btn.onclick=function(){
      panel.hidden=!panel.hidden;
      btn.textContent=panel.hidden?'🔍 像素检视':'🔍 收起检视';
      if(!panel.hidden) pxRender();
    };
  }
  if(safe){
    safe.onclick=function(){
      var p=blurProfile();
      var v=p?p.safe:1;
      state.exportScale=v;
      buildScales(); updateCropRes(); refresh();
      if(pxOpen()) pxRender();
      alert('已切到最大无损倍率 '+v+'×（更高倍率会把源像素放大，导出发软）');
    };
  }
})();

/* ---------- 主题：跟随系统 / 手动覆盖 / 记忆选择 ----------""")

F.write_text(s, encoding='utf-8')
print('patched index.html ->', len(s), 'bytes')
