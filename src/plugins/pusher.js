import Pusher from 'pusher-js';

export const pusher = new Pusher('254bc9b61c7b05e4ea12', {
  cluster: 'eu',
  encrypted: true,
});

const channel = pusher.subscribe('laravelShop-development');

channel.bind('message', function (data) {
  console.log('Получено сообщение от Pusher:', data);
});

export default pusher;

