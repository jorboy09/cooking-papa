let login = false

// Check Search Item
let searchingItems = new Set();
function checkSearchItems() {
    searchingItems.clear();

    // Check Drag&drop items with ignore space
    const searchBar = document.querySelectorAll('.inSearch .ingredient');
    for (const searchItem of searchBar) {
        searchingItems.add(searchItem.innerText.trim().toLowerCase())
    }
    // Check Input items
    if (document.querySelector('#editor').value != '') {
        // Split by ',' with ignore space. Use " " to include space
        const searchTexts = document.querySelector('#editor').value.split(',')
        for (const searchText of searchTexts) {
            searchingItems.add(searchText.trim().toLowerCase())
        }
    }
    // Change ingredients bookmark
    const ingredients = document.querySelectorAll('.individual-ingredient .ingredient')
    const ingredientsIndicator = document.querySelectorAll('.individual-ingredient .ingredients-indicator')

    for (let i = 0; i < ingredients.length; i++) {
        if (searchingItems.has(ingredients[i].innerText.toLowerCase())) {
            ingredientsIndicator[i].innerHTML = '<i class="far fa-check-square"></i>'
            let clone = ingredients[i].parentElement.cloneNode(true)
            ingredients[i].parentElement.parentElement.prepend(clone)
            ingredients[i].parentElement.remove()
        } else {
            ingredientsIndicator[i].innerHTML = '<i class="far fa-question-circle"></i>'
        }
    }
}

// document.querySelector('header').addEventListener('mousemove', () => {
//     checkSearchItems()
// })

// document.querySelector('#searchbar').addEventListener('keydown', () => {
//     checkSearchItems()
// })

document.querySelector('#searchbar').addEventListener('change', () => {
    checkSearchItems()
})

// Dragable
function dragstart_handler(event) {
    // console.log("dragStart");
    // Change the source element's background color to signify drag has started
    // ev.currentTarget.style.border = "dashed";
    // Add the id of the drag source element to the drag data payload so
    // it is available when the drop event is fired
    event.dataTransfer.setData("class", event.target.className.split(' ')[0]);
    event.dataTransfer.setData('ingre_id', event.target.dataset.ingre_id)
    // Tell the browser both copy and move are possible
    event.effectAllowed = "copyMove";
}
function dragover_handler(event) {
    // console.log("dragOver");
    // Change the target element's border to signify a drag over event
    // has occurred
    // ev.currentTarget.style.background = "lightblue";
    event.preventDefault();
}
function drop_handler(event) {
    // console.log("Drop");
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
            console.log('clicked')
            event.currentTarget.parentNode.remove()
        })
    }
}
function dragend_handler(event) {
    // console.log("dragEnd");
    // Restore source's border
    //  event.target.style.border = "solid black";
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
            // console.log(json)
            document.querySelector('.inputSearch').innerHTML += `<div class="ingre_result" data-ingre_id='${json.id}'>${json.name_eng}</div>`
        }
    }
    const inputresults = document.querySelectorAll('.inputSearch .ingre_result')
    for (let inputresult of inputresults) {
        inputresult.addEventListener('click', async (event) => {
            // console.log('click')
            if (document.querySelector(`.inSearch [data-ingre_id='${event.currentTarget.dataset.ingre_id}'`) == null) {
                const res = await fetch('/findingre', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ ingre_id: [event.currentTarget.dataset.ingre_id] })
                })
                const jsons = await res.json()
                // console.log(jsons)
                for (let json of jsons) {
                    document.querySelector('.inSearch').innerHTML +=
                        `<div class="ingredient" data-ingre_id='${json.id}' draggable="true" ondragstart="dragstart_handler(event);" ondragend="dragend_handler(event);">
                        <img src='${json.image}'>
                        <i class="far fa-times-circle"></i>${json.name_eng}</div>`
                }
            }
            document.querySelector('#editor').value = ''
            document.querySelector('.inputSearch').innerHTML = ''
            let crosses = document.querySelectorAll('#searchbar .inSearch .ingredient .fa-times-circle')
            for (let cross of crosses) {
                cross.addEventListener('click', (event) => {
                    // console.log('clicked')
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

//keep those ingredient searched on search bar
const searchparams = new URLSearchParams(location.search)
let searches = searchparams.get('id').split(' ')
getingredients(searches)
searchrecipes(searches)

//get ingredients by id
async function getingredients(ingredientsids) {
    const res = await fetch('/findingre', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ingre_id: ingredientsids })
    })
    const jsons = await res.json()
    // console.log(jsons)
    for (let json of jsons) {
        document.querySelector('.inSearch').innerHTML +=
            `<div class="ingredient" data-ingre_id='${json.id}' draggable="true" ondragstart="dragstart_handler(event);" ondragend="dragend_handler(event);">
            <img src='${json.image}'><i class="far fa-times-circle"></i>${json.name_eng}</div>`
    }
    let crosses = document.querySelectorAll('#searchbar .inSearch .ingredient .fa-times-circle')
    for (let cross of crosses) {
        cross.addEventListener('click', (event) => {
            // console.log('clicked')
            event.currentTarget.parentNode.remove()
        })
    }
}

