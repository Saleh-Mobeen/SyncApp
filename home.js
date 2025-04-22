import { authInstance, addNewContact, getContacts, waitForAuth, userData, clearCache, version, initLinks, regScript } from './firebase.js'
import { indexedStorage } from './indexedStorage.js';
init()
export async function init() {
    regScript('home.js', init)
    console.log('home');

    const chatSec = document.getElementsByClassName('contacts-sec')[0]
    const addcontactSec = document.getElementsByClassName('add-contact-sec')[0]
    const addContactForm = document.getElementById('add-contact-form')
    const loading = document.getElementById('loading')

    const addContactBtn = document.getElementsByClassName('contact-btn')

    let contactShow = false

    for (const ele of addContactBtn) {
        console.log(ele);

        ele.addEventListener('click', () => {
            if (contactShow) {
                contactShow = false
            } else {
                contactShow = true
            }

            if (contactShow) {
                addcontactSec.style.display = 'flex'
                chatSec.style.display = 'none'
            } else {
                addcontactSec.style.display = 'none'
                chatSec.style.display = 'block'
            }


        })

    }
    addContactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let newcontactEmail = e.target[1]
        let valid = true


        if (!newcontactEmail.checkValidity() || authInstance.currentUser.email == newcontactEmail.value || newcontactEmail.value.trim() == "") {
            valid = false
            makeInvalid(newcontactEmail)
            makeerr(e.submitter.previousElementSibling, "Invalid Email")
        }

        if (valid) {
            console.log(e.submitter.previousElementSibling);
            try {
                e.submitter.style.pointerEvents = 'none'
                await addNewContact(newcontactEmail.value)

                initialzeuser()
                e.submitter.style.pointerEvents = 'all'

                e.submitter.previousElementSibling.style.color = 'var(--inp-act)'
                makeerr(e.submitter.previousElementSibling, "Sucessfully Added")



            } catch (error) {
                console.log('hello');

                e.submitter.style.pointerEvents = 'all'
                makeerr(e.submitter.previousElementSibling, error)
                makeInvalid(newcontactEmail)
                console.log(error);

            }

        }

    })

    async function initialzeuser() {
        const contacts = await getContacts()

        chatSec.innerHTML = ''

        for (const e of contacts) {



            let linkWrap = document.createElement('a')
            linkWrap.style.textDecoration = 'none'
            linkWrap.style.color = 'unset'

            linkWrap.href = `chatroom.html?var=${e.email}`


            let contDiv = document.createElement('div')
            contDiv.classList.add('contact')
            contDiv.setAttribute('data-msg-count', await indexedStorage.getItem(e.email) || 'none')
            linkWrap.appendChild(contDiv)
            contDiv.innerHTML = `
                <div class="contact-img">
                    <img src="${e.profilePicurl}" alt="">
                 </div>
                <h2>${e.username}</h2>`


            contDiv.getElementsByClassName('contact-img')[0].addEventListener('click', () => {
                contDiv.getElementsByClassName('contact-img')[0].classList.add('full-img')
                setTimeout(() => {

                    document.addEventListener('click', () => {
                        contDiv.getElementsByClassName('contact-img')[0].classList.remove('full-img')

                    }, { once: true })
                }, 100)
            })

            chatSec.appendChild(linkWrap)
        }
        initLinks()


        document.getElementById('profilePic').src = userData.profilePic.url || ""




    }

    document.getElementById('SignOut').addEventListener('click', async () => {
        await clearCache()
        await authInstance.signOut()
        showauth()
    })





    function makeInvalid(ele) {
        ele.setCustomValidity(' ');

        ele.addEventListener('focus', () => {
            ele.setCustomValidity('');
        }, { once: true })
    }

    function makeerr(ele, err) {

        ele.textContent = err;


        ele.style.opacity = 1


        setTimeout(() => {
            ele.style.opacity = 0
        }, 5000)

        setTimeout(() => {
            ele.style.color = 'var(--err-tx)'
        }, 5500)


    }




    document.body.style.pointerEvents = 'none'
    loading.children[0].textContent = 'Initializing User...'
    loading.lastElementChild.textContent = 'sync-app-v-' + version
    console.log(version);


    waitForAuth().then(async () => {
        loading.style.display = 'none'
        console.log(authInstance);
        document.body.style.pointerEvents = 'all'

        showauth()
        subscribeForNoti()
        initialzeuser()
        showupdate()


    }).catch(error => {
        showauth()

        console.error(error);
        console.log('no internet');

        for (const e of loading.children[1].children) {
            e.addEventListener('animationiteration', (ele) => {

                ele.target.style.animation = 'none'
                ele.target.setAttribute('type', 'fail')
            })

        }
        loading.children[0].textContent = 'No Internet'

        loading.children[2].style.opacity = 1;
        loading.children[2].style.pointerEvents = 'all';



    })

    function showupdate() {
        const latestVersion = version;
        const seenVersion = localStorage.getItem("seenVersion");
        document.querySelector('#update>div>h1>span').textContent = version

        if (seenVersion !== latestVersion) {
            document.querySelector('#update').classList.remove('hidden')
            document.querySelector('#update button').addEventListener('click', (e) => {
                document.querySelector('#update').classList.add('hidden')

            })
            localStorage.setItem("seenVersion", latestVersion);
        }
    }

    function showauth() {

        console.log(authInstance.currentUser);

        if (!authInstance.currentUser) {
            const a = document.createElement('a')
            a.href = "auth.html"
            a.click()
        }
    }
    navigator.serviceWorker.addEventListener('message', async (event) => {
        if (event.data.type === 'new-msg') {
            console.log('new msg', document.querySelector(`div.contact[data-email='${event.data.sender}']`), await indexedStorage.getItem(event.data.sender));
            const contact = document.querySelector(`div.contact[data-email='${event.data.sender}']`)
            contact.setAttribute('data-msg-count', event.data.value || 'none')
        }
    });

    // notification
    async function subscribeForNoti() {

        const publicVapidKey = 'BK8CC-c42AiLrsY2Rg7md_0iUnqkrWbO_-xmAxv6vP-9JLqyYFAvFMxKWS_6htPwNCzClLG7U7se4X5g3P8b9OY';

        function urlBase64ToUint8Array(base64String) {
            const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
            const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);
            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }
            return outputArray;
        }

        const registration = await navigator.serviceWorker.getRegistration('./service worker.js')
        var subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });

        subscription = {
            id: userData.email,
            sub: subscription
        }

        fetch('https://syncapp.glitch.me/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription)
        }).then(succ => {

            console.log('Subscribed:', subscription);
        }).catch(err => {
            console.log('Subscribition failed', err);
        })

    }


}