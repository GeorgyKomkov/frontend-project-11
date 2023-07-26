import onChange from 'on-change';
import * as yup from 'yup';
import renderValid from './view';

export default () => {
  const state = {
    formState: 'filling',
    error: null,
    feeds: [],
    url: '',
  };

  const form = document.querySelector('.rss-form');

  const watchedState = onChange(state, () => {
    renderValid(watchedState); // Используем функцию renderValid для обновления представления
  });

  const validateUrl = () => {
    const schema = yup.object().shape({
      url: yup
        .string()
        .url('Не корректный URL')
        .notOneOf(watchedState.feeds, 'Такой URL-адрес уже есть в списке фидов'),
    });

    return schema
      .validate({ url: watchedState.url })
      .then(() => {
        watchedState.error = null;
        watchedState.formState = 'sending';
      })
      .catch((err) => {
        watchedState.error = err.message;
      });
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    watchedState.error = null;
    watchedState.url = document.querySelector('#url-input').value;

    validateUrl()
      .then(() => {
        watchedState.error = null;
        watchedState.formState = 'sending';
        return watchedState.url;
      })
      .then((url) => {
        watchedState.feeds.push(url);
        watchedState.formState = 'filling';
        renderValid(watchedState); // Обновляем представление здесь
      })
      .catch((err) => {
        watchedState.error = err.message;
        renderValid(watchedState); // Обновляем представление при возникновении ошибки
      });
  });

  // Первоначальное обновление представления
  watchedState();
};
