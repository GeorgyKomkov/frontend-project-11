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

  // функция добавления  уникального id для постов
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
    // добавляем фид в состояние
    watchedState.feeds.push(feed);
    // добавляем уникальный id постам и feedId
    addId(posts, feed.id);
    // добавляем посты в состояние
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

  const validateUrl = (links, input) => {
    const schema = yup.object().shape({
      url: yup.string().url().required().notOneOf(links),
    });

    return schema
      .validate({ url: input })
      .then(() => {
        watchedState.error = null;
        watchedState.formState = 'sending';
      })
      .catch((err) => {
        watchedState.error = err.message;
        watchedState.formState = 'inValid';
      });
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    watchedState.error = null;
    const addedLinks = watchedState.feeds.map((feed) => feed.link);
    const formData = new FormData(event.target);
    const input = formData.get('url');

    // валидируем url
    validateUrl(addedLinks, input)
      // делаем запрос по валидному url
      .then(() => getData(input))
      // получаем  xml файл
      .then((response) => {
        // парсим наш xml
        const data = parse(response.data.contents, input);
        // добавляем элементы в состояние
        handleData(data, watchedState);
        watchedState.formState = 'filling';
      })
      .catch(() => {
        watchedState.formState = 'inValid';
        // watchedState.error = err.message;
      });
    console.log(watchedState);
  });

  watchedState();
};
