// v5.3 导出清晰度可视化 验证
const {chromium} = require('/usr/local/lib/node_modules/playwright');
const fs = require('fs');

(async () => {
  const out = '/tmp/cover-v53';
  fs.mkdirSync(out, {recursive: true});
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport: {width: 1500, height: 1200}});
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  await page.goto('http://127.0.0.1:8902/index.html');
  await page.waitForTimeout(1200);

  // 切到 2×
  await page.evaluate(() => { state.exportScale = 2; buildScales(); updateCropRes(); refresh(); });
  await page.waitForTimeout(500);
  const info = await page.evaluate(() => ({
    scaleQ: document.getElementById('scaleQ').innerText,
    chips: [...document.querySelectorAll('#scales .chip')].map(c => c.innerText.replace(/\n/g, ' | ')),
    badge: (() => {
      // 从预览 canvas 取像素判断徽标是否绘制：右上角应偏暗
      const c = document.getElementById('pv');
      const x = c.getContext('2d');
      const d = x.getImageData(c.width - 260, 10, 250, 120).data;
      let dark = 0; for (let i = 0; i < d.length; i += 4) if (d[i] < 90 && d[i+1] < 90 && d[i+2] < 90) dark++;
      return dark;
    })(),
    blur: (() => { const p = blurProfile(); return p ? {up: p.up, blur: p.blur, safe: p.safe, need: p.needW + 'x' + p.needH, src: p.sw + 'x' + p.sh} : null; })(),
  }));
  console.log(JSON.stringify(info, null, 2));
  await page.screenshot({path: out + '/preview-2x.png', clip: {x: 0, y: 0, width: 1500, height: 1200}});

  // 打开像素检视
  await page.click('#pxInspect');
  await page.waitForTimeout(900);
  const px = await page.evaluate(() => ({
    open: !document.getElementById('pxPanel').hidden,
    cvW: document.getElementById('pxCv').width,
    cssW: document.getElementById('pxCv').style.width,
    info: document.getElementById('pxInfo').innerText,
    aLab: document.getElementById('pxALab').innerText,
    bLab: document.getElementById('pxBLab').innerText,
  }));
  console.log(JSON.stringify(px, null, 2));
  const el = await page.$('#pxPanel');
  await el.screenshot({path: out + '/pxpanel-2x.png'});

  // 3×
  await page.evaluate(() => { state.exportScale = 3; buildScales(); updateCropRes(); refresh(); pxRender(); });
  await page.waitForTimeout(900);
  await (await page.$('#pxPanel')).screenshot({path: out + '/pxpanel-3x.png'});
  const px3 = await page.evaluate(() => document.getElementById('pxInfo').innerText);
  console.log('3x info:', px3);
  console.log('ERRORS:', errors);
  await browser.close();
})();
