import { getChat, waitForAuth, sendMessage, addListener, userData, goOffline } from "./firebase.js";

const messageF = document.getElementById('message-f');
const msgInp = messageF.querySelector('textarea')
const replymsg = document.getElementById('reply-message');
let chatref;
let chatData;
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
    document.querySelector('#ch-info>p').textContent = otherUserData.email.length > 20 ? otherUserData.email.slice(0, 20).concat('...') : otherUserData.email


    const chatsnap = await getChat(email);
    chatData = chatsnap.docs[0].data()
    chatref = chatsnap.docs[0].ref
    console.log(chatData);



    chatData.messages.forEach(e => {
        showmsg(e, false)

    })


    document.querySelector('html').scrollTop = document.querySelector('html').scrollHeight;


    messageF.addEventListener('submit', async e => {
        e.preventDefault()
        msgsub()



    })

    msgInp.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            if (event.shiftKey) {

            } else {

                event.preventDefault();
                msgsub()
            }
        }
    })

    function msgsub() {
        if (msgInp.value.trim() != '') {
            const message = {
                text: msgInp.value.trim(),
                sender: userData.email

            }
            console.log(msgInp.classList.contains('reply-inp'));

            if (messageF.classList.contains('reply-inp')) {
                message.replyTo = messageF.getAttribute('data-reply-ts')
            }
            sendMessage(message, chatref)
            cancelReply()
            msgInp.value = ""
            msgInp.style.height = 'auto'; msgInp.style.height = `${msgInp.scrollHeight}px`
        }
    }

    addListener(chatref, showmsg)
}

function showmsg(msgdata, animate = true) {

    console.log(msgdata);

    const { text, timestamp, sender, replyTo } = msgdata
    console.log('new msg' + text, replyTo, chatData.messages.includes(msgdata));


    if (!chatData.messages.includes(msgdata)) {
        chatData.messages.push(msgdata)
    }

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

    console.log(replyTo);

    if (replyTo) {
        const replybox = document.createElement('div')

        replybox.classList.add('reply-box')
        replybox.innerHTML = `<p>${chatData.messages.find(msg => msg.timestamp == replyTo).text}</p>`
        msgdiv.prepend(replybox)
    }

    if (sender != userData.email) {

        const replybtn = document.createElement('button')
        replybtn.setAttribute('data-timestamp', timestamp)
        replybtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#333"><path d="M744-210v-144q0-50-35-85t-85-35H282l123 123-51 51-210-210 210-210 51 51-123 123h342q80 0 136 56t56 136v144h-72Z"/></svg>'
        replybtn.onclick = handlereply
        msgdiv.appendChild(replybtn)
    }

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

async function handlereply(e) {
    const replyts = e.target.getAttribute('data-timestamp');
    messageF.setAttribute('data-reply-ts', replyts)
    replymsg.innerHTML = chatData.messages.find(msg => msg.timestamp == replyts).text
    messageF.classList.add('reply-inp')

}

document.getElementById('cancel-reply').addEventListener("click", cancelReply)
function cancelReply() {
    messageF.classList.remove('reply-inp')
    setTimeout(() => {
        messageF.removeAttribute('data-reply-ts')
        replymsg.innerHTML = ''
    }, 500);
}
