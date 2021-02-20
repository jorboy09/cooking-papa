let login = false
; (async () => {
    const res = await fetch('/loginornot')
    const json = await res.json()
    if (json.login) {
        login = true
        console.log(json.user_ingres)
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
        console.log(json.user_reci.length)
        if (json.user_ingres[0].id != null){
            do{
                let num = Math.floor(Math.random()* json.user_ingres.length)
                if (!ingres.includes(num)){
                    ingres.push(num)
                }            
            }while(ingres.length != 4 && ingres.length != json.user_ingres.length)
        }
        if (json.userinfo[0].profile_pic == null){
            document.querySelector('.sidebar>ul').innerHTML = `<li id="welcome"><i class="fas fa-user-check">Welcome Back!</i> <a href="#">${json.userinfo[0].username}</a></li>` + document.querySelector('.sidebar>ul').innerHTML
        }else{
            document.querySelector('.sidebar>ul').innerHTML = `<li id="welcome"><i class="fas fa-user-check">Welcome Back!</i> <a href="#"><img src="${json.userinfo[0].profile_pic}">${json.userinfo[0].username}</a></li>` + document.querySelector('.sidebar>ul').innerHTML}
        for (let recipe of recipes){
        document.querySelector('#favrecipe .menubox').innerHTML+=`<button type="button" class="btn btn-warning" data-recipe_id = '${json.user_reci[recipe].id}'>${json.user_reci[recipe].reci_name_eng}</button>`
        }
        document.querySelector('#favrecipe .menubox').innerHTML+= `<a href="fav_recipe.html" class='button-more'><button type="button" class="btn btn-secondary">More</button></a>`
        for (let ingre of ingres){
        document.querySelector('#mying .menubox').innerHTML+=`<button type="button" class="btn btn-warning" data-ingre_id = '${json.user_ingres[ingre].id}'>${json.user_ingres[ingre].name_eng}</button>`
        }
        document.querySelector('#mying .menubox').innerHTML+= `<a href="my_ingredient.html" class='button-more'><button type="button" class="btn btn-secondary">More</button></a>`

        document.querySelector('.sidebar>ul>li:last-child').innerHTML = `<li id="logout"><a href="#"><i class="fas fa-sign-out-alt"></i>Logout</a></li>`
    } else {
        login = false
    }
})()