// const { default: nlp } = require("compromise");
nlp.extend(compromiseNumbers)
let login = false

    // show recipe
    ; (async function showRecipe() {
        const recipeParams = new URLSearchParams(location.search)
        let recipeId = recipeParams.get('recipeId')

        const res = await fetch('/recipeDetails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ recipeId: recipeId })
        })

        const json = await res.json();
        const recipeInfo = json[0];
        if (recipeInfo === undefined) {
            document.querySelector('main').innerHTML = 'No recipe information.'
            return;
        }
        // reduce duplicate ingredient
        let recipeIngres = recipeInfo.recipe_ingres
        recipeIngres.push({ id: "" })
        const recipeIngresReduce = []
        recipeIngres.reduce((acc, cur) => {
            if (acc.id != cur.id) {
                recipeIngresReduce.push(acc)
                return cur
            } else {
                if (acc.ingres_quan == null) {
                    return cur
                } else {
                    return acc
                }
            }

        })
        // insert info
        document.querySelector('.recipe-title').innerText = recipeInfo.recipe_id.recipe_name_eng
        document.querySelector('.creater-name').innerText = `(Creater: ${recipeInfo.recipe_id.username})`
        // insert ingredients
        for (const ingredient of recipeIngresReduce) {

            if (ingredient.ingres_quan == null) {
                // null ingredients quantity
                document.querySelector('.ingredient-list').innerHTML += `
            <div class="individual-ingredient container">
                <div class="indicator-info">
                    <div class="ingredients-indicator"><i class="far fa-question-circle"></i></div>
                    <a class="ingredient-info" href="#popup-1"><i class="fas fa-info-circle"></i></a>
                </div>
                <div class="ingredient" data-ingre_id='${ingredient.name_eng.replace(/\//g, '_').replace(/ /g, '_').toLowerCase()}' draggable="true" ondragstart="dragstart_handler(event);" ondragend="dragend_handler(event);">
                    <img src="${ingredient.image}">
                    <i class="far fa-times-circle"></i>${ingredient.name_eng}
                </div>
                <div class="ingredient-quantites"><span class="quantity-quantifier"></span></div>
            </div>
        `
            } else {
                // have ingredients quantity
                document.querySelector('.ingredient-list').innerHTML += `
            <div class="individual-ingredient container">
                <div class="indicator-info">
                    <div class="ingredients-indicator"><i class="far fa-question-circle"></i></div>
                    <a class="ingredient-info" href="#popup-1"><i class="fas fa-info-circle"></i></a>
                </div>
                <div class="ingredient" data-ingre_id='${ingredient.id}' draggable="true" ondragstart="dragstart_handler(event);" ondragend="dragend_handler(event);">
                    <img src="${ingredient.image}">
                    <i class="far fa-times-circle"></i>${ingredient.name_eng}
                </div>
                <div class="ingredient-quantites"><span class="quantity-quantifier">${ingredient.ingres_quan}</span></div>
            </div>
        `
            }
        }
        // insert image
        document.querySelector('.dish-image').src = `/uploads/${recipeInfo.recipe_pic[0].cover_pic}`

        // insert step
        for (const step of recipeInfo.recipe_step) {
            if (step.steps_img == null) {
                document.querySelector('.step-container').innerHTML += `
                <div class="individual-step">            
                    <div class="step-order-ingredient">
                        Step <span class="step-number">${step.steps_order}</span>
                        <div class="step-ingredient" id='step-${step.steps_order}-ingredient'>                    
                        </div>
                    </div>
                    <div class="image-describe">
                        <div class="step-describe">${step.steps_description}</div>
                    </div>
                </div>
            `
                for (const stepIngredient of step.ingredients)
                document.querySelector(`#step-${step.steps_order}-ingredient`).innerHTML += `
                <div class="ingredient" data-ingre_id='${stepIngredient.id}' draggable="true" ondragstart="dragstart_handler(event);" ondragend="dragend_handler(event);">
                    <img src="${stepIngredient.image}">
                    <i class="far fa-times-circle"></i>${stepIngredient.name_eng}
                </div>    
                `    
            } else {
                document.querySelector('.step-container').innerHTML += `
                <div class="individual-step">            
                    <div class="step-order-ingredient">
                        Step <span class="step-number">${step.steps_order}</span>
                        <div class="step-ingredient" id='step-${step.steps_order}-ingredient'>                    
                        </div>
                    </div>
                    <div class="image-describe">
                        <div><img class="step-image" src="/uploads/${step.steps_img}"></div>
                        <div class="step-describe">${step.steps_description}</div>
                    </div>
                </div>
            `
                for (const stepIngredient of step.ingredients)
                document.querySelector(`#step-${step.steps_order}-ingredient`).innerHTML += `
                <div class="ingredient" data-ingre_id='${stepIngredient.id}' draggable="true" ondragstart="dragstart_handler(event);" ondragend="dragend_handler(event);">
                    <img src="${stepIngredient.image}">
                    <i class="far fa-times-circle"></i>${stepIngredient.name_eng}
                </div>    
                `    
            }
        }

        addSpan()
        

        // popup ingredients details insert
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

                // update ingredient bookmark shown
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

        // ingredient bookmark
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

            // update recipe bookmark shown
            ; (async () => {
                const res = await fetch('/recipe_bookmark', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ recipe: document.querySelector('.recipe-title').innerText })
                })
                const json = await res.json()
                if (json.bookmarked) {
                    document.querySelector('.dish-info .bookmark').innerHTML = '<i class="fas fa-bookmark"></i>'
                } else {
                    document.querySelector('.dish-info .bookmark').innerHTML = '<i class="far fa-bookmark"></i>'
                }
            })();

        // Recipe bookmark
        document.querySelector('.dish-info .bookmark').addEventListener('click', async () => {
            const res = await fetch('/recipe_bookmark', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ recipe: document.querySelector('.recipe-title').innerText })
            })
            const json = await res.json()
            if (!json.loggedIn) {
                alert('Please login before bookmark. Thank you!')
            } else if (!json.recipeExist) {
                alert('Cannot bookmark as the recipe do not exist. Sorry!')
            } else if (!json.bookmarked) {
                document.querySelector('.dish-info .bookmark').innerHTML = '<i class="fas fa-bookmark"></i>'
                alert('Bookmarked!')
            } else {
                document.querySelector('.dish-info .bookmark').innerHTML = '<i class="far fa-bookmark"></i>'
                alert('Removed bookmark!')
            }
        })
        // hidden loading div
        document.querySelector('main .loading').style.visibility = 'hidden'
    })();


