const z = require('zod');
   
   //zod schema
    const movieSchema = z.object({
        Title: z.string("Debe ser un string"),
        Year: z.number().int().min(1900).max(2024),
        Poster: z.string().url().endsWith('.jpg'),
        Type: z.enum(["series", "movie"])
    })

    function validateMovie (object){
        return movieSchema.safeParse(object)
    }

    function validatePartial (object){
        return movieSchema.partial().safeParse(object)
    }

module.exports = {
    validateMovie,
    validatePartial
} 