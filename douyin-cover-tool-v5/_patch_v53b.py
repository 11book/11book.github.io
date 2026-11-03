#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""V5.3 修：内置示例图也能算清晰度（原 measureBlur 只认上传图）"""
import pathlib

P = pathlib.Path(__file__).parent
F = P / 'index.html'
s = F.read_text(encoding='utf-8')


def sub(old, new, cnt=1):
    global s
    assert old in s, 'NOT FOUND:\n' + old[:300]
    s = s.replace(old, new, cnt)


# measureBlur：没上传图时用内置示例图
sub("""var _measCv=null;
function measureBlur(){
  const im=state.img;
  if(!im||!im.width) return null;
  const Gg=G();
  if(!_measCv) _measCv=document.createElement('canvas');
  if(_measCv.width!==Gg.W||_measCv.height!==Gg.H){ _measCv.width=Gg.W; _measCv.height=Gg.H; }
  const stat={up:0};
  drawDesign(_measCv.getContext('2d'),state.layout,false,Gg,stat);
  const c=getCrop();
  return {
    up:stat.up||1,
    sw:Math.round(c.w*im.width),
    sh:Math.round(c.h*im.height),
    iw:im.width, ih:im.height,
    W:Gg.W, H:Gg.H
  };
}""",
    """var _measCv=null;
function measureBlur(){
  /* 上传图优先；没上传时用内置示例图，照样能算出放大系数 */
  const im=state.img||imgs[state.col]||null;
  if(!im||!im.width) return null;
  const Gg=G();
  if(!_measCv) _measCv=document.createElement('canvas');
  if(_measCv.width!==Gg.W||_measCv.height!==Gg.H){ _measCv.width=Gg.W; _measCv.height=Gg.H; }
  const stat={up:0};
  drawDesign(_measCv.getContext('2d'),state.layout,false,Gg,stat);
  const c=state.img?getCrop():{x:0,y:0,w:1,h:1};
  return {
    up:stat.up||1,
    sw:Math.round(c.w*im.width),
    sh:Math.round(c.h*im.height),
    iw:im.width, ih:im.height,
    W:Gg.W, H:Gg.H
  };
}""")

# updateScaleQ：统一走 blurProfile，内置图也能给出阈值建议
sub("""function updateScaleQ(up){
  const el=document.getElementById('scaleQ');
  if(!el) return;
  const Gg=G(), sc=state.exportScale;
  const needW=Math.round(Gg.W*sc), needH=Math.round(Gg.H*sc);
  let q='导出 <b>'+needW+'×'+needH+'</b> px';
  const im=state.img;
  if(im&&im.width&&up){
    const c=getCrop();
    const sw=Math.round(c.w*im.width), sh=Math.round(c.h*im.height);
    const blur=up*sc;""",
    """function updateScaleQ(up){
  const el=document.getElementById('scaleQ');
  if(!el) return;
  const Gg=G(), sc=state.exportScale;
  const needW=Math.round(Gg.W*sc), needH=Math.round(Gg.H*sc);
  let q='导出 <b>'+needW+'×'+needH+'</b> px';
  const p=blurProfile();
  const im=state.img||imgs[state.col];
  if(p&&im&&im.width){
    const sw=p.sw, sh=p.sh;
    const blur=p.blur;""")

sub("""    /* 建议原图最低像素阈值 + 最大无损倍率 */
    const safe=Math.max(1,Math.floor((1/up)+1e-6));""",
    """    /* 建议原图最低像素阈值 + 最大无损倍率 */
    const safe=p.safe;""")

sub("""    q+='<br>原图 '+im.width+'×'+im.height+' · 选框 '+sw+'×'+sh;""",
    """    q+='<br>'+(state.img?'原图':'示例图')+' '+im.width+'×'+im.height+' · 选框 '+sw+'×'+sh;""")

# pxRender 空值保护
sub("""  if(info){
    const blur=p?p.blur:1;""",
    """  if(info){
    const blur=p?p.blur:1;""")

F.write_text(s, encoding='utf-8')
print('patched ->', len(s), 'bytes')
