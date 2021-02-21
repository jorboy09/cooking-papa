let login = false

function dragstart_handler(event) {
    // Add the id of the drag source element to the drag data payload so
    // it is available when the drop event is fired
    event.dataTransfer.setData("class", event.target.className.split(' ')[0]);
    event.dataTransfer.setData('ingre_id', event.target.dataset.ingre_id)
    // Tell the browser both copy and move are possible
    event.effectAllowed = "copyMove";
}
function dragover_handler(event) {
    event.preventDefault();
}
function drop_handler(event) {
    event.preventDefault();
    // Get the id of drag source element (that was added to the drag data
    // payload by the dragstart event handler)
    let oneclass = event.dataTransfer.getData("class");
    let ingre_id = event.dataTransfer.getData("ingre_id")
    // Copy the element if the source and destination ids are both "copy"
    if (oneclass == "ingredient" && document.querySelector(`.inSearch [data-ingre_id='${ingre_id}'`) == null &&
        (event.target.id == "searchbar" || event.target.id == "editor" ||
            event.target.className.split(' ')[0] == 'inSearch' ||
            event.target.className.split(' ')[0] == 'ingredient')) {
        let nodeCopy = document.querySelector(`[data-ingre_id='${ingre_id}'`).cloneNode(true);
        nodeCopy.draggable = false
        document.querySelector('.inSearch').appendChild(nodeCopy);
    }

    let crosses = document.querySelectorAll('#searchbar .inSearch .ingredient .fa-times-circle')
    for (let cross of crosses) {
        cross.addEventListener('click', (event) => {
            event.currentTarget.parentNode.remove()
        })
    }
}
function dragend_handler(event) {
    // Remove all of the drag data
    event.dataTransfer.clearData();
}

const searchtext = document.querySelector('#editor')
searchtext.addEventListener('keydown', (event) => {
    if (event.keyCode == 8 && searchtext.value == '') {
        document.querySelector('.inSearch>div:last-child').remove();
    }
})

document.querySelector('#editor').addEventListener('input', async () => {
    document.querySelector('.inputSearch').innerHTML = ''
    if (document.querySelector('input[name=searchtext]').value != "") {
        const res = await fetch('/searchinput', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ searchtext: document.querySelector('input[name=searchtext]').value })
        })
        const jsons = await res.json()
        for (let json of jsons) {
            document.querySelector('.inputSearch').innerHTML += `<div class="ingre_result" data-ingre_id='${json.id}'>${json.name_eng}</div>`
        }
    }
    const inputresults = document.querySelectorAll('.inputSearch .ingre_result')
    for (let inputresult of inputresults) {
            if (document.querySelector(`.inSearch [data-ingre_id='${event.currentTarget.dataset.ingre_id}'`) == null) {
                const res = await fetch('/findingre', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ ingre_id: [event.currentTarget.dataset.ingre_id] })
                })
                const jsons = await res.json()
                for (let json of jsons) {
                    document.querySelector('.inSearch').innerHTML +=
                        `<div class="ingredient" data-ingre_id='${json.id}' draggable="true" ondragstart="dragstart_handler(event);" ondragend="dragend_handler(event);">
                        <img src="${json.image}">
                    <i class="far fa-times-circle"></i>${json.name_eng}</div>`
                }
            }
            document.querySelector('#editor').value = ''
            document.querySelector('.inputSearch').innerHTML = ''
            let crosses = document.querySelectorAll('#searchbar .inSearch .ingredient .fa-times-circle')
            for (let cross of crosses) {
                cross.addEventListener('click', (event) => {
                    event.currentTarget.parentNode.remove()
                })
            }
        })
    }
})

document.querySelector('.fa-search').addEventListener('click', () => {
    let ingredients = ''
    let ingre_searches = document.querySelectorAll('.inSearch .ingredient')
    for (let ingre_search of ingre_searches) {
        ingredients += ingre_search.dataset.ingre_id + ' '
    }
    if (ingredients != ''){
        window.location = `/search.html?id=${ingredients}`
    }
})

