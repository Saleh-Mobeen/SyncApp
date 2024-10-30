import { getChat, waitForAuth, sendMessage, addListener, userData, getuser } from "./firebase.js";

const messageF = document.getElementById('message-f');
const chatArea = document.getElementsByClassName('chat-area')[0];

const chHead = document.getElementsByClassName('ch-head')[0];


await waitForAuth()
loadChat()


async function loadChat() {
    const url = new URL(window.location.href);
    const email = url.searchParams.get('var');




    const otherUserData = userData.contacts.filter(contact => contact.email == email)[0]

    chHead.children[0].children[0].src = otherUserData.profilePicurl
    chHead.children[1].children[0].textContent = otherUserData.username
    chHead.children[1].children[1].textContent = otherUserData.email


    const chatsnap = await getChat(email);
    const chatData = chatsnap.docs[0].data()
    const chatref = chatsnap.docs[0].ref
    console.log(chatData);



    chatData.messages.forEach(e => {

        showmsg(e.text, e.timestamp, e.sender, false)

    })


    messageF.addEventListener('submit', async e => {
        e.preventDefault()
        console.log(e);


        const message = {
            text: e.target[0].value,
            sender: userData.email

        }
        sendMessage(message, chatref)
        e.target[0].value = ""

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
    p.textContent = text
    time.textContent = new Date(timestamp).toLocaleString(undefined, { hour: "2-digit", minute: "2-digit" });
    msgdiv.classList.add('message')
    msgdiv.appendChild(time)
    msgdiv.appendChild(p)
    chatArea.appendChild(msgdiv)
    if (animate) {
        if (sender == userData.email) {
            msgdiv.style.animation = 'UnewMsg 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'

        } else {

            msgdiv.style.animation = 'OnewMsg 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'

        }
    }
}


