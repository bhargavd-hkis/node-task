const express = require('express')
const auth = require('../middleware/auth')
const Task = require('../models/task')
const router = express.Router()

// create task
router.post('/task', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user.id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }

    // task.save().then((result) => {
    //     res.status(201).send(task)
    // }).catch((error) => {
    //     res.status(400).send(error)
    // })
})

// task list / filter / pagination / sorting
router.get('/tasks', auth, async (req, res) => {
    try {
        const match = {}
        const sort = {}
        if (req.query.completed) {
            match.completed = req.query.completed === 'true'
        }
        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':')
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        }

        // login user tasks
        // first way
        // const task = await Task.find({
        //     owner: req.user._id
        // })
        // second way
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        res.status(201).send(req.user.tasks)
    } catch (error) {
        res.status(400).send(error)
    }

    // Task.find({}).then((task) => {
    //     res.status(201).send(task)
    // }).catch((error) => {
    //     res.status(400).send(error)
    // })
})

// task find by id
router.get('/task/:id', auth, async (req, res) => {

    try {
        const _id = req.params.id
        // const task = await Task.findById(req.params.id) 
        //  only fetch task list => created by auth user
        const task = await Task.findOne({ _id, owner: req.user._id })

        if (!task) {
            return res.status(400).send('Data not found')
        }
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }

    // Task.findById(req.params.id).then((task) => {
    //     res.status(201).send(task)
    // }).catch((error) => {
    //     res.status(400).send(error)
    // })
})

//  Update task
router.patch('/task/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowUpdate = ['description', 'completed', 'onwer']
    const isValidOperation = updates.every((updates) => allowUpdate.includes(updates))

    if (!isValidOperation) {
        return res.status(500).send({ error: 'Invalid argument' })
    }
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        // const task = await Task.findById(req, params.id)

        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
        //     new: true,
        //     runValidators: true
        // })
        if (!task) {
            return res.status(500).send({ error: 'Invalid task id' })
        }
        updates.forEach((update) => task[update] = req.body[update])
        task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(500).send(error)
    }

})

//  remove task
router.delete('/task/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        // const task = await Task.findByIdAndDelete(req.params.id)
        if (!task) {
            return res.status(400).send({ error: 'Task id not found' })
        }
        res.status(200).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})



module.exports = router