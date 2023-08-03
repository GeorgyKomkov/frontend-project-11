import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import render from './view';
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
  // функция обноления постов
  const updatePosts = (watchedState) => {
    // перебираем фиды из состояния и делаем запрос по его ссылке
    const promises = watchedState.feeds.map((feed) => getData(feed.link)
      .then((response) => {
        // парсим поссты из полученго xml
        const { posts } = parse(response.data.contents);
        // фильтруем посты по id фида
        const postsWithCurrentId = watchedState.posts.filter((post) => post.feedId === feed.id);
        // собираем массив ссылок поста
        const displayedPostLinks = postsWithCurrentId.map((post) => post.link);
        // перебираем посты и если массив displayedPostLinks не содержит ссылку поста
        // то он попадает в массив newPosts
        const newPosts = posts.filter((post) => !displayedPostLinks.includes(post.link));
        // добовляем новым постам id корректного фида
        addId(newPosts, feed.id);
        // добовляем новые посты в состояне а именно в начало watchedState.posts
        watchedState.posts.unshift(...newPosts);
      })
      // обработка ошибки
      .catch((error) => {
        console.log(`Ошибка при получении данных из фида ${feed.id}:`, error);
      }));
      // ждем завершения  обработки всех постов и через 5 секунд, рекурсивно запускаем функицю
      // для проверки новых постов
    return Promise.all(promises).finally(() => setTimeout(updatePosts, 5000, watchedState));
  };
  // функция обработки ошибки
  const handleError = (error) => {
    // если запрос не содержит xml
    if (error.isParsingError) {
      return 'notRss';
    }
    // если произошла ошибка сети
    if (axios.isAxiosError(error)) {
      return 'networkError';
    }
    // если ошибка null или undefined возвращаем ключь unknown
    return error.key ?? 'unknown';
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  const form = document.querySelector('.rss-form');
  const watchedState = onChange(state, () => {
    render(watchedState, i18nextInstance);
  });

  yup.setLocale({
    string: {
      url: () => ({ key: 'notUrl' }),
      required: () => ({ key: 'empty' }),
    },
    mixed: {
      notOneOf: () => ({ key: 'alreadyInList' }),
    },
  });

  const validateUrl = (links, input) => {
    const schema = yup.object().shape({
      url: yup.string().url().required().notOneOf(links),
    });
    return schema
      .validate({ url: input })
      .then(() => null) // в случае валидной ссылки ничего не отправляем
      .catch((error) => error.message); // в случае оишибки вернем ошибку
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    watchedState.error = null;
    const addedLinks = watchedState.feeds.map((feed) => feed.link);
    const formData = new FormData(event.target);
    const input = formData.get('url');

    validateUrl(addedLinks, input)
      .then((error) => {
        if (error) {
          console.log(error);
          watchedState.error = handleError(error);
          watchedState.formState = 'inValid';
        } else {
          getData(input)
            .then((response) => {
              const data = parse(response.data.contents, input);
              handleData(data, watchedState);
              watchedState.formState = 'filling';
            });
        }
      });
    console.log(watchedState);
  });
  updatePosts(watchedState);
};
