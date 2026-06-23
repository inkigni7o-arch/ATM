const Database = require('better-sqlite3');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const db = new Database(path.join(__dirname, 'applications.db'));
const UPLOADS = path.join(__dirname, 'uploads');

const EN_NAMES = {
  "Muxtor Avezov Universiteti": "South Kazakhstan University",
  "Chimkent Universiteti": "Shymkent University",
  "Tarax davlat Universiteti": "Taraz Regional University",
  "Semey Tibbiyot Universiteti": "Semey University",
  "O'sh davlat Universiteti": "Osh State University",
  "O'sh davlat Tibbiyot Universiteti": "Osh State Medical University",
  "O'sh Texnalogiya Universiteti": "Jalal-Abad State University",
  "O'sh Pedagogika Universiteti": "Kyrgyz State University",
  "Jalalobod davlat Universiteti": "Jalal-Abad State University",
  "Batkent davlat Universiteti": "Osh State University",
  "Panjikent davlat Pedagogika Universiteti": "Khujand State University",
  "Xo'jand davlat Universiteti": "Khujand State University",
  "Xalqlar do'stligi Universiteti": "RUDN University",
  "Sinergiya Universiteti": "Synergy University Moscow",
  "Moskva Yuridik va Iqtisodiyot Universiteti": "Lomonosov Moscow State University",
  "Moskva davlat Pediatriya Universiteti": "Pirogov Russian National Research Medical University",
  "Tver davlat Tibbiyot Universiteti": "Tver State Medical University",
  "Saratov Davlat Tibbiyot Universiteti": "Saratov State Medical University",
  "Moskva Davlat Universiteti": "Moscow State University",
  "Ningbo University": "Ningbo University",
  "Hangzhou Dianzi University": "Hangzhou Dianzi University",
  "Zhejiang Business Technology Institute": "Zhejiang University",
  "Nanchang University": "Nanchang University",
  "Yunnan University": "Yunnan University",
  "Nantong University": "Nantong University",
  "Anhui Normal University": "Anhui Normal University",
  "Zhengzhou Electric Power University": "Zhengzhou University",
  "Guilin University of Technology": "Guilin University of Technology",
  "Hospitality Institute of Sanya": "Hainan University",
  "Xuzhou Vocational College": "China University of Mining and Technology",
  "Yangzhou University": "Yangzhou University",
  "Wuhan Institute of Technology": "Wuhan University of Technology",
  "Shanghai Polytechnic University": "Shanghai University",
  "Shanghai University of Science and Technology": "University of Shanghai for Science and Technology",
  "North China Electric Power University in Beijing": "North China Electric Power University",
  "Shandong University": "Shandong University",
  "Jiangsu Normal University": "Jiangsu Normal University",
  "Shanghai University of Engineering Science": "Tongji University",
  "Xiamen University": "Xiamen University",
  "Istanbul Kent University": "Istanbul University",
  "Istanbul Medeniyet University": "Marmara University",
  "Karabuk University": "Karabük University",
  "Sakarya University": "Sakarya University",
  "Anadalu University": "Anadolu University",
  "Izmir Katip Chelebi University": "Dokuz Eylül University",
  "Anqara University": "Ankara University",
  "Marmara University": "Marmara University",
  "Inha University of Tashkent": "Inha University",
  "Diplomat University": "University of World Economy and Diplomacy",
  "Termiz Iqtisodiyot va Servis Universiteti": "Termez State University",
  "Iqtisodiyot va Pedagogika Universiteti": "Tashkent State University of Economics",
  "Xalqaro Nordik Universiteti": "Nordic International University",
  "TMC Instituti of Tashkent": "Tashkent Medical Academy",
  "Buxoro Innovatsion Tibbiyot Instituti": "Bukhara State University",
  "PDP Universiteti": "National University of Uzbekistan",
  "Alfraganus Universiteti": "National University of Uzbekistan",
  "AL Bukhariy Universiteti": "Islamic University of Medina",
  "Segi University": "SEGi University",
  "Alfa University": "Multimedia University",
  "Acharya Bangalore Business School": "Indian Institute of Management Bangalore",
  "National University of Singapore": "National University of Singapore",
  "TMC Institute of Singapore": "Singapore Management University",
  "Management Development Institute of Singapore": "Singapore Institute of Management",
  "Seoul National University": "Seoul National University",
  "Koryo University": "Korea University",
  "Woosuk University": "Jeonbuk National University",
  "Dongguk University": "Dongguk University",
  "Tokyo Online University": "University of Tokyo",
  "OIST Graduate University": "Okinawa Institute of Science and Technology",
  "Varshava University": "University of Warsaw",
  "Lodz University": "University of Lodz",
  "Gdansk University": "University of Gdansk",
  "Vrotslav University": "University of Wroclaw",
  "Yagielloniya (Krakov) University": "Jagiellonian University",
  "Vistula University": "Warsaw School of Economics",
  "University of Pavia (foundation)": "University of Pavia",
  "University of Padua (foundation)": "University of Padua",
  "University of Pecs (foundation)": "University of Pécs",
  "Charles University (foundation)": "Charles University",
  "Heidelberg University": "Heidelberg University",
  "Humboldt University": "Humboldt University of Berlin",
  "Turiba University": "University of Latvia",
  "Riga Technical University": "Riga Technical University",
  "University of Sunderland (foundation)": "University of Sunderland",
  "University of London (foundation)": "University of London",
  "Oxford International College": "University of Oxford",
  "California State University Long Beach": "California State University Long Beach",
  "Santa Monica College": "University of California Los Angeles",
  "University of Manitoba": "University of Manitoba",
  "Humber College": "University of Toronto",
  "Sinergiya University": "Synergy University Moscow",
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

function get(url, retries = 3) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 ATMProject/1.0' } }, res => {
      if ([301,302,303].includes(res.statusCode) && res.headers.location) {
        return get(res.headers.location, retries).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', async err => {
      if (retries > 0) { await sleep(1000); return get(url, retries-1).then(resolve).catch(reject); }
      reject(err);
    });
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function downloadFile(url, dest, retries = 2) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    const req = proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 ATMProject/1.0' } }, res => {
      if ([301,302,303].includes(res.statusCode) && res.headers.location) {
        file.close(); try { fs.unlinkSync(dest); } catch {}
        return downloadFile(res.headers.location, dest, retries).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    });
    req.on('error', async err => {
      try { fs.unlinkSync(dest); } catch {}
      if (retries > 0) { await sleep(1000); return downloadFile(url, dest, retries-1).then(resolve).catch(reject); }
      reject(err);
    });
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function getWikiImage(searchName) {
  try {
    const q = encodeURIComponent(searchName);
    const { body } = await get(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${q}&srlimit=1&format=json`);
    const results = JSON.parse(body).query?.search;
    if (!results?.length) return null;

    const title = encodeURIComponent(results[0].title);
    await sleep(200);
    const { body: b2 } = await get(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`);
    const data = JSON.parse(b2);
    if (data.thumbnail?.source) {
      return data.thumbnail.source.replace(/\/\d+px-/, '/600px-');
    }
  } catch {}
  return null;
}

