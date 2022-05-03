const express = require('express')
const { update } = require('../models/user')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')


//  user sign in 
router.post('/user/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(res, req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

// create / signup user
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }

    // user.save().then((result) => {
    //     res.status(201).send(user)
    // }).catch((error) => {
    //     res.status(400).send(error)
    // })
})

// logout user 
router.post('/user/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send('Logout successful')
    } catch (error) {
        res.status(500).send()
    }
})

// logout all user
router.post('/user/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = []
        req.user.save()
        res.send('Logout all sessions')
    } catch (error) {
        res.status(500).send()
    }
})

//  user me
router.get('/user/me', auth, async (req, res) => {
    try {
        res.status(201).send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

// user list
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({})
        res.status(200).send(users)
    } catch (error) {
        res.status(500).send(error)
    }
    // User.find({}).then((users) => {
    //     res.status(200).send(users)
    // }).catch((e) => {
    //     res.status(500).send(e)
    // })
})

// user fetch with id
router.get('/user/:id', auth, async (req, res) => {
    try {
        const users = await User.findById(req.params.id)
        if (!users) {
            return res.status(400).send('Data not found')
        }
        res.status(200).send(users)
    } catch (error) {
        res.status(500).send(error)
    }
    // User.findById(
    //     req.params.id
    // ).then((user) => {
    //     res.status(200).send(user)
    // }).catch((e) => {
    //     res.status(500).send(e)
    // })
})

// Update user
router.patch('/user/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowUpdates = ['name', 'email', 'age', 'password']
    const isValidOperation = updates.every((updates) => allowUpdates.includes(updates))
    // console.log(isValidOperation);
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates' })
    }
    try {
        const user = await User.findById(req.params.id)
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        //     new: true,
        //     runValidators: true
        // })
        if (!user) {
            return res.status(400).send()
        }
        res.send(user)
    } catch (error) {
        res.status(500).send(error)
    }
})

// Update ME
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowUpdates = ['name', 'email', 'age', 'password']
    const isValidOperation = updates.every((updates) => allowUpdates.includes(updates))
    // console.log(isValidOperation);
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates' })
    }
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})



// user delete
router.delete('/user/:id', auth, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        if (!user) {
            return res.status(400).send({ error: "User id not found" })
        }
        sendCancelationEmail(user.email, user.name)
        res.status(201).send(user)
    } catch (error) {
        res.status(500).send(error)
    }
})

// Delete ME
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCancelationEmail(user.email, user.name)
        res.status(201).send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})


// var storage = multer.diskStorage({
//     destination: (req, file, callBack) => {
//         callBack(null, path.join(__dirname, "../public/images"))     // './public/images/' directory name where save the file
//     },
//     filename: (req, file, callBack) => {
//         callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
//     }
// })



var upload = multer({
    // storage: storage,
    // dest: 'avatars',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) { // cb: callback
        // console.log(file.mimetype);
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Upload proper image'))
        }
        cb(undefined, true)
    }
})
//  upload avatar
router.post('/user/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {

        const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
        req.user.avatar = buffer

        await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

// delete avatar
router.delete('/user/me/avatar', auth, async (req, res) => {
    try {
        // fs.unlink("./src/public/images/" + req.user.avatar, (err) => {
        //     if (err) {
        //         res.status(400).send("failed to delete :" + err);
        //     }
        // });
        req.user.avatar = undefined
        await req.user.save()
        res.send("Delete Successfully")

    } catch (error) {
        res.status(400).send(error)
    }
})

// fetch avatar by user id
router.get('/user/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            res.status(400).send(new Error('User not exist'))
        }

        res.set('content-type', 'image/png')
        res.send(user.avatar)

    } catch (error) {
        res.status(400).send(error)
    }
})
module.exports = router