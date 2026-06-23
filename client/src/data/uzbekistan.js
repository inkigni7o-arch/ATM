const UZBEKISTAN = {
  "Toshkent shahri": [
    "Bektemir tumani", "Chilonzor tumani", "Mirobod tumani",
    "Mirzo Ulug'bek tumani", "Olmazar tumani", "Sergeli tumani",
    "Shayxontohur tumani", "Uchtepa tumani", "Yakkasaroy tumani",
    "Yashnobod tumani", "Yunusobod tumani",
  ],
  "Toshkent viloyati": [
    "Angren shahri", "Bekabad shahri", "Chirchiq shahri", "Nurafshon shahri",
    "Yangiyo'l shahri", "Bo'ka tumani", "Bo'stonliq tumani", "Chinoz tumani",
    "Ohangaron tumani", "Oqqo'rg'on tumani", "Parkent tumani", "Piskent tumani",
    "Qibray tumani", "Toshkent tumani", "Urtachirchiq tumani", "Zangota tumani",
  ],
  "Andijon viloyati": [
    "Andijon shahri", "Asaka shahri", "Baliqchi tumani", "Bo'z tumani",
    "Buloqboshi tumani", "Hojaobod tumani", "Izboskan tumani", "Jalaquduq tumani",
    "Marhamat tumani", "Oltinko'l tumani", "Paxtaobod tumani", "Qo'rg'ontepa tumani",
    "Shahrixon tumani", "Ulug'nor tumani",
  ],
  "Farg'ona viloyati": [
    "Farg'ona shahri", "Marg'ilon shahri", "Qo'qon shahri", "Oltiariq tumani",
    "Bag'dod tumani", "Beshariq tumani", "Buvayda tumani", "Dang'ara tumani",
    "Furqat tumani", "Qo'shtepa tumani", "Quva tumani", "Rishton tumani",
    "So'x tumani", "Toshloq tumani", "Uchko'prik tumani", "O'zbekiston tumani",
    "Yozyovon tumani",
  ],
  "Namangan viloyati": [
    "Namangan shahri", "Chortoq tumani", "Chust tumani", "Kosonsoy tumani",
    "Mingbuloq tumani", "Namangan tumani", "Norin tumani", "Pop tumani",
    "To'raqo'rg'on tumani", "Uychi tumani", "Yangiqo'rg'on tumani",
  ],
  "Samarqand viloyati": [
    "Samarqand shahri", "Kattaqo'rg'on shahri", "Bulung'ur tumani",
    "Ishtixon tumani", "Jomboy tumani", "Kattaqo'rg'on tumani", "Narpay tumani",
    "Nurobod tumani", "Oqdaryo tumani", "Payariq tumani", "Pastdarg'om tumani",
    "Paxtachi tumani", "Qo'shrabot tumani", "Tayloq tumani", "Urgut tumani",
  ],
  "Buxoro viloyati": [
    "Buxoro shahri", "Kogon shahri", "G'ijduvon tumani", "Jondor tumani",
    "Kogon tumani", "Olot tumani", "Peshku tumani", "Qorakol tumani",
    "Qorovulbozor tumani", "Romitan tumani", "Shofirkon tumani", "Vobkent tumani",
  ],
  "Navoiy viloyati": [
    "Navoiy shahri", "Zarafshon shahri", "Karmana tumani", "Konimex tumani",
    "Navbahor tumani", "Nurota tumani", "Qiziltepa tumani", "Tomdi tumani",
    "Uchquduq tumani", "Xatirchi tumani",
  ],
  "Qashqadaryo viloyati": [
    "Qarshi shahri", "Shahrisabz shahri", "Chiroqchi tumani", "Dehqonobod tumani",
    "G'uzor tumani", "Kasbi tumani", "Kitob tumani", "Koson tumani",
    "Mirishkor tumani", "Muborak tumani", "Nishon tumani", "Qamashi tumani",
    "Shahrisabz tumani", "Yakkabog' tumani",
  ],
  "Surxondaryo viloyati": [
    "Termiz shahri", "Angor tumani", "Bandixon tumani", "Bo'ysun tumani",
    "Denov tumani", "Jarqo'rg'on tumani", "Muzrabot tumani", "Oltinsoy tumani",
    "Qiziriq tumani", "Qumqo'rg'on tumani", "Sariosiyo tumani", "Sherobod tumani",
    "Shurchi tumani", "Termiz tumani", "Uzun tumani",
  ],
  "Jizzax viloyati": [
    "Jizzax shahri", "Arnasoy tumani", "Baxmal tumani", "Do'stlik tumani",
    "Forish tumani", "G'allaorol tumani", "Mirzacho'l tumani", "Paxtakor tumani",
    "Sharof Rashidov tumani", "Yangiobod tumani", "Zafarobod tumani",
    "Zarbdor tumani", "Zomin tumani",
  ],
  "Sirdaryo viloyati": [
    "Guliston shahri", "Yangiyer shahri", "Boyovut tumani", "Guliston tumani",
    "Mirzaobod tumani", "Oqoltin tumani", "Sardoba tumani", "Sayxunobod tumani",
    "Sirdaryo tumani", "Xavos tumani",
  ],
  "Xorazm viloyati": [
    "Urganch shahri", "Xiva shahri", "Bog'ot tumani", "Gurlan tumani",
    "Hazorasp tumani", "Xonqa tumani", "Qo'shko'pir tumani", "Shovot tumani",
    "Tuproqqal'a tumani", "Urganch tumani", "Yangiariq tumani", "Yangibozor tumani",
  ],
  "Qoraqalpog'iston Respublikasi": [
    "Nukus shahri", "Amudaryo tumani", "Beruniy tumani", "Bo'zatov tumani",
    "Chimboy tumani", "Ellikkala tumani", "Kegeyli tumani", "Mo'ynoq tumani",
    "Nukus tumani", "Qanliko'l tumani", "Qo'ng'irot tumani", "Qorao'zak tumani",
    "Shumanay tumani", "Taxtako'pir tumani", "To'rtko'l tumani", "Xo'jayli tumani",
  ],
}

export const VILOYATLAR = Object.keys(UZBEKISTAN)
export const getShaharlar = (viloyat) => UZBEKISTAN[viloyat] || []
