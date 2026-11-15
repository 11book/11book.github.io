// V6 实测：视频取帧链路 + v5 能力回归
// 用真实 Chrome（channel:'chrome'）—— 自带 Chromium 无 h264 解码，播不了 mp4
const {chromium} = require('/usr/local/lib/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const URL_V6 = process.env.COVER_URL || 'http://127.0.0.1:8903/index.html';
const SAMPLE = '/tmp/v6probe/sample.mp4';

(async () => {
  const outDir = '/tmp/cover-v6';
  fs.mkdirSync(outDir, {recursive: true});
  const browser = await chromium.launch({channel: 'chrome'});
  const page = await browser.newPage({viewport: {width: 1500, height: 1200}});
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

  await page.goto(URL_V6);
  await page.waitForTimeout(1200);

  // ---- DOM 结构 ----
  const dom = await page.evaluate(() => {
    const ids = ['cardText','cardVid','cardPv','cardTpl','cardSize','vidDrop','vidFile','vid','vidMeta',
                 'vidSeek','vidPlay','vidPrev1','vidNext1','vidTime','vidStrip','vidUse','vidSave','vidStat',
                 'drop','file','cropBox','cropCv','cropSrcInfo','pv'];
    return {
      missing: ids.filter(i => !document.getElementById(i)),
      fileAccept: document.getElementById('file').accept,
      vidBodyHidden: document.getElementById('vidBody').classList.contains('hide'),
      title: document.title,
    };
  });
  console.log('=== DOM ===');
  console.log(JSON.stringify(dom, null, 2));

  // ---- 上传视频 ----
  await page.setInputFiles('#vidFile', SAMPLE);
  await page.waitForTimeout(4000);

  const meta = await page.evaluate(() => {
    const v = document.getElementById('vid');
    return {
      vidBodyHidden: document.getElementById('vidBody').classList.contains('hide'),
      videoW: v.videoWidth, videoH: v.videoHeight, dur: v.duration,
      vidMetaTxt: document.getElementById('vidMeta').innerText.replace(/\n/g,' | '),
      strip: document.getElementById('vidStrip').children.length,
      fps: VID.fps,
      seekable: v.seekable.length ? [v.seekable.start(0), v.seekable.end(0)] : null,
    };
  });
  console.log('=== 视频元信息 ===');
  console.log(JSON.stringify(meta, null, 2));

  // ---- 抽帧：不同时间点像素应不同 ----
  const frames = await page.evaluate(async () => {
    const out = [];
    for (const t of [0.5, 2.0, 4.0]) {
      await vidGoTo(t);
      const c = vidGrabFrame();
      const x = c.getContext('2d');
      const d = x.getImageData(0, 0, c.width, c.height).data;
      let sum = 0;
      for (let i = 0; i < d.length; i += 4 * 997) sum += d[i] + d[i+1] + d[i+2];
      out.push({t, w: c.width, h: c.height, avg: +(sum / (d.length / (4*997)) / 3).toFixed(2)});
    }
    return out;
  });
  console.log('=== 抽帧像素 ===');
  console.log(JSON.stringify(frames, null, 2));
  const distinct = new Set(frames.map(f => f.avg)).size;
  console.log('不同时间点像素是否不同:', distinct > 1 ? 'YES (' + distinct + ' 组不同)' : 'NO —— 抽帧有问题！');

  // ---- 逐帧步进 ----
  const step = await page.evaluate(async () => {
    await vidGoTo(1.0);
    const before = document.getElementById('vid').currentTime;
    document.getElementById('vidNext1').click();
    await new Promise(r => setTimeout(r, 900));
    const after = document.getElementById('vid').currentTime;
    return {before, after, delta: +(after - before).toFixed(4), fps: VID.fps};
  });
  console.log('=== 逐帧步进 ===', JSON.stringify(step));

  // ---- 用这一帧做封面 ----
  await page.evaluate(() => { vidGoTo(2.0); });
  await page.waitForTimeout(700);
  await page.click('#vidUse');
  await page.waitForTimeout(900);

  const used = await page.evaluate(() => {
    const m = measureBlur();
    return {
      imgIsCanvas: state.img instanceof HTMLCanvasElement,
      imgW: state.img && state.img.width,
      imgH: state.img && state.img.height,
      crop: state.img && state.img.__crop,
      cropOn: state.cropOn,
      srcInfo: state.srcInfo,
      blur: m,
      cropResTxt: document.getElementById('cropRes').innerText.replace(/\n/g,' | '),
      scaleQTxt: document.getElementById('scaleQ').innerText.replace(/\n/g,' | '),
      dropTxt: document.getElementById('dropTxt').innerText,
    };
  });
  console.log('=== 用帧作主图 ===');
  console.log(JSON.stringify(used, null, 2));

  await page.screenshot({path: '/tmp/cover-v6/page-video-frame.png', fullPage: true});

  // ---- 导出 PNG 尺寸 ----
  const exp = await page.evaluate(async () => {
    const Gg = G();
    const c = renderFull(state.layout, null, state.exportScale);
    const blob = await new Promise(r => c.toBlob(r, 'image/png'));
    return {W: c.width, H: c.height, bytes: blob.size, geoW: Gg.W, geoH: Gg.H};
  });
  console.log('=== 导出 ===', JSON.stringify(exp));

  // ---- v5 能力回归：全部版式 × 3 尺寸渲染 ----
  const ids = await page.evaluate(() => LAYOUTS.map(l => l.id));
  let n = 0;
  for (const ratio of ['3x4','9x16','16x9']) {
    for (const id of ids) {
      const data = await page.evaluate(({id, ratio}) => {
        state.ratio = ratio; state.layout = id;
        const Gg = G();
        const c = document.createElement('canvas');
        c.width = Gg.W; c.height = Gg.H;
        drawDesign(c.getContext('2d'), id, false, Gg);
        return {url: c.toDataURL('image/png')};
      }, {id, ratio});
      fs.writeFileSync(path.join(outDir, `${ratio}-${id}.png`), Buffer.from(data.url.split(',')[1], 'base64'));
      n++;
    }
  }
  console.log('=== 渲染矩阵 ===', n, '张（5 版式 × 3 尺寸）');

  // ---- v5 引擎未改动的证明：v5/v6 渲染像素级比对（同一状态下比） ----
  const cmp = await (async () => {
    const b = await chromium.launch({channel: 'chrome'});
    const p5 = await b.newPage();
    await p5.goto('http://127.0.0.1:8902/index.html');
    await p5.waitForTimeout(1000);
    // 两边都清掉上传底图，回到「用合集示例图」的默认状态，才是同一起点
    await p5.evaluate(() => { state.img = null; state.cropOn = false; });
    await page.evaluate(() => { state.img = null; state.cropOn = false; });
    const res = [];
    for (const ratio of ['3x4','9x16','16x9']) {
      for (const id of ids) {
        const d5 = await p5.evaluate(({id,ratio}) => {
          state.ratio=ratio; state.layout=id;
          const Gg=G(); const c=document.createElement('canvas');
          c.width=Gg.W;c.height=Gg.H;
          drawDesign(c.getContext('2d'),id,false,Gg);
          const d=c.getContext('2d').getImageData(0,0,Gg.W,Gg.H).data;
          let s=0; for(let i=0;i<d.length;i+=4*37) s+=d[i]+d[i+1]+d[i+2];
          return s;
        }, {id,ratio});
        const d6 = await page.evaluate(({id,ratio}) => {
          state.ratio=ratio; state.layout=id;
          const Gg=G(); const c=document.createElement('canvas');
          c.width=Gg.W;c.height=Gg.H;
          drawDesign(c.getContext('2d'),id,false,Gg);
          const d=c.getContext('2d').getImageData(0,0,Gg.W,Gg.H).data;
          let s=0; for(let i=0;i<d.length;i+=4*37) s+=d[i]+d[i+1]+d[i+2];
          return s;
        }, {id,ratio});
        res.push({ratio, id, same: d5 === d6, v5: d5, v6: d6});
      }
    }
    await b.close();
    return res;
  })();
  const bad = cmp.filter(c => !c.same);
  console.log('=== v5/v6 渲染像素比对 ===', cmp.length - bad.length + '/' + cmp.length + ' 完全一致');
  if (bad.length) console.log(JSON.stringify(bad, null, 2));

  // ---- 移动端 ----
  await page.setViewportSize({width: 390, height: 844});
  await page.waitForTimeout(600);
  await page.screenshot({path: '/tmp/cover-v6/mobile.png', fullPage: true});

  console.log('=== 错误 ===', errors.length ? errors : '无');
  await browser.close();
})();
