"""Independent Pillow encoder/decoder for local QA; not browser Canvas."""
import io,json,sys,random,hashlib
from pathlib import Path
from PIL import Image,ImageDraw

def source(kind):
 if kind=='noise':
  rng=random.Random(20261104)
  return Image.frombytes('RGB',(1280,681),rng.randbytes(1280*681*3))
 im=Image.new('RGB',(1280,681),'green');d=ImageDraw.Draw(im)
 for box,color in [((0,0,79,680),'magenta'),((80,0,319,680),'red'),((960,0,1199,680),'blue'),((1200,0,1279,680),'cyan')]:d.rectangle(box,fill=color)
 d.ellipse((540,240,739,439),fill='yellow')
 return im

def encode(args):
 im=source(args['source']).convert('RGBA');w,h=args['width'],args['height']
 out=Image.new('RGBA',(w,h),'white')
 # Replay public C.draw() calls; do not calculate fit/crop geometry here.
 for op in args['ops']:
  if op['op']=='fill':
   assert op['color']=='#fff' and op['args']==[0,0,w,h]
  else:
   x,y,dw,dh=op['args'];scaled=im.resize((max(1,round(dw)),max(1,round(dh))),Image.Resampling.LANCZOS)
   out.alpha_composite(scaled,(round(x),round(y)))
 buf=io.BytesIO();out.convert('RGB').save(buf,format='JPEG',quality=round(args['quality']*100))
 sys.stdout.buffer.write(buf.getvalue())

def verify(args):
 p=Path(args['path']);b=p.read_bytes()
 with Image.open(p) as im:
  im.load();assert im.format=='JPEG';assert im.size==(args['width'],args['height']);assert len(b)<=args['maxBytes'];assert len(b)>=args.get('minBytes',0)
  checks={};fit=args.get('fit')
  if fit:
   pix=im.convert('RGB');top=pix.getpixel((50,2));edge=pix.getpixel((0,50))
   points=[(x,y) for y in range(100) for x in range(100) if (lambda c:c[0]>180 and c[1]>180 and c[2]<100)(pix.getpixel((x,y)))]
   xs,ys=zip(*points);bw,bh=max(xs)-min(xs)+1,max(ys)-min(ys)+1
   if fit=='pad':assert min(top)>240 and edge[0]>180 and edge[2]>180 and abs(bw-bh)<=2
   if fit=='crop':assert top[1]>60 and top[0]<50 and edge[0]>180 and edge[1]<60 and edge[2]<60 and abs(bw-bh)<=2
   if fit=='stretch':assert top[1]>60 and top[0]<50 and edge[0]>180 and edge[2]>180 and bh>bw*1.5
   checks={'topRGB':top,'leftRGB':edge,'yellowObjectBounds':[bw,bh]}
  print(json.dumps({'file':p.name,'bytes':len(b),'width':im.width,'height':im.height,'format':im.format,'sha256':hashlib.sha256(b).hexdigest(),'pixelChecks':checks}))

if __name__=='__main__':
 args=json.loads(sys.stdin.read())
 if sys.argv[1]=='encode':encode(args)
 else:verify(args)
