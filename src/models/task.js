const mongooes = require('mongoose')
const validator = require('validator')

const taskSchema = new mongooes.Schema({
    description: {
        type: String,
        trim: true,
        required: true
    },
    completed: {
        type: Boolean,
        default: 0
    },
    owner: {
        type: mongooes.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

// taskSchema.pre('save', async function (next) {
//     const task = this
//     next()
// })


const Task = mongooes.model('Task', taskSchema)

module.exports = Task