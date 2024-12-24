import { authInstance, addNewContact, getContacts, waitForAuth, userData, goOffline, clearCache } from './firebase.js'

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
    let newcontactEmail = e.target[0]
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

    contacts.forEach(e => {
        console.log(e.profilePicurl);


        let contDiv = document.createElement('div')
        contDiv.classList.add('contact')
        contDiv.setAttribute('data-email', e.email)

        contDiv.innerHTML = `
                <div class="contact-img">
                    <img src="${e.profilePicurl}" alt="">
                 </div>
                <h2>${e.username}</h2>
        `

        contDiv.addEventListener('click', () => {
            const a = document.createElement('a');
            a.href = `chatroom.html?var=${contDiv.getAttribute('data-email')}`
            a.click()
        })

        chatSec.appendChild(contDiv)
    });


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
waitForAuth().then(user => {
    console.log(authInstance);
    document.body.style.pointerEvents = 'all'
    loading.style.display = 'none'

    showauth()
    initialzeuser()

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



function showauth() {

    console.log(authInstance.currentUser);

    if (!authInstance.currentUser) {
        const a = document.createElement('a')
        a.href = "auth.html"
        a.click()
    }
}
