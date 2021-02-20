// Login
const loginForm = document.querySelector('#loginform')
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const res = await fetch ('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: loginForm.querySelector('input[name=username]').value,
            password: loginForm.querySelector('input[name=password]').value,

        })
    })
    const json = await res.json();
    if (json.result){
        window.location = '/'
    } else {
        alert ("Sorry. Something's wrong. Login Failed.")
    }
})

