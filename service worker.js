const CACHE_NAME = 'SyncApp-image-cache-v1';

self.addEventListener('fetch', (event) => {

    const request = event.request;


    // Check if the request is for an image
    if (request.destination === 'image' && request.url.startsWith('https://')) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {

                // If the image is already cached, return it
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Otherwise, fetch the image, cache it, and return the fetched response
                return caches.open(CACHE_NAME).then((cache) => {
                    console.log(cache);

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

const cacheName = 'SyncApp-v1';
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
    event.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll(assets);
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

self.addEventListener('push', event => {
    const data = event.data.json();
    console.log('Push received:', data);

    const options = {
        body: data.body,
        icon: '/icon 512.png',
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
});







