const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage } = require('./utils/messages')
const { generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUserInRoom } = require('./utils/users')

//Start express
const app= express()

//Assign port to a variable
const port = process.env.PORT || 3000

//Create a new server by express
const server = http.createServer(app)

//Set up a socketio used by server
const io = socketio(server)

//Assing the public directory
const publicDirectory = path.join(__dirname, '../public')

//Use public directory
app.use(express.static(publicDirectory))

let count = 0
//Socketio will listen if there's a connection to the socketio from client
//Socket parameter down below contains information about the connection. It's an object
io.on('connection', (socket) => {
    // console.log('New Websocket Connection')

    //Emitting an event from server to client FOR A SINGLE CONNECTION
    socket.emit('countUpdated', count)

    socket.on('join', ({username, room}, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }

        socket.join(room)
        socket.emit('getMessage', generateMessage('Admin', 'Welcome!'))
        
        //Emitting an event from server to client FOR EVERYONE EXCEPT WHO JUST JOINED
        socket.broadcast.to(user.room).emit('getMessage', generateMessage(user.username+ ' has joined'));

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })

        callback()
    })

    
    

    //Receive the event from client to server
    socket.on('increase', () => {
        count++
        //socket.emit('countUpdated', count) //This will notify only one connection
        io.emit('countUpdated', count)  //This will notify all connections/users ALL CONNECTIONS
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(message)) {
            return callback('Bad words are not allowed!')
        }
        io.to(user.room).emit('getMessage', generateMessage(user.username, message))
        callback()
 
    })
    
    socket.on('sendLocation', (coords) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('getLocation', generateLocationMessage(user.username, 'https://google.com/maps?q='+coords.latitude+','+coords.longitude))
    })

    //No need to fire this event. This will work automaticallt when a connection is disconnected
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('getMessage', generateMessage('Admin',user.username+ ' has left'))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }

      
    })
})

//Server will listen to the port 3000
server.listen(port, () => {
    console.log('Server is running on port '+ port)
})