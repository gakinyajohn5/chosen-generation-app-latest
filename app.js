/* ════════════════════════════════════════════════════════
   CHOSEN GENERATION APP — app.js
   All frontend logic, modular and commented.
════════════════════════════════════════════════════════ */

'use strict';

/* ────────────────────────────────────────────────────────
   ① GLOBAL CONFIGURATION
   ┌─────────────────────────────────────────────────────┐
   │  PASTE YOUR API KEYS HERE BEFORE DEPLOYING          │
   └─────────────────────────────────────────────────────┘
──────────────────────────────────────────────────────── */
const CONFIG = {
  // Admin passcode (change before distributing)
  ADMIN_PASSCODE: 'chosen2026',

  // ── YouTube Data API v3 ──
  // 1. Go to https://console.cloud.google.com
  // 2. Create a project → Enable "YouTube Data API v3"
  // 3. Create an API Key → paste it below
  YOUTUBE_API_KEY: 'AIzaSyAg0yBZYzBor1rA8iiANk8rmSCrzeEELIg',

  // ── Jitsi Meet Server ──
  // Default: free public server. You can host your own Jitsi instance and replace this.
  JITSI_DOMAIN: 'meet.jit.si',

  // ── Local Document Library ──
  // Add your sermon PDFs here. Place files in a /docs/ folder beside index.html.
  // Format: { id, title, desc, url }
  DOCUMENTS: [
    {
      id: 'doc1',
      title: 'The Chosen Generation',
      desc: 'Sunday sermon – 1 Peter 2:9',
      url: 'docs/chosen-generation.pdf'
    },
    {
      id: 'doc2',
      title: 'Walking in Faith',
      desc: 'Midweek Bible study notes',
      url: 'docs/walking-in-faith.pdf'
    },
    {
      id: 'doc3',
      title: 'Kingdom Principles',
      desc: 'Leadership training series',
      url: 'docs/kingdom-principles.pdf'
    }
  ]
};

