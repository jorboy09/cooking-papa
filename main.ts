import express from 'express'
import path from 'path'
import expressSession from 'express-session'
import bodyParser from 'body-parser'
import multer from 'multer'
import { Client } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import fetch from 'node-fetch'
import grant from 'grant-express';

dotenv.config();
const client = new Client({
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD
})
client.connect()

const app = express()

app.use(expressSession({
  secret: 'This is the WSP project from tecky academy',
  saveUninitialized: true
}));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${__dirname}/uploads`);
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}.${file.mimetype.split('/')[1]}`);
  }
})

let upload = multer({ //multer settings
  storage: storage,
  fileFilter: function (req, file, callback) {
    let ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      return callback(new Error('Only images are allowed'))
    }
    callback(null, true)
  },
})

app.use(express.static('./public'))

app.use('/uploads', express.static('./uploads/'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//@ts-ignore
app.use(grant({
  "defaults": {
    "origin": "http://localhost:8080",
    "transport": "session",
    "state": true,
  },
  "google": {
    "key": process.env.GOOGLE_CLIENT_ID || "",
    "secret": process.env.GOOGLE_CLIENT_SECRET || "",
    "scope": ["profile", "email"],
    "callback": "/login/google"
  },
}));

// Middle-ware Check login status
const isLoggedIn = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.session['userid'] == null || req.session['userid'] === undefined) {
    res.json({ loggedIn: false })
    return;
  } else {
    next()
  }
}

//Register
app.post('/register', async (req, res) => {
  let users = await client.query('SELECT * FROM users where username = $1 LIMIT 1;', [
    req.body.username
  ])
  let usernames = users.rows;
  if (usernames.length < 1) {
    const users = await client.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id', [
      req.body.username,
      await bcrypt.hash(req.body.password, 10)
    ])
    req.session['userid'] = users.rows[0].id
    res.json({ result: true })
  } else {
    res.json({ result: false })
  }
})

//Google
app.get('/login/google', async (req, res) => {
  const accessToken = req.session?.['grant'].response.access_token;
  const fetchRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });
  const json = await fetchRes.json();
  const users = (await client.query('SELECT * FROM users WHERE username = $1', [json.email])).rows;
  if (users.length > 0 && req.session != null) {
    req.session['userid'] = users[0].id
    res.redirect('/')
  } else {
    const newUsers = await client.query('INSERT INTO users (username) VALUES ($1) RETURNING id', [
      json.email
    ])
    req.session["userid"] = newUsers.rows[0].id
    res.redirect('/preferences.html')
  }
})

//Login and Redirect
app.post('/login', async (req, res) => {
  let usersLogin = await client.query('SELECT * FROM users where username = $1;', [
    req.body.username
  ])
  let users = usersLogin.rows;

  if (users.length == 0 || req.session == null) {
    res.json({ result: false })
  } else {
    if (await bcrypt.compare(req.body.password, users[0].password)) {
      req.session['userid'] = users[0].id
      res.json({ result: true })
    } else {
      res.json({ result: false })
    }
  }
})

app.post('/logout', (req, res) => {
  req.session?.destroy(() => {
    res.json()
  });
})

app.get('/loginornot', async (req, res) => {
  if (req.session['userid'] != null) {
    const userinfo = await client.query(`select username, profile_pic from users where id = $1;`, [req.session['userid']])
    const user_fav_ingres = await client.query(`select ingredients.name_eng, ingredients.id, ingredients.image from users full outer join users_fav_ingres on users_fav_ingres.users_id = users.id full outer join ingredients on ingredients.id =
  users_fav_ingres.ingres_id where users.id = $1;`, [req.session['userid']])
    const users_fav_recipes = await client.query(`select recipes.recipe_name_eng, recipes.id from users full outer join users_fav_recipes on users.id = users_fav_recipes.users_id 
    full outer join recipes on recipes.id = users_fav_recipes.recipes_id where users.id = $1`, [req.session['userid']])
    res.json({ userinfo: userinfo.rows, user_ingres: user_fav_ingres.rows, user_reci: users_fav_recipes.rows, login: true })
  } else {
    res.json({ login: false })
  }
})

