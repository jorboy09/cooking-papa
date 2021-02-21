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
        let nodeCopy = document.querySelector(`[data-ingre_id='${ingre_id}']`).cloneNode(true);
        document.querySelector('.inSearch').appendChild(nodeCopy);
    }
    if (oneclass == "ingredient" && event.currentTarget.getAttribute('data-ingre_id') != ingre_id &&
        (event.target.className.split(' ')[0] == 'step_ingre' ||
            event.target.className.split(' ')[0] == 'ingredient')) {
        let nodeCopy = document.querySelector(`[data-ingre_id='${ingre_id}'`).cloneNode(true);
        event.currentTarget.appendChild(nodeCopy);
    }

    let crosses = document.querySelectorAll('.inSearch .ingredient .fa-times-circle')
    for (let cross of crosses) {
        cross.addEventListener('click', (event) => {
            event.currentTarget.parentNode.parentNode.remove()
        })
    }
    let crossess = document.querySelectorAll('.step_ingre .ingredient .fa-times-circle')
    for (let cross of crossess) {
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
                        `<div class="ingredientBox"><div class="ingredient" data-ingre_id='${json.id}' draggable="true" ondragstart="dragstart_handler(event);" ondragend="dragend_handler(event);">
                    <img src="${json.image}">
                    <i class="far fa-times-circle"></i>${json.name_eng}</div><input type="input" name="quantity" placeholder="quantity"></div>`
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

//Image Upload Preview
function previewFile() {
    const previews = document.querySelectorAll('input + img');

    const files = document.querySelectorAll('input[type=file]');
    for (let i = 0; i < files.length; i++) {
        let validateFiles = Validate(files[i])
      
        if (validateFiles) {
            file = files[i].files[0]
            const reader = new FileReader();

            reader.addEventListener("load", function () {
                // convert image file to base64 string
                previews[i].src = reader.result;
            }, false);

            if (file) {
                reader.readAsDataURL(file);

            }

        }
    }
}


//Check files are images or not
let _validFileExtensions = [".jpg", ".jpeg", ".bmp", ".gif", ".png"];
function Validate(oForm) {

    let oInput = oForm;
    if (oInput.type == "file") {
        let sFileName = oInput.value;
        if (sFileName.length > 0) {
            let blnValid = false;
            for (let j = 0; j < _validFileExtensions.length; j++) {
                let sCurExtension = _validFileExtensions[j];
                if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
                    blnValid = true;
                    break;
                }
            }

            if (!blnValid) {
                alert("Sorry! Please upload validate image files.");
                return false;
            }
        }
    }

    return true;
}



//Upload images
document.querySelector('#uploadform').addEventListener('submit', async event => {
    event.preventDefault()

    const body = new FormData(document.querySelector('#uploadform'))

    const ingredients = document.querySelectorAll('.inSearch .ingredient')
    let iMap = {}

    for (let ingredient of ingredients) {
        iMap[ingredient.dataset.ingre_id] = ingredient.parentElement.querySelector('input').value
    }

    const stepsTextarea = document.querySelectorAll('textarea')
    let steps = []

    for (let step of stepsTextarea) {
        steps.push(step.value)
    }

    const step_ingres = document.querySelectorAll('.step_ingre')
    let everystep = new Map()

    for (let step_ingre in step_ingres) {
        let ingreArray = []
        const ingres = step_ingres[step_ingre].children
        if(ingres){
            for (let ingre of ingres) {
                ingreArray.push(ingre.dataset.ingre_id)
            }
            everystep[`${parseInt(step_ingre) + 1}`] = ingreArray
        }
    }


    body.append("step", JSON.stringify(steps))
    body.append("ingre_quan", JSON.stringify(iMap))
    body.append("step_ingre", JSON.stringify(everystep))

    let res = await fetch('/upload_recipe', {
        method: 'POST',
        body: body
    })
    await res.json()
    //Upload Success
    const uploadConfirm = confirm('Really upload?')
    if (uploadConfirm) {
        window.location = `/my_recipe.html`
    }
})




//Add one step
let steps = [];
let stepTemplate;
function initializeTemplate() {
    let steps = document.querySelector('.steps');
    stepTemplate = steps.childNodes[1].cloneNode(true);
}

initializeTemplate();

const pluslogo = document.getElementById('pluslogo')
pluslogo.addEventListener('click', async () => {
    let steps = document.querySelector('.steps');
    let node = stepTemplate.cloneNode(true);

    node.querySelector('textarea').value = ''
    node.querySelector('input[name=photo]').value = ''
    node.querySelector('.step_ingre').innerHTML = 'Drag ingredients used in this step.'
    steps.appendChild(node);
    //Sorting
    function enableDragSort(listClass) {
        const sortableLists = document.getElementsByClassName(listClass);
        Array.prototype.map.call(sortableLists, (list) => { enableDragList(list) });
    }

    function enableDragList(list) {
        Array.prototype.map.call(list.children, (item) => { enableDragItem(item) });
    }

    function enableDragItem(item) {
        item.setAttribute('draggable', true)
        item.ondrag = handleDrag;
        item.ondragend = handleDrop;
    }

    function handleDrag(item) {
        const selectedItem = item.target,
            list = selectedItem.parentNode,
            x = event.clientX,
            y = event.clientY;

        selectedItem.classList.add('drag-sort-active');
        let swapItem = document.elementFromPoint(x, y) === null ? selectedItem : document.elementFromPoint(x, y);

        if (list === swapItem.parentNode) {
            swapItem = swapItem !== selectedItem.nextSibling ? swapItem : swapItem.nextSibling;
            list.insertBefore(selectedItem, swapItem);
        }
    }

    function handleDrop(item) {
        item.target.classList.remove('drag-sort-active');
    }

    (() => { enableDragSort('drag-sort-enable') })();
})

//Delete Button
document.querySelector('.steps').addEventListener('click', async (event) => {
    if (event.target.matches('.recipe-remove-button > i')) {
        event.target.parentNode.parentNode.remove();
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
            if (json.user_reci[0].id != null) {
                do {
                    let num = Math.floor(Math.random() * json.user_reci.length)
                    if (!recipes.includes(num)) {
                        recipes.push(num)
                    }
                } while (ingres.length != 4 && recipes.length != json.user_reci.length)
            }
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
                window.location = '/'
            })
        } else {
            login = false
        }
    })()


