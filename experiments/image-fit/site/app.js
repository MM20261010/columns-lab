/* Local-only image processing. No input, file name, or result is sent to a server. */
(() => {
  'use strict';
  const C=ImageFit, $=id=>document.getElementById(id);
  let version=0, controller=null, image=null, inputBlob=null, result=null, urls=[];
  const fields=['minKB','maxKB','minW','minH','resize','agree'];
  function say(text,error=false){$('status').textContent=text;$('status').classList.toggle('error',error);}
  function revoke(){urls.forEach(x=>URL.revokeObjectURL(x));urls=[];}
  function url(blob){const x=URL.createObjectURL(blob);urls.push(x);return x;}
  function noDownload(){const old=$('output').getAttribute('src');if(old){URL.revokeObjectURL(old);urls=urls.filter(x=>x!==old);}result=null;$('review').checked=false;$('after').hidden=true;$('download').removeAttribute('href');$('download').classList.add('disabled');$('download').setAttribute('aria-disabled','true');$('download').tabIndex=-1;$('output').removeAttribute('src');}
  function invalidate(message){version++;controller?.abort();controller=null;$('cancel').disabled=true;noDownload();$('run').disabled=!image||!$('agree').checked;if(message)say(message);}
  function closeInput(){image?.close?.();image=null;inputBlob=null;revoke();$('original').removeAttribute('src');$('before').hidden=true;$('empty').hidden=false;}
  function raw(){return {minKB:$('minKB').value,maxKB:$('maxKB').value,minW:$('minW').value,minH:$('minH').value,resize:$('resize').checked};}
  async function load(blob){
    invalidate();closeInput();$('run').disabled=true;const token=version;
    try{
      if (!blob.size || blob.size>C.MAX_BYTES) throw new Error('画像は15MiB以下にしてください。');
      C.inspect(await blob.arrayBuffer());if(token!==version)return;
      if(typeof createImageBitmap!=='function')throw new Error('このブラウザでは画像を読み込めません。最新版のChrome・Firefox等でお試しください。');
      const bitmap=await createImageBitmap(blob,{imageOrientation:'from-image'});
      if(token!==version){bitmap.close();return;}
      C.checkDimensions(bitmap.width,bitmap.height);image=bitmap;inputBlob=blob;
      $('original').src=url(blob);$('input-info').textContent=blob.size.toLocaleString('ja-JP')+'バイト（'+(blob.size/1000).toFixed(1)+'KB） / '+image.width+' × '+image.height+'px';
      $('before').hidden=false;$('empty').hidden=true;$('run').disabled=!$('agree').checked;say('画像を読み込みました。条件とJPEG変換の確認後、作成してください。');
    }catch(e){if(token!==version)return;closeInput();$('run').disabled=true;say(e.message,true);}
  }
  $('file').addEventListener('change',()=>{const f=$('file').files[0];if(f)load(f);else{invalidate();closeInput();$('run').disabled=true;say('画像を選んでください。');}});
  fields.forEach(id=>$(id).addEventListener('input',()=>invalidate('条件が変わりました。もう一度作成してください。')));
  document.querySelectorAll('[data-kb]').forEach(b=>b.addEventListener('click',()=>{$('maxKB').value=b.dataset.kb;invalidate('容量の上限を変更しました。もう一度作成してください。');}));
  $('run').addEventListener('click',async()=>{
    invalidate();if(!image||!$('agree').checked)return;
    const token=version;controller=new AbortController();const signal=controller.signal;
    $('run').disabled=true;$('cancel').disabled=false;
    const canvas=document.createElement('canvas');
    // A separate bitmap avoids a reset closing the bitmap still used by an encoder.
    let work;
    try{
      const s=C.settings(raw());work=await createImageBitmap(inputBlob,{imageOrientation:'from-image'});
      if(signal.aborted||token!==version)return;
      const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('画像の作成領域を確保できませんでした。');
      const encoded=await C.compress(work.width,work.height,s,(w,h,q)=>{
        canvas.width=w;canvas.height=h;ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.drawImage(work,0,0,w,h);
        return new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',q));
      },signal,p=>say('作成中… '+p.tries+'回目 / '+p.width+' × '+p.height+'px / '+p.bytes.toLocaleString('ja-JP')+'バイト'));
      if(token!==version)return;
      const actual=C.inspect(await encoded.blob.arrayBuffer());
      if(token!==version)return;
      if(actual.type!=='image/jpeg'||!C.fits(encoded.blob.size,actual.width,actual.height,s))throw new Error('出力の再確認で条件不一致を検出しました。保存はできません。');
      result=encoded.blob;$('output').src=url(result);$('after').hidden=false;
      $('output-info').textContent=result.size.toLocaleString('ja-JP')+'バイト（'+(result.size/1000).toFixed(1)+'KB） / '+actual.width+' × '+actual.height+'px / '+encoded.tries+'回試行';
      say('入力した数値条件を満たすJPEGを作成しました。見た目を確認してから保存してください。');
    }catch(e){if(token===version){noDownload();say(e.message,true);}}
    finally{work?.close();canvas.width=canvas.height=1;if(token===version){controller=null;$('run').disabled=!image||!$('agree').checked;$('cancel').disabled=true;}}
  });
  $('review').addEventListener('change',()=>{
    const a=$('download'),enabled=!!result&&$('review').checked;
    a.classList.toggle('disabled',!enabled);a.setAttribute('aria-disabled',String(!enabled));a.tabIndex=enabled?0:-1;
    if(enabled){a.href=$('output').src;a.download='image-fit.jpg';}else a.removeAttribute('href');
  });
  $('download').addEventListener('click',e=>{if(!result||!$('review').checked)e.preventDefault();});
  $('cancel').addEventListener('click',()=>invalidate('処理を中止しました。古い結果は保存できません。'));
  $('clear').addEventListener('click',()=>{invalidate();closeInput();$('file').value='';$('agree').checked=false;$('run').disabled=true;say('画像と結果をクリアしました。');});
  $('sample').addEventListener('click',async()=>{
    invalidate();const token=version;const c=document.createElement('canvas');c.width=1200;c.height=800;const ctx=c.getContext('2d');
    ctx.fillStyle='#e9f2df';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#17674e';ctx.fillRect(80,80,1040,640);ctx.fillStyle='#fff';ctx.font='bold 64px sans-serif';ctx.fillText('SAMPLE 1200 × 800',130,250);ctx.font='32px sans-serif';ctx.fillText('Check text, colors and edges.',130,350);
    const b=await new Promise(resolve=>c.toBlob(resolve,'image/png'));c.width=c.height=1;if(token===version&&b){$('file').value='';load(b);}
  });
  for(const id of ['original','output']){
    const open=()=>{const src=$(id).getAttribute('src');if(src)window.open(src,'_blank','noopener,noreferrer');};
    $(id).addEventListener('click',open);
    $(id).addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
  }
  window.addEventListener('pagehide',()=>{controller?.abort();image?.close();revoke();});
})();

