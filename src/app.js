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
    formState: 'filling',
    error: null,
    feeds: [],
    posts: [],
    uiState: {
      displayedPost: null,
      viewedPostIds: [],
    },
  };
  const elements = {
    form: document.querySelector('.rss-form'),
    postsList: document.querySelector('.posts'),
    feedsConteiner: document.querySelector('.feeds'),
    postsConteiner: document.querySelector('.posts'),
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

  const getData = (url) => axios.get(addProxy(url));

  const addId = (posts, id) => {
    posts.forEach((post) => {
      post.id = uniqueId();
      post.feedId = id;
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
    return error.key ?? 'unknown';
  };

  const updatePosts = (watchedState) => {
    const promises = watchedState.feeds.map((feed) => getData(feed.link)
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
    return Promise.all(promises).finally(() => setTimeout(updatePosts, 4000, watchedState));
  };
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => {
    const watchedState = watch(state, i18nextInstance);

    yup.setLocale(customMessages);

    const validateUrl = (links, input) => {
      const schema = yup.object().shape({
        url: yup.string().url().required().notOneOf(links),
      });
      return schema
        .validate({ url: input })
        .then(() => null)
        .catch((error) => error.message);
    };

    elements.form.addEventListener('submit', (event) => {
      event.preventDefault();
      const addedLinks = watchedState.feeds.map((feed) => feed.link);
      const formData = new FormData(event.target);
      const input = formData.get('url');
      watchedState.formState = 'sending';

      validateUrl(addedLinks, input)
        .then((error) => {
          if (error) {
            watchedState.error = error.key;
            watchedState.formState = 'inValid';
          } else {
            watchedState.error = null;
            watchedState.formState = 'sending';
            getData(input)
              .then((response) => {
                const data = parse(response.data.contents, input);
                handleData(data, watchedState);
                watchedState.formState = 'added';
              })
              .catch((err) => {
                watchedState.error = handleError(err);
                watchedState.formState = 'inValid';
              });
          }
        });
    });

    elements.postsList.addEventListener('click', (e) => {
      const postId = e.target.dataset.id;
      if (postId) {
        watchedState.uiState.displayedPost = postId;
        watchedState.uiState.viewedPostIds.push(postId);
      }
    });

    updatePosts(watchedState);
  }).catch((error) => {
    console.error('Error initializing i18nextInstance:', error);
  });
};

export default app;
