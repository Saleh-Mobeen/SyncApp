import { getChat, waitForAuth, sendMessage, addListener, userData, initLinks, regScript, showToast } from "./firebase.js";
import { indexedStorage } from './indexedStorage.js';

init()
export async function init() {

    regScript('chatroom.js', init)

    console.log('chatroom');

    const messageF = document.getElementById('message-f');
    const msgInp = messageF.querySelector('textarea')
    const replymsg = document.getElementById('reply-message');
    const imgUpld = document.getElementById('img-upld-inp');
    const imgPrev = document.getElementById('img-prev-src');

    document.querySelector('.emoji-togg').addEventListener('click', () => {
        requestAnimationFrame(() => {
            scrollBtm()
        });
    })


    let chatref;
    let chatData;
    const chatArea = document.getElementsByClassName('chat-area')[0];
    let msgGdate = 10
    let lastMsg = 1


    await waitForAuth()
    initLinks()
    await loadChat()


    async function loadChat() {
        const url = new URL(window.location.href);
        const email = url.searchParams.get('var');
        await indexedStorage.removeItem(email)




        const otherUserData = userData.contacts.filter(contact => contact.email == email)[0]


        document.querySelector('.ch-profile>img').src = otherUserData.profilePicurl
        document.querySelector('#ch-info>h2').textContent = otherUserData.username
        document.querySelector('#ch-info>p').textContent = otherUserData.email.length > 20 ? otherUserData.email.slice(0, 20).concat('...') : otherUserData.email


        const chatsnap = await getChat(email);
        chatData = chatsnap.docs[0].data()
        chatref = chatsnap.docs[0].ref
        console.log(chatData);

        let loadedMsgs = 0
        const bunchsize = 15
        chatData.messages = chatData.messages.sort((a, b) => a.timestamp - b.timestamp)
        document.addEventListener("scroll", e => {
            if (document.documentElement.scrollTop === 0 && loadedMsgs) {
                const html = document.querySelector('html')

                const prevScrollTop = html.scrollTop;
                const prevScrollHeight = html.scrollHeight;

                renderMsgs()

                const newScrollHeight = html.scrollHeight;
                console.log(newScrollHeight, prevScrollHeight, prevScrollTop);

                html.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight);

            }

        })
        renderMsgs()
        function renderMsgs(params) {
            let showMsgs = chatData.messages.slice(Math.max(0, chatData.messages.length - loadedMsgs - bunchsize), chatData.messages.length - loadedMsgs)
            lastMsg = chatArea.firstElementChild
            showMsgs.forEach(e => {

                showmsg(e, false)

            })
            lastMsg = null

            loadedMsgs += bunchsize
            if (loadedMsgs > chatData.messages.length) {
                loadedMsgs = null
            }
        }

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

        imgUpld.addEventListener('change', () => {
            const file = imgUpld.files[0];
            if (!file) {

                return;
            }
            showToast("Images are secure, but don't upload personal or sensitive info.")
            const url = URL.createObjectURL(file);
            imgPrev.src = url;
            imgPrev.parentElement.classList.add('show')

            imgPrev.onload = () => URL.revokeObjectURL(url);
            imgPrev.parentElement.querySelector('button').onclick = () => {
                imgPrev.src = '';
                imgUpld.value = ''
                imgPrev.parentElement.classList.remove('show')

            };
        })

        async function uploadImage(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = async () => {
                    try {
                        const image = reader.result.split(',')[1];
                        const imageres = await (await fetch('https://9n5t68-3000.csb.app/uploadImage', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ image })
                        })).json();
                        if (imageres.ok) {
                            resolve(imageres.imgUrl);
                        } else {
                            reject("Image upload failed");
                        }
                    } catch (e) {
                        reject(e);
                    }
                };
                reader.onerror = reject;
            });
        }

        async function msgsub() {
            document.querySelector('#send-msg').classList.add('sending')

            fetch('https://9n5t68-3000.csb.app/ping').then(async (res) => {
                console.warn(res);

                if (msgInp.value.trim() != '' || imgUpld.value != '') {
                    console.log('sending');
                    let imageurl = ''

                    if (imgUpld.value != '') {
                        const file = imgUpld.files[0]
                        imageurl = await uploadImage(file);
                    }

                    const message = {
                        text: msgInp.value.trim(),
                        sender: userData.email

                    }
                    console.log(msgInp.classList.contains('reply-inp'));

                    if (messageF.classList.contains('reply-inp')) {
                        message.replyTo = messageF.getAttribute('data-reply-ts')
                    }

                    if (imageurl) {
                        console.log('yes image');

                        message.imageUrl = imageurl
                    } else {
                        console.log(imageurl);

                    }
                    sendMessage(message, chatref)
                    fetch('https://9n5t68-3000.csb.app/notify-user', {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: email,
                            from: userData.email,
                            msg: msgInp.value.trim()
                        })
                    }).then((res) => { console.warn(res) })
                    cancelReply()
                    cancelImg()
                    document.querySelector('#send-msg').classList.remove('sending')

                    msgInp.value = ""
                    msgInp.style.height = 'auto'; msgInp.style.height = `${msgInp.scrollHeight}px`
                }

            }, (err) => {
                console.log(err);
                document.querySelector('#send-msg').classList.remove('sending')

            })


        }

        addListener(chatref, showmsg)
    }

    function showmsg(msgdata, animate = true) {


        const { text, timestamp, sender, replyTo, imageUrl } = msgdata
        // console.log('new msg' + text, replyTo, chatData.messages.includes(msgdata));


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

        // console.log(replyTo);

        if (imageUrl) {
            const imagebox = document.createElement('div')
            const imageele = document.createElement('img')

            console.log(imageele);


            imagebox.addEventListener('click', () => imagebox.classList.toggle('full-img'))
            imageele.addEventListener('load', scrollBtm, { once: true })
            imagebox.classList.add('image-box')
            imageele.src = imageUrl
            imagebox.append(imageele)
            msgdiv.prepend(imagebox)
        }

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

        console.log(lastMsg);

        chatArea.insertBefore(msgdiv, lastMsg)




        if (animate) {
            scrollBtm()
            if (sender == userData.email) {
                msgdiv.style.animation = 'UnewMsg 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'

            } else {

                msgdiv.style.animation = 'OnewMsg 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'

            }
        }
    }

    function scrollBtm() {
        const html = document.querySelector('html')
        html.style.scrollBehavior = 'smooth'
        html.scrollTop = html.scrollHeight;
        html.style.scrollBehavior = 'auto'
    }

    function addDateTag(date) {
        const tag = document.createElement('div')
        tag.classList.add('date-tag')
        tag.innerHTML = `<p>${date}</p>`
        chatArea.insertBefore(tag, lastMsg)
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


    function cancelImg() {
        imgPrev.src = '';
        imgUpld.value = ''
        imgPrev.parentElement.classList.remove('show')
    }

}
