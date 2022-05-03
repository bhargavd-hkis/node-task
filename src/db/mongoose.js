const mongooes = require('mongoose')
// const validator = require('validator')
mongooes.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
}, (error, client) => {
    if (error) {
        console.log(error);
    }
})


