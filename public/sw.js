/**
 * 🚀 SERVICE WORKER - OFFLINE MAGIC ✨
 * 
 * Bhai ye file browser me background me chalta hai aur tumhare app ko OFFLINE bhi kaam karne deta hai!
 * 
 * 📌 KEY CONCEPTS (Ek Dum Simple):
 * 
 * 1. SELF kya hai? 🤔
 *    - `self` = Service Worker ka apna scope (jaise `this` hota hai)
 *    - Browser ka main thread nahi hai ye, ye background worker hai
 *    - Example: Tumhara delivery boy jo quietly packages deliver karta hai background me
 * 
 * 2. EVENT kya hai? 📡
 *    - Events = Signals jo browser send karta hai (install, activate, fetch)
 *    - Jaise doorbell bajne par tum response dete ho, waise hi SW events par kaam karta hai
 * 
 * 3. CACHE kya hai? 💾
 *    - Browser ki storage jisme files save hoti hain (HTML, CSS, JS, images)
 *    - Jaise fridge me khana rakhte ho baad ke liye, waise hi cache me files
 *    - Offline = Net nahi hai, par cache se files mil jayengi
 * 
 * 4. event.respondWith() kya karta hai? 🎯
 *    - Ye browser ko batata hai: "Ruk bhai, main request handle karunga!"
 *    - Network request ko intercept karke apna custom response deta hai
 * 
 * 🔄 SERVICE WORKER LIFECYCLE:
 *    INSTALL → ACTIVATE → FETCH (requests intercept karo) → UPDATE (naya version aaye to)
 */

// 📦 STEP 1: CACHE KA NAAM (Version number se purana cache clear kar sakte ho)
const CACHE_NAME = 'mppsc-cache-v1'; // Jab update karna ho, ye v2, v3 karo

// 📂 STEP 2: KON SI FILES CACHE KARNI HAIN (Offline ke liye important files)
const urlsToCache = [
  '/',                              // Home page
  '/offline',                       // Offline fallback page
  '/manifest.json',                 // PWA manifest
  '/icons/icon-192x192.png',        // App icon (small)
  '/icons/icon-512x512.png'         // App icon (large)
];

// 🎬 EVENT 1: INSTALL (Jab Service Worker pehli baar install hota hai)
// Ye event tab trigger hota hai jab user pehli baar site visit kare
self.addEventListener('install', (event) => {
  console.log('🚀 Bhai: Service Worker install ho raha hai...');
  
  /**
   * event.waitUntil() kya karta hai?
   * - Ye browser ko bolta hai: "Aye wait kar, installation complete hone tak"
   * - Promise resolve hone tak SW install complete nahi hoga
   * - Agar promise reject hua = Installation fail
   */
  event.waitUntil(
    // Cache kholo (agar nahi hai to create karo)
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Bhai: Cache khul gaya, ab files daal raha hu...');
        
        /**
         * cache.addAll() kya karta hai?
         * - Saari files ko download karke cache me save kar deta hai
         * - Agar ek bhi file fail hui = Poora installation fail
         * - Files browser ke storage me save hoti hain (DevTools → Application → Cache Storage)
         */
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('💾 Bhai: Saari files cache ho gayi! Ab offline bhi chalega.');
      })
      .catch((error) => {
        console.error('❌ Bhai: Cache karne me dikkat aayi:', error);
      })
  );
  
  /**
   * 🔥 BONUS TIP:
   * self.skipWaiting() add karo agar turant naya SW activate karna ho:
   * self.skipWaiting(); // Waiting state skip kar dega
   */
});

// 🔄 EVENT 2: ACTIVATE (Jab Service Worker activate hota hai)
// Ye event install ke baad trigger hota hai, cleanup ke liye use hota hai
self.addEventListener('activate', (event) => {
  console.log('⚡ Bhai: Service Worker activate ho raha hai...');
  
  event.waitUntil(
    // Saare caches ke naam nikalo
    caches.keys().then((cacheNames) => {
      console.log('🔍 Bhai: Purane caches check kar raha hu...');
      
      /**
       * Promise.all() kya karta hai?
       * - Saare promises ko ek saath run karta hai
       * - Jab sab resolve ho jayenge tab complete hoga
       * - Agar ek bhi reject hua = Sab fail
       */
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Agar purana cache hai (naam different hai current se)
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Bhai: Purana cache mil gaya, delete kar raha hu:', cacheName);
            
            /**
             * caches.delete() kya karta hai?
             * - Purane cache ko delete kar deta hai (space free karne ke liye)
             * - Jab tum v1 → v2 update karo, purana v1 automatically delete ho jayega
             */
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('✨ Bhai: Activation complete! Service Worker ready hai.');
      
      /**
       * 🔥 BONUS TIP:
       * self.clients.claim() add karo agar turant control lena ho:
       * return self.clients.claim(); // Existing pages ko turant control karega
       */
    })
  );
});

