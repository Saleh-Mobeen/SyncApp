const CACHE_NAME = 'chat-app-image-cache-v1';

self.addEventListener('fetch', (event) => {

    const request = event.request;

    // Check if the request is for an image
    if (request.destination === 'image' && request.url.startsWith('https://')) {
        console.log(event);
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                console.log(cachedResponse);

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
        console.log('no', event);

    }
});