//search ingredients when input
app.post('/searchinput', async (req, res) => {
  const limit = 8;
  const results = await client.query(`select id, name_eng from ingredients where lower(name_eng) like $1 union all 
  select id, name_eng from ingredients where lower(name_eng) like $2 and 
  id not in (select id from ingredients where lower(name_eng) like $1) limit $3;`, [
    `${req.body.searchtext.toLowerCase()}%`,
    `%${req.body.searchtext.toLowerCase()}%`,
    limit
  ])
  res.json(results.rows)
})

//find ingredients with ingredients id
app.post('/findingre', async (req, res) => {
  const ids = req.body.ingre_id.map((id: string) => parseInt(id))
  let query = `select id, name_eng, image from ingredients where id in (`
  for (let id in ids){
    query = query + '$'+(parseInt(id)+1) +','
  }
  query = query.substring(0, query.length-1) + ') order by (case id '
  for (let id in ids) {
    query = query + `when ${ids[id]} then '${parseInt(id) + 1}' `
  }
  query = query + 'end);'
  const name = await client.query(query, ids)
  res.json(name.rows)
})

//search recipe and send data back to roughly show
app.post('/searchrecipe', async (req, res) => {
  const ids = req.body.ingre_id.map((id: string) => parseInt(id))
  let query = `select recipes.id, recipes.recipe_name_eng from recipes join steps on recipes.id = steps.recipes_id join steps_ingres on steps.id = steps_ingres.steps_id 
  join ingredients on ingredients.id = steps_ingres.ingres_id where ingredients.id in (`
  for (let id in ids){
    query = query + '$'+(parseInt(id)+1) +','
  }
  query = query.substr(0, query.length - 1) + ') group by (recipes.id) order by count(recipes.id) DESC;'
  const recipes = await client.query(query, ids)
  let details = []
  for (let recipe of recipes.rows) {
    let recipe_ingres = await client.query(`select distinct ingredients.id, ingredients.name_eng, ingredients.image from recipes join steps on recipes.id = steps.recipes_id join steps_ingres on steps.id = steps_ingres.steps_id 
    join ingredients on ingredients.id = steps_ingres.ingres_id where recipes.id = $1`, [recipe.id])
    let recipe_cover = await client.query(`select cover_pic from recipes where id = $1`, [recipe.id])
    let recipe_ingres_quan = await client.query(`select distinct ingredients.id, steps_ingres.ingres_quan from recipes join steps on recipes.id = steps.recipes_id join steps_ingres on steps.id = steps_ingres.steps_id 
    join ingredients on ingredients.id = steps_ingres.ingres_id where recipes.id = $1 and steps_ingres.ingres_quan is not null`, [recipe.id])
    details.push({
      recipe_id: recipe,
      recipe_pic: recipe_cover.rows,
      recipe_ingres: recipe_ingres.rows,
      recipe_ingres_quan: recipe_ingres_quan.rows
    })
  }
  res.json(details)
})

