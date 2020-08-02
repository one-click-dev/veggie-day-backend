'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const nano = require('nano')('http://admin:admin2020@localhost:5984');


// VARIABLES

const app = express();
var cors = require('cors');
let dbIngredients;
let dbRecipes;


// FUNKTIONS

const log = console.log;

// Connection to the database

const init = () => {
    dbIngredients = nano.db.use('ingredients');
    dbRecipes = nano.db.use('recipes');

}


// Read out all ingredients from DB "Ingredients"

const listOutput = (db, include_docs = true) => {
    return new Promise((resolve, reject) => {
        db.list({
            include_docs
        }).then(
            resolve
        ).catch(
            reject
        )
    })
}


// Server-Settings

var whitelist = ['//127.0.0.1', '//localhost'];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin.split(':')[1]) !== -1) {
      callback(null, true)
    } else {
        callback(null, false)
    }
  }
};

/*app.use(express.static('public', {
    extensions: ['html']
}));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "127.0.0.1"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});*/
app.use(cors(corsOptions));
app.use(bodyParser.json());


// ROUTING

app.get('/ingredients', (req, res) => {
    listOutput(dbIngredients).then(
        answer => res.send(JSON.stringify(answer)),
        err => res.send(JSON.stringify({ status: 'Error' }))
    )
});

app.get('/recipes', (req, res) => {
    dbRecipes.view(
        'recipes-view', // designname
        'card-view', // viewnname
        { 'include_docs': false }
    ).then(
        (answer) => res.send(JSON.stringify(answer)),
        (err) => res.send(JSON.stringify({ status: 'Error' }))
    )
});

// Read out one recipe from DB

app.get('/recipes/:id', (req, res) => {
    dbRecipes.get(req.params.id).then(
        (answer) => res.send(JSON.stringify(answer)),
        (err) => res.send(JSON.stringify({ status: 'Error' }))
    )
});

// View - Name

app.get('/recipes/findByNames/:recipes', (req, res) => {
    let recipesNames = req.params.recipes.split(',');
    dbRecipes.view(
        'recipes-view', // designname
        'name-view', // viewnname
        { 'keys': recipesNames }
    ).then(
        (answer) => res.send(JSON.stringify(answer)),
        (err) => res.send(JSON.stringify({ status: 'Error' }))
    )
});

// Recipes by ingredients

app.get('/recipes/findWithIngredients/:ingredients', (req, res) => {
    let selectedIngredients = req.params.ingredients.split(',');

    let orCondition = selectedIngredients.map(function (ingredientName) {
        return {
            '$elemMatch': {
                'name': ingredientName
            }
        }
    })

    return dbRecipes.find({
        selector: {
            'ingredients': {
                '$or': orCondition
            }
        },
        fields: [
            '_id',
            'name',
            'teaser',
            'photo'
        ]
    }).then(
        // To make the appearance of the results of .find() and .view() the same
        (answer) => {
            let normalizedAnswer = {}; 
            normalizedAnswer.total_rows = answer.docs.length;
            normalizedAnswer.rows = answer.docs.map(dbItem => {
                let normalizedDbItem = {
                    value: {}
                };
                for (let property in dbItem) {
                    normalizedDbItem.value[property] = dbItem[property];
                }
                normalizedDbItem.id = dbItem._id;
                normalizedDbItem.key = dbItem._id;
                return normalizedDbItem;
            })
            res.send(JSON.stringify(normalizedAnswer))},
        (err) => res.send(JSON.stringify({ status: 'Error' }))
    )
});


// INIT

init();


app.listen(6535, err => log(err || 'Runs'));