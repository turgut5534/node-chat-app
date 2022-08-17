const users = []

//addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
    // Clean the data (trim and make it lowercase)
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data (Username and room are required)
    if ( !username || !room ) {
        return {
            error: 'Username and room are required'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        //If both are true, then return true
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    //index is the position (number) of the user such as 3
    const index = users.findIndex((user) => {
        return user.id === id
    })

    //If the user is exists, then remove and return it
    if (index !== -1) {
        return users.splice(index, 1)[0] //1 is the number of items to remove
    }
}

const getUser = (id) => {
    return users.find((user) => user.id == id)
}

const getUserInRoom = (room) => {
    return users.filter((user) => user.room === room)
}

addUser({
    id: 22,
    username: 'Turgut',
    room: 'Mersin'
})

console.log(users)

// const removedUser = removeUser(22)

// console.log(removedUser)
// console.log(users)

const gotUser = getUser(22)
console.log(gotUser)

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}