import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import renderValid from './view';
import resources from './locales/index';
import parse from './rss';

export default () => {
  const state = {
    formState: 'filling',
    error: null,
    feeds: [],
    posts: [],
    url: '',
  };
  // приминяем прокси сервер
  const addProxy = (url) => {
    const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
    proxyUrl.searchParams.append('disableCache', 'true');
    proxyUrl.searchParams.append('url', url);
    return proxyUrl.toString();
  };

  // запрос на получение проксированного URL
  const getData = (url) => axios.get(addProxy(url));

  // функция добовления уникального id для постов
  const addId = (posts, id) => {
    posts.forEach((post) => {
      // eslint-disable-next-line no-param-reassign
      post.id = uniqueId();
      // eslint-disable-next-line no-param-reassign
      post.feedId = id;
    });
  };

  const handleData = (data, watchedState) => {
    // получаем из данных, а это проксированный URL фиды и посты
    const { feed, posts } = data;
    // устанавливаем фидам уникальный id
    feed.id = uniqueId();
    // добовляем фид в состояние
    watchedState.feeds.push(feed);
    // добовляем уникальный id постам и feedId
    addId(posts, feed.id);
    // доюовляем посты в состояние
    watchedState.posts.push(...posts);
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  });
  const form = document.querySelector('.rss-form');
  const watchedState = onChange(state, () => {
    renderValid(watchedState, i18nextInstance);
  });

  yup.setLocale({
    string: {
      url: () => i18nextInstance.t('errors.notUrl'),
      required: () => i18nextInstance.t('errors.empty'),
    },
    mixed: {
      notOneOf: () => i18nextInstance.t('errors.alreadyInList'),
    },
  });

  const validateUrl = (validatedLinks) => {
    const schema = yup.object().shape({
      url: yup.string().url().required().notOneOf(validatedLinks),
    });

    return schema
      .validate({ url: watchedState.feeds.link })
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
    // валидируем url
    validateUrl(watchedState.url)
      .then(() => {
        watchedState.error = null;
        watchedState.formState = 'sending';
        // возвращаем запрос url, должны получить xml
        return getData(watchedState.url);
      })
      .then((response) => {
        // парсим наш xml
        const data = parse(response.data.contents, watchedState.url);
        // добавляем элементы в состояние
        handleData(data, watchedState);
        watchedState.formState = 'added';
      })
      .catch(() => {
        watchedState.formState = 'invalid';
      });
  });

  watchedState();
};
