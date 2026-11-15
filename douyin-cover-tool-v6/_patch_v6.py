#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""V6 改造：上传视频 → 逐帧挑选 → 该帧当封面底图（与 v5 图片裁剪完全同一套）

原则：
  1) v5 渲染引擎（RENDER / drawDesign / cropSrc / drawCoverF / measureBlur）一行不改
  2) 抽帧走 <video> + canvas.drawImage(video)，取视频原始像素（videoWidth×videoHeight），
     不缩放、不插值、不重编码 —— 与「截图」不同，不会失真
  3) 抽出的帧直接塞进 state.img（Canvas 天然满足 drawImage 与 .width/.height 契约），
     于是裁剪 / 清晰度体检 / 三尺寸导出 / 5 款骨架全部原样复用
  4) 主图入口同时接受图片与视频，按 MIME 分流
"""
import pathlib
import sys

P = pathlib.Path(__file__).parent
F = P / 'index.html'
BASE = P.parent / 'douyin-cover-tool-v5' / 'index.html'   # v5 原件（可重放的基线）
# 每次都从 v5 原件重建，保证本脚本幂等可重放
s = BASE.read_text(encoding='utf-8')


def rebuild_template(text):
    """按既有切片逻辑生成 index.template.html（__ENGINE__ 回填后应与 index.html 一致）"""
    a = text.index('<script>')
    b = text.index('/* ================= 状态与交互 ================= */')
    tpl = text[:a] + '<script>\n__ENGINE__' + text[b:]
    (P / 'index.template.html').write_text(tpl, encoding='utf-8')
    return tpl


def sub(old, new, cnt=1):
    global s
    assert old in s, 'NOT FOUND:\n' + old[:300]
    s = s.replace(old, new, cnt)


# ================================================================ 1. 标题 / 头部
sub('<title>抖音封面工具 v5 · 合集视觉指纹</title>',
    '<title>抖音封面工具 v6 · 视频取帧</title>')

sub("""  <h1>抖音封面工具</h1><span class="v">v5 合集视觉指纹</span>
  <span>改标题 → 选合集 → 传主图 → 选版式 · 全部就位在预览里，改一处即时见效</span>
  <a href="../douyin-cover-tool-v4/">← v4</a>""",
    """  <h1>抖音封面工具</h1><span class="v">v6 视频取帧</span>
  <span>上传视频 → 逐帧挑一帧 → 直接当封面底图 · 不截图不失真</span>
  <a href="../douyin-cover-tool-v5/">← v5</a>""")

# ================================================================ 2. CSS 增补
sub("""/* ============ 移动端适配 ============ */""",
    """/* ---------- v6：视频取帧面板 ---------- */
