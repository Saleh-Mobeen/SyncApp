const indexedStorage = {
    dbName: 'appSharedStorage',
    storeName: 'kv',

    _getDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id' });
                }
            };

            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    },

    async setItem(key, value) {
        const db = await this._getDB();
        const tx = db.transaction(this.storeName, 'readwrite');
        tx.objectStore(this.storeName).put({ id: key, value });
        await tx.complete?.catch(() => { });
        db.close();
    },

    getItem(key) {
        return new Promise(async (resolve, reject) => {

            const db = await this._getDB();
            const tx = db.transaction(this.storeName, 'readonly');
            const result = await tx.objectStore(this.storeName).get(key);
            result.onsuccess = (e) => {

                resolve(e.target?.result?.value || null);
            }
        })
    },

    async removeItem(key) {
        const db = await this._getDB();
        const tx = db.transaction(this.storeName, 'readwrite');
        await tx.objectStore(this.storeName).delete(key);
        db.close();
    },

    async clear() {
        const db = await this._getDB();
        const tx = db.transaction(this.storeName, 'readwrite');
        await tx.objectStore(this.storeName).clear();
        db.close();
    }
};
export { indexedStorage };