/* ────────────────────────────────────────────────────────
   ② SCRIPTURE DATA — Daily Verses
──────────────────────────────────────────────────────── */
const SCRIPTURES = [
  { verse: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", ref: "Jeremiah 29:11 (NIV)" },
  { verse: "I can do all this through him who gives me strength.", ref: "Philippians 4:13 (NIV)" },
  { verse: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.", ref: "Proverbs 3:5-6 (NIV)" },
  { verse: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", ref: "John 3:16 (NIV)" },
  { verse: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", ref: "Joshua 1:9 (NIV)" },
  { verse: "The Lord is my shepherd, I lack nothing.", ref: "Psalm 23:1 (NIV)" },
  { verse: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.", ref: "Romans 8:28 (NIV)" },
  { verse: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles.", ref: "Isaiah 40:31 (NIV)" },
  { verse: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.", ref: "Philippians 4:6 (NIV)" },
  { verse: "For you are a chosen people, a royal priesthood, a holy nation, God's special possession.", ref: "1 Peter 2:9 (NIV)" },
  { verse: "The Lord himself goes before you and will be with you; he will never leave you nor forsake you.", ref: "Deuteronomy 31:8 (NIV)" },
  { verse: "Delight yourself in the Lord, and he will give you the desires of your heart.", ref: "Psalm 37:4 (ESV)" },
  { verse: "Come to me, all you who are weary and burdened, and I will give you rest.", ref: "Matthew 11:28 (NIV)" },
  { verse: "The name of the Lord is a fortified tower; the righteous run to it and are safe.", ref: "Proverbs 18:10 (NIV)" }
];

/* ────────────────────────────────────────────────────────
   ③ BIBLE DATA — Offline Bilingual (English KJV + Kiswahili)
   Includes a sample of verses. Extend as needed.
──────────────────────────────────────────────────────── */
const BIBLE_BOOKS_EN = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy",
  "Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings",
  "1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job",
  "Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah",
  "Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah",
  "Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi",
  "Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians",
  "Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians",
  "1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James",
  "1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"
];

const BIBLE_BOOKS_SW = [
  "Mwanzo","Kutoka","Mambo ya Walawi","Hesabu","Kumbukumbu la Torati",
  "Yoshua","Waamuzi","Ruthu","1 Samweli","2 Samweli","1 Wafalme","2 Wafalme",
  "1 Mambo ya Nyakati","2 Mambo ya Nyakati","Ezra","Nehemia","Esta","Ayubu",
  "Zaburi","Mithali","Mhubiri","Wimbo wa Sulemani","Isaya","Yeremia",
  "Maombolezo","Ezekieli","Danieli","Hosea","Yoeli","Amosi","Obadia",
  "Yona","Mika","Nahumu","Habakuki","Sefania","Hagai","Zekaria","Malaki",
  "Mathayo","Marko","Luka","Yohana","Matendo","Warumi","1 Wakorintho","2 Wakorintho",
  "Wagalatia","Waefeso","Wafilipi","Wakolosai","1 Wathesalonike","2 Wathesalonike",
  "1 Timotheo","2 Timotheo","Tito","Filemoni","Waebrania","Yakobo",
  "1 Petro","2 Petro","1 Yohana","2 Yohana","3 Yohana","Yuda","Ufunuo"
];

// English Bible — fallback sample (used only if bible-en-*.json fails to load).
// The FULL 66-book KJV and ASV (31,102 verses each) are loaded on demand from
// bible-en-kjv.json / bible-en-asv.json — see loadEnglishBible() below.
const ENGLISH_BIBLE_DATA_CACHE = {}; // { kjv: {...}, asv: {...} } populated at runtime
const _englishBibleLoadPromises = {};

const BIBLE_DATA_EN = {
  "0_1": [ // Genesis 1
    "In the beginning God created the heaven and the earth.",
    "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.",
    "And God said, Let there be light: and there was light.",
    "And God saw the light, that it was good: and God divided the light from the darkness.",
    "And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.",
    "And God said, Let there be a firmament in the midst of the waters, and let it divide the waters from the waters.",
    "And God made the firmament, and divided the waters which were under the firmament from the waters which were above the firmament: and it was so.",
    "And God called the firmament Heaven. And the evening and the morning were the second day.",
    "And God said, Let the waters under the heaven be gathered together unto one place, and let the dry land appear: and it was so.",
    "And God called the dry land Earth; and the gathering together of the waters called he Seas: and God saw that it was good.",
    "And God said, Let the earth bring forth grass, the herb yielding seed, and the fruit tree yielding fruit after his kind, whose seed is in itself, upon the earth: and it was so.",
    "And the earth brought forth grass, and herb yielding seed after his kind, and the tree yielding fruit, whose seed was in itself, after his kind: and God saw that it was good.",
    "And the evening and the morning were the third day.",
    "And God said, Let there be lights in the firmament of the heaven to divide the day from the night; and let them be for signs, and for seasons, and for days, and years.",
    "And let them be for lights in the firmament of the heaven to give light upon the earth: and it was so.",
    "And God made two great lights; the greater light to rule the day, and the lesser light to rule the night: he made the stars also.",
    "And God set them in the firmament of the heaven to give light upon the earth.",
    "And to rule over the day and over the night, and to divide the light from the darkness: and God saw that it was good.",
    "And the evening and the morning were the fourth day.",
    "And God said, Let the waters bring forth abundantly the moving creature that hath life, and fowl that may fly above the earth in the open firmament of heaven.",
    "And God created great whales, and every living creature that moveth, which the waters brought forth abundantly, after their kind, and every winged fowl after his kind: and God saw that it was good.",
    "And God blessed them, saying, Be fruitful, and multiply, and fill the waters in the seas, and let fowl multiply in the earth.",
    "And the evening and the morning were the fifth day.",
    "And God said, Let the earth bring forth the living creature after his kind, cattle, and creeping thing, and beast of the earth after his kind: and it was so.",
    "And God made the beast of the earth after his kind, and cattle after their kind, and every thing that creepeth upon the earth after his kind: and God saw that it was good.",
    "And God said, Let us make man in our image, after our likeness: and let them have dominion over the fish of the sea, and over the fowl of the air, and over the cattle, and over all the earth, and over every creeping thing that creepeth upon the earth.",
    "So God created man in his own image, in the image of God created he him; male and female created he them.",
    "And God blessed them, and God said unto them, Be fruitful, and multiply, and replenish the earth, and subdue it: and have dominion over the fish of the sea, and over the fowl of the air, and over every living thing that moveth upon the earth.",
    "And God said, Behold, I have given you every herb bearing seed, which is upon the face of all the earth, and every tree, in the which is the fruit of a tree yielding seed; to you it shall be for meat.",
    "And to every beast of the earth, and to every fowl of the air, and to every thing that creepeth upon the earth, wherein there is life, I have given every green herb for meat: and it was so.",
    "And God saw every thing that he had made, and, behold, it was very good. And the evening and the morning were the sixth day."
  ],
  "39_1": [ // Matthew 1
    "The book of the generation of Jesus Christ, the son of David, the son of Abraham.",
    "Abraham begat Isaac; and Isaac begat Jacob; and Jacob begat Judas and his brethren;",
    "And Judas begat Phares and Zara of Thamar; and Phares begat Esrom; and Esrom begat Aram;",
    "And Aram begat Aminadab; and Aminadab begat Naasson; and Naasson begat Salmon;",
    "And Salmon begat Booz of Rachab; and Booz begat Obed of Ruth; and Obed begat Jesse;",
    "And Jesse begat David the king; and David the king begat Solomon of her that had been the wife of Urias;",
    "And Solomon begat Roboam; and Roboam begat Abia; and Abia begat Asa;",
    "And Asa begat Josaphat; and Josaphat begat Joram; and Joram begat Ozias;",
    "And Ozias begat Joatham; and Joatham begat Achaz; and Achaz begat Ezekias;",
    "And Ezekias begat Manasses; and Manasses begat Amon; and Amon begat Josias;",
    "And Josias begat Jechonias and his brethren, about the time they were carried away to Babylon:",
    "And after they were brought to Babylon, Jechonias begat Salathiel; and Salathiel begat Zorobabel;",
    "And Zorobabel begat Abiud; and Abiud begat Eliakim; and Eliakim begat Azor;",
    "And Azor begat Sadoc; and Sadoc begat Achim; and Achim begat Eliud;",
    "And Eliud begat Eleazar; and Eleazar begat Matthan; and Matthan begat Jacob;",
    "And Jacob begat Joseph the husband of Mary, of whom was born Jesus, who is called Christ.",
    "So all the generations from Abraham to David are fourteen generations; and from David until the carrying away into Babylon are fourteen generations; and from the carrying away into Babylon unto Christ are fourteen generations.",
    "Now the birth of Jesus Christ was on this wise: When as his mother Mary was espoused to Joseph, before they came together, she was found with child of the Holy Ghost.",
    "Then Joseph her husband, being a just man, and not willing to make her a publick example, was minded to put her away privily.",
    "But while he thought on these things, behold, the angel of the Lord appeared unto him in a dream, saying, Joseph, thou son of David, fear not to take unto thee Mary thy wife: for that which is conceived in her is of the Holy Ghost.",
    "And she shall bring forth a son, and thou shalt call his name JESUS: for he shall save his people from their sins.",
    "Now all this was done, that it might be fulfilled which was spoken of the Lord by the prophet, saying,",
    "Behold, a virgin shall be with child, and shall bring forth a son, and they shall call his name Emmanuel, which being interpreted is, God with us.",
    "Then Joseph being raised from sleep did as the angel of the Lord had bidden him, and took unto him his wife:",
    "And knew her not till she had brought forth her firstborn son: and he called his name JESUS."
  ],
  "42_3": [ // John 3
    "There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:",
    "The same came to Jesus by night, and said unto him, Rabbi, we know that thou art a teacher come from God: for no man can do these miracles that thou doest, except God be with him.",
    "Jesus answered and said unto him, Verily, verily, I say unto thee, Except a man be born again, he cannot see the kingdom of God.",
    "Nicodemus saith unto him, How can a man be born when he is old? can he enter the second time into his mother's womb, and be born?",
    "Jesus answered, Verily, verily, I say unto thee, Except a man be born of water and of the Spirit, he cannot enter into the kingdom of God.",
    "That which is born of the flesh is flesh; and that which is born of the Spirit is spirit.",
    "Marvel not that I said unto thee, Ye must be born again.",
    "The wind bloweth where it listeth, and thou hearest the sound thereof, but canst not tell whence it cometh, and whither it goeth: so is every one that is born of the Spirit.",
    "Nicodemus answered and said unto him, How can these things be?",
    "Jesus answered and said unto him, Art thou a master of Israel, and knowest not these things?",
    "Verily, verily, I say unto thee, We speak that we do know, and testify that we have seen; and ye receive not our witness.",
    "If I have told you earthly things, and ye believe not, how shall ye believe, if I tell you of heavenly things?",
    "And no man hath ascended up to heaven, but he that came down from heaven, even the Son of man which is in heaven.",
    "And as Moses lifted up the serpent in the wilderness, even so must the Son of man be lifted up:",
    "That whosoever believeth in him should not perish, but have eternal life.",
    "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
    "For God sent not his Son into the world to condemn the world; but that the world through him might be saved.",
    "He that believeth on him is not condemned: but he that believeth not is condemned already, because he hath not believed in the name of the only begotten Son of God.",
    "And this is the condemnation, that light is come into the world, and men loved darkness rather than light, because their deeds were evil.",
    "For every one that doeth evil hateth the light, neither cometh to the light, lest his deeds should be reproved.",
    "But he that doeth truth cometh to the light, that his deeds may be made manifest, that they are wrought in God."
  ]
};

// Kiswahili Bible — fallback sample (used only if bible-sw.json fails to load).
// The FULL 66-book Swahili Bible (31,102 verses) is loaded on demand from
// bible-sw.json — see loadSwahiliBible() in the Bible module below.
let BIBLE_DATA_SW_FULL = null;   // populated at runtime from bible-sw.json
let _bibleSwLoadPromise = null;  // in-flight fetch, so we only ever fetch once

const BIBLE_DATA_SW = {
  "0_1": [
    "Hapo mwanzo Mungu aliumba mbingu na nchi.",
    "Nayo nchi ilikuwa ukiwa na utupu, na giza lilikuwa juu ya uso wa vilindi vya maji; na Roho ya Mungu ilikuwa ikitanda juu ya uso wa maji.",
    "Mungu akasema, Iwe nuru. Ikawa nuru.",
    "Mungu akaona kuwa nuru ilikuwa njema; Mungu akagawanya nuru na giza.",
    "Mungu akaiita nuru Mchana, na giza akaliita Usiku. Ikawa jioni, ikawa asubuhi, siku ya kwanza.",
    "Mungu akasema, Liwe ganda katikati ya maji, ligawanye maji na maji.",
    "Mungu akafanya ganda, akagawanya maji yaliyokuwa chini ya ganda na maji yaliyokuwa juu ya ganda. Ikawa hivyo.",
    "Mungu akaliita ganda Mbingu. Ikawa jioni, ikawa asubuhi, siku ya pili.",
    "Mungu akasema, Maji yaliyoko chini ya mbingu yakusanyike mahali pamoja, na nchi kame ionekane. Ikawa hivyo.",
    "Mungu akaiita nchi kame Nchi, na mkusanyo wa maji akauita Bahari. Mungu akaona kwamba ilikuwa njema.",
    "Mungu akasema, Nchi iote majani, mimea itokayo mbegu, na miti ya matunda izaayo matunda kwa jinsi yake, yenye mbegu ndani yake, juu ya nchi. Ikawa hivyo.",
    "Nchi ikatoa majani, na mimea yenye mbegu kwa jinsi yake, na miti izaayo matunda yenye mbegu ndani yake kwa jinsi yake. Mungu akaona kwamba ilikuwa njema.",
    "Ikawa jioni, ikawa asubuhi, siku ya tatu.",
    "Mungu akasema, Ziwe taa angani, kugawanya mchana na usiku; nazo ziwe ishara za majira ya mwaka, siku na miaka.",
    "Nazo ziwe taa angani kuwaka juu ya nchi. Ikawa hivyo.",
    "Mungu akafanya taa kuu mbili; ile taa kubwa iitawalayo mchana, na ile taa ndogo iitawalayo usiku; na nyota pia.",
    "Mungu akaziweka angani kuzika juu ya nchi.",
    "Zitawale mchana na usiku, na kugawanya nuru na giza. Mungu akaona kwamba ilikuwa njema.",
    "Ikawa jioni, ikawa asubuhi, siku ya nne.",
    "Mungu akasema, Maji yawe na wingi wa viumbe vyenye uhai, na ndege waruke juu ya nchi mbinguni.",
    "Mungu akaumba nyangumi wakubwa, na kila kiumbe chenye uhai kinachosogea ambacho maji yalitoa kwa wingi, kwa jinsi yake, na kila ndege mwenye mabawa kwa jinsi yake. Mungu akaona kwamba ilikuwa njema.",
    "Mungu akavibariki, akisema, Zaaneni, mkazidishane, mjaze maji ya bahari, na ndege wazidishe juu ya nchi.",
    "Ikawa jioni, ikawa asubuhi, siku ya tano.",
    "Mungu akasema, Nchi izae viumbe hai kwa jinsi yake, wanyama, na vitambuavyo, na wanyama wa nchi kwa jinsi yake. Ikawa hivyo.",
    "Mungu akawafanya wanyama wa nchi kwa jinsi yake, na wanyama wafugwao kwa jinsi yake, na kila kitambaacho juu ya nchi kwa jinsi yake. Mungu akaona kwamba ilikuwa njema.",
    "Mungu akasema, Na tumfanye mtu kwa mfano wetu, kwa sura yetu; wakatawale samaki wa baharini, na ndege wa angani, na wanyama, na nchi yote, na kila kitambaacho juu ya nchi.",
    "Mungu akaumba mtu kwa mfano wake, kwa mfano wa Mungu alimumba; mwanaume na mwanamke aliwaumba.",
    "Mungu akawabariki, Mungu akawaambia, Zaaneni, mkazidishane, mlijaze nchi, na kuitiisha; mkatawale samaki wa baharini, na ndege wa angani, na kila kiumbe chenye uhai juu ya nchi.",
    "Mungu akasema, Tazama, nimewapa kila mmea uzaao mbegu, ambao uko juu ya uso wa nchi yote, na kila mti wenye matunda ya mti uzaao mbegu; itakuwa chakula chenu.",
    "Na kwa kila mnyama wa nchi, na kwa kila ndege wa angani, na kwa kila kiingiavyo chini ya nchi, ambacho kina pumzi ya uhai, nimetoa kila mmea wa majani kuwa chakula. Ikawa hivyo.",
    "Mungu akaona kila kitu alichokuwa amekifanya, na tazama kilikuwa chema sana. Ikawa jioni, ikawa asubuhi, siku ya sita."
  ],
  "42_3": [
    "Alikuwepo mtu mmoja wa Mafarisayo, jina lake Nikodemo, mkuu wa Wayahudi.",
    "Huyu alikuja kwa Yesu usiku, akamwambia, Rabi, tunajua ya kuwa wewe ni mwalimu aliyekuja kutoka kwa Mungu; kwa maana hakuna mtu awezaye kufanya ishara hizi unazozifanya, isipokuwa Mungu yu pamoja naye.",
    "Yesu akajibu, akamwambia, Amin, amin, nakuambia, Mtu asipozaliwa mara ya pili, hawezi kuuona ufalme wa Mungu.",
    "Nikodemo akamwambia, Mtu awezaje kuzaliwa akiwa mzee? Aweza kuingia tumboni mwa mamaye mara ya pili, na kuzaliwa?",
    "Yesu akajibu, Amin, amin, nakuambia, Mtu asipozaliwa kwa maji na kwa Roho, hawezi kuuingia ufalme wa Mungu.",
    "Kilichozaliwa kwa nyama ni nyama; na kilichozaliwa kwa Roho ni roho.",
    "Usistaajabu kwa sababu nilikuambia, Mpaswa kuzaliwa mara ya pili.",
    "Upepo huvuma upendako, na sauti yake unaisikia, lakini hujui ulikotoka na uendako; kadhalika kila mtu aliyezaliwa kwa Roho.",
    "Nikodemo akajibu, akamwambia, Mambo haya yanawezaje kuwa?",
    "Yesu akajibu, akamwambia, Wewe ni mwalimu wa Israeli, na mambo haya huyajui?",
    "Amin, amin, nakuambia, Tunena tujuacho, na kuushuhudia tulioona; na ushuhuda wetu hamukubali.",
    "Nikuambia mambo ya nchi, na hamkuamini, itakuwaje mkiamini nikuambiapo mambo ya mbinguni?",
    "Wala hakuna aliyepaa mbinguni, ila yeye aliyeshuka kutoka mbinguni, yaani, Mwana wa Adamu aliye mbinguni.",
    "Na kama vile Musa alivyomwinua yule nyoka jangwani, vivyo hivyo Mwana wa Adamu hupaswa kuinuliwa,",
    "Ili kila mtu amwaminiye asianguke, bali awe na uzima wa milele.",
    "Kwa maana jinsi hii Mungu aliupenda ulimwengu, hata akamtoa Mwanawe wa pekee, ili kila mtu amwaminiye asipotee, bali awe na uzima wa milele.",
    "Kwa maana Mungu hakumtuma Mwanawe ulimwenguni ili auhukumu ulimwengu, bali ulimwengu uokolewe kwa yeye.",
    "Amwaminiye yeye, hahukumiwi; asiyeamini amekwisha kuhukumiwa, kwa sababu hakuliamini jina la Mwana wa pekee wa Mungu.",
    "Na hukumu ndiyo hii, ya kuwa nuru ilikuja ulimwenguni, na watu wakapenda giza kuliko nuru; kwa sababu matendo yao yalikuwa mabaya.",
    "Kwa maana kila mtu atendaye maovu, huchukia nuru, wala huja kwenye nuru, ili matendo yake yasije yakaonekana.",
    "Lakini atendaye kweli huja kwenye nuru, ili matendo yake yaonekane kwamba yamefanywa katika Mungu."
  ]
};

/* ────────────────────────────────────────────────────────
   ④ APP STATE — in-memory store
──────────────────────────────────────────────────────── */
const STATE = {
  isAdmin: false,
  activeTab: 'home',
  activeSubTab: 'bible',
  // announcements, events, prayers, and the activity log now live in
  // Postgres (via /api/*) instead of localStorage, so every visitor sees
  // the same data and it survives redeploys. These arrays are just an
  // in-memory cache of the last fetch, populated by loadAnnouncements(),
  // loadEvents(), loadPrayers(), and loadActivityLog() below.
  announcements: [],
  events: [],
  prayers: [],
  activityLog: [],
  savedDocs: JSON.parse(localStorage.getItem('cga_saved_docs') || '[]'),
  currentPrayerType: 'prayer'
};

// A random per-device ID (NOT a login) so the server can tell "this browser
// already RSVP'd / said Amen" apart from a login system. Safe to keep in
// localStorage since it carries no personal data.
function getDeviceId() {
  let id = localStorage.getItem('cga_device_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('cga_device_id', id);
  }
  return id;
}
const DEVICE_ID = getDeviceId();

function nextDate(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString();
}

function saveState() {
  // Only savedDocs remains a purely local, per-device preference.
  localStorage.setItem('cga_saved_docs', JSON.stringify(STATE.savedDocs));
}

/* ── Server-backed loaders ───────────────────────────────
   Replace the old localStorage reads. Call these on init and
   after any create/delete so the UI reflects the shared data. */

async function loadAnnouncements() {
  try {
    const r = await fetch('/api/announcements');
    const data = await r.json();
    STATE.announcements = data.announcements || [];
  } catch (err) {
    console.error('Failed to load announcements:', err);
  }
  renderAnnouncements();
}

async function loadEvents() {
  try {
    const r = await fetch(`/api/events?deviceId=${encodeURIComponent(DEVICE_ID)}`);
    const data = await r.json();
    STATE.events = data.events || [];
  } catch (err) {
    console.error('Failed to load events:', err);
  }
  renderEvents();
}

async function loadPrayers() {
  try {
    const r = await fetch(`/api/prayers?deviceId=${encodeURIComponent(DEVICE_ID)}`);
    const data = await r.json();
    STATE.prayers = data.prayers || [];
  } catch (err) {
    console.error('Failed to load prayer wall:', err);
  }
  renderPrayers();
}

async function loadActivityLog() {
  try {
    const r = await fetch('/api/activity-log');
    const data = await r.json();
    STATE.activityLog = data.log || [];
  } catch (err) {
    console.error('Failed to load activity log:', err);
  }
  renderActivityLog();
}

/* ────────────────────────────────────────────────────────
   ⑤ UTILITY FUNCTIONS
──────────────────────────────────────────────────────── */
function $(id) { return document.getElementById(id); }

function showToast(msg, duration = 2500) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.add('hidden'), duration);
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' });
}

function getMonthAbbr(iso) {
  return new Date(iso).toLocaleDateString('en-KE', { month: 'short' }).toUpperCase();
}

function getDayNum(iso) {
  return new Date(iso).getDate();
}

function sanitize(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

async function logActivity(msg) {
  // Optimistically show it right away, then persist to the server.
  const entry = { msg, time: new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }) };
  STATE.activityLog.unshift(entry);
  if (STATE.activityLog.length > 50) STATE.activityLog.pop();
  renderActivityLog();
  try {
    await fetch('/api/activity-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msg })
    });
  } catch (err) {
    console.error('Failed to save activity log entry:', err);
  }
}

function extractVideoId(input) {
  // Handles full URLs or bare 11-char video IDs
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    /^([A-Za-z0-9_-]{11})$/
  ];
  for (const re of patterns) {
    const m = input.trim().match(re);
    if (m) return m[1];
  }
  return null;
}

/* ────────────────────────────────────────────────────────
   ⑥ NAVIGATION MODULE
──────────────────────────────────────────────────────── */
function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });
}