// for change number in step 

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
checkSearchItems();

document.querySelector('header').addEventListener('mousemove', () => {
    checkSearchItems()
})

document.querySelector('#searchbar').addEventListener('keydown', () => {
    checkSearchItems()
})

document.querySelector('#searchbar').addEventListener('change', () => {
    checkSearchItems()
})

// Dragable
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
    if (ingredients != ''){
        window.location = `/search.html?id=${ingredients}`
    }
})

// Change quantities in steps and ingredients
// Add Span to quantity
async function addSpan() {
    const steps = document.querySelectorAll('.step-describe, .ingredient-quantites .quantity-quantifier')
    for (let step of steps) {
        let newStep = ''
        for (let i = 1; i <= step.innerHTML.length; i++) {
            if (!isNaN(step.innerHTML.substring(i, i - 1)) && isNaN(step.innerHTML.substring(i, i + 1)) &&
                (step.innerHTML.substring(i, i + 1).toUpperCase().charCodeAt(0) <= 90 &&
                    step.innerHTML.substring(i, i + 1).toUpperCase().charCodeAt(0) >= 65) &&
                step.innerHTML.substring(i, i - 1) != ' ') {
                newStep += step.innerHTML.substring(i, i - 1) + ' '
            } else {
                if (step.innerHTML.substring(i, i + 1) == '/' && !isNaN(step.innerHTML.substring(i, i - 1)) && !isNaN(step.innerHTML.substring(i + 1, i + 2))) {
                    if (newStep.length == 0) {
                        newStep = '<sup>' + step.innerHTML.substring(i, i - 1) + '</sup>&frasl;<sub>' + step.innerHTML.substring(i + 1, i + 2) + '</sub>'
                        i += 2
                    } else {
                        newStep = newStep.substring(0, newStep.length - 1) + ' <sup>' + step.innerHTML.substring(i, i - 1) + '</sup>&frasl;<sub>' + step.innerHTML.substring(i + 1, i + 2) + '</sub>'
                        i += 2
                    }
                } else if (step.innerHTML.substring(i, i-1) == "'"){
                    newStep += step.innerHTML.substring(i, i - 1)+"'"
                }else {newStep += step.innerHTML.substring(i, i - 1)}
            }
        }
        newStep = nlp(newStep).numbers().toNumber().all().text()
        let checknumString = newStep
        nlp(checknumString).nouns().toSingular()
        let checknumArray = checknumString.split(' ')
        const res = await fetch('/findunit', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ word: checknumArray })
        })
        let newnewStep = newStep.split(' ')
        const jsons = await res.json()
        for (let json in jsons) {
            if (jsons[json] && !jsons[json - 1] && (!isNaN(newnewStep[json - 1]) || newnewStep[json - 1].includes('&frasl;'))) {
                newnewStep[json - 1] = `<span class="quantity">${newnewStep[json - 1]}</span>`
            }
        }
        step.innerHTML = newnewStep.join(' ');
    }
}

