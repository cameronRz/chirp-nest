// call io function to run in client
const socket = io();

// DOM elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
});

socket.on('locationMessage', (data) => {
    const html = Mustache.render(locationTemplate, {
        url: data.url,
        createdAt: moment(data.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
});

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled');
    const message = $messageFormInput.value;

    socket.emit('sendMessage', message, () => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        console.log('Message delivered.');
    });
});

document.querySelector('#send-location').addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    }

    $sendLocationButton.setAttribute('disabled', 'disabled');
    $sendLocationButton.textContent = 'Sending...';

    navigator.geolocation.getCurrentPosition((position) => {
        let coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };
        socket.emit('sendLocation', coords, () => {
            $sendLocationButton.removeAttribute('disabled');
            $sendLocationButton.textContent = 'Send Location';
            console.log('Location shared!');
        });
    });
});

socket.emit('join', { username, room });