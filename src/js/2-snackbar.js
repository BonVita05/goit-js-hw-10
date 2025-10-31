//бібліотека для повідомлення
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

iziToast.settings({
  close: false,
});

const form = document.querySelector('.form');
const delayInput = document.querySelector('[name="delay"]');
const fullFilledRadio = form.querySelector('[value="fulfilled"]');
const rejectedRadio = form.querySelector('[value="rejected"]');

let delay = 0;

form.addEventListener('submit', onsubmit);

function onsubmit(event) {
  event.preventDefault();
  return new Promise((resolve, reject) => {
    delay = +delayInput.value.trim();
    if (delay < 0) {
      reject(new Error('Delay must be positive number'));
      return;
    }

    if (fullFilledRadio.checked) {
      setTimeout(resolve, delay, delay);
    }
    if (rejectedRadio.checked) {
      setTimeout(reject, delay, new Error(`Rejected promise in ${delay} ms`));
    }
  })
    .then(delay => {
      iziToast.success({
        message: `Fulfilled promise in ${delay} ms`,
        position: 'topCenter',
        timeout: delay,
        backgroundColor: '#59A10D',
        messageColor: 'white',
      });
    })
    .catch(error => {
      iziToast.error({
        message: `${error?.message ?? String(error)}`,
        position: 'topCenter',
        timeout: delay,
        backgroundColor: '#EF4040',
        messageColor: 'white',
      });
    })
    .finally(() => {
      delayInput.value = '';
      fullFilledRadio.checked = false;
      rejectedRadio.checked = false;
    });
}