let add = []
let remove = []

document.querySelector('.change_grp').addEventListener('click', () => {
    get_ingre()
})

document.querySelector('.select_all').addEventListener('click', () => {
    let selectall = true
    const all = document.querySelectorAll('.fav_ingre .ingredient')
    for (let single of all) {
        if (single.dataset.tick == 'false') {
            selectall = false
        }
    }
    if (selectall) {
        for (let single of all) {
            if (single.dataset.tick == 'true') {
                single.dataset.tick = 'false'
                single.removeChild(single.lastChild)
                if (add.indexOf(single.dataset.ingre_id) >= 0) {
                    add.splice(add.indexOf(single.dataset.ingre_id), 1)
                } else {
                    remove.push(single.dataset.ingre_id)
                }
            }
        }
        selectall = false
    } else {
        for (let single of all) {
            if (single.dataset.tick == 'false') {
                single.innerHTML += `<i class="far fa-check-circle"></i>`
                single.dataset.tick = 'true'
                add.push(single.dataset.ingre_id)
            }
        }
        selectall = true
    }
})


    //get login status
    ; (async () => {
        const res = await fetch('/loginornot')
        const json = await res.json()
        if (json.login) {
            login = true
            let recipes = []
            let ingres = []
            if (json.user_reci[0].id != null){
                do{
                    let num = Math.floor(Math.random()* json.user_reci.length)
                    if (!recipes.includes(num)){
                        recipes.push(num)
                    }            
                }while(ingres.length != 4 && recipes.length != json.user_reci.length)
            }
            if (json.user_ingres[0].id != null){
                do{
                    let num = Math.floor(Math.random()* json.user_ingres.length)
                    if (!ingres.includes(num)){
                        ingres.push(num)
                    }            
                }while(ingres.length != 4 && ingres.length != json.user_ingres.length)
            }
            if (json.userinfo[0].profile_pic == null){
                document.querySelector('.sidebar>ul').innerHTML = `<li id="welcome"><i class="fas fa-user-check"><span>Welcome Back!</span></i> <a href="/profile.html">${json.userinfo[0].username}</a></li>` + document.querySelector('.sidebar>ul').innerHTML
            }else{
                document.querySelector('.sidebar>ul').innerHTML = `<li id="welcome"><i class="fas fa-user-check"><span>Welcome Back!</span></i> <a href="/profile.html"><img src="/uploads/${json.userinfo[0].profile_pic}">${json.userinfo[0].username}</a></li>` + document.querySelector('.sidebar>ul').innerHTML}
            for (let recipe of recipes){
            document.querySelector('#favrecipe .menubox').innerHTML+=`<button type="button" class="btn btn-warning" data-recipe_id = '${json.user_reci[recipe].id}'>${json.user_reci[recipe].recipe_name_eng}</button>`
            }
            document.querySelector('#favrecipe .menubox').innerHTML+= `<a href="fav_recipe.html" class='button-more'><button type="button" class="btn btn-secondary">More</button></a>`
            for (let ingre of ingres){
            document.querySelector('#mying .menubox').innerHTML+=`<button type="button" class="btn btn-warning" data-ingre_id = '${json.user_ingres[ingre].id}'>${json.user_ingres[ingre].name_eng}</button>`
            }
            document.querySelector('#mying .menubox').innerHTML+= `<a href="my_ingredient.html" class='button-more'><button type="button" class="btn btn-secondary">More</button></a>`
    
            document.querySelector('.sidebar>ul>li:last-child').innerHTML = `<li id="logout"><a href="#"><i class="fas fa-sign-out-alt"></i>Logout</a></li>`

            // logout listener
            document.querySelector('#logout').addEventListener('click', async () => {
                await fetch('/logout', {
                    method: 'POST'
                })
                alert('You are logged out')
                window.location = '/'
            })
        } else {
            login = false
        }
        //BIG REMIND!!!!!!
        //THIS IS DIFFERENT FROM OTHER PAGE!!!!!
        get_ingre()
    })()

