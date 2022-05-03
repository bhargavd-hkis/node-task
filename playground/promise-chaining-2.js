require('../src/db/mongoose')
const Task = require('../src/models/task')


// Task.findByIdAndDelete('6260e618035cc98a8e932d65').then((task) => {
//     console.log(task);
//     return Task.countDocuments({ type: true })
// }).then((taskCount) => {
//     console.log(taskCount);
// }).catch((e) => {
//     console.log(e);
// })


const deleteTaskAndCount = async (id) => {
    const task = await Task.findByIdAndDelete(id)
    const count = await Task.countDocuments({ type: 0 })
    return count
}

deleteTaskAndCount('625ffed7a5b6ad8917e6dc1f').then((result) => {
    console.log(result);
}).catch((e) => {
    console.log(e);
})