import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'pusher',
  key: '9bbfdf823d30017849e0',
  cluster: 'eu',
  forceTLS: true,
});

export function listenChatUpdates(userId, callback) {
  echo.channel(`chat.${userId}`)
      .listen('.chat.updated', (event) => {
        callback(event);
      });
}