function switchTab(tabId) {
  STATE.activeTab = tabId;
  // Hide all panels — remove 'active' from all tab-panel elements
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

  const panel = $('tab-' + tabId);
  if (panel) panel.classList.add('active');

  const navBtn = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
  if (navBtn) navBtn.classList.add('active');

  // The AI tab uses flex layout and manages its own internal scroll.
  // When activated, scroll its chat body to the bottom.
  if (tabId === 'ai') {
    const chatBody = $('ai-chat-body');
    if (chatBody) requestAnimationFrame(() => { chatBody.scrollTop = chatBody.scrollHeight; });
  }

  if (tabId === 'register') {
    renderRegistrationView();
  }
}

/* ────────────────────────────────────────────────────────
   ⑦ ADMIN MODULE
──────────────────────────────────────────────────────── */
function initAdmin() {
  const title = $('header-title');
  const modal = $('admin-modal');
  const input = $('admin-passcode-input');
  const errBox = $('admin-error');

  title.addEventListener('click', () => {
    if (STATE.isAdmin) {
      // Toggle admin panel off
      STATE.isAdmin = false;
      $('admin-panel').classList.add('hidden');
      $('admin-badge').classList.add('hidden');
      showToast('Admin mode deactivated.');
      return;
    }
    input.value = '';
    errBox.classList.add('hidden');
    modal.classList.remove('hidden');
    setTimeout(() => input.focus(), 200);
  });

  $('admin-cancel-btn').addEventListener('click', () => modal.classList.add('hidden'));

  $('admin-confirm-btn').addEventListener('click', attemptAdminLogin);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') attemptAdminLogin(); });

  // Post announcement
  $('post-announce-btn').addEventListener('click', async () => {
    const title = $('announce-title').value.trim();
    const body = $('announce-body').value.trim();
    if (!title || !body) { showToast('⚠️ Please fill in both fields.'); return; }
    try {
      const r = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body })
      });
      const data = await r.json();
      if (!r.ok) { showToast('⚠️ ' + (data.error || 'Could not post announcement.')); return; }
      await loadAnnouncements();
      logActivity(`📣 Announcement posted: "${title}"`);
      $('announce-title').value = '';
      $('announce-body').value = '';
      showToast('✅ Announcement posted!');
    } catch (err) {
      showToast('⚠️ Network error — could not post announcement.');
    }
  });

  // Post event
  $('post-event-btn').addEventListener('click', async () => {
    const title = $('event-title-input').value.trim();
    const dateVal = $('event-date-input').value;
    const desc = $('event-desc-input').value.trim();
    if (!title || !dateVal) { showToast('⚠️ Please add a title and date.'); return; }
    try {
      const r = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date: dateVal, desc })
      });
      const data = await r.json();
      if (!r.ok) { showToast('⚠️ ' + (data.error || 'Could not add event.')); return; }
      await loadEvents();
      logActivity(`📅 Event scheduled: "${title}" on ${formatDate(data.event.date)}`);
      $('event-title-input').value = '';
      $('event-date-input').value = '';
      $('event-desc-input').value = '';
      showToast('✅ Event added to calendar!');
    } catch (err) {
      showToast('⚠️ Network error — could not add event.');
    }
  });

  // Clear log
  $('clear-log-btn').addEventListener('click', async () => {
    STATE.activityLog = [];
    renderActivityLog();
    try {
      await fetch('/api/activity-log/clear', { method: 'POST' });
    } catch (err) {
      console.error('Failed to clear activity log:', err);
    }
    showToast('Log cleared.');
  });
}

function attemptAdminLogin() {
  const input = $('admin-passcode-input');
  const errBox = $('admin-error');
  if (input.value === CONFIG.ADMIN_PASSCODE) {
    STATE.isAdmin = true;
    $('admin-modal').classList.add('hidden');
    $('admin-panel').classList.remove('hidden');
    $('admin-badge').classList.remove('hidden');
    logActivity('🔓 Admin logged in.');
    showToast('✅ Admin panel unlocked!');
  } else {
    errBox.classList.remove('hidden');
    input.value = '';
    input.focus();
  }
}

function renderActivityLog() {
  const log = $('activity-log');
  if (STATE.activityLog.length === 0) {
    log.innerHTML = '<p class="empty-state">No activity yet.</p>';
    return;
  }
  log.innerHTML = STATE.activityLog.map(e =>
    `<div class="log-entry"><span class="log-time">${e.time}</span>${sanitize(e.msg)}</div>`
  ).join('');
}

/* ────────────────────────────────────────────────────────
   ⑧ HOME MODULE — Scripture + Announcements
──────────────────────────────────────────────────────── */
function initHome() {
  const todayIndex = new Date().getDate() % SCRIPTURES.length;
  setVerse(SCRIPTURES[todayIndex]);

  $('new-verse-btn').addEventListener('click', () => {
    const idx = Math.floor(Math.random() * SCRIPTURES.length);
    setVerse(SCRIPTURES[idx]);
  });

  loadAnnouncements();
  loadActivityLog();
}

function setVerse(s) {
  $('daily-verse').textContent = `"${s.verse}"`;
  $('daily-ref').textContent = `— ${s.ref}`;
}

function renderAnnouncements() {
  const list = $('announcements-list');
  if (STATE.announcements.length === 0) {
    list.innerHTML = '<p class="empty-state">No announcements yet.</p>';
    return;
  }
  list.innerHTML = STATE.announcements.map(a => `
    <div class="announcement-card">
      <div class="ann-header">
        <div class="ann-title">${sanitize(a.title)}</div>
        <div class="ann-date">${formatDate(a.date)}</div>
      </div>
      <div class="ann-body">${sanitize(a.body)}</div>
      ${STATE.isAdmin ? `<button class="btn-danger-sm" style="margin-top:8px" onclick="deleteAnnouncement('${a.id}')">🗑 Delete</button>` : ''}
    </div>
  `).join('');
}

async function deleteAnnouncement(id) {
  if (!confirm('Delete this announcement?')) return;
  try {
    const r = await fetch('/api/announcements/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (!r.ok) { showToast('⚠️ Could not delete announcement.'); return; }
    await loadAnnouncements();
    showToast('🗑 Announcement deleted.');
    logActivity('🗑 Announcement deleted');
  } catch (err) {
    showToast('⚠️ Network error — could not delete announcement.');
  }
}
window.deleteAnnouncement = deleteAnnouncement;

/* ────────────────────────────────────────────────────────
   ⑨ FELLOWSHIP / JITSI MODULE
──────────────────────────────────────────────────────── */
function initFellowship() {
  $('join-meeting-btn').addEventListener('click', joinMeeting);
  $('leave-meeting-btn').addEventListener('click', leaveMeeting);
}

function joinMeeting() {
  const room = $('jitsi-room-input').value.trim().replace(/\s+/g, '-') || 'ChosenGenHub';
  const name = encodeURIComponent($('jitsi-name-input').value.trim() || 'Community Member');
  const url = `https://${CONFIG.JITSI_DOMAIN}/${room}#userInfo.displayName="${name}"&config.startWithAudioMuted=false&config.startWithVideoMuted=false`;

  $('jitsi-frame').src = url;
  $('active-room-name').textContent = room;
  $('jitsi-container').classList.remove('hidden');
  $('join-meeting-btn').closest('.meeting-card').style.display = 'none';

  const dot = $('meeting-status-dot');
  dot.classList.add('live');
  $('meeting-status-text').textContent = `Live: ${room}`;

  logActivity(`🎙 Joined meeting room: ${room}`);
  showToast('✅ Joining meeting room…');
}

function leaveMeeting() {
  $('jitsi-frame').src = '';
  $('jitsi-container').classList.add('hidden');
  $('join-meeting-btn').closest('.meeting-card').style.display = '';
  $('meeting-status-dot').classList.remove('live');
  $('meeting-status-text').textContent = 'No active meeting';
  showToast('👋 You left the meeting.');
}

/* ────────────────────────────────────────────────────────
   ⑩ RESOURCES MODULE
──────────────────────────────────────────────────────── */
function initResources() {
  // Sub-tab switching — strip legacy 'hidden' class and use inline display
  document.querySelectorAll('.sub-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sub-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.sub-panel').forEach(p => {
        p.classList.remove('active', 'hidden');
        p.style.display = 'none';
      });
      btn.classList.add('active');
      const sub = btn.dataset.sub;
      STATE.activeSubTab = sub;
      const panel = $('sub-' + sub);
      if (panel) { panel.style.display = 'block'; panel.classList.add('active'); }
    });
  });

  // On first load: strip hidden class, show only active sub-panel
  document.querySelectorAll('.sub-panel').forEach(p => {
    p.classList.remove('hidden');
    p.style.display = p.classList.contains('active') ? 'block' : 'none';
  });

  initBible();
  initYouTube();
  initDocs();
  initScout();
  initDownloader();
  initDocUpload();
  refreshUploadedDocs(); // load any previously uploaded docs on startup
}

/* ── BIBLE ── */

