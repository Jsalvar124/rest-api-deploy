const express = require('express');
const crypto = require('node:crypto');
const moviesJson = require('./mock/movies.json')
const {validateMovie, validatePartial} = require('./Schemas/movieSchema')


//node --watch restApi.js // Just like Nodemon.
//npx servor .\web\ => To run the html 


const app = express();

app.disable('x-powered-by')
//Middleware to handle json files
app.use(express.json());

const ACCEPTED_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:1234',
    'http://movies.com',
    'http://chacho.dev',
]


//GET movie by genre
app.get('/movies', (req, res) => {
    
    // CORS HEADER Cross Origin Resource Shareing
    const origin = req.header('origin')
    if(ACCEPTED_ORIGINS.includes(origin) || !origin){
        res.header('Access-Control-Allow-Origin',origin)
    }
    // res.header('Access-Control-Allow-Origin','*')
    // res.header('Access-Control-Allow-Origin','http://localhost:8080')

    const { type } = req.query
    if (type) {
        let moviesBygenre = moviesJson.Search.filter(movie => movie.Type === type)
        if (moviesBygenre) return res.json(moviesBygenre)
    }
    //GET Movies
    res.json(moviesJson.Search)
})

// app.get('/movies', (req, res) => {
//     res.json(moviesJson.Search)
// })

//GET movie by id
app.get('/movies/:id', (req, res) => {
    const { id } = req.params
    let movieById = moviesJson.Search.find(movie => movie.imdbID === id)
    if (movieById) return res.json(movieById)
})

//POST new movie
//"imdbID": "tt3581920"
app.post('/movies', (req,res)=>{

    // Sin validación
    // const {
    //     Title,
    //     Year,
    //     Type,
    //     Poster
    // } = req.body;

    const result = validateMovie(req.body)

    if(result.error){
        res.status(400).json({error: JSON.parse(result.error.message)})
    }
    const newMovie = {
        // "Title": Title,
        // "Year": Year,
        // "Type":Type,
        // "Poster":Poster,
        "imdbID": "tt3581921",
        "UUID": crypto.randomUUID(),
        ...result.data
    }

    moviesJson.Search.push(newMovie)
    if (newMovie){
        return res.status(201).json(
        {
        "message": "New movie created",
        "movie": moviesJson
        }
    )}
})

// PATCH Y DELETE REQUIEREN CORS PRE-FLIGHT y OPTIONS, ALLOW METHODS
app.delete('/movies/:id',(req,res)=>{
    // CORS HEADER Cross Origin Resource Shareing
    const origin = req.header('origin')
    if(ACCEPTED_ORIGINS.includes(origin) || !origin){
        res.header('Access-Control-Allow-Origin',origin)
    }

    const { id } = req.params;

    const movieIndex = moviesJson.Search.findIndex(movie => movie.imdbID === id)


    if(movieIndex === -1){
        return res.status(404).json({message: 'Movie not found'})
    }

    //Se borra del json.
    moviesJson.Search.splice(movieIndex,1)

    return res.json({message: 'Movie deleted'})
})

app.patch('/movies/:id',(req, res)=>{
    const { id } = req.params;
    //"imdbID": "tt3886654",
    const result = validatePartial(req.body)

    if(result.error){
        res.status(400).json({error: JSON.parse(result.error.message)})
    }

    //find movie by id
    const movieIndex = moviesJson.Search.findIndex(movie => movie.imdbID === id)

    const updatedMovie = {
        ...moviesJson.Search[movieIndex],
        ...result.data
    }

    moviesJson.Search[movieIndex] = updatedMovie;

    res.status(200).json(updatedMovie)
})


app.options('/movies/:id', (req,res)=>{
    const origin = req.header('origin')

    if(ACCEPTED_ORIGINS.includes(origin) || !origin){
        res.header('Access-Control-Allow-Origin',origin)
        res.header('Access-Control-Allow-Methods','GET, POST, PUT, PATCH, DELETE')
        // res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    }
    res.send(200)

})

//NOT FOUND Middleware
app.use((req,res)=>{
    res.status(404).json({ message: "404 Not found" })
})

const PORT = process.env.PORT ?? 3001;

app.listen(PORT, () => {
    console.log(`Escuchando en el puerto ${PORT} http://localhost:${PORT}`)
})