// 🌐 EVENT 3: FETCH (Har network request ko intercept karta hai)
// Ye SABSE POWERFUL event hai - Offline magic yahi hota hai!
self.addEventListener('fetch', (event) => {
  
  /**
   * event.request kya hai?
   * - User ne jo request bheji (URL, headers, method)
   * - Example: GET https://mppsc.com/syllabus/unit_1
   * 
   * event.respondWith() kya karta hai?
   * - Browser ko custom response deta hai
   * - Network ko bypass karke cache se response de sakte ho
   * - Agar net slow hai to cache se turant serve kar do = BLAZING FAST! 🚀
   */
  event.respondWith(
    /**
     * STRATEGY: Cache First, Network Fallback
     * 1. Pehle cache me dekho
     * 2. Agar mila = Turant return karo (FAST!)
     * 3. Agar nahi mila = Network se fetch karo
     * 4. Agar network bhi fail = Offline page dikha do
     */
    caches.match(event.request)
      .then((response) => {
        /**
         * CACHE HIT CHECK 🎯
         * - caches.match() cache me request ko search karta hai
         * - Agar exact URL match hua = Response milega
         * - Response object me HTML/CSS/JS/Image ka data hota hai
         */
        if (response) {
          console.log('⚡ CACHE HIT! Turant serve kar raha hu:', event.request.url);
          
          /**
           * 💡 YE HAI ASLI MAGIC!
           * Network se fetch kiye bina directly cache se response bhej diya
           * Internet slow ho ya na ho, user ko turant content mil gaya
           * Jaise fridge se paani nikala - beech me RO water plant tak jaane ki zaroorat nahi!
           */
          return response;
        }
        
        // Cache me nahi mila? Chalo network se fetch karte hain
        console.log('📡 Cache miss, network se fetch kar raha hu:', event.request.url);
        
        /**
         * fetch() kya karta hai?
         * - Normal network request bhejta hai server ko
         * - Promise return karta hai (resolve = success, reject = network fail)
         * 
         * .catch() kab trigger hota hai?
         * - Jab internet nahi hai (offline)
         * - Jab server down hai
         * - Jab request timeout ho gayi
         */
        return fetch(event.request)
          .then((networkResponse) => {
            /**
             * 🔥 BONUS: Dynamic Caching (Network se aaye to cache me daal do)
             * Future ke liye save kar lo, next time offline bhi chalega!
             */
            if (networkResponse && networkResponse.status === 200) {
              // Cache ko clone karke save karo (original response return karne ke liye)
              const responseToCache = networkResponse.clone();
              
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
                console.log('💾 Network response ko cache me save kar diya:', event.request.url);
              });
            }
            
            return networkResponse;
          })
          .catch(() => {
            /**
             * ⚠️ OFFLINE FALLBACK
             * - Internet nahi hai
             * - Cache me bhi nahi hai
             * - Ab kya kare? Offline page dikha do!
             */
            console.log('🔴 Offline hai aur cache me bhi nahi! Fallback dikha raha hu.');
            
            /**
             * caches.match('/offline') kya karega?
             * - /offline route ka cached version serve karega
             * - User ko friendly message dikhega: "Internet nahi hai bhai!"
             * - Better UX than browser's ugly "No Internet" page
             */
            return caches.match('/offline');
          });
      })
  );
});

/**
 * 📚 TESTING GUIDE (Kaise Test Kare):
 * 
 * 1. DevTools me check karo:
 *    - Chrome DevTools kholo (F12)
 *    - Application tab → Service Workers
 *    - Status dekhna: "activated and is running"
 *    - Green dot = Running successfully ✅
 * 
 * 2. Cache verify karo:
 *    - Application tab → Cache Storage
 *    - "mppsc-cache-v1" expand karo
 *    - Saari cached files dikhengi
 * 
 * 3. Offline test karo:
 *    - Network tab me "Offline" checkbox ON karo
 *    - Page refresh karo (Ctrl+R)
 *    - Agar page load ho gaya = SUCCESS! 🎉
 *    - Agar error aaya = Cache properly nahi hua
 * 
 * 4. Console logs dekho:
 *    - "🚀 Bhai: Service Worker install ho raha hai..."
 *    - "⚡ CACHE HIT!" messages aane chahiye
 * 
 * 5. Update test karo:
 *    - CACHE_NAME change karo: 'mppsc-cache-v2'
 *    - File save karo
 *    - Page refresh (SW update hoga)
 *    - "🗑️ Purana cache delete" message aana chahiye
 * 
 * 📱 MOBILE PE TEST:
 *    - Chrome mobile me chrome://serviceworker-internals open karo
 *    - Apni site ka SW registered dikhega
 *    - "Unregister" se remove kar sakte ho debugging ke liye
 * 
 * 🔧 COMMON ISSUES:
 *    - SW update nahi ho raha? → Hard refresh karo (Ctrl+Shift+R)
 *    - Cache clear nahi ho raha? → DevTools → Application → Clear Storage
 *    - Localhost pe kaam nahi kar raha? → HTTPS chahiye (localhost exempt hai)
 * 
 * 💡 PRO TIPS:
 *    1. Version number badha kar cache bust karo (v1 → v2)
 *    2. Critical files hi cache karo (poori site nahi!)
 *    3. API responses ko mat cache karo (unless specific strategy hai)
 *    4. Images, CSS, JS cache karo (static files best hain)
 *    5. Production me console.log remove karo (performance ke liye)
 * 
 * 🎯 NEXT.JS KE SAATH USE:
 *    - Service Worker Next.js ke built-in cache ke saath conflict kar sakta hai
 *    - Static files cache karo, dynamic routes skip karo
 *    - next.config.ts me PWA plugin use karo (next-pwa package)
 *    - _next/static/ folder ko cache karne se bundle offline chalega
 * 
 * 🚀 DEPLOYMENT CHECKLIST:
 *    ✅ sw.js public folder me hai
 *    ✅ manifest.json configured hai
 *    ✅ Icons sab sizes me ready hain
 *    ✅ /offline route banaya hai
 *    ✅ HTTPS enabled hai (production me mandatory)
 *    ✅ Cache version number set kiya hai
 * 
 * Bhai ab samajh aaya? Service Worker = Tumhara silent background hero! 🦸‍♂️
 */