//Calculate ingredients quantity base on servings

// define decimal to Fraction function
function gcd(a, b) {
    return (b) ? gcd(b, a % b) : a;
}
const decimalToFraction = function (decimalNum) {
    if (decimalNum == parseInt(decimalNum)) {
        return {
            top: parseInt(decimalNum),
            bottom: 1,
            display: parseInt(decimalNum) + '/' + 1
        };
    }
    else {
        let top = decimalNum.toString().includes(".") ? decimalNum.toString().replace(/\d+[.]/, '') : 0;
        let bottom = Math.pow(10, top.toString().replace('-', '').length);
        if (decimalNum >= 1) {
            top = +top + (Math.floor(decimalNum) * bottom);
        }
        else if (decimalNum <= -1) {
            top = +top + (Math.ceil(decimalNum) * bottom);
        }

        let x = Math.abs(gcd(top, bottom));
        return {
            top: (top / x),
            bottom: (bottom / x),
            display: (top / x) + '/' + (bottom / x)
        };
    }
};

// Change quantity
const servings = document.querySelector('#servings')
let initialServings = servings.value
servings.addEventListener('change', () => {
    const updateServings = servings.value
    const servingsChange = updateServings / initialServings

    const quantitiesIngreList = document.querySelectorAll('.quantity')
    for (let quantity of quantitiesIngreList) {
        // For fraction
        if (quantity.innerText.split('⁄').length > 1) {
            let numberArray = quantity.innerText.split('⁄')
            let newNumber = parseFloat(numberArray[0]) / parseFloat(numberArray[1])
            let newFrac = decimalToFraction(newNumber * servingsChange).display.split('/')
            quantity.innerHTML = `<sup>${newFrac[0]}</sup>&frasl;<sub>${newFrac[1]}</sub>`
        } else if (quantity.innerText.split('/').length > 1) {
            let numberArray = quantity.innerText.split('/')
            let newNumber = parseFloat(numberArray[0]) / parseFloat(numberArray[1])
            quantity.textContent = decimalToFraction(newNumber * servingsChange).display
            // For normal number
        } else {
            quantity.textContent *= servingsChange
        }
    }
    initialServings = updateServings;
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