//get recipe details info
app.post('/recipeDetails', async (req, res) => {
  const recipes = await client.query(`select recipes.id, recipes.recipe_name_eng, users.username from recipes
   join users on users.id = recipes.creater_id where recipes.id = $1`, [req.body.recipeId])
  let details = []
  for (let recipe of recipes.rows) {
    let recipe_ingres = await client.query(`select distinct ingredients.id, ingredients.name_eng, ingredients.image, steps_ingres.ingres_quan from recipes join steps on recipes.id = steps.recipes_id join steps_ingres on steps.id = steps_ingres.steps_id 
    join ingredients on ingredients.id = steps_ingres.ingres_id where recipes.id = $1;`,[recipe.id])
    let recipe_cover = await client.query(`select cover_pic from recipes where id = $1;`,[recipe.id])
    let recipe_steps = (await client.query(`select distinct steps.id, steps.steps_description, steps.steps_order, steps.steps_img from recipes join steps on recipes.id = steps.recipes_id where recipes.id = $1 order by steps.steps_order;`, [recipe.id])).rows
    for (let recipe_step of recipe_steps) {
      recipe_step['ingredients'] = (await client.query(`select distinct ingredients.name_eng, ingredients.id, ingredients.image from steps join steps_ingres on steps_ingres.steps_id = steps.id join ingredients on ingredients.id = steps_ingres.ingres_id where steps.recipes_id = $1 AND steps.id = $2`,[recipe.id, recipe_step.id])).rows
    }
    details.push({
      recipe_id: recipe,
      recipe_pic: recipe_cover.rows,
      recipe_ingres: recipe_ingres.rows,
      recipe_step: recipe_steps,
    })
  }
  res.json(details)
})

//get users favorite recipe
app.get('/favrecipe', isLoggedIn, async (req, res) => {
  const recipes = await client.query(`select distinct recipes.id, recipes.recipe_name_eng from users_fav_recipes join recipes on users_fav_recipes.recipes_id = recipes.id join steps on recipes.id = steps.recipes_id join steps_ingres on steps.id = steps_ingres.steps_id 
  join ingredients on ingredients.id = steps_ingres.ingres_id where users_fav_recipes.users_id = $1;`,[req.session['userid']])
  let details = []
  for (let recipe of recipes.rows) {
    let recipe_ingres = await client.query(`select distinct ingredients.id, ingredients.name_eng, ingredients.image from recipes join steps on recipes.id = steps.recipes_id join steps_ingres on steps.id = steps_ingres.steps_id 
    join ingredients on ingredients.id = steps_ingres.ingres_id where recipes.id = $1;`, [recipe.id])
    let recipe_cover = await client.query(`select cover_pic from recipes where id = $1;`,[recipe.id])
    let recipe_ingres_quan = await client.query(`select distinct ingredients.id, steps_ingres.ingres_quan from recipes join steps on recipes.id = steps.recipes_id join steps_ingres on steps.id = steps_ingres.steps_id 
    join ingredients on ingredients.id = steps_ingres.ingres_id where recipes.id = $1 and steps_ingres.ingres_quan is not null`, [recipe.id])
    details.push({
      recipe_id: recipe,
      recipe_pic: recipe_cover.rows,
      recipe_ingres: recipe_ingres.rows,
      recipe_ingres_quan: recipe_ingres_quan.rows
    })
  }
  res.json(details)
})

//get users created recipe
app.get('/myrecipe', isLoggedIn, async (req, res) => {
  // Get recipe details
  const recipes = await client.query(`select recipes.id, recipes.recipe_name_eng from recipes where recipes.creater_id = $1;`,[req.session['userid']])
  let details = []
  for (let recipe of recipes.rows) {
    let recipe_ingres = await client.query(`select distinct ingredients.id, ingredients.name_eng, ingredients.image from recipes join steps on recipes.id = steps.recipes_id join steps_ingres on steps.id = steps_ingres.steps_id 
    join ingredients on ingredients.id = steps_ingres.ingres_id where recipes.id = $1;`,[recipe.id])
    let recipe_cover = await client.query(`select cover_pic from recipes where id = $1;`,[recipe.id])
    let recipe_ingres_quan = await client.query(`select distinct ingredients.id, steps_ingres.ingres_quan from recipes join steps on recipes.id = steps.recipes_id join steps_ingres on steps.id = steps_ingres.steps_id 
    join ingredients on ingredients.id = steps_ingres.ingres_id where recipes.id = $1 and steps_ingres.ingres_quan is not null`,[recipe.id])
    details.push({
      recipe_id: recipe,
      recipe_pic: recipe_cover.rows,
      recipe_ingres: recipe_ingres.rows,
      recipe_ingres_quan: recipe_ingres_quan.rows
    })
  }
  res.json({ loggedIn: true, details: details })
})

