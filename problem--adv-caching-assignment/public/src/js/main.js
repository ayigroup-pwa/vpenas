
var box = document.querySelector('.box');
var button = document.querySelector('button');

//Reemplazo de registro del SW con la documentación de MDN:
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
  .then(function(registration) {
    registration.addEventListener('updatefound', function() {
      // If updatefound is fired, it means that there's
      // a new service worker being installed.
      var installingWorker = registration.installing;
      console.log('A new service worker is being installed:',
        installingWorker);

      // You can listen for changes to the installing service worker's
      // state via installingWorker.onstatechange
    });
  })
  .catch(function(error) {
    console.log('Service worker registration failed:', error);
  });
} else {
  console.log('Service workers are not supported.');
}

button.addEventListener('click', function(event) {
  if (box.classList.contains('visible')) {
    box.classList.remove('visible');
  } else {
    box.classList.add('visible');
  }
});


//Fetch original usado hasta el task 4

fetch('https://httpbin.org/ip')
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    console.log(data.origin);
    box.style.height = (data.origin.substr(0, 2) * 5) + 'px';
  });


//Fetch para los tasks 5 y 6

/*
let url = 'https://httpbin.org/ip';
let networkDataReceived = false;

//Fetch fresh data
fetch(url)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    networkDataReceived = true;
    console.log('From fetch ', data);
    box.style.height = (data.origin.substr(0, 2) * 5) + 'px';
  });

//Fetch cached data
if ('caches' in window) {
  caches.match(url)
  .then(function(response) {
    if(response) {
      return response.json();
    }
  })
  .then(function(data) {
    // don't overwrite newer network data
    if (!networkDataReceived) {
      box.style.height = (data.origin.substr(0, 2) * 5) + 'px';
      console.log('From cache: ', data);
    }
  });
}
*/