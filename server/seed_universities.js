const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'applications.db'));

const universities = [
  // Qozog'iston
  { name: "Muxtor Avezov Universiteti",            continent: "Osiyo",   country: "Qozog'iston", city: "Shymkent" },
  { name: "Chimkent Universiteti",                 continent: "Osiyo",   country: "Qozog'iston", city: "Shymkent" },
  { name: "Tarax davlat Universiteti",             continent: "Osiyo",   country: "Qozog'iston", city: "Taraz" },
  { name: "Semey Tibbiyot Universiteti",           continent: "Osiyo",   country: "Qozog'iston", city: "Semey" },

  // Qirg'iziston
  { name: "O'sh davlat Universiteti",              continent: "Osiyo",   country: "Qirg'iziston", city: "O'sh" },
  { name: "O'sh davlat Tibbiyot Universiteti",     continent: "Osiyo",   country: "Qirg'iziston", city: "O'sh" },
  { name: "O'sh Texnalogiya Universiteti",         continent: "Osiyo",   country: "Qirg'iziston", city: "O'sh" },
  { name: "O'sh Pedagogika Universiteti",          continent: "Osiyo",   country: "Qirg'iziston", city: "O'sh" },
  { name: "Jalalobod davlat Universiteti",         continent: "Osiyo",   country: "Qirg'iziston", city: "Jalolobod" },
  { name: "Batkent davlat Universiteti",           continent: "Osiyo",   country: "Qirg'iziston", city: "Batken" },

  // Tojikiston
  { name: "Panjikent davlat Pedagogika Universiteti", continent: "Osiyo", country: "Tojikiston", city: "Panjakent" },
  { name: "Xo'jand davlat Universiteti",           continent: "Osiyo",   country: "Tojikiston", city: "Xo'jand" },

  // Rossiya
  { name: "Xalqlar do'stligi Universiteti",        continent: "Osiyo",   country: "Rossiya",     city: "Moskva" },
  { name: "Sinergiya Universiteti",                continent: "Osiyo",   country: "Rossiya",     city: "Moskva" },
  { name: "Moskva Yuridik va Iqtisodiyot Universiteti", continent: "Osiyo", country: "Rossiya",  city: "Moskva" },
  { name: "Moskva davlat Pediatriya Universiteti", continent: "Osiyo",   country: "Rossiya",     city: "Moskva" },
  { name: "Tver davlat Tibbiyot Universiteti",     continent: "Osiyo",   country: "Rossiya",     city: "Tver" },
  { name: "Saratov Davlat Tibbiyot Universiteti",  continent: "Osiyo",   country: "Rossiya",     city: "Saratov" },
  { name: "Moskva Davlat Universiteti",            continent: "Osiyo",   country: "Rossiya",     city: "Moskva" },

  // Xitoy
  { name: "Ningbo University",                     continent: "Osiyo",   country: "Xitoy",       city: "Ningbo" },
  { name: "Hangzhou Dianzi University",            continent: "Osiyo",   country: "Xitoy",       city: "Hangzhou" },
  { name: "Zhejiang Business Technology Institute",continent: "Osiyo",   country: "Xitoy",       city: "Ningbo" },
  { name: "Nanchang University",                   continent: "Osiyo",   country: "Xitoy",       city: "Nanchang" },
  { name: "Yunnan University",                     continent: "Osiyo",   country: "Xitoy",       city: "Kunming" },
  { name: "Nantong University",                    continent: "Osiyo",   country: "Xitoy",       city: "Nantong" },
  { name: "Anhui Normal University",               continent: "Osiyo",   country: "Xitoy",       city: "Wuhu" },
  { name: "Zhengzhou Electric Power University",   continent: "Osiyo",   country: "Xitoy",       city: "Zhengzhou" },
  { name: "Guilin University of Technology",       continent: "Osiyo",   country: "Xitoy",       city: "Guilin" },
  { name: "Hospitality Institute of Sanya",        continent: "Osiyo",   country: "Xitoy",       city: "Sanya" },
  { name: "Xuzhou Vocational College",             continent: "Osiyo",   country: "Xitoy",       city: "Xuzhou" },
  { name: "Yangzhou University",                   continent: "Osiyo",   country: "Xitoy",       city: "Yangzhou" },
  { name: "Wuhan Institute of Technology",         continent: "Osiyo",   country: "Xitoy",       city: "Wuhan" },
  { name: "Shanghai Polytechnic University",       continent: "Osiyo",   country: "Xitoy",       city: "Shanxay" },
  { name: "Shanghai University of Science and Technology", continent: "Osiyo", country: "Xitoy", city: "Shanxay" },
  { name: "North China Electric Power University in Beijing", continent: "Osiyo", country: "Xitoy", city: "Pekin" },
  { name: "Shandong University",                   continent: "Osiyo",   country: "Xitoy",       city: "Jinan" },
  { name: "Jiangsu Normal University",             continent: "Osiyo",   country: "Xitoy",       city: "Xuzhou" },
  { name: "Shanghai University of Engineering Science", continent: "Osiyo", country: "Xitoy",    city: "Shanxay" },
  { name: "Xiamen University",                     continent: "Osiyo",   country: "Xitoy",       city: "Xiamen" },

  // Turkiya
  { name: "Istanbul Kent University",              continent: "Osiyo",   country: "Turkiya",     city: "Istanbul" },
  { name: "Istanbul Medeniyet University",         continent: "Osiyo",   country: "Turkiya",     city: "Istanbul" },
  { name: "Karabuk University",                    continent: "Osiyo",   country: "Turkiya",     city: "Karabük" },
  { name: "Sakarya University",                    continent: "Osiyo",   country: "Turkiya",     city: "Sakarya" },
  { name: "Anadalu University",                    continent: "Osiyo",   country: "Turkiya",     city: "Eskişehir" },
  { name: "Izmir Katip Chelebi University",        continent: "Osiyo",   country: "Turkiya",     city: "Izmir" },
  { name: "Anqara University",                     continent: "Osiyo",   country: "Turkiya",     city: "Ankara" },
  { name: "Marmara University",                    continent: "Osiyo",   country: "Turkiya",     city: "Istanbul" },

  // O'zbekiston
  { name: "Inha University of Tashkent",           continent: "Osiyo",   country: "O'zbekiston", city: "Toshkent" },
  { name: "Diplomat University",                   continent: "Osiyo",   country: "O'zbekiston", city: "Toshkent" },
  { name: "Termiz Iqtisodiyot va Servis Universiteti", continent: "Osiyo", country: "O'zbekiston", city: "Termiz" },
  { name: "Iqtisodiyot va Pedagogika Universiteti",continent: "Osiyo",   country: "O'zbekiston", city: "Toshkent" },
  { name: "Xalqaro Nordik Universiteti",           continent: "Osiyo",   country: "O'zbekiston", city: "Toshkent" },
  { name: "TMC Instituti of Tashkent",             continent: "Osiyo",   country: "O'zbekiston", city: "Toshkent" },
  { name: "Buxoro Innovatsion Tibbiyot Instituti", continent: "Osiyo",   country: "O'zbekiston", city: "Buxoro" },
  { name: "PDP Universiteti",                      continent: "Osiyo",   country: "O'zbekiston", city: "Toshkent" },
  { name: "Alfraganus Universiteti",               continent: "Osiyo",   country: "O'zbekiston", city: "Toshkent" },
  { name: "AL Bukhariy Universiteti",              continent: "Osiyo",   country: "O'zbekiston", city: "Toshkent" },

  // Malayziya
  { name: "Segi University",                       continent: "Osiyo",   country: "Malayziya",   city: "Kuala Lumpur" },
  { name: "Alfa University",                       continent: "Osiyo",   country: "Malayziya",   city: "Kuala Lumpur" },

  // Hindiston
  { name: "Acharya Bangalore Business School",     continent: "Osiyo",   country: "Hindiston",   city: "Bangalore" },

  // Singapur
  { name: "National University of Singapore",      continent: "Osiyo",   country: "Singapur",    city: "Singapur" },
  { name: "TMC Institute of Singapore",            continent: "Osiyo",   country: "Singapur",    city: "Singapur" },
  { name: "Management Development Institute of Singapore", continent: "Osiyo", country: "Singapur", city: "Singapur" },

  // Janubiy Koreya
  { name: "Seoul National University",             continent: "Osiyo",   country: "Janubiy Koreya", city: "Seul" },
  { name: "Koryo University",                      continent: "Osiyo",   country: "Janubiy Koreya", city: "Seul" },
  { name: "Woosuk University",                     continent: "Osiyo",   country: "Janubiy Koreya", city: "Wanju" },
  { name: "Dongguk University",                    continent: "Osiyo",   country: "Janubiy Koreya", city: "Seul" },

  // Yaponiya
  { name: "Tokyo Online University",               continent: "Osiyo",   country: "Yaponiya",    city: "Tokio" },
  { name: "OIST Graduate University",              continent: "Osiyo",   country: "Yaponiya",    city: "Okinava" },

  // Polsha
  { name: "Varshava University",                   continent: "Yevropa", country: "Polsha",      city: "Varshava" },
  { name: "Lodz University",                       continent: "Yevropa", country: "Polsha",      city: "Lodz" },
  { name: "Gdansk University",                     continent: "Yevropa", country: "Polsha",      city: "Gdansk" },
  { name: "Vrotslav University",                   continent: "Yevropa", country: "Polsha",      city: "Vrotslav" },
  { name: "Yagielloniya (Krakov) University",      continent: "Yevropa", country: "Polsha",      city: "Krakov" },
  { name: "Vistula University",                    continent: "Yevropa", country: "Polsha",      city: "Varshava" },

  // Italiya
  { name: "University of Pavia (foundation)",      continent: "Yevropa", country: "Italiya",     city: "Pavia" },
  { name: "University of Padua (foundation)",      continent: "Yevropa", country: "Italiya",     city: "Padua" },

  // Vengriya
  { name: "University of Pecs (foundation)",       continent: "Yevropa", country: "Vengriya",    city: "Pecs" },

  // Chexiya
  { name: "Charles University (foundation)",       continent: "Yevropa", country: "Chexiya",     city: "Praga" },

  // Germaniya
  { name: "Heidelberg University",                 continent: "Yevropa", country: "Germaniya",   city: "Heidelberg" },
  { name: "Humboldt University",                   continent: "Yevropa", country: "Germaniya",   city: "Berlin" },

  // Latviya
  { name: "Turiba University",                     continent: "Yevropa", country: "Latviya",     city: "Riga" },
  { name: "Riga Technical University",             continent: "Yevropa", country: "Latviya",     city: "Riga" },

  // Buyuk Britaniya
  { name: "University of Sunderland (foundation)", continent: "Yevropa", country: "Buyuk Britaniya", city: "Sunderland" },
  { name: "University of London (foundation)",     continent: "Yevropa", country: "Buyuk Britaniya", city: "London" },
  { name: "Oxford International College",          continent: "Yevropa", country: "Buyuk Britaniya", city: "Oxford" },

  // AQSh
  { name: "California State University Long Beach",continent: "Amerika", country: "AQSh",        city: "Long Beach" },
  { name: "Santa Monica College",                  continent: "Amerika", country: "AQSh",        city: "Santa Monica" },

  // Kanada
  { name: "University of Manitoba",               continent: "Amerika", country: "Kanada",      city: "Winnipeg" },
  { name: "Humber College",                        continent: "Amerika", country: "Kanada",      city: "Toronto" },
];

const stmt = db.prepare(
  'INSERT OR IGNORE INTO universities (name, continent, country, city) VALUES (?, ?, ?, ?)'
);

let count = 0;
const insert = db.transaction(() => {
  for (const u of universities) {
    stmt.run(u.name, u.continent, u.country, u.city);
    count++;
  }
});

insert();
console.log(`✅ ${count} ta universitet qo'shildi.`);
db.close();