// Chapter counts per book (0-indexed, matches BIBLE_BOOKS_SW / BIBLE_BOOKS_EN order)
// used so the chapter dropdown only ever shows real chapters, not a fixed 1-150.
const BIBLE_CHAPTER_COUNTS = [
  50,40,27,36,34,24,21,4,31,24,22,25,29,36,10,13,10,42,150,31,12,8,66,52,5,48,12,14,3,9,2,4,7,3,3,3,2,14,4, // OT (39 books)
  28,16,24,21,28,16,16,13,6,6,4,4,5,3,6,4,3,2,13,5,5,3,5,1,1,1,22 // NT (27 books)
];

// Fetch the full Swahili Bible (bible-sw.json) once, on demand. Cached in
// BIBLE_DATA_SW_FULL for the rest of the session, and cached offline by the
// service worker after the first successful load.
function loadSwahiliBible() {
  if (BIBLE_DATA_SW_FULL) return Promise.resolve(BIBLE_DATA_SW_FULL);
  if (_bibleSwLoadPromise) return _bibleSwLoadPromise;

  _bibleSwLoadPromise = fetch('bible-sw.json')
    .then(res => { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
    .then(data => { BIBLE_DATA_SW_FULL = data; return data; })
    .catch(err => {
      console.warn('[Bible] Could not load full Swahili Bible, using sample only:', err);
      _bibleSwLoadPromise = null; // allow retry on next attempt
      return BIBLE_DATA_SW; // fallback to the small built-in sample
    });

  return _bibleSwLoadPromise;
}

const ENGLISH_BIBLE_VERSIONS = {
  kjv: { file: 'bible-en-kjv.json', label: 'King James Version (KJV)' },
  asv: { file: 'bible-en-asv.json', label: 'American Standard Version (ASV)' }
};

// Fetch a full English translation (KJV or ASV) once, on demand.
function loadEnglishBible(version) {
  if (ENGLISH_BIBLE_DATA_CACHE[version]) return Promise.resolve(ENGLISH_BIBLE_DATA_CACHE[version]);
  if (_englishBibleLoadPromises[version]) return _englishBibleLoadPromises[version];

  const meta = ENGLISH_BIBLE_VERSIONS[version];
  _englishBibleLoadPromises[version] = fetch(meta.file)
    .then(res => { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
    .then(data => { ENGLISH_BIBLE_DATA_CACHE[version] = data; return data; })
    .catch(err => {
      console.warn(`[Bible] Could not load ${version.toUpperCase()}, using sample only:`, err);
      delete _englishBibleLoadPromises[version]; // allow retry
      return BIBLE_DATA_EN; // fallback to the small built-in sample
    });

  return _englishBibleLoadPromises[version];
}

function initBible() {
  const langSel = $('bible-lang-select');
  const versionSel = $('bible-version-select');
  const bookSel = $('bible-book-select');
  const chapSel = $('bible-chapter-select');
  const verseSel = $('bible-verse-select');

  // Loads whichever translation/language is currently selected.
  function loadCurrentBible() {
    if (langSel.value === 'sw') return loadSwahiliBible();
    return loadEnglishBible(versionSel.value);
  }

  function populateBooks() {
    const books = langSel.value === 'en' ? BIBLE_BOOKS_EN : BIBLE_BOOKS_SW;
    bookSel.innerHTML = books.map((b, i) => `<option value="${i}">${b}</option>`).join('');
    versionSel.style.display = langSel.value === 'en' ? '' : 'none';
    populateChapters();
    loadCurrentBible(); // warm the cache so Read Chapter feels instant
  }

  function populateChapters() {
    const bookIdx = parseInt(bookSel.value) || 0;
    const count = BIBLE_CHAPTER_COUNTS[bookIdx] || 150;
    chapSel.innerHTML = '';
    for (let i = 1; i <= count; i++) {
      chapSel.innerHTML += `<option value="${i}">${i}</option>`;
    }
    populateVerses();
  }

  async function populateVerses() {
    const bookIdx = parseInt(bookSel.value);
    const chap = parseInt(chapSel.value);
    const key = `${bookIdx}_${chap}`;
    const data = await loadCurrentBible();
    const verses = data[key] || [];
    verseSel.innerHTML = '<option value="0">Full Chapter</option>' +
      verses.map((_, i) => `<option value="${i+1}">Verse ${i+1}</option>`).join('');
  }

  langSel.addEventListener('change', populateBooks);
  versionSel.addEventListener('change', () => { populateVerses(); loadCurrentBible(); });
  bookSel.addEventListener('change', () => { populateChapters(); });
  chapSel.addEventListener('change', populateVerses);
  populateBooks();

  $('bible-read-btn').addEventListener('click', async () => {
    const lang = langSel.value;
    const bookIdx = parseInt(bookSel.value);
    const chap = parseInt(chapSel.value);
    const verseIdx = parseInt(verseSel.value);
    const books = lang === 'en' ? BIBLE_BOOKS_EN : BIBLE_BOOKS_SW;
    const key = `${bookIdx}_${chap}`;
    const out = $('bible-output');
    const versionLabel = lang === 'en' ? ENGLISH_BIBLE_VERSIONS[versionSel.value].label : 'Kiswahili';

    out.innerHTML = `<p class="empty-state">📖 Loading…</p>`;

    const data = await loadCurrentBible();
    const verses = data[key];

    if (!verses) {
      out.innerHTML = `<p class="empty-state">📖 This chapter is not available.</p>`;
      return;
    }

    const bookName = books[bookIdx];
    const subset = verseIdx === 0 ? verses : [verses[verseIdx - 1]].filter(Boolean);
    const startNum = verseIdx === 0 ? 1 : verseIdx;

    out.innerHTML = `
      <div class="bible-chapter-header">${sanitize(bookName)} ${chap} (${sanitize(versionLabel)})</div>
      ${subset.map((v, i) => `
        <div class="bible-verse-row">
          <span class="verse-num">${startNum + i}</span>
          <span class="verse-text">${sanitize(v)}</span>
        </div>`).join('')}`;

    out.scrollTop = 0;
  });
}

/* ── YOUTUBE ── */
function initYouTube() {
  $('yt-search-btn').addEventListener('click', searchYouTube);
  $('yt-search-input').addEventListener('keydown', e => { if (e.key === 'Enter') searchYouTube(); });
  $('yt-close-btn').addEventListener('click', closeYTPlayer);

  $('yt-manual-btn').addEventListener('click', () => {
    const val = $('yt-manual-input').value.trim();
    const vid = extractVideoId(val);
    if (vid) {
      playYouTubeVideo(vid, 'Manual Entry');
    } else {
      showToast('⚠️ Invalid YouTube URL or Video ID.');
    }
  });
}

async function searchYouTube() {
  const q = $('yt-search-input').value.trim();
  if (!q) return;

  if (CONFIG.YOUTUBE_API_KEY === 'PASTE_YOUR_YOUTUBE_API_KEY_HERE') {
    $('yt-results').innerHTML = `
      <div class="info-box" style="margin:0">
        <strong>YouTube API Key Not Set</strong><br>
        Open <code>app.js</code> and paste your YouTube Data API v3 key into <code>CONFIG.YOUTUBE_API_KEY</code>.<br><br>
        You can still use the manual Video ID field above to play any YouTube video.
      </div>`;
    return;
  }

  $('yt-results').innerHTML = '<p class="empty-state">Searching…</p>';

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=8&q=${encodeURIComponent(q)}&key=${CONFIG.YOUTUBE_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      $('yt-results').innerHTML = `<p class="empty-state">API Error: ${sanitize(data.error.message)}</p>`;
      return;
    }

    if (!data.items || data.items.length === 0) {
      $('yt-results').innerHTML = '<p class="empty-state">No results found. Try different keywords.</p>';
      return;
    }

    $('yt-results').innerHTML = data.items.map(item => {
      const vid = item.id.videoId;
      const thumb = item.snippet.thumbnails?.medium?.url || '';
      const title = item.snippet.title;
      const channel = item.snippet.channelTitle;
      return `
        <div class="yt-card" onclick="playYouTubeVideo('${vid}', '${sanitize(title).replace(/'/g, "\\'")}')">
          <img class="yt-thumb" src="${thumb}" alt="" loading="lazy" />
          <div class="yt-info">
            <div class="yt-title">${sanitize(title)}</div>
            <div class="yt-channel">${sanitize(channel)}</div>
          </div>
        </div>`;
    }).join('');

  } catch (err) {
    $('yt-results').innerHTML = '<p class="empty-state">Network error. Check your connection.</p>';
  }
}

function playYouTubeVideo(videoId, title) {
  const container = $('yt-player-container');
  $('yt-frame').src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  $('yt-now-playing').textContent = title || 'Now Playing';
  container.classList.remove('hidden');
  container.scrollIntoView({ behavior: 'smooth' });
  logActivity(`▶️ Playing: ${title}`);
}

function closeYTPlayer() {
  $('yt-frame').src = '';
  $('yt-player-container').classList.add('hidden');
}
window.playYouTubeVideo = playYouTubeVideo;

/* ── DOCUMENTS ── */
function initDocs() {
  renderDocs(CONFIG.DOCUMENTS);
  $('doc-search-btn').addEventListener('click', () => {
    const q = $('doc-search-input').value.trim().toLowerCase();
    const filtered = CONFIG.DOCUMENTS.filter(d =>
      d.title.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q)
    );
    renderDocs(filtered);
  });
  $('doc-search-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') $('doc-search-btn').click();
  });
}

function renderDocs(docs) {
  const list = $('docs-list');
  if (docs.length === 0) {
    list.innerHTML = '<p class="empty-state">No documents found.</p>';
    return;
  }
  list.innerHTML = docs.map(doc => {
    const isSaved = STATE.savedDocs.includes(doc.id);
    return `
      <div class="doc-card">
        <div class="doc-icon">📄</div>
        <div class="doc-info">
          <div class="doc-title">${sanitize(doc.title)}</div>
          <div class="doc-desc">${sanitize(doc.desc)}</div>
        </div>
        <div class="doc-actions">
          <a href="${doc.url}" target="_blank" class="btn-outline-sm">Preview</a>
          <button class="btn-outline-sm ${isSaved ? 'saved' : ''}" onclick="saveDocOffline('${doc.id}', '${doc.url}', this)">
            ${isSaved ? '✓ Saved' : '⬇ Offline'}
          </button>
        </div>
      </div>`;
  }).join('');
}

async function saveDocOffline(docId, url, btn) {
  if (!('caches' in window)) {
    showToast('⚠️ Cache not supported on this browser.');
    return;
  }
  btn.textContent = 'Saving…';
  btn.disabled = true;
  try {
    const cache = await caches.open('cga-docs-v1');
    await cache.add(url);
    if (!STATE.savedDocs.includes(docId)) STATE.savedDocs.push(docId);
    saveState();
    btn.textContent = '✓ Saved';
    btn.classList.add('saved');
    showToast('✅ Saved for offline reading!');
    logActivity(`📥 Saved offline: ${url}`);
  } catch (err) {
    btn.textContent = '⬇ Offline';
    btn.disabled = false;
    showToast('⚠️ Could not save. Check file URL.');
  }
}
window.saveDocOffline = saveDocOffline;

/* ── OPEN LIBRARY SCOUT ── */
function initScout() {
  $('scout-search-btn').addEventListener('click', searchScout);
  $('scout-search-input').addEventListener('keydown', e => { if (e.key === 'Enter') searchScout(); });
}