app.delete('/myrecipe', isLoggedIn, async (req, res) => {
  const recipe = (await client.query('SELECT * FROM recipes WHERE creater_id = $1 AND id = $2', [req.session['userid'], req.body.recipe])).rows
  if (recipe.length == 0) {
    // response if not the recipe owner
    res.json({ loggedIn: true, recipeOwner: false })
  } else {
    const stepsID = (await client.query('SELECT id FROM steps WHERE recipes_id = $1', [req.body.recipe])).rows
    for (const stepID of stepsID) {
      await client.query('DELETE FROM steps_ingres WHERE steps_id = $1', [stepID.id])
    }
    await client.query('DELETE FROM steps WHERE recipes_id = $1', [req.body.recipe])
    await client.query('DELETE FROM users_fav_recipes WHERE recipes_id = $1', [req.body.recipe])
    await client.query('DELETE FROM recipes WHERE id = $1', [req.body.recipe])
    res.json({ loggedIn: true, recipeOwner: true })
  }

})

// change user password
app.put('/change_password', isLoggedIn, async (req, res) => {
  // check who logged in
  const users = (await client.query('SELECT username, password FROM users where id = $1', [req.session['userid']])).rows

  // check if old password correct
  if (!(await bcrypt.compare(req.body.oldPassword, users[0].password))) {
    res.json({ loggedIn: true, passwordCorrect: false })
  } else {

    // check if old and new password are same
    if (await bcrypt.compare(req.body.newPassword, users[0].password)) {
      res.json({ loggedIn: true, passwordCorrect: true, newOldNotSame: false })
    } else {

      // change password
      await client.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [await bcrypt.hash(req.body.newPassword, 10), req.session['userid']])
      res.json({ loggedIn: true, passwordCorrect: true, newOldNotSame: true })
    }
  }
})

// get ingredient info
app.post('/ingredient_info', async (req, res) => {
  const ingredientInfo = (await client.query('SELECT name_eng, details, image FROM ingredients where RTRIM(LOWER(name_eng)) = RTRIM(LOWER($1))', [req.body.ingredient])).rows
  if (ingredientInfo.length == 0) {
    res.json({ result: false })
  } else {
    res.json({ result: true, name_eng: ingredientInfo[0]["name_eng"], details: ingredientInfo[0].details, image: ingredientInfo[0].image })
  }
})

// get ingredient bookmark status
app.post('/ingredient_bookmark', isLoggedIn, async (req, res) => { 
  const user = (await client.query('SELECT id FROM users where id = $1', [req.session['userid']])).rows
  const ingredientInfo = (await client.query('SELECT id FROM ingredients where RTRIM(LOWER(name_eng)) = RTRIM(LOWER($1))', [req.body.ingredient])).rows
  if (ingredientInfo.length > 0) {
    const bookmarkStatus = (await client.query('SELECT id FROM users_fav_ingres WHERE users_id = $1 AND ingres_id = $2', [user[0].id, ingredientInfo[0].id])).rows
    if (bookmarkStatus.length > 0) {
      res.json({ bookmarked: true })
    } else {
      res.json({ bookmarked: false })
    }
  } else {
    res.json({ bookmarked: false })
  }
})

