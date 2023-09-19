import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import resources from './locales/index.js';
import parse from './rss.js';
import customMessages from './locales/customMessages.js';
import watch from './view.js';

const defaultOptions = { timeout: 10000 };
const timeOut = 4000;
const addProxy = (url) => {
  const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxyUrl.searchParams.append('disableCache', 'true');
  proxyUrl.searchParams.append('url', url);
  return proxyUrl.toString();
};
const addId = (items, id) => {
  items.forEach((item) => {
    item.id = uniqueId();
    item.feedId = id;
  });
};
const handleData = (data, watchedState, url) => {
  const { feed, posts } = data;
  feed.link = url;
  feed.id = uniqueId();
  watchedState.feeds.push(feed);
  addId(posts, feed.id);
  watchedState.posts.unshift(...posts);
};
const handleError = (error) => {
  if (error.isParsingError) {
    return 'notRss';
  }
  if (axios.isAxiosError(error)) {
    return 'networkError';
  }
  return 'unknown';
};
const loadRSS = (watchedState, url) => {
  watchedState.error = null;
  watchedState.form.status = 'sending';

  axios.get(addProxy(url), defaultOptions)
    .then((response) => {
      const data = parse(response.data.contents, url);
      handleData(data, watchedState, url);
      watchedState.form.status = 'added';
    })
    .catch((error) => {
      watchedState.error = handleError(error);
      watchedState.form.status = 'inValid';
    });
};
const updatePosts = (watchedState) => {
  const promises = watchedState.feeds.map((feed) => axios.get(addProxy(feed.link))
    .then((response) => {
      const { posts } = parse(response.data.contents);
      const postsWithCurrentId = watchedState.posts.filter((post) => post.feedId === feed.id);
      const displayedPostLinks = postsWithCurrentId.map((post) => post.link);
      const newPosts = posts.filter((post) => !displayedPostLinks.includes(post.link));
      addId(newPosts, feed.id);
      watchedState.posts.unshift(...newPosts);
    })
    .catch((error) => {
      console.error(`Error fetching data from feed ${feed.id}:`, error);
    }));
  return Promise.all(promises).finally(() => setTimeout(updatePosts, timeOut, watchedState));
};
const app = () => {
  yup.setLocale(customMessages);

  const state = {
    form: {
      status: 'filling',
    },
    error: null,
    feeds: [],
    posts: [],
    uiState: {
      currentPostId: null,
      viewedPostIds: new Set(),
    },
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    submit: document.querySelector('.px-sm-5'),
    containerFeeds: document.querySelector('.feeds'),
    containerPosts: document.querySelector('.posts'),
    feedback: document.querySelector('.feedback'),
    urlInput: document.querySelector('#url-input'),
    modalHeader: document.querySelector('.modal-header'),
    modalBody: document.querySelector('.modal-body'),
    modalHref: document.querySelector('.full-article'),
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => {
    const watchedState = watch(state, i18nextInstance, elements);
    const validateURL = (existingURLs, input) => {
      const schema = yup.object().shape({
        url: yup.string().url().required().notOneOf(existingURLs),
      });
      return schema
        .validate({ url: input })
        .then(() => null)
        .catch((error) => error.message);
    };

    elements.form.addEventListener('submit', (event) => {
      event.preventDefault();
      const addedUrls = watchedState.feeds.map((feed) => feed.link);
      const formData = new FormData(event.target);
      const input = formData.get('url');

      validateURL(addedUrls, input)
        .then((error) => {
          if (error) {
            watchedState.error = error.key;
            watchedState.form.status = 'inValid';
          } else {
            watchedState.form.status = 'added';
            loadRSS(watchedState, input);
          }
        });
    });

    elements.containerPosts.addEventListener('click', (e) => {
      const postId = e.target.dataset.id;
      if (postId) {
        watchedState.uiState.currentPostId = postId;
        watchedState.uiState.viewedPostIds.add(postId);
      }
    });

    updatePosts(watchedState);
  }).catch((error) => {
    console.error('Error initializing i18nextInstance:', error);
  });
};

export default app;