async function searchScout() {
  const q = $('scout-search-input').value.trim();
  if (!q) return;
  const out = $('scout-results');
  out.innerHTML = '<p class="empty-state">Searching Open Library…</p>';
  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q + ' christian theology')}&limit=12&fields=key,title,author_name,first_publish_year,cover_i`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.docs || data.docs.length === 0) {
      out.innerHTML = '<p class="empty-state">No results found. Try different keywords.</p>';
      return;
    }
    out.innerHTML = data.docs.map(book => {
      const author = book.author_name ? book.author_name[0] : 'Unknown Author';
      const year = book.first_publish_year || '';
      const readUrl = `https://openlibrary.org${book.key}`;
      return `
        <div class="scout-card">
          <div class="scout-title">${sanitize(book.title)}</div>
          <div class="scout-author">${sanitize(author)}${year ? ' · ' + year : ''}</div>
          <a href="${readUrl}" target="_blank" class="scout-link">Read on Open Library →</a>
        </div>`;
    }).join('');
  } catch (err) {
    out.innerHTML = '<p class="empty-state">Network error. Check your connection.</p>';
  }
}

/* ────────────────────────────────────────────────────────
   ⑪ PRAYER WALL MODULE
──────────────────────────────────────────────────────── */
function initPrayerWall() {
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      STATE.currentPrayerType = btn.dataset.type;
    });
  });

  $('post-prayer-btn').addEventListener('click', postPrayer);
  loadPrayers();
}

async function postPrayer() {
  const body = $('prayer-body').value.trim();
  if (!body) { showToast('⚠️ Please write something first.'); return; }
  const author = $('prayer-author').value.trim() || 'Anonymous';
  const type = STATE.currentPrayerType;
  try {
    const r = await fetch('/api/prayers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, author, body })
    });
    const data = await r.json();
    if (!r.ok) { showToast('⚠️ ' + (data.error || 'Could not post.')); return; }
    await loadPrayers();
    $('prayer-body').value = '';
    $('prayer-author').value = '';
    const typeLabel = type === 'prayer' ? '🙏 Prayer request' : '🎉 Praise report';
    showToast(`✅ ${typeLabel} posted!`);
    logActivity(`${typeLabel} by ${author}`);
  } catch (err) {
    showToast('⚠️ Network error — could not post.');
  }
}

function renderPrayers() {
  const feed = $('prayer-feed');
  if (STATE.prayers.length === 0) {
    feed.innerHTML = '<p class="empty-state">No posts yet. Be the first to share!</p>';
    return;
  }
  feed.innerHTML = STATE.prayers.map(p => {
    const amened = !!p.amened;
    const count = p.amens || 0;
    return `
      <div class="prayer-card ${p.type}">
        <div class="prayer-header">
          <div class="prayer-meta">
            <span class="prayer-type-badge ${p.type}">${p.type === 'prayer' ? '🙏 Prayer' : '🎉 Praise'}</span>
            <span class="prayer-author">${sanitize(p.author)}</span>
          </div>
          <span class="prayer-date">${formatDate(p.date)}</span>
        </div>
        <div class="prayer-text">${sanitize(p.body)}</div>
        <button class="amen-btn ${amened ? 'amened' : ''}" onclick="toggleAmen('${p.id}')">
          🙌 Amen <span class="amen-count">${count}</span>
        </button>
      </div>`;
  }).join('');
}

async function toggleAmen(postId) {
  const post = STATE.prayers.find(p => p.id === postId);
  if (!post) return;
  try {
    const r = await fetch(`/api/prayers/${postId}/amen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: DEVICE_ID })
    });
    const data = await r.json();
    if (!r.ok) { showToast('⚠️ ' + (data.error || 'Could not update Amen.')); return; }
    post.amened = data.amened;
    post.amens = data.amens;
    renderPrayers();
  } catch (err) {
    showToast('⚠️ Network error — could not update Amen.');
  }
}
window.toggleAmen = toggleAmen;

/* ────────────────────────────────────────────────────────
   ⑫ CALENDAR MODULE
──────────────────────────────────────────────────────── */
function initCalendar() {
  loadEvents();
}

function renderEvents() {
  const list = $('events-list');
  if (STATE.events.length === 0) {
    list.innerHTML = '<p class="empty-state">No upcoming events. Check back soon!</p>';
    return;
  }
  // Sort by date ascending
  const sorted = [...STATE.events].sort((a, b) => new Date(a.date) - new Date(b.date));
  list.innerHTML = sorted.map(ev => {
    const attending = !!ev.attending;
    return `
      <div class="event-card">
        <div class="event-date-badge">
          <div class="event-badge-day">${getDayNum(ev.date)}</div>
          <div class="event-badge-month">${getMonthAbbr(ev.date)}</div>
        </div>
        <div class="event-info">
          <div class="event-title">${sanitize(ev.title)}</div>
          <div class="event-time">🕐 ${sanitize(ev.time)} · ${formatDateTime(ev.date)}</div>
          <div class="event-desc">${sanitize(ev.desc)}</div>
          <button class="rsvp-btn ${attending ? 'attending' : ''}" onclick="toggleRSVP('${ev.id}')">
            ${attending ? '✅ Attending' : '📋 I\'m Attending'}
            <span class="rsvp-count">${ev.rsvpCount || 0}</span>
          </button>
          ${STATE.isAdmin ? `<button class="btn-danger-sm" style="margin-top:8px" onclick="deleteEvent('${ev.id}')">🗑 Delete</button>` : ''}
        </div>
      </div>`;
  }).join('');
}

async function deleteEvent(id) {
  if (!confirm('Delete this event?')) return;
  try {
    const r = await fetch('/api/events/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (!r.ok) { showToast('⚠️ Could not delete event.'); return; }
    await loadEvents();
    showToast('🗑 Event deleted.');
    logActivity('🗑 Event deleted');
  } catch (err) {
    showToast('⚠️ Network error — could not delete event.');
  }
}
window.deleteEvent = deleteEvent;

async function toggleRSVP(eventId) {
  const ev = STATE.events.find(e => e.id === eventId);
  if (!ev) return;
  try {
    const r = await fetch(`/api/events/${eventId}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: DEVICE_ID })
    });
    const data = await r.json();
    if (!r.ok) { showToast('⚠️ ' + (data.error || 'Could not update RSVP.')); return; }
    ev.attending = data.attending;
    ev.rsvpCount = data.rsvpCount;
    renderEvents();
    showToast(data.attending ? `✅ RSVP confirmed for "${ev.title}"!` : 'RSVP cancelled.');
  } catch (err) {
    showToast('⚠️ Network error — could not update RSVP.');
  }
}
window.toggleRSVP = toggleRSVP;

/* ────────────────────────────────────────────────────────
   ⑬ SERVICE WORKER REGISTRATION
──────────────────────────────────────────────────────── */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('[SW] Registered:', reg.scope))
      .catch(err => console.warn('[SW] Registration failed:', err));
  }
}

/* ────────────────────────────────────────────────────────
   ⑭ APP INIT — single entry point
──────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  registerServiceWorker();
  initNavigation();
  initAdmin();
  initHome();
  initFellowship();
  initResources();
  initPrayerWall();
  initCalendar();
  initAIAssistant();  // ← AI module
  initMemberSystem(); // ← Member Registry (Registration, Secretary, Treasurer)
  renderActivityLog();
  console.log('[Chosen Gen Hub] App initialized ✝');
});

/* ────────────────────────────────────────────────────────
   ⑮ AI FAITH ASSISTANT MODULE
──────────────────────────────────────────────────────── */

// Rolling conversation history array sent to backend each turn
// Format mirrors Gemini multi-turn: [{role: "user"|"model", parts:[{text}]}]
let AI_HISTORY = [];

function initAIAssistant() {
  const input    = $('ai-input');
  const sendBtn  = $('ai-send-btn');
  const clearBtn = $('ai-clear-btn');
  const chips    = document.querySelectorAll('.ai-chip');

  // Send on button click
  sendBtn.addEventListener('click', handleAISend);

  // Send on Enter key
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAISend();
    }
  });

  // Pre-set prompt chips: paste text + send immediately
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.prompt;
      input.focus();
      handleAISend();
    });
  });

  // Clear conversation
  clearBtn.addEventListener('click', clearAIChat);
}

async function handleAISend() {
  const input   = $('ai-input');
  const sendBtn = $('ai-send-btn');
  const message = input.value.trim();
  if (!message) return;

  // Append user bubble
  appendAIBubble('user', message);
  input.value = '';
  sendBtn.disabled = true;

  // Show typing loader
  const loaderId = showAITypingLoader();

  // Add to history before sending
  AI_HISTORY.push({ role: 'user', parts: [{ text: message }] });

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history: AI_HISTORY })
    });

    removeAILoader(loaderId);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server error ${res.status}`);
    }

    const data = await res.json();
    const reply = data.response || '(No response received)';

    // Append model reply
    appendAIBubble('model', reply);

    // Append model turn to history
    AI_HISTORY.push({ role: 'model', parts: [{ text: reply }] });

    // Keep history from growing unbounded (last 20 turns = 10 exchanges)
    if (AI_HISTORY.length > 20) AI_HISTORY = AI_HISTORY.slice(-20);

  } catch (err) {
    removeAILoader(loaderId);
    console.error('[AI] Request failed:', err);
    showAIError('Unable to connect to your assistant. Check connection or verify backend API key.');
  }

  sendBtn.disabled = false;
}

function appendAIBubble(role, text) {
  const body = $('ai-chat-body');
  const isUser = role === 'user';
  const div = document.createElement('div');
  div.className = `ai-bubble ${isUser ? 'ai-bubble-user' : 'ai-bubble-model'}`;

  const inner = document.createElement('div');
  inner.className = 'ai-bubble-content';
  inner.innerHTML = isUser ? sanitize(text) : formatAIResponse(text);

  div.appendChild(inner);
  body.appendChild(div);
  scrollAIChat();
}

function showAITypingLoader() {
  const body = $('ai-chat-body');
  const id = 'loader-' + Date.now();
  const div = document.createElement('div');
  div.id = id;
  div.className = 'ai-bubble ai-bubble-model';
  div.innerHTML = `
    <div class="ai-bubble-content ai-typing-loader">
      <span></span><span></span><span></span>
    </div>`;
  body.appendChild(div);
  scrollAIChat();
  return id;
}

function removeAILoader(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function showAIError(msg) {
  const body = $('ai-chat-body');
  const div = document.createElement('div');
  div.className = 'ai-error-notice';
  div.textContent = '⚠️ ' + msg;
  body.appendChild(div);
  scrollAIChat();
}

function clearAIChat() {
  AI_HISTORY = [];
  const body = $('ai-chat-body');
  body.innerHTML = `
    <div class="ai-bubble ai-bubble-model">
      <div class="ai-bubble-content">
        <p>Conversation cleared. ✝ How else may I serve you?</p>
      </div>
    </div>`;
  showToast('Conversation cleared.');
}

function scrollAIChat() {
  const body = $('ai-chat-body');
  requestAnimationFrame(() => {
    body.scrollTop = body.scrollHeight;
  });
}

/**
 * Convert basic markdown-style formatting to HTML for AI responses.
 * Handles: **bold**, *italic*, line breaks, and bullet lists.
 */
function formatAIResponse(text) {
  // Escape raw HTML first
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // **bold**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // *italic* (single asterisk or underscore)
  html = html.replace(/\*([^*\n]+?)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_\n]+?)_/g, '<em>$1</em>');

  // Process line-by-line to wrap bullet points and paragraphs
  const lines = html.split('\n');
  const parts = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.match(/^[-•*]\s+/)) {
      // Bullet point
      if (!inList) { parts.push('<ul>'); inList = true; }
      parts.push('<li>' + line.replace(/^[-•*]\s+/, '') + '</li>');
    } else {
      if (inList) { parts.push('</ul>'); inList = false; }
      if (line === '') {
        parts.push(''); // blank line = paragraph break
      } else {
        parts.push('<p>' + line + '</p>');
      }
    }
  }
  if (inList) parts.push('</ul>');

  return parts.join('');
}

// AI module is initialised in the main DOMContentLoaded above.

/* ════════════════════════════════════════════════════════
   ⑯ VIDEO DOWNLOADER MODULE
   Uses the server-side /api/download route which proxies
   through yt-dlp (installed on the Node server).
   Frontend: fetch info → show formats → user picks → download.
════════════════════════════════════════════════════════ */

// In-memory download history (persisted to localStorage)
let DL_HISTORY = JSON.parse(localStorage.getItem('cga_dl_history') || '[]');
let DL_SELECTED_FORMAT = null;
let DL_CURRENT_INFO    = null;

function initDownloader() {
  $('dl-fetch-btn').addEventListener('click', dlFetchInfo);
  $('dl-url-input').addEventListener('keydown', e => { if (e.key === 'Enter') dlFetchInfo(); });
  $('dl-download-btn').addEventListener('click', dlStartDownload);
  renderDlHistory();
}

/* ── Step 1: Fetch video metadata and available formats ── */
async function dlFetchInfo() {
  const raw = $('dl-url-input').value.trim();
  if (!raw) { showToast('⚠️ Paste a YouTube URL or video ID first.'); return; }

  // Extract video ID from URL or bare ID
  const vid = extractVideoId(raw) || (raw.length === 11 ? raw : null);
  if (!vid) {
    showToast('⚠️ Could not read a valid YouTube video ID.');
    return;
  }

  dlSetStatus('loading', 'Fetching video info…');
  $('dl-info-card').classList.add('hidden');
  $('dl-download-btn').disabled = true;
  DL_SELECTED_FORMAT = null;

  try {
    const res = await fetch('/api/download/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId: vid })
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      dlSetStatus('error', data.error || 'Could not fetch video info. Check the URL.');
      return;
    }

    DL_CURRENT_INFO = data;
    dlRenderInfoCard(data);
    dlSetStatus('info', 'Select a format below, then tap Download.');
    $('dl-info-card').classList.remove('hidden');

  } catch (err) {
    dlSetStatus('error', 'Server unreachable. Make sure the backend (node server.js) is running.');
  }
}

/* ── Render the video info card with format buttons ── */
function dlRenderInfoCard(info) {
  // Thumbnail & meta
  $('dl-thumb').src = info.thumbnail || `https://img.youtube.com/vi/${info.videoId}/mqdefault.jpg`;
  $('dl-title').textContent = info.title || 'Unknown Title';
  $('dl-channel').textContent = info.channel || '';
  $('dl-duration').textContent = info.duration ? `⏱ ${info.duration}` : '';

  // Format buttons
  const grid = $('dl-format-grid');
  grid.innerHTML = '';

  if (!info.formats || info.formats.length === 0) {
    grid.innerHTML = '<p class="empty-state" style="padding:8px 0">No downloadable formats found.</p>';
    return;
  }

  info.formats.forEach((fmt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'dl-format-btn';
    btn.dataset.idx = idx;
    btn.innerHTML = `
      <span class="fmt-quality">${sanitize(fmt.quality || fmt.format_id)}</span>
      <span class="fmt-type">${sanitize(fmt.ext || 'mp4')}</span>
      <span class="fmt-size">${fmt.filesize ? formatBytes(fmt.filesize) : '~'}</span>`;

    btn.addEventListener('click', () => {
      document.querySelectorAll('.dl-format-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      DL_SELECTED_FORMAT = fmt;
      $('dl-download-btn').disabled = false;
      dlSetStatus('info', `Selected: ${fmt.quality || fmt.format_id} · ${fmt.ext} · ${fmt.filesize ? formatBytes(fmt.filesize) : 'size unknown'}`);
    });

    grid.appendChild(btn);
  });
}