// ingredient bookmark / remove bookmark
app.put('/ingredient_bookmark', isLoggedIn, async (req, res) => {
  const ingredientInfo = (await client.query('SELECT id FROM ingredients where RTRIM(LOWER(name_eng)) = RTRIM(LOWER($1))', [req.body.ingredient])).rows
  const user = (await client.query('SELECT id FROM users where id = $1', [req.session['userid']])).rows
  if (ingredientInfo.length == 0) {
    // no such ingredients
    res.json({ loggedIn: true, ingredientExist: false })
  } else {
    const usersLiked = (await client.query('SELECT id FROM users_fav_ingres WHERE users_id = $1 AND ingres_id = $2', [user[0].id, ingredientInfo[0].id])).rows
    if (usersLiked.length > 0) {
      // Bookmarked before
      await client.query('DELETE FROM users_fav_ingres WHERE users_id = $1 AND ingres_id = $2', [user[0].id, ingredientInfo[0].id])
      res.json({ loggedIn: true, ingredientExist: true, bookmarked: true })
    } else {
      // No bookmark before
      await client.query('INSERT INTO users_fav_ingres (users_id, ingres_id, created_at) VALUES ($1, $2, NOW())', [user[0].id, ingredientInfo[0].id])
      res.json({ loggedIn: true, ingredientExist: true, bookmarked: false })
    }
  }
})

// get recipe bookmark status
app.post('/recipe_bookmark', isLoggedIn, async (req, res) => {
  const user = (await client.query('SELECT id FROM users where id = $1', [req.session['userid']])).rows
  const recipeInfo = (await client.query('SELECT id FROM recipes where RTRIM(LOWER(recipe_name_eng)) = RTRIM(LOWER($1))', [req.body.recipe])).rows
  if (recipeInfo.length > 0) {
    const bookmarkStatus = (await client.query('SELECT id FROM users_fav_recipes WHERE users_id = $1 AND recipes_id = $2', [user[0].id, recipeInfo[0].id])).rows
    if (bookmarkStatus.length > 0) {
      res.json({ bookmarked: true })
    } else {
      res.json({ bookmarked: false })
    }
  } else {
    res.json({ bookmarked: false })
  }
})

app.delete('/recipe_bookmark', isLoggedIn, async (req, res) => {
  const recipeInfo = (await client.query('SELECT id FROM recipes where id = $1', [req.body.recipe])).rows
  if (recipeInfo.length == 0) {
    // no such recipe
    res.json({ loggedIn: true, recipeExist: false })
  } else {
    await client.query('DELETE FROM users_fav_recipes WHERE users_id = $1 AND recipes_id = $2', [req.session['userid'], recipeInfo[0].id])
    res.json({ loggedIn: true, recipeExist: true })
  }
})

// recipe bookmark / remove bookmark
app.put('/recipe_bookmark', isLoggedIn, async (req, res) => {
  const recipeInfo = (await client.query('SELECT id FROM recipes where RTRIM(LOWER(recipe_name_eng)) = RTRIM(LOWER($1))', [req.body.recipe])).rows
  const user = (await client.query('SELECT id FROM users where id = $1', [req.session['userid']])).rows
  if (recipeInfo.length == 0) {
    // no such recipe
    res.json({ loggedIn: true, recipeExist: false })
  } else {
    const usersLiked = (await client.query('SELECT id FROM users_fav_recipes WHERE users_id = $1 AND recipes_id = $2', [user[0].id, recipeInfo[0].id])).rows
    if (usersLiked.length > 0) {
      // Bookmarked before
      await client.query('DELETE FROM users_fav_recipes WHERE users_id = $1 AND recipes_id = $2', [user[0].id, recipeInfo[0].id])
      res.json({ loggedIn: true, recipeExist: true, bookmarked: true })
    } else {
      // No bookmark before
      await client.query('INSERT INTO users_fav_recipes (users_id, recipes_id) VALUES ($1, $2)', [user[0].id, recipeInfo[0].id])
      res.json({ loggedIn: true, recipeExist: true, bookmarked: false })
    }
  }
})

