import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import renderValid from './view';
import resources from './locales/index';

export default () => {
  const state = {
    formState: 'filling',
    error: null,
    feeds: [],
    url: '',
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  });
  const form = document.querySelector('.rss-form');
  const watchedState = onChange(state, () => {
    renderValid(watchedState);
  });
  const validateUrl = () => {
    yup.setLocale({
      string: {
        url: () => i18nextInstance.t('errors.notUrl'),
        required: () => i18nextInstance.t('errors.empty'),
      },
      mixed: {
        notOneOf: () => i18nextInstance.t('errors.alreadyInList'),
      },
    });

    const schema = yup.object().shape({
      url: yup.string().url().required().notOneOf(watchedState.feeds),
    });

    return schema
      .validate({ url: watchedState.url })
      .then(() => {
        watchedState.error = null;
        watchedState.formState = 'sending';
      })
      .catch((err) => {
        watchedState.formState = 'inValid';
        watchedState.error = err.message;
      });
  };
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    watchedState.error = null;
    watchedState.url = document.querySelector('#url-input').value;

    validateUrl().then(() => {
      if (!watchedState.error) {
        watchedState.feeds.push(watchedState.url);
        watchedState.formState = 'filling';
        watchedState.url = '';
      }
    });
  });

  watchedState();
};