/* ── Step 2: Trigger download via server proxy ── */
async function dlStartDownload() {
  if (!DL_SELECTED_FORMAT || !DL_CURRENT_INFO) {
    showToast('⚠️ Select a format first.');
    return;
  }

  const { videoId, title, thumbnail, channel } = DL_CURRENT_INFO;
  const fmt = DL_SELECTED_FORMAT;

  dlSetStatus('loading', `Preparing download: ${fmt.quality || fmt.format_id}…`);
  $('dl-download-btn').disabled = true;

  try {
    // The server streams the file back; we trigger a browser download via blob URL.
    const res = await fetch('/api/download/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId, formatId: fmt.format_id, ext: fmt.ext || 'mp4' })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server error ${res.status}`);
    }

    // Stream response as blob
    const total = parseInt(res.headers.get('Content-Length') || '0');
    const reader = res.body.getReader();
    const chunks = [];
    let received = 0;

    dlShowProgressBar();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      if (total > 0) {
        const pct = Math.round((received / total) * 100);
        dlUpdateProgressBar(pct);
        dlSetStatus('loading', `Downloading… ${pct}% (${formatBytes(received)} / ${formatBytes(total)})`);
      } else {
        dlSetStatus('loading', `Downloading… ${formatBytes(received)} received`);
      }
    }

    // Combine chunks and trigger browser save dialog
    const blob = new Blob(chunks);
    const safeName = (title || 'video').replace(/[^a-zA-Z0-9\s_-]/g, '').trim().replace(/\s+/g, '_');
    const filename = `${safeName}.${fmt.ext || 'mp4'}`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);

    dlSetStatus('ok', `✅ "${title}" downloaded as ${filename}`);
    $('dl-download-btn').disabled = false;

    // Save to history
    dlAddToHistory({ videoId, title, thumbnail, channel, quality: fmt.quality || fmt.format_id, ext: fmt.ext, date: new Date().toISOString() });
    showToast(`✅ Download complete!`);
    logActivity(`⬇ Downloaded: ${title} (${fmt.quality || fmt.format_id})`);

  } catch (err) {
    dlSetStatus('error', `Download failed: ${err.message}`);
    $('dl-download-btn').disabled = false;
  }
}

/* ── History ── */
function dlAddToHistory(item) {
  DL_HISTORY.unshift(item);
  if (DL_HISTORY.length > 30) DL_HISTORY = DL_HISTORY.slice(0, 30);
  localStorage.setItem('cga_dl_history', JSON.stringify(DL_HISTORY));
  renderDlHistory();
}

function renderDlHistory() {
  const list = $('dl-history-list');
  if (!list) return;
  if (DL_HISTORY.length === 0) {
    list.innerHTML = '<p class="empty-state">No downloads yet.</p>';
    return;
  }
  list.innerHTML = DL_HISTORY.map(item => `
    <div class="dl-history-card">
      <img class="dl-history-thumb" src="${item.thumbnail || `https://img.youtube.com/vi/${item.videoId}/default.jpg`}" alt="" />
      <div class="dl-history-info">
        <div class="dl-history-title">${sanitize(item.title || 'Unknown')}</div>
        <div class="dl-history-meta">${sanitize(item.channel || '')} · ${formatDate(item.date)}</div>
      </div>
      <span class="dl-history-badge">${sanitize(item.quality || item.ext || '')}</span>
    </div>`).join('');
}

/* ── Status helpers ── */
function dlSetStatus(type, msg) {
  const el = $('dl-status');
  el.classList.remove('hidden', 'info', 'ok', 'error', 'loading');
  el.classList.add(type);
  if (type === 'loading') {
    el.innerHTML = `<div class="dl-spinner"></div><span>${sanitize(msg)}</span>`;
  } else {
    el.textContent = msg;
  }
}

function dlShowProgressBar() {
  const el = $('dl-status');
  // Append progress bar if not already there
  if (!el.querySelector('.dl-progress-wrap')) {
    el.insertAdjacentHTML('beforeend', `
      <div class="dl-progress-wrap">
        <div class="dl-progress-bar" id="dl-progress-bar"></div>
      </div>`);
  }
}

function dlUpdateProgressBar(pct) {
  const bar = $('dl-progress-bar');
  if (bar) bar.style.width = pct + '%';
}

/* ── Utility ── */
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
}

// Register downloader in the main init
// initDownloader is called inside initResources()

/* ════════════════════════════════════════════════════════
   DOCUMENT UPLOAD MODULE (Admin only)
════════════════════════════════════════════════════════ */

function initDocUpload() {
  const dropZone  = $('upload-drop-zone');
  const fileInput = $('upload-doc-file');
  const uploadBtn = $('upload-doc-btn');

  // Click drop zone → open file picker
  dropZone.addEventListener('click', () => fileInput.click());

  // Drag and drop
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) setChosenFile(file);
  });

  // File chosen via picker
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) setChosenFile(fileInput.files[0]);
  });

  uploadBtn.addEventListener('click', doUpload);

  // Load existing uploaded docs into admin list
  refreshAdminDocsList();
}

let _chosenFile = null;

function setChosenFile(file) {
  if (!file.name.endsWith('.pdf')) {
    showToast('⚠️ Only PDF files are supported.');
    return;
  }
  _chosenFile = file;
  $('upload-drop-label').textContent = `📄 ${file.name} (${(file.size/1024/1024).toFixed(1)} MB)`;
  $('upload-drop-zone').classList.add('file-chosen');
}

async function doUpload() {
  const title = $('upload-doc-title').value.trim();
  const desc  = $('upload-doc-desc').value.trim();
  const statusEl = $('upload-status');

  if (!title) { showToast('⚠️ Please enter a document title.'); return; }
  if (!_chosenFile) { showToast('⚠️ Please choose a PDF file first.'); return; }

  // Show progress
  const progressWrap = $('upload-progress');
  const progressBar  = $('upload-progress-bar');
  const progressLbl  = $('upload-progress-label');
  progressWrap.classList.remove('hidden');
  progressBar.style.width = '0%';
  progressLbl.textContent = 'Uploading…';
  statusEl.textContent = '';
  statusEl.className = 'upload-status';
  $('upload-doc-btn').disabled = true;

  const formData = new FormData();
  formData.append('pdf', _chosenFile);
  formData.append('title', title);
  formData.append('desc',  desc || '');

  try {
    // Use XMLHttpRequest for progress tracking
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/docs/upload');

      xhr.upload.onprogress = e => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          progressBar.style.width = pct + '%';
          progressLbl.textContent = `${pct}%`;
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
        else reject(new Error(JSON.parse(xhr.responseText)?.error || 'Upload failed'));
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(formData);
    });

    progressBar.style.width = '100%';
    progressLbl.textContent = '100%';
    statusEl.textContent = '✅ Document uploaded successfully!';
    statusEl.className = 'upload-status success';

    // Reset form
    _chosenFile = null;
    $('upload-doc-title').value = '';
    $('upload-doc-desc').value  = '';
    $('upload-doc-file').value  = '';
    $('upload-drop-label').textContent = '📎 Tap to choose a PDF';
    $('upload-drop-zone').classList.remove('file-chosen');

    // Refresh both lists
    await refreshUploadedDocs();
    refreshAdminDocsList();
    logActivity(`📄 Uploaded document: ${title}`);
    showToast('✅ Document uploaded!');

  } catch (err) {
    statusEl.textContent = '❌ ' + err.message;
    statusEl.className = 'upload-status error';
    showToast('❌ Upload failed: ' + err.message);
  } finally {
    $('upload-doc-btn').disabled = false;
    setTimeout(() => progressWrap.classList.add('hidden'), 2000);
  }
}

// Fetch uploaded docs from server and refresh the docs list in the app
async function refreshUploadedDocs() {
  try {
    const res  = await fetch('/api/docs/list');
    const data = await res.json();
    const uploaded = (data.docs || []).map(d => ({
      id:   'uploaded_' + d.filename,
      title: d.title,
      desc:  d.desc || '',
      url:  '/api/docs/file/' + d.filename
    }));

    // Merge with static CONFIG.DOCUMENTS
    const all = [...CONFIG.DOCUMENTS, ...uploaded];
    renderDocs(all);
  } catch (err) {
    console.error('Could not load uploaded docs:', err);
  }
}

// Admin panel list with delete buttons
async function refreshAdminDocsList() {
  const list = $('admin-docs-list');
  if (!list) return;
  try {
    const res  = await fetch('/api/docs/list');
    const data = await res.json();
    const docs = data.docs || [];

    if (docs.length === 0) {
      list.innerHTML = '<p class="empty-state">No uploaded documents yet.</p>';
      return;
    }

    list.innerHTML = docs.map(d => `
      <div class="admin-doc-row" id="admin-doc-row-${d.filename}">
        <div class="admin-doc-row-info">
          <div class="admin-doc-row-title">${d.title}</div>
          <div class="admin-doc-row-desc">${d.desc || d.filename}</div>
        </div>
        <button class="btn-danger-sm" onclick="deleteDoc('${d.filename}')">🗑 Delete</button>
      </div>`).join('');
  } catch (err) {
    list.innerHTML = '<p class="empty-state">Could not load documents.</p>';
  }
}

async function deleteDoc(filename) {
  if (!confirm('Delete this document? This cannot be undone.')) return;
  try {
    const res = await fetch('/api/docs/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Delete failed');
    showToast('🗑 Document deleted.');
    refreshAdminDocsList();
    refreshUploadedDocs();
  } catch (err) {
    showToast('❌ ' + err.message);
  }
}

/* ════════════════════════════════════════════════════════
   MEMBER REGISTRY MODULE
   Handles Registration, Secretary Dashboard, Treasurer Dashboard
════════════════════════════════════════════════════════ */

// Passcodes for role-based access (change before deploying)
const ROLE_PASSCODES = {
  secretary: 'secretary2026',
  treasurer: 'treasurer2026'
};

const ROLE_STATE = {
  secretaryLoggedIn: false,
  treasurerLoggedIn: false,
  pendingRole: null  // which role is being attempted
};

/* ────────────────────────────────────────────────────────
   REGISTRATION MODULE
──────────────────────────────────────────────────────── */

// A device can only register once — after a successful registration we save
// a flag + the name used, so returning to this tab shows "already
// registered" instead of the form. This is NOT a login; it's just so the
// same person doesn't accidentally submit multiple registrations.
function isAlreadyRegistered() {
  return localStorage.getItem('cga_registered') === 'true';
}

function markAsRegistered(fullName) {
  localStorage.setItem('cga_registered', 'true');
  localStorage.setItem('cga_registered_name', fullName || '');
}

function renderRegistrationView() {
  const alreadyCard = $('reg-already-card');
  const successCard = $('reg-success-card');
  const formWrap     = $('reg-form-wrap');

  if (isAlreadyRegistered()) {
    const name = localStorage.getItem('cga_registered_name');
    $('reg-already-msg').textContent = name
      ? `Looks like ${name} already joined from this device. If you need to update your details, please speak to the secretary.`
      : `Looks like you've already joined from this device. If you need to update your details, please speak to the secretary.`;
    alreadyCard.classList.remove('hidden');
    successCard.classList.add('hidden');
    formWrap.classList.add('hidden');
  } else {
    alreadyCard.classList.add('hidden');
    successCard.classList.add('hidden');
    formWrap.classList.remove('hidden');
  }
}