//Upload Recipes
app.post('/upload_recipe', upload.array('photo'), async (req, res) => {
  await client.query('INSERT INTO recipes (recipe_name_eng, cover_pic, created_at, updated_at, creater_id) VALUES ($1, $2, NOW(), NOW(), $3);', [req.body.dishname, req.files[0].filename, req.session['userid']]);
  let steps = req.body.content;
  const stepIds = [];
  for (let i = 0; i < steps.length; i++) {
    const result = await client.query('INSERT INTO steps (steps_description, steps_order, steps_img, recipes_id) VALUES ($1, $2, $3, $4) RETURNING id;', [
      steps[i],
      i + 1,
      req.files[i + 1]?.filename,
      (await client.query('SELECT id FROM recipes where recipe_name_eng = $1 AND creater_id = $2;', [
        req.body.dishname,
        req.session['userid']])).rows[0].id])
    stepIds.push(result.rows[0].id);
  }

  let ingredientQuantities = JSON.parse(req.body.ingre_quan)
  let stepIngredients = JSON.parse(req.body.step_ingre)

  for (let key in stepIngredients) {
    for (let id of stepIngredients[key]) {
      await client.query('INSERT INTO steps_ingres (ingres_quan, ingres_id, steps_id) VALUES ($1, $2, $3);', [
        ingredientQuantities[id],
        parseInt(id),
        stepIds[key]]);
    }
  }
  res.json()
})