async function searchrecipes(ingredientsids) {
    const res = await fetch('/searchrecipe', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ingre_id: ingredientsids })
    })
    const jsons = await res.json()
    // console.log(jsons)
    for (let json in jsons) {
        document.querySelector('.recipe-container').innerHTML +=
            `<div class="individual-recipe" data-recipe_id = '${jsons[json].recipe_id.id}'>
                    <div class="recipe-image">
                        <img src="/uploads/${jsons[json].recipe_pic[0].cover_pic}">
                    </div>
                    <div class="recipe-info">
                        <div class="recipe-title">
                            <h3>${jsons[json].recipe_id.recipe_name_eng}</h3>
                        </div>
                        <div class="recipe-ingredients">
                            <div class="ingredients-title">
                                Ingredients:
                            </div>
                            <div class="ingredients-list">                              
                            </div>
                        </div>
                    </div>
                </div>`
        for (let recipe_ingre of jsons[json].recipe_ingres) {
            document.querySelector(`.recipe-container>div:nth-child(${parseInt(json) + 1}) .ingredients-list`).innerHTML +=
                `<div class="individual-ingredient container">
            <div class="ingredients-indicator"><i class="far fa-question-circle"></i></div>
            <a class="ingredient-info" href="#popup-1"><i class="fas fa-info-circle"></i></a>
            <div class="ingredient" data-ingre_id='${recipe_ingre.id}' draggable="true" ondragstart="dragstart_handler(event);" ondragend="dragend_handler(event);">
                <img src="${recipe_ingre.image}">
                <i class="far fa-times-circle"></i>${recipe_ingre.name_eng}
            </div>
        </div>`
        }
        const individuals = document.querySelectorAll(`.recipe-container>div:nth-child(${parseInt(json) + 1}) .individual-ingredient .ingredient`)
        for (let individual of individuals){
            for (let ingre_quan in jsons[json].recipe_ingres_quan) {
                if (jsons[json].recipe_ingres_quan[ingre_quan].id == individual.dataset.ingre_id) {
                    individual.parentElement.innerHTML +=
                        `<div class="ingredient-quantites">${jsons[json].recipe_ingres_quan[ingre_quan].ingres_quan}</div>`
                }
            }
        }
    }
    checkSearchItems();
    const ingre_lists = document.querySelectorAll('.ingredients-list')
    for (let ingre_list of ingre_lists) {
        for (let i = 6; i <= ingre_list.childElementCount; i++) {
            ingre_list.childNodes[i].remove()
        }
    }
    // link to recipe.html
    const recipes = document.querySelectorAll('.individual-recipe')

    for (let recipe of recipes) {
        recipe.addEventListener('click', (event) => {
            const recipeId = event.currentTarget.dataset.recipe_id
            window.location = `/recipe.html?recipeId=${recipeId}`
        })
    }
}