async function main() {
  const unis = db.prepare('SELECT id, name FROM universities').all();
  const upd = db.prepare('UPDATE universities SET image_url=? WHERE id=?');
  let ok = 0, fail = 0;

  for (let i = 0; i < unis.length; i++) {
    const u = unis[i];
    const searchName = EN_NAMES[u.name] || u.name;
    process.stdout.write(`[${i+1}/${unis.length}] ${u.name} ... `);

    const imgUrl = await getWikiImage(searchName);
    if (!imgUrl) { console.log('❌ topilmadi'); fail++; await sleep(800); continue; }

    const ext = (imgUrl.match(/\.(png|jpg|jpeg|svg)/i)?.[1] || 'jpg').replace('svg','png');
    const filename = `uni_${u.id}.${ext}`;
    const dest = path.join(UPLOADS, filename);

    try {
      await downloadFile(imgUrl, dest);
      const size = fs.statSync(dest).size;
      if (size < 500) { fs.unlinkSync(dest); console.log('❌ bo\'sh'); fail++; continue; }
      upd.run(`/uploads/${filename}`, u.id);
      console.log(`✅ (${Math.round(size/1024)}kb)`);
      ok++;
    } catch {
      try { fs.unlinkSync(dest); } catch {}
      console.log('❌ yuklanmadi'); fail++;
    }

    await sleep(800);
  }

  console.log(`\n✅ ${ok} ta muvaffaqiyatli, ❌ ${fail} ta topilmadi`);
  db.close();
}

main();