//Edit Recipes
app.put('/edit_recipe', isLoggedIn, upload.array('photo'), async (req, res) => {
  if (req.files.length == 0) {
    req.files[0] = { filename: req.body.file.replace(/"/g, '') }
  }
  // update recipes
  await client.query('UPDATE recipes SET recipe_name_eng = $1, updated_at = NOW() WHERE id = $2', [req.body.dishname, parseInt(req.body.recipe_id)])

  // update steps
  let steps = req.body.content;
  const stepsOriginal = (await client.query('SELECT id FROM steps WHERE recipes_id = $1', [parseInt(req.body.recipe_id)])).rows

  if (stepsOriginal.length < steps.length) {
    for (let i = 0; i < steps.length; i++) {
      const stepIds = (await client.query('SELECT id FROM steps WHERE recipes_id = $1 AND steps_order = $2', [parseInt(req.body.recipe_id), i + 1])).rows
      if (stepIds.length > 0) {
        await client.query('UPDATE steps SET steps_description = $1 WHERE recipes_id = $2 AND steps_order = $3', [
          steps[i],
          parseInt(req.body.recipe_id),
          i + 1
        ])
      } else {
        await client.query('INSERT INTO steps (steps_description, steps_order, recipes_id) VALUES ($1, $2, $3);', [
          steps[i],
          i + 1,
          parseInt(req.body.recipe_id),
        ])
      }
    }
  } else {
    // stepsOriginal.length > steps.length
    for (let i = 0; i < steps.length; i++) {
      await client.query('UPDATE steps SET steps_description = $1 WHERE recipes_id = $2 AND steps_order = $3', [
        steps[i],
        parseInt(req.body.recipe_id),
        i + 1
      ])
    }
    // Delete steps
    for (let i = steps.length; i < stepsOriginal.length; i++) {
      const stepId = (await client.query('SELECT id FROM steps WHERE recipes_id = $1 AND steps_order = $2', [parseInt(req.body.recipe_id), i + 1])).rows
      await client.query('DELETE FROM steps_ingres WHERE steps_id = $1', [stepId])
      await client.query('DELETE FROM steps WHERE steps_order = $1 AND recipes_id = $2', [
        i + 1,
        parseInt(req.body.recipe_id)
      ])
    }
  }

  // Update steps_ingres
  let ingredientQuantities = JSON.parse(req.body.ingre_quan)
  let stepIngredients = JSON.parse(req.body.step_ingre)
  // Delete old data
  const stepsIngreOriginals = (await client.query('SELECT distinct steps_ingres.steps_id FROM steps_ingres join steps on steps.id = steps_ingres.steps_id WHERE recipes_id = $1', [parseInt(req.body.recipe_id)])).rows
  if (stepsIngreOriginals.length > 0) {
    for (const stepsIngreOriginal of stepsIngreOriginals) {
      await client.query('DELETE FROM steps_ingres WHERE steps_id = $1', [stepsIngreOriginal.steps_id])
    }
  }
  // Replace with new data
  for (let key in stepIngredients) {
    for (let id of stepIngredients[key]) {
      await client.query('INSERT INTO steps_ingres (ingres_quan, ingres_id, steps_id) VALUES ($1, $2, $3);', [
        ingredientQuantities[id],
        parseInt(id),
        (await client.query('select id from steps where recipes_id = $1 and steps_order = $2;',
          [parseInt(req.body.recipe_id), parseInt(key)])).rows[0].id])
    }
  }

  // update image
  const parseObjectJSON = JSON.parse(req.body.stepImg)
  // update cover photo
  if (parseObjectJSON['cover_pic']) {
    await client.query('UPDATE recipes SET cover_pic = $1, updated_at = NOW() WHERE id = $2', [req.files[0], parseInt(req.body.recipe_id)])
  }
  // update step photo
  let fileNum = 0;
  for (const stepImg in parseObjectJSON) {
    if (parseObjectJSON[stepImg] && stepImg != 'cover_pic') {
      await client.query('UPDATE steps SET steps_img = $1 WHERE recipes_id = $2 AND steps_order = $3', [req.files[fileNum].filename, parseInt(req.body.recipe_id), parseInt(stepImg)])
      fileNum++;
    }
  }

  res.json({ result: true })
})

app.post('/findunit', async (req, res) => {
  const words = req.body.word
  let unit: Boolean[] = []
  for (let word in words) {
    if (isNaN(words[word])) {
      const inList = await client.query(`select * from quantifiers where lower(quantifiers_eng) = lower($1)`,[words[word]])
      const inTable = await client.query(`select * from ingredients where lower(name_eng) = lower($1)`,[words[word]])
      const inListtwo = await client.query(`select * from quantifiers where lower(quantifiers_eng) = lower($1)`,[`${words[word] + ' ' + words[word + 1]}`])
      const inTabletwo = await client.query(`select * from ingredients where lower(name_eng) = lower($1)`,[`${words[word] + ' ' + words[word + 1]}`])
      if (inList.rows.length != 0 || inTable.rows.length != 0 || inListtwo.rows.length != 0 || inTabletwo.rows.length != 0) {
        unit[word] = true;
      } else {
        unit[word] = false;
      }
    }
  }
  res.json(unit)
})

//send ingredients name and id with users fav_ingre info
app.get('/getfav_ingre', isLoggedIn, async (req, res) => {
  const ingres = await client.query(`select id, name_eng, image from ingredients;`)
  const fav_ingres = await client.query(`select ingres_id from users_fav_ingres where users_id = ${req.session['userid']}`)
  res.json([ingres.rows, fav_ingres.rows])
})

//edit users favourite ingredients
app.post('/editfav_ingre', async (req, res) => {
  const add_ingres = req.body.add_fav_ingres
  const remove_ingres = req.body.remove_fav_ingres
  if (add_ingres != null) {
    for (let add_ingre of add_ingres) {
      await client.query(`insert into users_fav_ingres (ingres_id, users_id, created_at) values ($1, $2, now());`, [parseInt(add_ingre), req.session['userid']])
    }
  }
  if (remove_ingres != null) {
    for (let remove_ingre of remove_ingres) {
      await client.query(`delete from users_fav_ingres where ingres_id = $1 and users_id = $2 ;`, [parseInt(remove_ingre), req.session['userid']])
    }
  }
  res.json()
})

app.get('/ingre_box', async (req, res) => {
  const items = (await client.query('select name_eng, id, image, details from ingredients')).rows
  res.json(items)
})

app.get('/recipe_box', async (req, res) => {
  const items = (await client.query('select recipe_name_eng, id, cover_pic from recipes')).rows
  res.json(items)
})

//404 Not Found
app.use((req, res, next) => {
  res.sendFile(path.resolve('./public/404.html'))
})

app.listen(8080, () => {
  console.log('Listening')
})