// popup ingredients details insert
setTimeout(() => {
    const ingredients = document.querySelectorAll('.individual-ingredient .ingredient')
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
}, 1000)


    //get login status
    ; (async () => {
        const res = await fetch('/loginornot')
        const json = await res.json()
        if (json.login) {
            login = true
            let recipes = []
            let ingres = []
            if (json.user_reci[0].id != null) {
                do {
                    let num = Math.floor(Math.random() * json.user_reci.length)
                    if (!recipes.includes(num)) {
                        recipes.push(num)
                    }
                } while (ingres.length != 4 && recipes.length != json.user_reci.length)
            }
            console.log(json.user_reci.length)
            if (json.user_ingres[0].id != null) {
                do {
                    let num = Math.floor(Math.random() * json.user_ingres.length)
                    if (!ingres.includes(num)) {
                        ingres.push(num)
                    }
                } while (ingres.length != 4 && ingres.length != json.user_ingres.length)
            }
            if (json.userinfo[0].profile_pic == null) {
                document.querySelector('.sidebar>ul').innerHTML = `<li id="welcome"><i class="fas fa-user-check"><span>Welcome Back!</span></i> <a href="/profile.html">${json.userinfo[0].username}</a></li>` + document.querySelector('.sidebar>ul').innerHTML
            } else {
                document.querySelector('.sidebar>ul').innerHTML = `<li id="welcome"><i class="fas fa-user-check"><span>Welcome Back!</span></i> <a href="/profile.html"><img src="/uploads/${json.userinfo[0].profile_pic}">${json.userinfo[0].username}</a></li>` + document.querySelector('.sidebar>ul').innerHTML
            }
            for (let recipe of recipes) {
                document.querySelector('#favrecipe .menubox').innerHTML += `<button type="button" class="btn btn-warning" data-recipe_id = '${json.user_reci[recipe].id}'>${json.user_reci[recipe].recipe_name_eng}</button>`
            }
            document.querySelector('#favrecipe .menubox').innerHTML += `<a href="fav_recipe.html" class='button-more'><button type="button" class="btn btn-secondary">More</button></a>`
            for (let ingre of ingres) {
                document.querySelector('#mying .menubox').innerHTML += `<button type="button" class="btn btn-warning" data-ingre_id = '${json.user_ingres[ingre].id}'>${json.user_ingres[ingre].name_eng}</button>`
            }
            document.querySelector('#mying .menubox').innerHTML += `<a href="my_ingredient.html" class='button-more'><button type="button" class="btn btn-secondary">More</button></a>`

            document.querySelector('.sidebar>ul>li:last-child').innerHTML = `<li id="logout"><a href="#"><i class="fas fa-sign-out-alt"></i>Logout</a></li>`
            // logout listener
            document.querySelector('#logout').addEventListener('click', async () => {
                await fetch('/logout', {
                    method: 'POST'
                })
                alert('You are logged out')
                window.location.reload();
            })
        } else {
            login = false
        }
    })()

// generate suggested ingredients
async function getsuggest_ingre() {
    const res = await fetch('/ingre_box')
    const jsons = await res.json()
    let items = []
    do {
        let ingre_id = Math.floor(Math.random() * jsons.length)
        if (!items.includes(ingre_id)) {
            document.querySelector('.suggest_ingredients').innerHTML += `<div class="ingredient" data-ingre_id='${jsons[ingre_id].id}' draggable="true"
            ondragstart="dragstart_handler(event);" ondragend="dragend_handler(event);">
            <img src="${jsons[ingre_id].image}">
            <i class="far fa-times-circle"></i>${jsons[ingre_id].name_eng}
            </div>`
            items.push(ingre_id)
        }
    } while (items.length != 4)
}
getsuggest_ingre()