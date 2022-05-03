const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const path = require('path')

const app = new express()
const port = process.env.PORT

// app.use((req, res, next) => {
//     if (req.method === "GET") {
//         res.send('Get request are disable')
//     } else {
//         next()
//     }
//     // console.log(req.method, req.path);
//     // next()
// })


// set public path
// app.use("/public", express.static(path.join(__dirname, "/public")));

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port);
})


// const Task = require('./models/task')
// const User = require('./models/user')

// const main = async function () {

//     // const task = await Task.findById('62692dabf9a368158c377218')
//     // await task.populate('owner')
//     // console.log(task.owner);

//     const user = await User.findById('62692d69f11cd4f69ff1499f')
//     await user.populate('tasks')
//     console.log(user.tasks)

// }
// main()

// const jwt = require('jsonwebtoken')

// const testFunction = async () => {
//     const token = await jwt.sign({ _id: 'test' }, 'thisismynewcourse', { expiresIn: '7 days' })
//     const data = await jwt.verify(token, 'thisismynewcourse')
//     console.log(data)
// }

// testFunction()


// const multer = require('multer')
// var upload = multer({
//     dest: 'avatars',
//     limits: {
//         fileSize: 1000000
//     },
//     fileFilter(req, file, cb) { // cb: callback

//         if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
//             return cb(new Error('Upload proper image'))
//         }
//         cb(undefined, true)

//         // cb(new Error('File must be PDF'))
//         // cb(undefined, true)
//         // cb(undefined, false)
//     }
// })
// const errorMiddleware = (req, res, next) => {
//     throw new Error('From my middleware')
// }
// app.post('/upload', upload.single('upload'), (req, res) => {
//     res.send('uploaded')
// }, (error, req, res, next) => {
//     res.status(400).send({ error: error.message })
// })