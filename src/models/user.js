const mongooes = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')
const multer = require('multer')

const userSchema = new mongooes.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('please enter valid email address')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be positive number')
            }
        },
        required: true
    },
    password: {
        type: String,
        minLength: 7,
        required: true,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Please not user password word in your password')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

// virtual relationship user => tasks
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})


// delete/hide fields
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}


// jwt user authentication token
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = await jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

// login 
userSchema.statics.findByCredentials = async (res, email, password) => {
    try {
        const user = await User.findOne({ email })
        // console.log(user);
        if (!user)
            throw "Email id not exist!"
        const isMatch = await bcrypt.compare(password, user.password)
        // console.log(isMatch);
        if (!isMatch)
            throw "Credential Wrong! please try again.."
        return user
    } catch (error) {
        res.status(400).send(error);
    }

}


//  password bcrypt
userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})


// delete user task when user is delete
userSchema.pre('remove', async function (next) {
    const user = this
    // console.log(user);
    await Task.deleteMany({ owner: user._id })
    next()
})

const User = mongooes.model('User', userSchema)


module.exports = User