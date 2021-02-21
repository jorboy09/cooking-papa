import pg from 'pg';
import dotenv from 'dotenv';
import xlsx from 'xlsx';

dotenv.config();
const client = new pg.Client({
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
})
client.connect()
async function main() {
    const workbook = await xlsx.readFile('WSP Project - Recipe.xlsx')
    for (let ingredients of (xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as any)){
        await client.query('insert into ingredients (name_eng, details, image, created_at, updated_at) values ($1, $2, $3, now(), now());',[ingredients.name_eng, ingredients.details, ingredients.image])
    }
    for (let users of (xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[1]]) as any)){
        await client.query('insert into users (username, password, profile_pic, email, created_at, updated_at) values ($1, $2, $3, $4, now(), now());', [users.username, users.password, users.profile_pic, users.email])
    }
    for (let recipes of (xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[2]])as any)){
        await client.query('insert into recipes (recipe_name_eng, cover_pic, created_at, updated_at, creater_id) values ($1, $2, now(), now(), $3);', [recipes.recipe_name_eng, recipes.cover_pic, recipes.creater_id])
    }
    for (let users_recipes of (xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[3]])as any)){
        await client.query('insert into users_fav_recipes (users_id, recipes_id) values ($1, $2);',[users_recipes.users_id, users_recipes.recipes_id])
    }
    for (let steps of (xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[4]])as any)){
        await client.query('insert into steps (steps_description, steps_order, recipes_id, steps_img) values ($1, $2, $3, $4);',[steps.steps_description, steps.steps_order, steps.recipes_id, steps.steps_img])
    }
    for (let steps_ingredients of (xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[5]])as any)){
        await client.query('insert into steps_ingres (ingres_quan, ingres_id, steps_id) values ($1, $2, $3);',[steps_ingredients.ingres_quan, steps_ingredients.ingres_id, steps_ingredients.steps_id])
    }
    for (let users_fav_ingredients of (xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[6]])as any)){
        await client.query('insert into users_fav_ingres (users_id, ingres_id, created_at) values ($1, $2, now());',[users_fav_ingredients.users_id, users_fav_ingredients.ingres_id])
    }
    for (let quantifiers of (xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[7]])as any)){
        await client.query('insert into quantifiers (quantifiers_eng) values ($1);',[quantifiers.quantifiers_eng])
    }
    //truncate all table
    // await client.query('truncate table ingredients;')
    // await client.query('truncate table users;')
    // await client.query('truncate table recipes;')
    // await client.query('truncate table users;')
    // await client.query('truncate table quantifiers;')

    await client.end()
}

main();