function initRegistration() {
  $('reg-submit-btn').addEventListener('click', submitRegistration);
  $('reg-another-btn').addEventListener('click', () => {
    $('reg-success-card').classList.add('hidden');
    $('reg-form-wrap').classList.remove('hidden');
  });
  renderRegistrationView();
}

async function submitRegistration() {
  const fullName         = $('reg-fullname').value.trim();
  const phone            = $('reg-phone').value.trim();
  const email            = $('reg-email').value.trim();
  const dob              = $('reg-dob').value;
  const gender           = $('reg-gender').value;
  const address          = $('reg-address').value.trim();
  const emergencyContact = $('reg-emergency').value.trim();
  const notes            = $('reg-notes').value.trim();
  const btn              = $('reg-submit-btn');

  if (!fullName) { showRegStatus('error', '⚠️ Please enter your full name.'); return; }
  if (!phone)    { showRegStatus('error', '⚠️ Please enter your phone number.'); return; }

  btn.disabled = true;
  btn.innerHTML = '<span>⏳ Registering…</span>';
  $('reg-status').className = 'reg-status hidden';

  try {
    const res  = await fetch('/api/members/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ fullName, phone, email, dob, gender, address, emergencyContact, notes })
    });
    const data = await res.json();

    if (!res.ok) {
      showRegStatus('error', '❌ ' + (data.error || 'Could not register. Please try again.'));
      btn.disabled = false;
      btn.innerHTML = '<span>✅ Register</span>';
      return;
    }

    markAsRegistered(fullName);
    $('reg-form-wrap').classList.add('hidden');
    $('reg-success-card').classList.remove('hidden');
    resetRegForm();
    btn.disabled = false;
    btn.innerHTML = '<span>✅ Register</span>';

  } catch (err) {
    showRegStatus('error', '❌ Network error. Please try again.');
    btn.disabled = false;
    btn.innerHTML = '<span>✅ Register</span>';
  }
}

function resetRegForm() {
  ['reg-fullname','reg-phone','reg-email','reg-address','reg-emergency','reg-notes'].forEach(id => { const el = $(id); if(el) el.value = ''; });
  const dob = $('reg-dob'); if(dob) dob.value = '';
  const gen = $('reg-gender'); if(gen) gen.value = '';
}

function showRegStatus(type, msg) {
  const el = $('reg-status');
  el.textContent = msg;
  el.className = 'reg-status ' + type;
  el.classList.remove('hidden');
}

/* ────────────────────────────────────────────────────────
   ROLE LOGIN MODAL
──────────────────────────────────────────────────────── */
function initRoleModal() {
  $('role-cancel-btn').addEventListener('click', closeRoleModal);
  $('role-confirm-btn').addEventListener('click', attemptRoleLogin);
  $('role-passcode-input').addEventListener('keydown', e => { if (e.key === 'Enter') attemptRoleLogin(); });

  // Admin panel role buttons
  $('open-secretary-btn').addEventListener('click', () => openRoleModal('secretary'));
  $('open-treasurer-btn').addEventListener('click', () => openRoleModal('treasurer'));
}

function openRoleModal(role) {
  ROLE_STATE.pendingRole = role;
  $('role-modal-title').textContent = role === 'secretary' ? '📋 Secretary Login' : '💰 Treasurer Login';
  $('role-modal-desc').textContent  = role === 'secretary' ? 'Enter the secretary passcode' : 'Enter the treasurer passcode';
  $('role-passcode-input').value = '';
  $('role-error').classList.add('hidden');
  $('role-modal').classList.remove('hidden');
  setTimeout(() => $('role-passcode-input').focus(), 200);
}

function closeRoleModal() {
  $('role-modal').classList.add('hidden');
  ROLE_STATE.pendingRole = null;
}

function attemptRoleLogin() {
  const val  = $('role-passcode-input').value;
  const role = ROLE_STATE.pendingRole;
  if (val === ROLE_PASSCODES[role]) {
    ROLE_STATE[role === 'secretary' ? 'secretaryLoggedIn' : 'treasurerLoggedIn'] = true;
    closeRoleModal();
    if (role === 'secretary') {
      switchTab('secretary');
      loadMembersForSecretary();
    } else {
      switchTab('treasurer');
      loadMembersForTreasurer();
    }
    showToast(`✅ ${role.charAt(0).toUpperCase()+role.slice(1)} dashboard unlocked!`);
  } else {
    $('role-error').classList.remove('hidden');
    $('role-passcode-input').value = '';
    $('role-passcode-input').focus();
  }
}

/* ────────────────────────────────────────────────────────
   SECRETARY DASHBOARD
──────────────────────────────────────────────────────── */
let _allMembers = [];

function initSecretary() {
  $('sec-logout-btn').addEventListener('click', () => {
    ROLE_STATE.secretaryLoggedIn = false;
    switchTab('home');
    showToast('Secretary logged out.');
  });

  $('sec-search').addEventListener('input', renderMemberCards);
  $('sec-filter').addEventListener('change', renderMemberCards);

  $('sec-print-btn').addEventListener('click', printMemberList);
}

async function loadMembersForSecretary() {
  try {
    const res  = await fetch('/api/members/list');
    const data = await res.json();
    _allMembers = data.members || [];
    updateMemberStats();
    renderMemberCards();
  } catch (err) {
    $('members-list').innerHTML = '<p class="empty-state">Could not load members. Is the server running?</p>';
  }
}

function updateMemberStats() {
  $('stat-total').textContent    = _allMembers.length;
  $('stat-pending').textContent  = _allMembers.filter(m => m.status === 'pending').length;
  $('stat-active').textContent   = _allMembers.filter(m => m.status === 'active').length;
  $('stat-inactive').textContent = _allMembers.filter(m => m.status === 'inactive').length;
}

function renderMemberCards() {
  const query  = ($('sec-search').value || '').toLowerCase();
  const filter = $('sec-filter').value;

  let members = _allMembers.filter(m => {
    const matchStatus = filter === 'all' || m.status === filter;
    const matchQuery  = !query ||
      m.fullName.toLowerCase().includes(query) ||
      (m.phone   || '').includes(query) ||
      (m.email   || '').toLowerCase().includes(query) ||
      (m.address || '').toLowerCase().includes(query);
    return matchStatus && matchQuery;
  });

  const list = $('members-list');
  if (members.length === 0) {
    list.innerHTML = '<p class="empty-state">No members found.</p>';
    return;
  }

  list.innerHTML = members.map(m => {
    const initials = m.fullName.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
    const badgeClass = m.status === 'active' ? 'badge-active' : m.status === 'inactive' ? 'badge-inactive' : 'badge-pending';
    const dateJoined = m.registeredAt ? new Date(m.registeredAt).toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'}) : '';

    return `
    <div class="member-card" id="mcard-${m.id}">
      <div class="member-card-top">
        <div class="member-avatar">${initials}</div>
        <div class="member-info">
          <div class="member-name">${sanitize(m.fullName)}</div>
          <div class="member-phone">📞 ${sanitize(m.phone)}${m.email ? ' · ' + sanitize(m.email) : ''}</div>
          <div class="member-date">Registered: ${dateJoined}</div>
        </div>
        <span class="member-status-badge ${badgeClass}">${m.status}</span>
      </div>
      <div class="member-details">
        ${m.gender   ? `<strong>Gender:</strong> ${sanitize(m.gender)}&nbsp;&nbsp;` : ''}
        ${m.dob      ? `<strong>DOB:</strong> ${sanitize(m.dob)}&nbsp;&nbsp;` : ''}
        ${m.address  ? `<strong>Area:</strong> ${sanitize(m.address)}<br>` : ''}
        ${m.emergencyContact ? `<strong>Emergency:</strong> ${sanitize(m.emergencyContact)}<br>` : ''}
        ${m.notes    ? `<strong>Notes:</strong> ${sanitize(m.notes)}` : ''}
        ${m.role !== 'member' ? `<br><strong>Role:</strong> ${sanitize(m.role)}` : ''}
      </div>
      <div class="member-actions">
        ${m.status !== 'active'   ? `<button class="btn-status btn-approve"   onclick="setMemberStatus('${m.id}','active')">✅ Approve</button>` : ''}
        ${m.status !== 'inactive' ? `<button class="btn-status btn-deactivate" onclick="setMemberStatus('${m.id}','inactive')">⏸ Deactivate</button>` : ''}
        ${m.status !== 'pending'  ? `<button class="btn-status btn-deactivate" onclick="setMemberStatus('${m.id}','pending')">🕐 Set Pending</button>` : ''}
        <button class="btn-status btn-del-member" onclick="deleteMember('${m.id}')">🗑 Remove</button>
      </div>
    </div>`;
  }).join('');
}

