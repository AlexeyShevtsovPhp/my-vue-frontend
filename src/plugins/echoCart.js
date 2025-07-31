import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'pusher',
  key: '9bbfdf823d30017849e0',
  cluster: 'eu',
  forceTLS: true,
});

export function listenCartUpdates(userId, callback) {
  echo.channel(`cart.${userId}`)
      .listen('.cart.updated', (event) => {
        callback(event);
      });
}
