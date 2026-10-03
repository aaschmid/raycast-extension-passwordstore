// Icon generator — the committed assets/icon.png and assets/icon@dark.png are
// built by this script (verified byte-identical at commit time). Pure Node,
// no dependencies: rasterizes a key glyph onto a rounded badge and encodes
// PNG directly. Run:  node scripts/make-icons.mjs
// It writes /tmp/new-icon.png and /tmp/new-icon-dark.png; copy into assets/.
// Hard-fails if the glyph center is not (256,256) +/- 0.2px in either variant.
import zlib from "zlib";
import fs from "fs";

const SIZE = 512, PAD = 0, ZOOM = 0.78;

function inRoundedRect(x, y, cx, cy, hw, hh, r) {
  const dx = Math.abs(x - cx) - (hw - r), dy = Math.abs(y - cy) - (hh - r);
  if (dx > -r && dy > -r) { const a = Math.max(dx,0), b = Math.max(dy,0); return a*a + b*b <= r*r; }
  return Math.abs(x - cx) <= hw && Math.abs(y - cy) <= hh;
}

function insideKey(nx, ny) {
  const bx = 30, by = 50;
  const d = Math.hypot(nx - bx, ny - by);
  const bowOuter = 14.5, bowInner = 8.5;
  const ang = Math.atan2(68 - by, 78 - bx);
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const px = (nx - bx) * ca + (ny - by) * sa;
  const py = -(nx - bx) * sa + (ny - by) * ca;
  const shaftHalf = 5.0, shaftLen = 46;
  const inShaft = px >= 8 && px <= shaftLen && Math.abs(py) <= shaftHalf;
  const inTooth1 = px >= 22 && px <= 30 && py >= 0 && py <= 13;
  const inTooth2 = px >= 34 && px <= 41 && py >= 0 && py <= 10;
  const roundedEnd = px > shaftLen - shaftHalf
    ? px <= shaftLen && Math.abs(py) <= Math.sqrt(Math.max(0, shaftHalf*shaftHalf - (px-(shaftLen-shaftHalf))**2))
    : false;
  return (d <= bowOuter && d >= bowInner) || inShaft || roundedEnd || inTooth1 || inTooth2;
}

// pixel-space shift dx NOT scaled by zoom: applied to x before design mapping
function render(fg, bg, dx, dy) {
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  let minX = SIZE, maxX = -1, minY = SIZE, maxY = -1;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const inBadge = inRoundedRect(x, y, 256, 256, 256, 256, 118);
      let glyphOn = false;
      if (inBadge) {
        const gx0 = ((x + dx - PAD) / (SIZE - 2 * PAD)) * 100;
        const gy0 = ((y + dy - PAD) / (SIZE - 2 * PAD)) * 100;
        const gx = 50 + (gx0 - 50) * ZOOM;
        const gy = 50 + (gy0 - 50) * ZOOM;
        glyphOn = insideKey(gx, gy);
      }
      const rgba = glyphOn ? fg : (inBadge ? bg : [0,0,0,0]);
      if (glyphOn) { minX=Math.min(minX,x); maxX=Math.max(maxX,x); minY=Math.min(minY,y); maxY=Math.max(maxY,y); }
      const i = (y*SIZE+x)*4;
      buf[i]=rgba[0]; buf[i+1]=rgba[1]; buf[i+2]=rgba[2]; buf[i+3]=rgba[3];
    }
  }
  return { buf, minX, maxX, minY, maxY };
}

// iterate until center is 256.0 +/- 0.2px
let dx = 0, dy = 0, m;
for (let it = 0; it < 8; it++) {
  m = render([255,255,255,255],[0,0,0,255], dx, dy);
  const cx = (m.minX + m.maxX) / 2, cy = (m.minY + m.maxY) / 2;
  console.log(`iter ${it}: dx=${dx.toFixed(2)} dy=${dy.toFixed(2)} center=(${cx.toFixed(1)}, ${cy.toFixed(1)}) size=${m.maxX-m.minX}x${m.maxY-m.minY}`);
  if (Math.abs(cx-256)<=0.2 && Math.abs(cy-256)<=0.2) break;
  dx -= 256 - cx; dy -= 256 - cy;
}
if (Math.abs((m.minX+m.maxX)/2 - 256) > 0.2 || Math.abs((m.minY+m.maxY)/2 - 256) > 0.2) {
  console.error("FAILED to center"); process.exit(1);
}

function encodePng(buf, outFile) {
  const raw = Buffer.alloc(SIZE * (SIZE*4 + 1));
  for (let y = 0; y < SIZE; y++) { raw[y*(SIZE*4+1)] = 0; buf.copy(raw, y*(SIZE*4+1)+1, y*SIZE*4, (y+1)*SIZE*4); }
  const idat = zlib.deflateSync(raw, { level: 9 });
  let t = null;
  const crc32 = (b) => { if (!t) { t = new Int32Array(256); for (let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c;} } let c=0xffffffff; for (const v of b) c=t[(c^v)&0xff]^(c>>>8); return (c^0xffffffff)>>>0; };
  const chunk = (type, data) => { const l=Buffer.alloc(4); l.writeUInt32BE(data.length); const ty=Buffer.from(type); const cr=Buffer.alloc(4); cr.writeUInt32BE(crc32(Buffer.concat([ty,data]))); return Buffer.concat([l,ty,data,cr]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(SIZE,0); ihdr.writeUInt32BE(SIZE,4); ihdr[8]=8; ihdr[9]=6;
  fs.writeFileSync(outFile, Buffer.concat([Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]), chunk("IHDR",ihdr), chunk("IDAT",idat), chunk("IEND",Buffer.alloc(0))]));
}

// same dx,dy applies to both fg/bg since geometry identical, but re-verify dark too
const light = render([255,255,255,255],[35,35,36,255], dx, dy);
const dark  = render([25,25,26,255],[240,240,242,255], dx, dy);
for (const [name, r] of [["light",light],["dark",dark]]) {
  const cx=(r.minX+r.maxX)/2, cy=(r.minY+r.maxY)/2;
  console.log(`${name}: center=(${cx.toFixed(1)},${cy.toFixed(1)})`);
  if (Math.abs(cx-256)>0.2||Math.abs(cy-256)>0.2) { console.error(name+" not centered"); process.exit(1); }
}
encodePng(light.buf, "/tmp/new-icon.png");
encodePng(dark.buf, "/tmp/new-icon-dark.png");
console.log("OK centered, wrote pngs");
