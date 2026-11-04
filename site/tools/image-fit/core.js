(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ImageFit = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const MAX_BYTES = 15 * 1024 * 1024, MAX_PIXELS = 20000000, MAX_SIDE = 12000;
  function checkDimensions(width, height) {
    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > MAX_SIDE || height > MAX_SIDE || width * height > MAX_PIXELS) throw new Error('画像は2,000万画素以下・各辺12,000px以下にしてください。');
    return { width, height };
  }
  function inspect(buffer) {
    const b = new Uint8Array(buffer), v = new DataView(buffer);
    if (!b.length || b.length > MAX_BYTES) throw new Error('画像は15MiB以下にしてください。');
    const png = [137,80,78,71,13,10,26,10].every((x,i) => b[i] === x);
    if (png) {
      if (b.length < 33 || v.getUint32(8) !== 13 || String.fromCharCode(...b.slice(12,16)) !== 'IHDR') throw new Error('PNGのヘッダーを読み取れません。');
      const dim = checkDimensions(v.getUint32(16), v.getUint32(20));
      let pos = 8, ended = false;
      while (pos + 12 <= b.length) {
        const len = v.getUint32(pos), kind = String.fromCharCode(...b.slice(pos + 4,pos + 8));
        if (pos + len + 12 > b.length) throw new Error('PNGが途中で切れています。');
        if (kind === 'acTL') throw new Error('アニメーションPNGには対応していません。');
        pos += len + 12;
        if (kind === 'IEND') { ended = true; break; }
      }
      if (!ended) throw new Error('PNGの終端を読み取れません。');
      return { type:'image/png', ...dim };
    }
    if (b[0] !== 255 || b[1] !== 216) throw new Error('JPEG・静止PNGを選んでください。HEIC・GIF・WebP・SVG・PDFは対象外です。');
    let pos = 2;
    while (pos < b.length) {
      if (b[pos++] !== 255) throw new Error('JPEGの構造を読み取れません。');
      while (b[pos] === 255) pos++;
      const marker = b[pos++];
      if (marker === 217 || marker === 218) break;
      if (marker === 1 || (marker >= 208 && marker <= 215)) continue;
      if (pos + 2 > b.length) break;
      const len = v.getUint16(pos);
      if (len < 2 || pos + len > b.length) throw new Error('JPEGが途中で切れています。');
      if ([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)) {
        if (len < 8) throw new Error('JPEGの寸法を読み取れません。');
        return { type:'image/jpeg', ...checkDimensions(v.getUint16(pos+5),v.getUint16(pos+3)) };
      }
      pos += len;
    }
    throw new Error('JPEGの寸法を読み取れません。');
  }
  function settings(raw) {
    const mode=raw.mode ?? 'capacity';
    const n = Object.fromEntries(['minKB','maxKB','minW','minH'].map(k => [k,mode==='exact'&&['minW','minH'].includes(k)?0:Number(raw[k])]));
    if (Object.values(n).some(x => !Number.isFinite(x))) throw new Error('条件を数値で入力してください。');
    if (n.minKB < 0 || n.maxKB < 1 || n.maxKB > 15000 || n.minKB > n.maxKB) throw new Error('容量は上限1〜15,000KB、下限0〜上限の範囲で指定してください。');
    if (![n.minW,n.minH].every(x=>Number.isInteger(x)&&x>=0&&x<=MAX_SIDE)) throw new Error('最小寸法は0〜12,000pxの整数で指定してください。');
    if (!['capacity','exact'].includes(mode)) throw new Error('寸法の指定方法を選んでください。');
    const maxW=mode==='exact'?0:Number(raw.maxW||0),maxH=mode==='exact'?0:Number(raw.maxH||0);
    if (![maxW,maxH].every(x=>Number.isInteger(x)&&x>=0&&x<=MAX_SIDE)) throw new Error('最大寸法は0〜12,000pxの整数で指定してください。');
    if (mode==='capacity'&&((maxW&&maxW<n.minW)||(maxH&&maxH<n.minH))) throw new Error('最大寸法は最小寸法以上にしてください。');
    const targetW=Number(raw.targetW),targetH=Number(raw.targetH),fit=raw.fit ?? 'pad';
    if (mode==='exact') {
      checkDimensions(targetW,targetH);
      if (!['pad','crop','stretch'].includes(fit)) throw new Error('縦横比が違う場合の方法を選んでください。');
    }
    return {minBytes:Math.ceil(n.minKB*1000),maxBytes:Math.floor(n.maxKB*1000),minW:mode==='exact'?0:n.minW,minH:mode==='exact'?0:n.minH,maxW:mode==='exact'?0:maxW,maxH:mode==='exact'?0:maxH,mode,targetW,targetH,fit,resize:raw.resize === true};
  }
  function fits(bytes,width,height,s) { return bytes>=s.minBytes&&bytes<=s.maxBytes&&(s.mode==='exact' ? width===s.targetW&&height===s.targetH : width>=s.minW&&height>=s.minH&&(!s.maxW||width<=s.maxW)&&(!s.maxH||height<=s.maxH)); }
  function dimensions(width,height,s) {
    checkDimensions(width,height);
    if(s.mode==='exact') return [{width:s.targetW,height:s.targetH}];
    if (width<s.minW || height<s.minH) throw new Error('元画像が最小寸法を下回っています。拡大で見かけの条件を合わせず、別の元画像を選んでください。');
    const scale=Math.min(1,s.maxW?s.maxW/width:1,s.maxH?s.maxH/height:1);
    width=Math.max(1,Math.floor(width*scale));height=Math.max(1,Math.floor(height*scale));
    if (width<s.minW || height<s.minH) throw new Error('縦横比を保ったまま、最小寸法と最大寸法を同時に満たせません。寸法の範囲を見直してください。');
    const out=[{width,height}];
    if (!s.resize) return out;
    const floor = Math.max(s.minW/width,s.minH/height,Math.min(1,64/width),Math.min(1,64/height));
    for (let scale=.8; scale>floor; scale*=.8) {
      const w=Math.max(s.minW,Math.floor(width*scale)),h=Math.max(s.minH,Math.floor(height*scale));
      if (w!==out.at(-1).width || h!==out.at(-1).height) out.push({width:w,height:h});
    }
    const last={width:Math.max(1,Math.ceil(width*floor)),height:Math.max(1,Math.ceil(height*floor))};
    if (last.width!==out.at(-1).width || last.height!==out.at(-1).height) out.push(last);
    return out;
  }
  function abort(signal) { if (signal?.aborted) throw new Error('処理を中止しました。'); }
  async function compress(width,height,s,encode,signal,onStep=()=>{}) {
    let tries=0, smallest=Infinity;
    for (const d of dimensions(width,height,s)) {
      for (const quality of [.95,.88,.8,.7,.6,.5,.4,.3,.2]) {
        abort(signal);
        const blob=await encode(d.width,d.height,quality);
        abort(signal);
        if (!blob || blob.type!=='image/jpeg' || blob.size<1) throw new Error('このブラウザでJPEGを書き出せませんでした。');
        tries++;smallest=Math.min(smallest,blob.size);onStep({tries,...d,bytes:blob.size});
        if (fits(blob.size,d.width,d.height,s)) return {blob,...d,quality,tries};
      }
    }
    throw new Error('この探索範囲では条件に合うJPEGを作れませんでした。'+(s.mode==='exact'?'指定した仕上がり寸法は変更していません。容量上限を増やすか、仕上がり寸法を見直してください。':(s.resize?'':'縮小を許可するか、')+'容量・寸法の範囲を見直してください。')+'最小の試行は'+smallest.toLocaleString('ja-JP')+'バイトでした。');
  }
  function geometry(sw,sh,w,h,fit='pad') {
    if (fit==='stretch') return {x:0,y:0,width:w,height:h};
    const scale=(fit==='crop'?Math.max:Math.min)(w/sw,h/sh);
    return {x:(w-sw*scale)/2,y:(h-sh*scale)/2,width:sw*scale,height:sh*scale};
  }
  function draw(ctx,image,w,h,s) {
    ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);
    const d=geometry(image.width,image.height,w,h,s.mode==='exact'?s.fit:'stretch');
    ctx.drawImage(image,d.x,d.y,d.width,d.height);
  }
  return {geometry,draw,MAX_BYTES,MAX_PIXELS,inspect,checkDimensions,settings,fits,dimensions,compress};
});