async function get_ingre() {
    const res = await fetch('/getfav_ingre')
    const jsons = await res.json()
    if (!login) {
        document.querySelector('.fav_ingre').innerHTML = "<div class='individual-recipe'>Please login to view and edit your favourite ingredients. Thank you!</div>"
    } else {
        document.querySelector('.select_all').style.visibility = 'visible';
        document.querySelector('.change_grp').style.visibility = 'visible';
        document.querySelector('section button').style.visibility = 'visible';
        let items = []
        do {
            let num = Math.floor(Math.random() * jsons[0].length)
            if (!items.includes(num)) {
                items.push(num)
            }
        } while (items.length != 27)
        document.querySelector('.fav_ingre').innerHTML = ''
        for (let item of items) {
            document.querySelector('.fav_ingre').innerHTML += `
        <div class="ingredient" data-ingre_id='${jsons[0][item].id}' data-tick='false' draggable="true" ondragstart="dragstart_handler(event);"
        ondragend="dragend_handler(event);">
            <i class="far fa-times-circle"></i>${jsons[0][item].name_eng}
        </div>`

            for (let fav_ingre of jsons[1]) {
                if ((fav_ingre.ingres_id == parseInt(document.querySelector('.fav_ingre').lastChild.dataset.ingre_id) && !remove.includes(fav_ingre.ingres_id.toString())) ||
                    add.includes(document.querySelector('.fav_ingre').lastChild.dataset.ingre_id)) {
                    document.querySelector('.fav_ingre').lastChild.innerHTML += `<i class="far fa-check-circle"></i>`
                    document.querySelector('.fav_ingre').lastChild.dataset.tick = 'true'
                    break;
                }
            }
        }
        const choices = document.querySelectorAll('.fav_ingre .ingredient')
        for (let choice of choices) {
            choice.addEventListener('click', event => {
                if (event.currentTarget.dataset.tick == 'false') {
                    event.currentTarget.innerHTML += `<i class="far fa-check-circle"></i>`
                    event.currentTarget.dataset.tick = 'true'
                    add.push(event.currentTarget.dataset.ingre_id)
                } else {
                    event.currentTarget.dataset.tick = 'false'
                    event.currentTarget.lastChild.remove()
                    if (add.indexOf(event.currentTarget.dataset.ingre_id) >= 0) {
                        add.splice(add.indexOf(event.currentTarget.dataset.ingre_id), 1)
                    } else {
                        remove.push(event.currentTarget.dataset.ingre_id)
                    }
                }
            })
        }

        document.querySelector('section button').addEventListener('click', async () => {
            let fav_ingre = []
            const favingre = document.querySelectorAll('.fav_ingre .ingredient')
            for (let choice of choices) {
                if (choice.dataset.tick == 'true') {
                    fav_ingre.push(choice.dataset.ingre_id)
                }
            }
            const res = await fetch('/editfav_ingre', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ add_fav_ingres: add, remove_fav_ingres: remove })
            })
            window.location = '/'
        })
    }
}



// generate suggested ingredients
async function getsuggest_ingre() {
    const res = await fetch('/ingre_box')
    const jsons = await res.json()
    let items = []
    do{
        let ingre_id = Math.floor(Math.random() * jsons.length)
        if (!items.includes(ingre_id)) {
            document.querySelector('.suggest_ingredients').innerHTML += `<div class="ingredient" data-ingre_id='${jsons[ingre_id].id}' draggable="true"
            ondragstart="dragstart_handler(event);" ondragend="dragend_handler(event);">
            <img src="${jsons[ingre_id].image}">
            <i class="far fa-times-circle"></i>${jsons[ingre_id].name_eng}
            </div>`
            items.push(ingre_id)
        }
    }while(items.length !=4)
}
getsuggest_ingre()