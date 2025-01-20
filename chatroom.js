import { getChat, waitForAuth, sendMessage, addListener, userData, goOffline } from "./firebase.js";

const messageF = document.getElementById('message-f');
const chatArea = document.getElementsByClassName('chat-area')[0];
let msgGdate = 10


await waitForAuth()
await loadChat()


async function loadChat() {
    const url = new URL(window.location.href);
    const email = url.searchParams.get('var');




    const otherUserData = userData.contacts.filter(contact => contact.email == email)[0]


    document.querySelector('.ch-profile>img').src = otherUserData.profilePicurl
    document.querySelector('#ch-info>h2').textContent = otherUserData.username
    document.querySelector('#ch-info>p').textContent = otherUserData.email


    const chatsnap = await getChat(email);
    const chatData = chatsnap.docs[0].data()
    const chatref = chatsnap.docs[0].ref
    console.log(chatData);



    chatData.messages.forEach(e => {
        showmsg(e.text, e.timestamp, e.sender, false)

    })


    document.querySelector('html').scrollTop = document.querySelector('html').scrollHeight;


    messageF.addEventListener('submit', async e => {
        e.preventDefault()
        console.log(e);

        if (e.target[0].value.trim() != '') {

            const message = {
                text: e.target[0].value,
                sender: userData.email

            }
            sendMessage(message, chatref)
            e.target[0].value = ""
        }

    })

    addListener(chatref, showmsg)
}

function showmsg(text, timestamp, sender, animate = true) {
    console.log('new msg' + text);

    const msgdiv = document.createElement('div')
    const time = document.createElement('span')
    const p = document.createElement('p')


    if (sender == userData.email) {
        msgdiv.setAttribute('type', 'user')
    } else {
        msgdiv.setAttribute('type', 'other')


    }

    if (new Date(timestamp).toDateString() != msgGdate) {
        msgGdate = new Date(timestamp).toDateString()

        addDateTag(msgGdate)
        console.log(msgGdate);
    }





    p.textContent = text
    time.textContent = new Date(timestamp).toLocaleString(undefined, { hour: "2-digit", minute: "2-digit" });
    msgdiv.classList.add('message')
    msgdiv.appendChild(time)
    msgdiv.appendChild(p)
    chatArea.appendChild(msgdiv)

    const html = document.querySelector('html')
    html.style.scrollBehavior = 'smooth'
    html.scrollTop = html.scrollHeight;
    html.style.scrollBehavior = 'auto'


    if (animate) {
        if (sender == userData.email) {
            msgdiv.style.animation = 'UnewMsg 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'

        } else {

            msgdiv.style.animation = 'OnewMsg 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'

        }
    }
}

function addDateTag(date) {
    const tag = document.createElement('div')
    tag.classList.add('date-tag')
    tag.innerHTML = `<p>${date}</p>`
    chatArea.appendChild(tag)
}