async function setMemberStatus(id, status) {
  try {
    const res = await fetch('/api/members/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    if (!res.ok) throw new Error('Update failed');
    const m = _allMembers.find(m => m.id === id);
    if (m) m.status = status;
    updateMemberStats();
    renderMemberCards();
    showToast(`✅ Member status updated to ${status}.`);
    logActivity(`👤 Member "${_allMembers.find(m=>m.id===id)?.fullName}" set to ${status}.`);
  } catch (err) {
    showToast('❌ Could not update member.');
  }
}

async function deleteMember(id) {
  const m = _allMembers.find(m => m.id === id);
  if (!confirm(`Remove ${m?.fullName || 'this member'} from the registry? This cannot be undone.`)) return;
  try {
    await fetch('/api/members/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    _allMembers = _allMembers.filter(m => m.id !== id);
    updateMemberStats();
    renderMemberCards();
    showToast('🗑 Member removed.');
    logActivity(`🗑 Member removed: "${m?.fullName}".`);
  } catch (err) {
    showToast('❌ Could not remove member.');
  }
}

function printMemberList() {
  const filter = $('sec-filter').value;
  const query  = ($('sec-search').value || '').toLowerCase();
  let members  = _allMembers.filter(m => {
    const matchStatus = filter === 'all' || m.status === filter;
    const matchQuery  = !query || m.fullName.toLowerCase().includes(query) || (m.phone||'').includes(query);
    return matchStatus && matchQuery;
  });

  const now = new Date().toLocaleDateString('en-KE', { day:'numeric', month:'long', year:'numeric' });
  const filterLabel = filter === 'all' ? 'All Members' : filter.charAt(0).toUpperCase()+filter.slice(1)+' Members';

  const rows = members.map((m, i) => `
    <tr>
      <td>${i+1}</td>
      <td><strong>${m.fullName}</strong></td>
      <td>${m.phone}</td>
      <td>${m.email || '—'}</td>
      <td>${m.gender || '—'}</td>
      <td>${m.address || '—'}</td>
      <td><span class="ps-${m.status}">${m.status}</span></td>
      <td>${m.registeredAt ? new Date(m.registeredAt).toLocaleDateString('en-KE') : '—'}</td>
    </tr>`).join('');

  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><head><title>Chosen Generation – Member List</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #1a0a0d; }
    h1   { color: #5C0A14; font-size: 22px; margin-bottom: 4px; }
    .sub { color: #666; font-size: 13px; margin-bottom: 18px; }
    table{ border-collapse: collapse; width: 100%; font-size: 12px; }
    th   { background: #5C0A14; color: #E4C76B; text-align: left; padding: 8px 10px; }
    td   { border-bottom: 1px solid #eee; padding: 7px 10px; vertical-align: top; }
    tr:nth-child(even) td { background: #faf5ec; }
    .ps-active   { background: #D4EDDA; color: #155724; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; }
    .ps-pending  { background: #FEF3CD; color: #9A5700; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; }
    .ps-inactive { background: #F0F0F0; color: #555;    padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; }
    .footer { margin-top: 20px; font-size: 11px; color: #999; }
    @media print { body { margin: 12px; } }
  </style></head><body>
  <h1>✝ Chosen Generation Fellowship</h1>
  <div class="sub">${filterLabel} &nbsp;·&nbsp; Printed: ${now} &nbsp;·&nbsp; Total: ${members.length}</div>
  <table>
    <thead><tr><th>#</th><th>Full Name</th><th>Phone</th><th>Email</th><th>Gender</th><th>Area</th><th>Status</th><th>Registered</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">Chosen Generation App – Confidential. For internal leadership use only.</div>
  <script>window.onload = () => window.print();<\/script>
  </body></html>`);
  win.document.close();
}

/* ────────────────────────────────────────────────────────
   TREASURER DASHBOARD
──────────────────────────────────────────────────────── */
// Contributions used to live ONLY in the treasurer's browser localStorage —
// meaning financial records were per-device, not backed up, and lost if the
// browser cache was cleared. They now live in Postgres via /api/contributions,
// shared across every device the treasurer logs in from.
let _contributions = [];

const CONTRIB_ICONS = { Tithe:'🙏', Offering:'🎁', Welfare:'🤝', Building:'🏛', Other:'💵' };

function initTreasurer() {
  $('treas-logout-btn').addEventListener('click', () => {
    ROLE_STATE.treasurerLoggedIn = false;
    switchTab('home');
    showToast('Treasurer logged out.');
  });

  // Set today's date as default
  $('treas-date').value = new Date().toISOString().slice(0, 10);

  $('treas-record-btn').addEventListener('click', recordContribution);
  $('treas-search').addEventListener('input', renderContributions);
  $('treas-print-btn').addEventListener('click', printContributions);
}

async function loadMembersForTreasurer() {
  // Populate total members count and datalist for autocomplete
  fetch('/api/members/list').then(r => r.json()).then(data => {
    const members = (data.members || []).filter(m => m.status === 'active');
    $('treas-total-members').textContent = data.members?.length || 0;
    const dl = $('treas-member-datalist');
    dl.innerHTML = members.map(m => `<option value="${m.fullName}">`).join('');
  }).catch(() => {});
  await loadContributions();
}

async function loadContributions() {
  try {
    const r = await fetch('/api/contributions');
    const data = await r.json();
    _contributions = data.contributions || [];
  } catch (err) {
    console.error('Failed to load contributions:', err);
    showToast('⚠️ Could not load contributions — check your connection.');
  }
  renderContributions();
  updateTreasStats();
}

function updateTreasStats() {
  $('treas-tithe-count').textContent = _contributions.filter(c => c.type === 'Tithe').length;
}

async function recordContribution() {
  const memberName = $('treas-member-name').value.trim();
  const type       = $('treas-contrib-type').value;
  const amountRaw  = $('treas-amount').value.trim().replace(/,/g, '');
  const date       = $('treas-date').value;
  const notes      = $('treas-notes').value.trim();

  if (!memberName) { showToast('⚠️ Please enter a member name.'); return; }
  if (!amountRaw || isNaN(Number(amountRaw)) || Number(amountRaw) <= 0) { showToast('⚠️ Please enter a valid amount.'); return; }
  if (!date)       { showToast('⚠️ Please select a date.'); return; }

  try {
    const r = await fetch('/api/contributions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member: memberName, type, amount: Number(amountRaw), date, notes })
    });
    const data = await r.json();
    if (!r.ok) { showToast('⚠️ ' + (data.error || 'Could not record contribution.')); return; }

    // Reset fields
    $('treas-member-name').value = '';
    $('treas-amount').value      = '';
    $('treas-notes').value       = '';
    $('treas-date').value        = new Date().toISOString().slice(0, 10);

    await loadContributions();
    showToast(`✅ KES ${Number(amountRaw).toLocaleString()} recorded for ${memberName}.`);
    logActivity(`💰 ${type} KES ${Number(amountRaw).toLocaleString()} – ${memberName}`);
  } catch (err) {
    showToast('⚠️ Network error — could not record contribution.');
  }
}

function renderContributions() {
  const query = ($('treas-search').value || '').toLowerCase();
  const list  = $('contributions-list');

  let contribs = query
    ? _contributions.filter(c => c.member.toLowerCase().includes(query) || c.type.toLowerCase().includes(query) || (c.notes||'').toLowerCase().includes(query))
    : _contributions;

  if (contribs.length === 0) {
    list.innerHTML = '<p class="empty-state">No contributions recorded yet.</p>';
    return;
  }

  // Running total
  const total = contribs.reduce((sum, c) => sum + c.amount, 0);

  list.innerHTML = `<div style="text-align:right;font-size:13px;color:var(--text-muted);margin-bottom:8px">
    Showing ${contribs.length} record${contribs.length!==1?'s':''} · <strong style="color:#1a6b3a">Total: KES ${total.toLocaleString()}</strong>
  </div>` + contribs.map(c => {
    const icon = CONTRIB_ICONS[c.type] || '💵';
    const dateStr = c.date ? new Date(c.date+'T00:00:00').toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'}) : '';
    return `
    <div class="contrib-card">
      <div class="contrib-type-badge">${icon}</div>
      <div class="contrib-info">
        <div class="contrib-name">${sanitize(c.member)}</div>
        <div class="contrib-meta">${c.type} · ${dateStr}${c.notes ? ' · '+sanitize(c.notes) : ''}</div>
      </div>
      <div>
        <div class="contrib-amount">KES ${c.amount.toLocaleString()}</div>
        <button class="btn-danger-sm" style="margin-top:6px;font-size:10px" onclick="deleteContrib('${c.id}')">🗑</button>
      </div>
    </div>`;
  }).join('');
}

async function deleteContrib(id) {
  if (!confirm('Delete this contribution record?')) return;
  try {
    const r = await fetch('/api/contributions/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (!r.ok) { showToast('⚠️ Could not delete record.'); return; }
    await loadContributions();
    showToast('🗑 Record deleted.');
  } catch (err) {
    showToast('⚠️ Network error — could not delete record.');
  }
}

function printContributions() {
  const query   = ($('treas-search').value || '').toLowerCase();
  const contribs = query
    ? _contributions.filter(c => c.member.toLowerCase().includes(query) || c.type.toLowerCase().includes(query))
    : _contributions;

  const now   = new Date().toLocaleDateString('en-KE', {day:'numeric',month:'long',year:'numeric'});
  const total = contribs.reduce((sum, c) => sum + c.amount, 0);

  const rows = contribs.map((c, i) => `
    <tr>
      <td>${i+1}</td>
      <td><strong>${c.member}</strong></td>
      <td>${c.type}</td>
      <td style="text-align:right"><strong>KES ${c.amount.toLocaleString()}</strong></td>
      <td>${c.date ? new Date(c.date+'T00:00:00').toLocaleDateString('en-KE') : '—'}</td>
      <td>${c.notes || '—'}</td>
    </tr>`).join('');

  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><head><title>Chosen Generation – Contributions</title>
  <style>
    body  { font-family: Arial, sans-serif; margin: 24px; color: #1a0a0d; }
    h1    { color: #1a4a1a; font-size: 22px; margin-bottom: 4px; }
    .sub  { color: #666; font-size: 13px; margin-bottom: 18px; }
    table { border-collapse: collapse; width: 100%; font-size: 12px; }
    th    { background: #1a4a1a; color: #90EE90; text-align: left; padding: 8px 10px; }
    td    { border-bottom: 1px solid #eee; padding: 7px 10px; }
    tr:nth-child(even) td { background: #f5faf5; }
    .total-row td { background: #D4EDDA; font-weight: 700; border-top: 2px solid #1a4a1a; }
    .footer { margin-top: 20px; font-size: 11px; color: #999; }
    @media print { body { margin: 12px; } }
  </style></head><body>
  <h1>💰 Chosen Generation Fellowship</h1>
  <div class="sub">Contributions Record &nbsp;·&nbsp; Printed: ${now} &nbsp;·&nbsp; ${contribs.length} records</div>
  <table>
    <thead><tr><th>#</th><th>Member</th><th>Type</th><th>Amount (KES)</th><th>Date</th><th>Notes</th></tr></thead>
    <tbody>${rows}
    <tr class="total-row"><td colspan="3">TOTAL</td><td>KES ${total.toLocaleString()}</td><td colspan="2"></td></tr>
    </tbody>
  </table>
  <div class="footer">Chosen Generation App – Confidential. For internal leadership use only.</div>
  <script>window.onload = () => window.print();<\/script>
  </body></html>`);
  win.document.close();
}

/* ────────────────────────────────────────────────────────
   INIT ALL NEW MODULES (called from existing DOMContentLoaded patch)
──────────────────────────────────────────────────────── */
function initMemberSystem() {
  initRegistration();
  initRoleModal();
  initSecretary();
  initTreasurer();
}
