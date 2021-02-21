let login = false

// generate suggested ingredients
;(async function recommandIngredient() {
    const res = await fetch('/ingre_box')
    const jsons = await res.json()
    let items = []
    do {        
        let ingre_id = Math.floor(Math.random() * jsons.length)
        if (!items.includes(ingre_id)) {
                    
            document.querySelector('#ingredients-section .wrapper').innerHTML += `
            <div class="card"><img src="${jsons[ingre_id].image}" />
                <div class="info">
                    <h1 class="ingredient-name" data-ingredientid="${jsons[ingre_id].id}">${jsons[ingre_id].name_eng}</h1>
                    <p>${jsons[ingre_id].details.substring(0,144)} ...</p>
                    <a class="ingredient-info" href="#popup-1"><button>Details</button></a>
                </div>
            </div>
            `
            items.push(ingre_id)
        }
    } while (items.length != 6)

    // popup ingredients details insert
    const ingredients = document.querySelectorAll('#ingredients-section .ingredient-name')
    const ingredientInfos = document.querySelectorAll('.ingredient-info')
    for (let i = 0; i < ingredientInfos.length; i++) {
        ingredientInfos[i].addEventListener('click', async () => {
            const res = await fetch('/ingredient_info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ingredient: ingredients[i].innerText })
            })
            const json = await res.json()

            if (!json.result) {
                document.querySelector('.popup .ingredient-name').innerText = ingredients[i].innerText
                document.querySelector('.popup .content').innerText = "Sorry no such information ><"
                document.querySelector('.popup .popup-image').src = 'icon.png'
            } else {
                document.querySelector('.popup .ingredient-name').innerText = json["name_eng"]
                document.querySelector('.popup .content').innerText = json.details
                document.querySelector('.popup .popup-image').src = json.image
            }

            // update bookmark shown
            const resBookmark = await fetch('/ingredient_bookmark', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ingredient: ingredients[i].innerText })
            })
            const jsonBookmark = await resBookmark.json()
            if (jsonBookmark.bookmarked) {
                document.querySelector('#popup-1 .bookmark').innerHTML = '<i class="fas fa-bookmark"></i>'
            } else {
                document.querySelector('#popup-1 .bookmark').innerHTML = '<i class="far fa-bookmark"></i>'
            }
        })
    }

    // bookmark
    document.querySelector('#popup-1 .bookmark').addEventListener('click', async () => {
        const res = await fetch('/ingredient_bookmark', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ingredient: document.querySelector('.popup .ingredient-name').innerText })
        })
        const json = await res.json()
        if (!json.loggedIn) {
            alert('Please login before bookmark. Thank you!')
        } else if (!json.ingredientExist) {
            alert('Cannot bookmark as the ingredient do not exist. Sorry!')
        } else if (!json.bookmarked) {
            document.querySelector('#popup-1 .bookmark').innerHTML = '<i class="fas fa-bookmark"></i>'
            alert('Bookmarked!')
        } else {
            document.querySelector('#popup-1 .bookmark').innerHTML = '<i class="far fa-bookmark"></i>'
            alert('Removed bookmark!')
        }
    })
})()

// generate suggested recipes
;(async function getsuggest_recipe() {
    const res = await fetch('/recipe_box')
    const jsons = await res.json()
    let items = []
    do {        
        let recipe_id = Math.floor(Math.random() * jsons.length)
        if (!items.includes(recipe_id)) {        
            document.querySelector('.recipes-section .spinner-wrapper').innerHTML += `
            <div id='recipe-${jsons[recipe_id].id}' class="spinner">
                <div class="inner-spin"></div>
                <span class="spinner-content">
                    <p>${jsons[recipe_id].recipe_name_eng}</p>
                    <img src="/uploads/${jsons[recipe_id].cover_pic}">
                </span>
            </div>
            `
            items.push(recipe_id)
        }
    } while (items.length != 3)

    // link to recipe.html
    const recipes = document.querySelectorAll('.recipes-section .spinner')

    for (let recipe of recipes) {
        recipe.addEventListener('click', () => {
            const recipeId = recipe.id.split('-')[1]
            window.location = `/recipe.html?recipeId=${recipeId}`
        })
    }
})()

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
    //key code 8 = backspace
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
        inputresult.addEventListener('click', async (event) => {
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
    if (ingredients != '') {
        window.location = `/search.html?id=${ingredients}`
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
        document.querySelector('#logout').addEventListener('click', async() => {
            await fetch('/logout', {
                method: 'POST'
            })
            alert('You are logged out')
            window.location = '/'
        })
    } else {
        login = false
    }
})()

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
    }while(items.length !=4 && items.length!=jsons.length)
}
getsuggest_ingre()
