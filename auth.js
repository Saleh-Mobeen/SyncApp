import { signIn, signUp, forgotPass } from './firebase.js'

const signinF = document.getElementById("sign-in-f");
const signupF = document.getElementById("sign-up-f");
const forgotbtn = document.getElementById('fgbtn');
const inErr = document.getElementById('sign-in-err');
const upErr = document.getElementById('sign-up-err');





signinF.addEventListener('submit', async e => {
    e.preventDefault(); // Prevent default form submission
    const form = e.target;
    const inputs = form.querySelectorAll('input');
    let valid = true;


    inputs.forEach(input => {
        if (input.value.trim() === '' || !input.checkValidity()) {
            valid = false;
            makeInvalid(input);
        }
    });

    if (valid) {
        console.log("valid");



        // Form is valid, proceed with sign-in
        try {
            const email = e.target[0].value;
            const password = e.target[1].value;
            e.submitter.style.pointerEvents = 'none'
            e.submitter.style.cursor = 'not-allowed'
            e.submitter.parentElement.classList.add('animate-before');


            const userCredential = await signIn(email, password);


            e.submitter.parentElement.classList.remove('animate-before');
            e.submitter.style.pointerEvents = 'all'
            e.submitter.style.cursor = 'default'
            redirect()
        } catch (error) {
            e.submitter.parentElement.classList.remove('animate-before');

            let err = error.toString()
            if (err.includes("(auth/network-request-failed)")) {
                makeerr(inErr, "No Connnection, Check your Internet")

            } else if (err.includes("(auth/invalid-credential)")) {
                makeerr(inErr, "Invalid username or password.")

            } else if (err.includes("(auth/too-many-requests)")) {
                makeerr(inErr, "Too many requests. Try again later.")

            } else {
                makeerr(upErr, "An unknown error occurred.");

            }
            e.submitter.style.pointerEvents = 'all'
            e.submitter.style.cursor = 'default'

        }
    }
});

signupF.addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const inputs = form.querySelectorAll('input');
    let valid = true;

    inputs.forEach(input => {
        if (input.value.trim() === '' || !input.checkValidity()) {
            valid = false;

            makeInvalid(input);


        }
    })


    if (e.target[2].value !== e.target[3].value) {
        valid = false;

        makeInvalid(e.target[2]);
        makeInvalid(e.target[3]);


    }

    if (valid) {
        try {
            console.log("Valid");

            const username = e.target[0].value;
            const email = e.target[1].value;
            const password = e.target[2].value;
            console.log(e);
            e.submitter.style.pointerEvents = 'none';
            e.submitter.style.cursor = 'not-allowed'

            e.submitter.parentElement.classList.add('animate-before');


            let userCredential = await signUp(username, email, password);


            e.submitter.parentElement.classList.remove('animate-before');
            e.submitter.style.pointerEvents = 'all';
            e.submitter.style.cursor = 'default'

            console.log("Sign-up successful:", userCredential.user);
            redirect()

        } catch (error) {
            e.submitter.parentElement.classList.remove('animate-before');

            let err = error.toString();

            if (err.includes("auth/network-request-failed")) {
                makeerr(upErr, "No connection. Check your internet.");

            } else if (err.includes("auth/email-already-in-use")) {
                makeerr(upErr, "Email is already in use.");
                makeInvalid(e.target[1]);

            } else if (err.includes("auth/too-many-requests")) {
                makeerr(upErr, "Too many requests. Try again later.");

            } else if (err.includes("Invalid username")) {
                makeerr(upErr, "Username is already in use.");
                makeInvalid(e.target[0]);

            } else {
                makeerr(upErr, "An unknown error occurred.");

            }
            e.submitter.style.pointerEvents = 'all';
            e.submitter.style.cursor = 'default'

        }
    }
})

forgotbtn.addEventListener('click', async (e) => {

    const email = document.getElementById('sign-in-email')
    if (email.checkValidity() && email.value.trim() != '') {

        try {
            console.log("sending  " + email.value);
            forgotbtn.style.pointerEvents = 'none'
            forgotbtn.style.cursor = 'not-allowed'


            await forgotPass(email.value)

            forgotbtn.style.pointerEvents = 'all'
            forgotbtn.style.cursor = 'pointer'

            inErr.style.color = 'var(--prim-tx)'
            inErr.style.backgroundColor = '#00b40060'
            inErr.style.borderColor = 'var(--inp-act)'


            setTimeout(() => {
                inErr.style.color = 'var(--err-tx)'
            }, 5500)

            makeerr(inErr, "Email sent")
        } catch (error) {
            forgotbtn.style.pointerEvents = 'all'
            forgotbtn.style.cursor = 'pointer'

            makeerr(inErr, "Email cannot be sent")
        }
    } else {
        makeInvalid(email)

    }

})

function redirect() {
    const a = document.createElement('a')
    a.href = "index.html"
    a.click()
}

function makeInvalid(ele) {
    ele.setCustomValidity(' ');

    ele.addEventListener('focus', () => {
        ele.setCustomValidity('');
    }, { once: true })
}

function makeerr(ele, err) {
    // Set the error message
    ele.children[0].textContent = err;

    // Ensure the element is visible
    ele.style.display = "block";
    setTimeout(() => {

        ele.style.opacity = 1
    }, 1)

    setTimeout(() => {
        ele.style.opacity = 0
    }, 5000)

    setTimeout(() => {
        ele.style.display = "none";
    }, 5500)

}


