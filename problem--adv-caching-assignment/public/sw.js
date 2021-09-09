
var CACHE_STATIC_NAME = 'static-v8';
var CACHE_DYNAMIC_NAME = 'dynamic-v2';
//Agrega App shell a una variable 
var filesToCache = [
  '/',
  '/index.html',
  '/src/css/app.css',
  '/src/css/main.css',
  '/src/js/main.js',
  '/src/js/material.min.js',
  '/offline.html',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
]

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function(cache) {
        cache.addAll(filesToCache)
      })
  )
  
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
          if (key !== CACHE_STATIC_NAME) {
            return caches.delete(key);
          }
        }));
      })
  );
});


// 1. La estrategia de cacheo actual es "Cache first" o también llamada "Cache with network fallback"

// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request) //busca en el cache primero
//       .then(function(response) {
//         if (response) {
//           console.log("Hubo response del fetch")
//           return response; //Si hay cache trae cache
//         } else {
//           return fetch(event.request) //Si no hay cache fetchea al network
//             .then(function(res) {
//               return caches.open(CACHE_DYNAMIC_NAME) // crea la cache dinamica
//                 .then(function(cache) {
//                   console.log("Actualiza el cache dinámico")

//                   cache.put(event.request.url, res.clone()); //actualiza el cache
//                   return res; // actualiza la pagina
//                 });
//             })
//             .catch(function(err) {
//               console.log(err);
//             });
//         }
//       })
//   );
// });


//2. Reemplazada por "Network only". 
//Great for elements that have no presence offline, like analytics, pings or non-GET requests.

/*
self. addEventListener('fetch', function (event) {
  event.respondWith(
    fetch(event.request)
  );
  //We can simply don't call "event.respondWith", mhich will result in default browser behavior
});
*/


//3. Reemplazada por "Cache only". 
//Ideal strategy for anything considered static in our website.

/*
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
  );
})
*/


//4. Reemplazada por "Network, cache fallback". 
//Ideal as quick fix for resources that update frequently no matter what the version of your site. 
//Ex.: avatars, social media timelines, and game leaderboards.
//Flaw: If the user has a an intermittent or slow connection, they'll have to wait for the network to fail before the get the content already on their device.

/*
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        caches.open(CACHE_DYNAMIC_NAME)
        .then(cache => {
          cache.put(event.request.url, response.clone());
          return response;
        })
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
*/

// 5. Reemplazada con "Cache, then network" (Continúa en el main.js)
//Works well for content that updates frequently. The SW makes two requests: one to the cache, one to the network, and the idea is to show the cached data first
// and then update the page when, or if, the network data arrives.

// self.addEventListener('fetch', event => {
//   event.respondWith(
//     caches.open(CACHE_DYNAMIC_NAME)
//     .then(cache => {
//       return fetch(event.request)
//       .then(response => {
//         cache.put(event.request.url, response.clone());
//         return response;
//       });
//     }).catch((error) => console.log("ERROR!", error))
//   );
// });


// 6. Routing

//Validation of URL, code from Class 7
function isInArray(string, array) {
  let cachePath;
  if (string.indexOf(self.origin) === 0) { 
    cachePath = string.substring(self.origin.length);
  } else {
    cachePath = string;
  }
  return array.indexOf(cachePath) > -1;
}

self.addEventListener('fetch', event => {

  let url = 'https://httpbin.org/ip';
  if (event.request.url.indexOf(url) > -1) { // Previamente "url === 'https://httpbin.org/ip'""
    console.log('Cache, then network');
    //Strategy 1 -> Cache then network
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return caches.open(CACHE_DYNAMIC_NAME)
            .then(cache => {
              cache.put(event.request.url, response.clone());
              return response;
            })
        })
    );
  } else if (isInArray(event.request.url, filesToCache)) {
    //Strategy 2 -> Cache only
    event.respondWith(
      caches.match(event.request.url)
    );
  } else {
    //Strategy 3 -> Cache with network fallback
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          } else {
            return fetch(event.request)
              .then(response => {
                return caches.open(CACHE_DYNAMIC_NAME)
                  .then(cache => {
                    cache.put(event.request.url, response.clone());
                    return response;
                  });
              })
              .catch(error => {
                return caches.open(CACHE_STATIC_NAME)
                  .then(cache => {
                    if (event.request.headers.get('accept').includes('text/html')) {
                      return cache.match('/offline.html');
                    }
                  });
              });
          }
        })
    );
  }
});

