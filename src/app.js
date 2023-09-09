import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import resources from './locales/index.js';
import parse from './rss.js';
import customMessages from './locales/customMessages.js';
import watch from './view.js';

const app = () => {
  const state = {
    form: {
      status: 'filling',
    },
    error: null,
    feeds: [],
    posts: [],
    uiState: {
      displayedPost: null,
      viewedPostIds: new Set(),
    },
  };
  const elements = {
    form: document.querySelector('.rss-form'),
    postsList: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    feedbackElement: document.querySelector('.feedback'),
    urlInput: document.querySelector('#url-input'),
    modalHeader: document.querySelector('.modal-header'),
    modalBody: document.querySelector('.modal-body'),
    modalHref: document.querySelector('.full-article'),
  };

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

  const handleData = (data, watchedState) => {
    const { feed, posts } = data;
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

    axios.get(addProxy(url), {
      timeout: 10000,
    })
      .then((response) => {
        const data = parse(response.data.contents, url);
        handleData(data, watchedState);
        watchedState.form.status = 'added';
      })
      .catch((err) => {
        watchedState.error = handleError(err);
        watchedState.form.status = 'inValid';
      });
  };

  const updatePosts = (watchedState) => {
    const updateFeedData = (feed) => {
      loadRSS(watchedState, feed.link)
        .then(() => {
          setTimeout(updateFeedData, 4000, feed);
        })
        .catch((error) => {
          console.error(`Error fetching data from feed ${feed.id}:`, error);
          setTimeout(updateFeedData, 4000, feed);
        });
    };

    watchedState.feeds.forEach((feed) => {
      updateFeedData(feed);
    });
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => {
    const watchedState = watch(state, i18nextInstance);

    yup.setLocale(customMessages);

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
      const addedURLs = watchedState.feeds.map((feed) => feed.link);
      const formData = new FormData(event.target);
      const input = formData.get('url');

      validateURL(addedURLs, input)
        .then((error) => {
          if (error) {
            watchedState.error = error.key;
            watchedState.form.status = 'inValid';
          } else {
            loadRSS(watchedState, input);
          }
        });
    });

    elements.postsList.addEventListener('click', (e) => {
      const postId = e.target.dataset.id;
      if (postId) {
        watchedState.uiState.displayedPost = postId;
        watchedState.uiState.viewedPostIds.add(postId);
      }
    });

    updatePosts(watchedState);
  }).catch((error) => {
    console.error('Error initializing i18nextInstance:', error);
  });
};

export default app;
