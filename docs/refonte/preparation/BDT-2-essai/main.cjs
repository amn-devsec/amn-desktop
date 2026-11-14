// Banc d'essai minimal de BDT-2 : un vrai Electron, sans l'application, sans réseau, images de synthèse.
const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const sharp = require('sharp');
const smartcrop = require('smartcrop');

const sortie = path.join(__dirname, 'sortie');
fs.mkdirSync(sortie, { recursive: true });

/** Adaptateur smartcrop → sharp (ce que fait smartcrop-sharp, qui exige sharp 0.32). */
const iop = {
  open: async (src) => { const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true }); return { width: info.width, height: info.height, _d: data }; },
  resample: async (img, w, h) => { const { data, info } = await sharp(img._d, { raw: { width: img.width, height: img.height, channels: 4 } }).resize(Math.round(w), Math.round(h), { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true }); return { width: info.width, height: info.height, _d: data }; },
  getData: async (img) => new smartcrop.ImgData(img.width, img.height, img._d),
};

/** Une image de synthèse : fond uni, un « sujet » contrasté décentré à droite. */
function svgDeSynthese(l, h) {
  const traits = Array.from({ length: 12 }, (_, i) => `<rect x="${l * 0.7 + i * 9}" y="${h * 0.3 + (i % 3) * 20}" width="4" height="60" fill="#1a1a1a"/>`).join('');
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${l}" height="${h}"><rect width="100%" height="100%" fill="#7a8a99"/><rect x="${l * 0.68}" y="${h * 0.25}" width="${l * 0.18}" height="${h * 0.5}" fill="#f2d2b6"/>${traits}</svg>`);
}

/** Le contrôle de licence d'un ffmpeg séparé : refusé s'il est construit en GPL ou « nonfree ». */
function licenceFfmpeg(bin) {
  const r = spawnSync(bin, ['-hide_banner', '-buildconf'], { encoding: 'utf8' });
  if (r.error) return { present: false };
  const conf = r.stdout + r.stderr;
  const gpl = /--enable-gpl\b/.test(conf);
  const nonfree = /--enable-nonfree\b/.test(conf);
  const version = spawnSync(bin, ['-hide_banner', '-version'], { encoding: 'utf8' }).stdout.split('\n')[0];
  return { present: true, version, gpl, nonfree, accepte: !gpl && !nonfree };
}

async function principal() {
  const r = { electron: process.versions.electron, node: process.versions.node, chrome: process.versions.chrome };
  // 1. sharp dans le processus principal : les trois formats Instagram depuis une photo 1200 × 800.
  const source = await sharp(svgDeSynthese(1200, 800)).jpeg({ quality: 92 }).toBuffer();
  fs.writeFileSync(path.join(sortie, 'source.jpg'), source);
  const formats = { carre: [1080, 1080], portrait: [1080, 1350], story: [1080, 1920] };
  r.sharp = { version: sharp.versions };
  // 2. smartcrop + sharp : le cadre est choisi sur le sujet, puis découpé et redimensionné.
  r.formats = {};
  for (const [nom, [l, h]] of Object.entries(formats)) {
    const t0 = Date.now();
    const { topCrop: c } = await smartcrop.crop(source, { width: l, height: h, imageOperations: iop });
    const out = await sharp(source).extract({ left: c.x, top: c.y, width: c.width, height: c.height }).resize(l, h).jpeg({ quality: 90, mozjpeg: true }).toBuffer();
    fs.writeFileSync(path.join(sortie, `${nom}.jpg`), out);
    const meta = await sharp(out).metadata();
    r.formats[nom] = { cadre: c, sortie: [meta.width, meta.height], octets: out.length, ms: Date.now() - t0, sujetDedans: c.x <= 1200 * 0.68 && c.x + c.width >= 1200 * 0.86 };
  }
  // 3. ffmpeg, outil séparé lancé depuis Electron : contrôle de licence, puis mécanique d'encodage.
  r.ffmpegSysteme = licenceFfmpeg('ffmpeg');
  const enc = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-loop', '1', '-t', '2', '-i', path.join(sortie, 'story.jpg'), '-f', 'lavfi', '-t', '2', '-i', 'anullsrc=r=48000:cl=stereo', '-c:v', 'mpeg4', '-q:v', '5', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', path.join(sortie, 'story.mp4')], { encoding: 'utf8' });
  r.ffmpegMecanique = { code: enc.status, octets: fs.existsSync(path.join(sortie, 'story.mp4')) ? fs.statSync(path.join(sortie, 'story.mp4')).size : 0, codecs: 'mpeg4 + aac natifs (LGPL), sans libx264', note: 'mécanique seulement : ce ffmpeg est GPL et ne serait pas livré' };
  const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,width,height', '-of', 'csv=p=0', path.join(sortie, 'story.mp4')], { encoding: 'utf8' });
  r.ffmpegMecanique.flux = probe.stdout.trim().split('\n');
  // 4. le rendu : onnxruntime-web (WebAssembly) et smartcrop sur canvas, dans une fenêtre cachée isolée.
  const win = new BrowserWindow({ show: false, webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true } });
  await win.loadFile(path.join(__dirname, 'page.html'));
  r.rendu = await win.webContents.executeJavaScript('window.essai()');
  fs.writeFileSync(path.join(sortie, 'resultat.json'), JSON.stringify(r, null, 2));
  console.log(JSON.stringify(r, null, 2));
}

app.whenReady().then(principal).then(() => app.quit(), (e) => { console.error('ÉCHEC', e); app.exit(1); });
