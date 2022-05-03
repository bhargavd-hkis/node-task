require('../src/db/mongoose')
const { ObjectId } = require('mongodb');
const User = require('../src/models/user')


// User.findByIdAndUpdate('6260095d90aa9db168fe6825', {
//     age: 20
// }).then((user) => {
//     console.log(user);
//     return User.countDocuments({ age: 5 })
// }).then((userCount) => {
//     console.log(userCount);
// }).catch((e) => {
//     console.log(e);
// })



//  use Async 
const updateAgeAndCount = async (id, age) => {
    const user = await User.findOneAndUpdate(id, { age: 30 })
    const count = await User.countDocuments({ age: 30 })
    return count
}

updateAgeAndCount('625ff8f9a1de8d12074f6956', 5).then((result) => {
    console.log(result);
}).catch((e) => {
    console.log(e);
})