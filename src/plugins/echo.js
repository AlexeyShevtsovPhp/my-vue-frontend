import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

export const echo = new Echo({
  broadcaster: 'pusher',
  key: '9bbfdf823d30017849e0',
  cluster: 'eu',
  forceTLS: true
});

export default echo;
