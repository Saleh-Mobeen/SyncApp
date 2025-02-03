const CACHE_NAME = 'SyncApp-cache-v1.2.3';

self.addEventListener('fetch', (event) => {

    const request = event.request;


    if (request.destination === 'image' && request.url.startsWith('https://')) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {

                if (cachedResponse) {
                    return cachedResponse;
                }

                return caches.open(CACHE_NAME).then((cache) => {

                    return fetch(request).then((networkResponse) => {
                        console.log(networkResponse);

                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
    } else {
        // event.respondWith(
        //     caches.match(event.request).then(response => {
        //         return response || fetch(event.request);
        //     })
        // );

    }
});

self.addEventListener("navigate", async () => {
    console.log('nav');

})

const assets = [
    './',
    './auth.html',
    './auth.js',

    './chatroom.html',
    './chatroom.js',

    './firebase.js',

    './home.js',
    './index.html',

    './logo white.svg',
    './logo.svg',
    './icon 192.png',
    './icon 512.png',

    './manifest.json',

    './settings.html',
    './settings.js',

    './style.css',



];




self.addEventListener('install', event => {
    self.skipWaiting()
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(assets);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        self.clients.claim().then(() => {
            console.log('Service Worker activated and clients claimed.');
        })
    );
});

self.addEventListener('update', event => {
    event.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll(assets);
        })
    );
});

self.addEventListener('push', async event => {
    const data = event.data.json();
    console.log('Push received:', data);
    if (await checkClientIsVisible()) {

        console.log('app open');
    } else {
        console.log('app close');


        const options = {
            body: data.body,
            icon: '/icon 512.png',
        };

        event.waitUntil(self.registration.showNotification(data.title, options));

    }
});


async function checkClientIsVisible() {
    const windowClients = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
    });

    for (var i = 0; i < windowClients.length; i++) {
        if (windowClients[i].visibilityState === "visible") {
            return true;
        }
    }

    return false;


}


