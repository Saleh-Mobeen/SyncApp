import { regScript } from "./firebase.js";

init()
export async function init() {

    regScript('emoji.js', init)

    let emojis = []
    const emojikbd = document.querySelector('#emoji-kbd')
    const msginp = document.querySelector('#message-f>textarea')


    fetch('emoji_list.json')

        .then(res => res.json())
        .then(data => {
            emojis = data
            console.log('Loaded emojis:', emojis)
            renderEmoji()

        })
        .catch(err => console.error('Error loading emoji list:', err))

    function renderEmoji() {
        let category = ''
        for (const obj of emojis) {
            if (category !== obj.category) {
                const div = document.createElement('p')
                div.textContent = obj.category
                emojikbd.append(div)
                category = obj.category
            }
            const div = document.createElement('div')
            div.textContent = obj.emoji
            emojikbd.append(div)
        }


        const kbd = document.getElementById('emoji-kbd');
        if (!kbd) {
            console.error('emoji-kbd container not found');
            return;
        }

        emojikbd.addEventListener('click', e => {
            console.log(e.target, e);
            if (e.target.localName == 'div' && e.target.id != 'emoji-kbd') {
                console.log(e.target, 'yes');
                msginp.value += e.target?.firstElementChild?.alt || e.target.textContent
            } else {

            }

        })
    }


}