.vidhint{font-size:11.5px;color:var(--muted2);margin:-2px 0 10px;line-height:1.7}
.vidpxinfo{font-size:11.5px;color:var(--muted2);margin-top:8px;line-height:1.7}
.vidpxinfo b{color:var(--txt)}
.vidwrap{display:flex;gap:10px;align-items:flex-start}
.vidwrap video{flex:0 0 auto;max-width:132px;max-height:210px;border-radius:8px;background:#000;display:block}
.vidmeta{font-size:11.5px;color:var(--muted);line-height:1.85;min-width:0;word-break:break-all}
.vidmeta b{color:var(--txt2)}
.vidseek{margin:10px 0 8px}
.vidseek input[type=range]{width:100%;height:auto;padding:0;border:none;background:none}
.vidrow{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:8px}
.vidtime{font-size:11px;color:var(--muted);font-variant-numeric:tabular-nums}
.vidstat{font-size:11px;color:var(--acc);font-weight:700}
.vidstrip{display:flex;gap:6px;overflow-x:auto;padding:8px;margin-top:8px;background:var(--soft-bg);border-radius:9px}
.vidstrip canvas{flex:0 0 auto;height:72px;border-radius:5px;cursor:pointer;border:2px solid transparent;background:#000}
.vidstrip canvas.on{border-color:var(--sel-ring);box-shadow:0 0 0 2px var(--sel-ring)}
/* v6：手机端把 8 帧缩略图排成 4×2 网格，一屏看全，不用横滑 */
@media(max-width:560px){
  .vidstrip{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;overflow-x:visible}
  .vidstrip canvas{width:100%;height:auto;aspect-ratio:9/16}
}
/* v6：「1:1 看原像素」面板
   —— 左栏只有 340px 宽，2 个 300px 画布并排放不下会折行，
      所以对比图固定用 1:1 网格、每格 145px，两边都按各自原生像素绘制。
   —— 用 grid 而不是 flex：flex 50% + gap 会超宽折行。 */
.vidcard .pxcmp{display:grid;grid-template-columns:145px 145px;gap:8px;margin-top:9px}
.vidcard .pxcmp figure{margin:0;width:145px}
.vidcard .pxcmp canvas{width:145px;height:145px;border:1px solid var(--line);
  border-radius:4px;display:block;background:var(--thumb-bg)}
.vidcard .pxcmp figcaption{font-size:10px;color:var(--muted);margin-top:4px;text-align:center;line-height:1.4}
@media(max-width:900px){
  .vidcard .pxwrap{max-height:210px}
  .vidcard .pxcmp{grid-template-columns:1fr 1fr;gap:7px}
  .vidcard .pxcmp figure{width:auto}
  .vidcard .pxcmp canvas{width:100%;height:auto;aspect-ratio:1/1}
  .vidcard .pxcmp figcaption{font-size:9.5px}
  .vidcard .vidpxinfo{font-size:11px;line-height:1.6}
}
#vidBody.hide{display:none}

/* ============ 移动端适配 ============ */""")

# ================================================================ 3. 视频卡片 HTML（左栏，版式卡片之前）
sub("""    <div class="card" id="cardTpl">
      <h2>② 版式（5 款骨架，分 2 大族；带「荐」的是该合集推荐）</h2>""",
    """    <div class="card vidcard" id="cardVid">
      <h2>🎬 视频取帧（可选）</h2>
      <div class="vidhint">不想单独截图？直接传视频进来，逐帧挑一张当封面底图 —— 抽的是原始像素，不缩放不重编码，和下面的图片裁剪完全同一套。<br><b>看着糊？</b>点「🔍 1:1 看原像素」直接看真实像素，左边是原帧、右边是封面成品里的同一段画面，一眼就知道糊没糊。</div>
      <div class="drop mini" id="vidDrop">
        <div id="vidDropTxt">点击选视频 · 或拖进来 · 支持 MP4 / WebM</div>
        <input type="file" id="vidFile" accept="video/*" hidden>
      </div>
      <div id="vidBody" class="hide">
        <div class="vidwrap">
          <video id="vid" playsinline muted preload="metadata"></video>
          <div class="vidmeta" id="vidMeta"></div>
        </div>
        <div class="vidseek"><input type="range" id="vidSeek" min="0" max="1000" value="0"></div>
        <div class="vidrow">
          <button class="sbtn" id="vidPrev1" type="button">◀ 上一帧</button>
          <button class="sbtn" id="vidPlay" type="button">▶ 播放</button>
          <button class="sbtn" id="vidNext1" type="button">下一帧 ▶</button>
          <span class="vidtime" id="vidTime">00:00.00 / 00:00.00</span>
        </div>
        <div class="vidstrip" id="vidStrip"></div>
        <div class="vidrow">
          <button class="sbtn on" id="vidUse" type="button">⬇ 用这一帧做封面</button>
          <button class="sbtn" id="vidSave" type="button">⬇ 导出这一帧原图</button>
          <button class="sbtn" id="vidPx" type="button">🔍 1:1 看原像素</button>
          <span class="vidstat" id="vidStat"></span>
        </div>
        <div class="pxwrap hide" id="vidPxWrap"><canvas id="vidPxCv"></canvas></div>
        <div class="pxcmp hide" id="vidPxCmp">
          <figure><canvas id="vidPxSrc" width="300" height="300"></canvas><figcaption>抽出的原帧 · 局部 1:1</figcaption></figure>
          <figure><canvas id="vidPxOut" width="300" height="300"></canvas><figcaption>封面成品 · 同一段画面</figcaption></figure>
        </div>
        <div class="vidpxinfo" id="vidPxInfo"></div>
        <div class="vidpxinfo" id="vidPxInfo2"></div>
      </div>
    </div>

    <div class="card" id="cardTpl">
      <h2>③ 版式（5 款骨架，分 2 大族；带「荐」的是该合集推荐）</h2>""")

# 尺寸说明编号顺延
sub("""    <summary><b>③ 尺寸说明</b> · 抖音封面有两版竖版，选对才不浪费画面</summary>""",
    """    <summary><b>④ 尺寸说明</b> · 抖音封面有两版竖版，选对才不浪费画面</summary>""")

# 主图入口同时接受视频
sub("""          <div id="dropTxt">点击选图 · 或拖进来 · 不传则用合集示例图</div>
          <input type="file" id="file" accept="image/*" hidden>""",
    """          <div id="dropTxt">点击选图 / 选视频 · 或拖进来 · 不传则用合集示例图</div>
          <input type="file" id="file" accept="image/*,video/*" hidden>""")

# ================================================================ 4. 移动端顺序
sub("""  #cardText{order:1}#cardPv{order:2}
  #cardTpl{order:3}#cardSize{order:4}""",
    """  #cardText{order:1}#cardVid{order:2}#cardPv{order:3}
  #cardTpl{order:4}#cardSize{order:5}""")

# ================================================================ 5. useFile 分流（图片照旧，视频走取帧流程）
sub("""function useFile(f){
  /* 释放上一张的 ObjectURL，避免内存泄漏 */""",
    """function useFile(f){
  /* v6：视频分流 —— 走取帧流程，不进图片流水线 */
  if(f && f.type && f.type.indexOf('video/')===0){ vidLoad(f); return; }
  /* 释放上一张的 ObjectURL，避免内存泄漏 */""")

sub("""document.getElementById('drop').addEventListener('drop',e=>{const f=e.dataTransfer.files[0];if(f&&f.type.startsWith('image/'))useFile(f);});""",
    """document.getElementById('drop').addEventListener('drop',e=>{const f=e.dataTransfer.files[0];if(f&&(f.type.startsWith('image/')||f.type.startsWith('video/')))useFile(f);});""")

# ================================================================ 6. 视频取帧模块（插在交互区）
VIDEO_JS = r"""/* ================= v6：视频取帧（纯前端 · 原始像素） ================= */
const VID={url:null,fps:30,dur:0,w:0,h:0,idx:0,busy:false};

function vidEl(id){ return document.getElementById(id); }
function vidFmt(t){
  if(!isFinite(t)||t<0) t=0;
  const m=Math.floor(t/60), s=t-m*60;
  return (m<10?'0':'')+m+':'+(s<10?'0':'')+s.toFixed(2);
}
function vidEsc(s){
  return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function vidRevokeUrl(){
  if(VID.url){ try{URL.revokeObjectURL(VID.url);}catch(e){} VID.url=null; }
}
function vidStat(t){ const e=vidEl('vidStat'); if(e) e.textContent=t||''; }

/* 载入视频：ObjectURL + 元数据 + 帧率标定 */
function vidLoad(f){
  if(!f) return;
  if((f.type||'').indexOf('video/')!==0){
    vidStat('这不是视频文件'); return;
  }
  vidRevokeUrl();
  const v=vidEl('vid');
  VID.url=URL.createObjectURL(f);
  vidEl('vidBody').classList.remove('hide');
  vidEl('vidDropTxt').innerHTML='<div style="font-size:12px;color:#12a150">已载入：'+vidEsc(f.name)+' · 解码中…</div>';
  vidStat('解码中…');
  v.onloadedmetadata=function(){
    VID.dur=v.duration||0; VID.w=v.videoWidth||0; VID.h=v.videoHeight||0;
    vidEl('vidMeta').innerHTML='源视频 <b>'+vidEsc(f.name)+'</b><br>'+
      '分辨率 <b>'+VID.w+'×'+VID.h+'</b> · 时长 <b>'+vidFmt(VID.dur)+'</b> · 帧率 <b id="vidFps">检测中…</b><br>'+
      '抽帧取原始像素，不缩放不插值 —— 和直接截图不同，不会失真。';
    vidCalibrate(v).then(function(){
      const fp=vidEl('vidFps'); if(fp) fp.textContent=VID.fps+' fps';
      vidBuildStrip();
      vidSyncUI();
    });
  };
  v.onerror=function(){
    vidStat('');
    vidEl('vidDropTxt').innerHTML='<div style="font-size:12px;color:#c2410c">浏览器无法解码该视频<br><span style="font-size:11px">可能是 HEVC / MOV 等编码，请转成 MP4(H.264) 后重试</span></div>';
  };
  v.src=VID.url;
  v.load();
  /* 从主图入口选到视频时，把视频面板滚到可见处 */
  const card=vidEl('cardVid');
  if(card && card.scrollIntoView) card.scrollIntoView({behavior:'smooth',block:'center'});
}

/* 帧率标定：短播一小段，用 requestVideoFrameCallback 数帧 */
function vidCalibrate(v){
  return new Promise(function(res){
    const oldT=v.currentTime;
    let fps=30;
    const done=function(){
      v.pause();
      VID.fps=fps;
      try{ v.currentTime=oldT||0; }catch(e){}
      res(fps);
    };
    if(typeof v.requestVideoFrameCallback!=='function'){ done(); return; }
    const t0=performance.now(); let n=0;
    const cb=function(now,meta){
      n++;
      if(n>=15 || performance.now()-t0>1600){ done(); return; }
      v.requestVideoFrameCallback(cb);
    };
    try{ const pr=v.play(); if(pr&&pr.catch) pr.catch(()=>done()); }
    catch(e){ done(); return; }
    v.requestVideoFrameCallback(cb);
    setTimeout(done,2200);
  });
}

/* 定位到某个时间点（等 seeked 落定） */
function vidSeek(t){
  const v=vidEl('vid');
  return new Promise(function(res){
    if(!v || !VID.dur) return res(false);
    t=Math.max(0,Math.min(t, VID.dur-0.002));
    let settled=false;
    const fin=function(ok){ if(settled) return; settled=true; v.removeEventListener('seeked',onSeek); res(ok); };
    const onSeek=function(){ fin(true); };
    v.addEventListener('seeked',onSeek);
    try{ v.currentTime=t; }catch(e){ fin(false); return; }
    setTimeout(function(){ fin(false); },4000);
  });
}

/* 抽帧：按视频原始分辨率取当前帧（无缩放 / 无插值 / 无重编码） */
function vidGrabFrame(){
  const v=vidEl('vid');
  if(!v || !v.videoWidth) return null;
  const c=document.createElement('canvas');
  c.width=v.videoWidth; c.height=v.videoHeight;
  const x=c.getContext('2d');
  x.drawImage(v,0,0,c.width,c.height);
  return c;
}

/* 用当前帧当封面底图：塞进 state.img，走 v5 的裁剪 / 版式 / 导出流水线 */
function vidUseFrame(){
  const c=vidGrabFrame();
  if(!c){ vidStat('还没解出帧'); return; }
  c.__crop={x:0,y:0,w:1,h:1};
  state.img=c;
  state.srcInfo={w:c.width,h:c.height,name:'视频帧 @ '+vidFmt(vidEl('vid').currentTime),size:0};
  /* 换底图了，之前上传图片的 ObjectURL 就可以释放 */
  if(state.objUrl){ try{URL.revokeObjectURL(state.objUrl);}catch(e){} state.objUrl=null; }
  /* 初始裁剪 = 当前输出比例在源帧里的最大内接区域（居中），保证源像素不被放大 */
  const r=RATIOS[state.ratio], ta=r.w/r.h, sa=c.width/c.height;
  let cw=1,ch=1;
  if(sa>ta) cw=ta/sa; else ch=sa/ta;
  c.__crop={x:(1-cw)/2,y:(1-ch)/2,w:cw,h:ch};
  /* 竖版源（9:16）很高：「按宽取景」会把选框压到视口高度，源像素被裁掉 → 看着像失真。
     切「看全图」，整帧可见，3:4 选框能拿满 1080×1440 原始像素（放大系数 1.0）。 */
  if(c.height/c.width>1.2){
    state.cropFit='full';
    const fFull=vidEl('cropFitFull'), fWide=vidEl('cropFitWide');
    if(fFull) fFull.classList.add('on');
    if(fWide) fWide.classList.remove('on');
  }
  state.cropPan=0;
  /* 自动打开裁剪面板 */
  state.cropOn=true;
  const cbox=vidEl('cropBox'); if(cbox) cbox.classList.remove('locked');
  const cb=vidEl('cropBtn'); if(cb){ cb.classList.add('on'); cb.textContent='✓ 裁剪已启用 · 点此关闭'; }
  buildTpls(); buildCropRatios(); refresh();
  setTimeout(function(){ drawCropUI(); updateCropRes(); },30);
  vidEl('vidDropTxt').innerHTML='<div style="font-size:12px;color:#12a150">✓ 已用视频帧作底图 · 在右侧裁剪</div>';
  vidStat('已设为底图');
}

/* 导出当前帧原图（不做任何缩放） */
function vidSaveFrame(){
  const c=vidGrabFrame();
  if(!c){ vidStat('还没解出帧'); return; }
  c.toBlob(function(b){
    dl(b,'frame-'+vidFmt(vidEl('vid').currentTime).replace(/[:.]/g,'-')+'.png');
  },'image/png');
}

/* ---- v6：1:1 原像素检视 ----
   解决「看着模糊」的困惑：预览区 canvas 是 1080×1440 真实像素，但 CSS 只显示 300px 宽，
   浏览器缩到 300px 给人看 → 视觉上必然发糊（这是显示缩放，不是画质损失）。
   这里直接铺出真实像素（1 像素 = 1 屏幕像素，可滚动），并与封面导出结果同区域并排对比，
   让用户亲眼确认「抽的是原始像素、没被缩放」。 */
function vidPxInspect(){
  const wrap=vidEl('vidPxWrap'), cmp=vidEl('vidPxCmp'), info=vidEl('vidPxInfo'), info2=vidEl('vidPxInfo2');
  if(!wrap) return;
  if(!wrap.classList.contains('hide')){          /* 已展开 → 收起 */
    wrap.classList.add('hide'); if(cmp) cmp.classList.add('hide');
    if(info) info.innerHTML='';
    const b=vidEl('vidPx'); if(b) b.textContent='🔍 1:1 看原像素';
    return;
  }
  const im=state.img;
  if(!im||!im.width){ vidStat('先用「用这一帧做封面」'); return; }
  /* ① 整张原帧，1:1 真实像素 */
  const cv=vidEl('vidPxCv');
  cv.width=im.width; cv.height=im.height;
  cv.style.width=im.width+'px';
  const x=cv.getContext('2d');
  x.setTransform(1,0,0,1,0,0);
  x.clearRect(0,0,cv.width,cv.height);
  x.drawImage(im,0,0);
  wrap.classList.remove('hide');
  /* ② 与封面成品同区域对比
     —— 两栏显示**同一段画面、同一真实现场范围**：
        左：源帧原生像素，1:1（不缩放）
        右：封面文件里这段画面**真实存在的像素**，按最近邻放大到同样大小
           （放大后有块感 = 导出文件里的真实颗粒度，不是我们画糊了）
     —— 位置换算用引擎记录的 rect：源 = r.sx + (封面x - r.dx) / r.s
        （r.s = 封面px / 源px，所以这里要「除以」r.s） */
  const Gg=geo(state.ratio,1);
  const src=vidEl('vidPxSrc'), out=vidEl('vidPxOut');
  if(src&&out){
    const one=document.createElement('canvas'); one.width=Gg.W; one.height=Gg.H;
    const ox=one.getContext('2d');
    ox.setTransform(1,0,0,1,0,0); ox.clearRect(0,0,Gg.W,Gg.H);
    const st={up:0};
    drawDesign(ox,state.layout,false,Gg,st);
    const r=st.rect;
    if(r&&r.s>0){
      /* 品红遮罩：找出封面里图片真正占据的区域（圆形裁切、版式留白都算在内） */
      const mask=document.createElement('canvas'); mask.width=Gg.W; mask.height=Gg.H;
      const mx=mask.getContext('2d');
      const real=state.img;
      const mag=document.createElement('canvas');
      mag.width=real.width; mag.height=real.height;
      mag.__crop=real.__crop;
      const mg=mag.getContext('2d');
      mg.fillStyle='#ff00ff'; mg.fillRect(0,0,mag.width,mag.height);
      const keep=state.img; state.img=mag;
      drawDesign(mx,state.layout,false,Gg,{up:0});
      state.img=keep;
      const md=mx.getImageData(0,0,Gg.W,Gg.H).data;
      let bx0=1e9,bx1=-1,by0=1e9,by1=-1;
      for(let y=0;y<Gg.H;y+=2){
        for(let x=0;x<Gg.W;x+=2){
          const i=(y*Gg.W+x)*4;
          if(md[i]>190&&md[i+1]<70&&md[i+2]>190){
            if(x<bx0)bx0=x; if(x>bx1)bx1=x; if(y<by0)by0=y; if(y>by1)by1=y;
          }
        }
      }
      let ccx,ccy;
      if(bx1>bx0){
        ccx=(bx0+bx1)/2; ccy=(by0+by1)/2;
      }else{
        ccx=r.dx+r.dw/2; ccy=r.dy+r.dh/2;
      }
      /* 现场范围 = D×D 源像素（D 是对比图每边的显示像素数，两栏 1:1） */
      const D=145;
      /* 源坐标：把封面中心点反算回源像素 */
      const srcCx=r.sx+(ccx-r.dx)/r.s, srcCy=r.sy+(ccy-r.dy)/r.s;
      /* 保证这块源区域完整落在图片里（圆形版式时留够内切余量） */
      const coverSide=Math.min(bx1>bx0?(bx1-bx0):r.dw,(by1>by0?(by1-by0):r.dh));
      const maxSrcSide=coverSide*0.7/Math.max(0.01,r.s);
      const d=Math.max(40,Math.min(D,Math.floor(maxSrcSide)));
      const srcX=Math.round(srcCx-d/2), srcY=Math.round(srcCy-d/2);
      /* 左：源帧原生像素，1:1 */
      src.width=d; src.height=d;
      const sx=src.getContext('2d');
      sx.imageSmoothingEnabled=false;
      sx.setTransform(1,0,0,1,0,0);
      sx.clearRect(0,0,d,d);
      sx.drawImage(im,srcX,srcY,d,d,0,0,d,d);
      /* 右：封面里同一段画面的真实像素，最近邻放大到 d×d */
      const cw=Math.max(1,Math.round(d*r.s));
      const covX=Math.round(r.dx+(srcX-r.sx)*r.s), covY=Math.round(r.dy+(srcY-r.sy)*r.s);
      out.width=d; out.height=d;
      const ox2=out.getContext('2d');
      ox2.imageSmoothingEnabled=false;
      ox2.setTransform(1,0,0,1,0,0);
      ox2.clearRect(0,0,d,d);
      ox2.drawImage(one,covX,covY,cw,cw,0,0,d,d);
      if(cmp) cmp.classList.remove('hide');
      if(info2) info2.innerHTML='<b>左边 = 抽出的原始帧</b>（'+d+'×'+d+' 源像素，1:1 无缩放）<br>'+
        '<b>右边 = 封面成品里的同一段画面</b>（文件里真实只有 '+cw+'×'+cw+' 像素，放大 '+(d/cw).toFixed(2)+'× 显示）<br>'+
        '<span style="color:var(--muted2)">右边有块感 = 导出文件里这一块真实的颗粒度；这是封面版式把画面装进格子后的必然结果，不是抽帧失真。</span>';
    }
  }
  /* ③ 文字结论：用真实数字说话 */
  if(info){
    const mb=measureBlur();
    const up=mb?mb.up:1;
    const vw=im.width, vh=im.height;
    const tag=up>1.001
      ? '<span class="warn">⚠️ 放大 '+up.toFixed(2)+'× —— 源像素不够，导出会发软</span>'
      : '<span class="ok">✓ 无损（封面里这段画面是源像素的 '+up.toFixed(2)+' 倍，缩着放，不丢细节）</span>';
    info.innerHTML='原帧 <b>'+vw+'×'+vh+'</b> px —— 下面这块是 <b>1 像素 = 1 屏幕像素</b> 的真实画面，可滚动查看。<br>'+
      '当前封面里这段画面的取景比例：源像素的 <b>'+up.toFixed(2)+'</b> 倍 '+tag+'<br>'+
      '<span style="color:var(--muted)">为什么预览看着糊？预览 canvas 只有 300px 宽，1080px 的画面被压到 300px 显示，<b>这是显示缩放，不是画质损失</b>；导出文件是完整像素。</span>';
  }
  const b=vidEl('vidPx'); if(b) b.textContent='🔍 收起原像素';
}

/* filmstrip：均匀采样若干帧做缩略图，串行 seek 保证不错帧 */
async function vidBuildStrip(){
  const v=vidEl('vid'), host=vidEl('vidStrip');
  if(!v || !VID.dur || !host) return;
  if(VID.busy) return;
  VID.busy=true;
  const N=8, keep=v.currentTime;
  host.innerHTML='';
  for(let i=0;i<N;i++){
    vidStat('取缩略图 '+(i+1)+'/'+N);
    const t=VID.dur*(i+0.5)/N;
    await vidSeek(t);
    const c=document.createElement('canvas');
    const th=72, tw=Math.max(24,Math.round(th*(v.videoWidth||9)/(v.videoHeight||16)));
    c.width=tw; c.height=th;
    try{ c.getContext('2d').drawImage(v,0,0,tw,th); }catch(e){}
    c.dataset.t=t;
    c.title=vidFmt(t)+' · 点此跳到这一帧';
    c.onclick=function(){ vidGoTo(parseFloat(this.dataset.t)); };
    host.appendChild(c);
  }
  await vidSeek(keep);
  VID.busy=false;
  vidStat('');
  vidMarkStrip();
}

/* 时间 / 帧号同步 */
function vidSyncUI(){
  const v=vidEl('vid'); if(!v) return;
  const t=v.currentTime||0, d=VID.dur||v.duration||0;
  const el=vidEl('vidTime');
  if(el) el.textContent=vidFmt(t)+' / '+vidFmt(d)+' · 帧 '+(VID.idx+1)+'/'+Math.max(1,Math.round(d*VID.fps));
  const sk=vidEl('vidSeek');
  if(sk && d) sk.value=Math.round(t/d*1000);
}
function vidMarkStrip(){
  const host=vidEl('vidStrip'), v=vidEl('vid');
  if(!host) return;
  const t=v?(v.currentTime||0):0;
  const kids=host.children; let best=-1,bd=1e9;
  for(let i=0;i<kids.length;i++){
    const dt=Math.abs(parseFloat(kids[i].dataset.t||0)-t);
    if(dt<bd){ bd=dt; best=i; }
  }
  for(let j=0;j<kids.length;j++) kids[j].classList.toggle('on', j===best);
}

/* 跳到指定时间 */
async function vidGoTo(t){
  const v=vidEl('vid');
  if(!v||!VID.dur) return;
  v.pause();
  await vidSeek(t);
  VID.idx=Math.max(0,Math.floor((v.currentTime||0)*VID.fps+1e-6));
  vidSyncUI(); vidMarkStrip();
}

/* 逐帧步进（按标定出来的真实 fps） */
function vidStep(dir){
  const v=vidEl('vid');
  if(!v||!VID.dur) return;
  const fps=VID.fps||30;
  const cur=Math.floor((v.currentTime||0)*fps+1e-6);
  const max=Math.max(0,Math.round(VID.dur*fps)-1);
  const idx=Math.max(0,Math.min(max,cur+dir));
  vidGoTo((idx+0.5)/fps);   /* 落在目标帧中点，避免踩到帧边界 */
}

/* ---- 视频面板事件绑定 ---- */
(function(){
  const drop=vidEl('vidDrop'), file=vidEl('vidFile');
  if(!drop||!file) return;
  drop.onclick=()=>file.click();
  file.onchange=e=>{ if(e.target.files[0]) vidLoad(e.target.files[0]); };
  ['dragover','dragenter'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('hot');}));
  ['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('hot');}));
  drop.addEventListener('drop',e=>{
    const f=e.dataTransfer.files[0];
    if(f && (f.type||'').indexOf('video/')===0) vidLoad(f);
  });
  const v=vidEl('vid');
  if(v){
    v.addEventListener('timeupdate',function(){ VID.idx=Math.max(0,Math.floor((v.currentTime||0)*VID.fps+1e-6)); vidSyncUI(); vidMarkStrip(); });
    v.addEventListener('seeked',function(){ vidSyncUI(); vidMarkStrip(); });
    v.addEventListener('play',function(){ const b=vidEl('vidPlay'); if(b) b.textContent='⏸ 暂停'; });
    v.addEventListener('pause',function(){ const b=vidEl('vidPlay'); if(b) b.textContent='▶ 播放'; });
  }
  const sk=vidEl('vidSeek');
  if(sk) sk.onchange=function(){ vidGoTo((this.value/1000)*VID.dur); };
  const pb=vidEl('vidPlay');
  if(pb) pb.onclick=function(){ const v2=vidEl('vid'); if(!v2) return; if(v2.paused) v2.play(); else v2.pause(); };
  const p1=vidEl('vidPrev1'), n1=vidEl('vidNext1');
  if(p1) p1.onclick=()=>vidStep(-1);
  if(n1) n1.onclick=()=>vidStep(1);
  const use=vidEl('vidUse'), save=vidEl('vidSave'), px=vidEl('vidPx');
  if(use) use.onclick=vidUseFrame;
  if(save) save.onclick=vidSaveFrame;
  if(px) px.onclick=vidPxInspect;
  /* 方向键逐帧 */
  document.addEventListener('keydown',function(e){
    if(!VID.dur) return;
    const tag=(e.target&&e.target.tagName)||'';
    if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT') return;
    if(e.key==='ArrowLeft'){ vidStep(-1); e.preventDefault(); }
    else if(e.key==='ArrowRight'){ vidStep(1); e.preventDefault(); }
  });
})();

"""
sub("""['title','sub'].forEach(k=>{""",
    VIDEO_JS + """['title','sub'].forEach(k=>{""")

# ================================================================ 7. 导出文件名前缀
s = s.replace("'cover-v5-'+COLLECTIONS", "'cover-v6-'+COLLECTIONS")

# ================================================================ 7b. 裁剪视口高度：竖版源 + 比例锁时加高
# v5 的 clampCropWide 把选框高度压到「视口高 88%」，
# 于是 9:16 源做 3:4 时选框只剩 685px 高，drawCoverF 再硬拉成 1440 → 放大 1.26×（看起来像失真）。
# v6：裁剪画布按「让锁定的选框能一次看全」反推高度（上限 470px）。
sub("""function cropVH(){
  const cv=document.getElementById('cropCv');
  const W=cv.clientWidth||300;
  const mob=window.innerWidth<=900;
  const H=mob?Math.max(220,Math.min(430,Math.round(window.innerHeight*0.46)))
             :Math.max(120,Math.min(220,Math.round(W*0.72)));
  return {W:W,H:H,dh:state.img?Math.round(W*state.img.height/state.img.width):H};
}""",
    """/* v6：竖版源 + 比例锁时，把裁剪视口加高，让锁定的选框能一次看全
   （否则选框被视口压扁 → 源像素被裁掉 → 放大系数虚高，看着像失真） */
function cropTallH(W){
  if(!state.img) return 0;
  const asp=lockAspect();
  if(!asp) return 0;
  const iw=state.img.width, ih=state.img.height;
  if(!iw||!ih) return 0;
  const sa=iw/ih;                      /* 源的宽/高 */
  if(sa>=0.85) return 0;               /* 不算特别高，不用加 */
  const ch=sa/asp;                     /* 选框高（归一化） */
  const dh=Math.round(W*ih/iw);
  return Math.min(500, Math.ceil(ch*dh/0.88*1.03));
}
function cropVH(){
  const cv=document.getElementById('cropCv');
  const W=cv.clientWidth||300;
  const mob=window.innerWidth<=900;
  let H=mob?Math.max(220,Math.min(430,Math.round(window.innerHeight*0.46)))
           :Math.max(120,Math.min(220,Math.round(W*0.72)));
  if(!mob){ const th=cropTallH(W); if(th>H) H=th; }
  return {W:W,H:H,dh:state.img?Math.round(W*state.img.height/state.img.width):H};
}""")

# drawCropUI 里也算一遍高度（它自己算的，不走 cropVH）
sub("""  const mob=window.innerWidth<=900;
  const H=mob?Math.max(220,Math.min(430,Math.round(window.innerHeight*0.46)))
             :Math.max(120,Math.min(220,Math.round(W*0.72)));
  cv.width=W; cv.height=H;""",
    """  const mob=window.innerWidth<=900;
  let H=mob?Math.max(220,Math.min(430,Math.round(window.innerHeight*0.46)))
           :Math.max(120,Math.min(220,Math.round(W*0.72)));
  if(!mob){ const th=cropTallH(W); if(th>H) H=th; }
  cv.width=W; cv.height=H;""")

# 比例锁时保持宽高比（以前只夹高度，选框被压扁）
sub("""function clampCropWide(){
  if(!state.img) return;
  const V=cropVH();
  const c=getCrop();
  let w=Math.max(0.06,Math.min(1,c.w));
  let h=Math.max(0.06,Math.min(c.h, V.H*0.88/Math.max(1,V.dh)));
  let y=Math.max(0,Math.min(1-h,c.y));
  let x=Math.max(0,Math.min(1-w,c.x));
  setCrop({x:x,y:y,w:w,h:h});
}""",
    """function clampCropWide(){
  if(!state.img) return;
  const V=cropVH();
  const c=getCrop();
  let w=Math.max(0.06,Math.min(1,c.w));
  let h=Math.max(0.06,Math.min(c.h, V.H*0.88/Math.max(1,V.dh)));
  /* v6：锁了比例时保持宽高比 —— 以前只夹高度，选框被压扁，
     drawCoverF 再把它硬拉成输出尺寸，放大系数虚高 */
  const asp=lockAspect();
  if(asp){ if(w/h>asp) w=h*asp; else h=w/asp; }
  let y=Math.max(0,Math.min(1-h,c.y));
  let x=Math.max(0,Math.min(1-w,c.x));
  setCrop({x:x,y:y,w:w,h:h});
}""")

# ================================================================ 8. 写回 + 重建模板 + 校验
# ---- 8a. 引擎微调：drawCoverF 记录「源像素→封面像素」映射（仅记录，不改渲染逻辑） ----
sub("""  ctx.drawImage(img,c.sx,c.sy,c.sw,c.sh,x+(w-dw)/2,y-off,dw,dh);
  /* 记录本次放大倍率（>1 = 源像素不够，导出会糊） */
  if(CURSTAT && s>(CURSTAT.up||0)) CURSTAT.up=s;
}""",
    """  ctx.drawImage(img,c.sx,c.sy,c.sw,c.sh,x+(w-dw)/2,y-off,dw,dh);
  /* 记录本次放大倍率（>1 = 源像素不够，导出会糊） */
  if(CURSTAT && s>(CURSTAT.up||0)) CURSTAT.up=s;
  /* v6：记录「源像素 → 封面像素」的实际映射，供 1:1 检视精确定位同一画面区域
     （纯记录，不影响任何渲染结果） */
  if(CURSTAT) CURSTAT.rect={sx:c.sx,sy:c.sy,sw:c.sw,sh:c.sh,
                             dx:x+(w-dw)/2,dy:y-off,dw:dw,dh:dh,s:s};
}""")

F.write_text(s, encoding='utf-8')
tpl = rebuild_template(s)
a = s.index('<script>') + len('<script>\n')
b = s.index('/* ================= 状态与交互 ================= */')
same = tpl.replace('__ENGINE__', s[a:b]) == s
print('v6 patched -> index.html', len(s), 'bytes')
print('index.template.html', len(tpl), 'bytes')
print('backfill identical to index.html:', same)
sys.exit(0 if same else 1)
