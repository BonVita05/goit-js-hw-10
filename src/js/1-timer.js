// бібліотека для календаря
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
//бібліотека для повідомлення
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const dateInput = document.querySelector('#datetime-picker');
const startBtn = document.querySelector('.button');

const daysBox = document.querySelector('[data-days]');
const hoursBox = document.querySelector('[data-hours]');
const minutesBox = document.querySelector('[data-minutes]');
const secondsBox = document.querySelector('[data-seconds]');

let userSelectedDate = null;
let timerId = null;

//додаємо в інпут календар
const options = {
  enableTime: true, // дозволено вибір часу також
  time_24hr: true, // формат часу 24 година (0-23)
  defaultDate: new Date(), // дата виставляється у як об'єкт класу Date
  dateFormat: 'Y-m-d H:i', // формат відображення дати
  //   minDate: 'today', // не можна вибрати дату ранніше за сьогоднішню
  minuteIncrement: 1, // крок відліку хвилин
  //   enableSeconds: false,
  onReady(selectedDates, dateStr, instance) {
    startBtn.disabled = true;
  },
  onClose(selectedDates, dateStr, instance) {
    if (!selectedDates[0]) {
      userSelectedDate = null;
      startBtn.disabled = true;

      iziToast.error({
        title: 'Error',
        message: 'Please choose a date!',
        position: 'topLeft', // topRight | topLeft | bottomRight | bottomLeft | center
        timeout: 1000, // авто-закриття (мс). false — не закривати
        closeOnClick: true,
      });
      return;
    }

    if (!isFutureDate(selectedDates[0])) {
      userSelectedDate = null;

      iziToast.error({
        title: 'Error',
        message: 'Please choose a date!',
        position: 'topLeft', // topRight | topLeft | bottomRight | bottomLeft | center
        timeout: 3000, // авто-закриття (мс). false — не закривати
        closeOnClick: true,
      });
    } else {
      userSelectedDate = selectedDates[0];
      startBtn.disabled = false;
    }
  },
};

const flatp = flatpickr(dateInput, options);

const isFutureDate = date =>
  date instanceof Date && Number.isFinite(+date) && +date > Date.now();

const addLeadingZero = number => String(number).padStart(2, '0');

function convertMs(ms) {
  const second = 1000;
  const minute = 60 * second;
  const hour = 60 * minute;
  const day = 24 * hour;

  const days = Math.floor(ms / day);
  const hours = Math.floor((ms % day) / hour);
  const minutes = Math.floor(((ms % day) % hour) / minute);
  const seconds = Math.floor((((ms % day) % hour) % minute) / second);
  return { days, hours, minutes, seconds };
}

function renderTime({ days, hours, minutes, seconds }) {
  daysBox.textContent = addLeadingZero(days);
  hoursBox.textContent = addLeadingZero(hours);
  minutesBox.textContent = addLeadingZero(minutes);
  secondsBox.textContent = addLeadingZero(seconds);
}

function countDown(targetDate, onTick) {
  return new Promise((resolve, reject) => {
    if (!isFutureDate(targetDate)) {
      reject(new Error('Date must be in the future'));
      return;
    }

    const tick = () => {
      const difference = +targetDate - Date.now();

      if (difference <= 0) {
        clearInterval(timerId);
        onTick({ days: '00', hours: '00', minutes: '00', seconds: '00' });
        resolve(); // кінець
      } else {
        onTick(convertMs(difference));
      }
    };

    tick(); // миттєве перше оновлення
    timerId = setInterval(tick, 1000);
  });
}

startBtn.addEventListener('click', () => {
  if (!isFutureDate(userSelectedDate)) {
    iziToast.error({
      title: 'Error',
      message: 'Please choose a date!',
      position: 'topLeft', // topRight | topLeft | bottomRight | bottomLeft | center
      timeout: 3000, // авто-закриття (мс). false — не закривати
      closeOnClick: true,
    });
    return;
  }
  if (timerId) clearInterval(timerId);

  dateInput.disabled = true;
  startBtn.disabled = true;

  countDown(userSelectedDate, renderTime)
    .then(() => {})
    .catch(error => {
      iziToast.error({
        title: 'Error',
        message: `${error.message}` || `${error}`,
        position: 'topLeft', // topRight | topLeft | bottomRight | bottomLeft | center
        timeout: 3000, // авто-закриття (мс). false — не закривати
        closeOnClick: true,
      });
    })
    .finally(() => {
      startBtn.disabled = false;
      dateInput.disabled = false;
    });
});