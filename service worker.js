import { indexedStorage } from './indexedStorage.js';


const CACHE_NAME = 'syncapp';


self.addEventListener('fetch', async (event) => {

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

let instances = null;
self.addEventListener('message', event => {
    const { type, payload } = event.data;
    if (type === 'store') {
        instances = payload
        console.log('SW stored object:', payload);
    }
});

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
        }),
        caches.keys().then(names =>
            Promise.all(
                names.filter(name => name !== 'v1').map(oldName => caches.delete(oldName))
            )
        )
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
    addNewMsg(data.data.from)

    if (await checkClientIsVisible()) {

        console.log('app open');
    } else {
        console.log('app close');
        console.log(data.data.from);


        event.waitUntil(self.registration.showNotification(data.title, data));

    }


});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    console.log('click noti');

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
            for (const client of clientList) {
                console.log(event);

                if (client.url === event.notification.data.url && 'focus' in client) {
                    console.log('window open');

                    return client.focus();
                }
            }

            if (clients.openWindow) {
                console.log('no window open');

                return clients.openWindow(event.notification.data.url);

            }
        })
    );
});

async function addNewMsg(sender) {
    let msgs = await indexedStorage.getItem(sender)
    console.log(msgs);

    if (!msgs) {
        await indexedStorage.setItem(sender, 0)
        console.log('made');

        msgs = 0
    }
    await indexedStorage.setItem(sender, msgs + 1)

    self.clients.matchAll().then(clients => {
        for (const client of clients) {
            client.postMessage({
                type: 'new-msg',
                sender: sender,
                value: msgs + 1
            });
        }
    });
}

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


