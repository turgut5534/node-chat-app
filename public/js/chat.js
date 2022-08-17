const socket = io()

//Receiving event from the server (The event name must match)
// socket.on('countUpdated', (count) => {
//     console.log('Count has been updated', count)
// })

const messageForm = document.querySelector('#message-form')
const messageFormInput = messageForm.querySelector('input')
const messageFormButton = messageForm.querySelector('button')
const sendLocationButton = document.querySelector('#send-location')
const messages = document.querySelector('#messages')
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessage = document.querySelector('#location-message-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix : true } )


const autoscroll = () => {
    // New message element
    const newMessage = messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = messages.offsetHeight

    // Height of messages container
    const containerHeight = messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }
}

socket.on('getMessage', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
    // var el = document.createElement('div');
    // el.setAttribute('class', 'msg');
    // el.innerHTML = message;
    // message1.appendChild(el);
})

socket.on('getLocation', (url) => {
    console.log(url)
    const html = Mustache.render(locationMessage, {
        username: url.username,
        url: url.url,
        createdAt:  moment(locationMessage.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


// document.querySelector('#increment').addEventListener('click', () => {
//     //Send an event from client to server
//     socket.emit('increase')
// })


document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault()

    messageFormButton.setAttribute('disabled', 'disabled')

    const message= document.querySelector('#theText').value
    socket.emit('sendMessage', message, (callbackMessage) => {
        messageFormButton.removeAttribute('disabled')
        messageFormInput.value = ''
        messageFormInput.focus()
        console.log(callbackMessage)
    })
})

sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Your browser does not support Geolocation')
    }

    sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            sendLocationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})