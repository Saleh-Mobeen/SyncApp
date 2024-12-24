import { updateProfilepic, waitForAuth, goOffline } from "./firebase.js";

await waitForAuth()
console.log('ready');


const picLoader = document.getElementById('pf-pic-upload')

picLoader.addEventListener('change', async (e) => {
    console.log(e);
    let valid = true;
    const btn = e.target.nextElementSibling
    if (!navigator.onLine) {
        btn.textContent = 'No Internet'
        setTimeout(() => {
            btn.textContent = 'Upload Pic'
        }, 3000)
        return

    }

    if (e.target.files[0].size > 2097152) {
        valid = false;
        console.log("too large");

    }

    if (valid) {
        btn.textContent = 'Uploading...'
        try {
            let test = await updateProfilepic(e.target.files[0])
            btn.textContent = 'Uploaded'
            setTimeout(() => {
                btn.textContent = 'Upload Pic'
            }, 3000)

            console.log(test);

        } catch (error) {
            console.log(error);

        }

    }

})