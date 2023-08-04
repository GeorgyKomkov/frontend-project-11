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
    uiState: {
      displayedPost: null,
      viewedPostIds: [],
    },
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
      // eslint-disable-next-line no-param-reassign
      post.id = uniqueId();
      // eslint-disable-next-line no-param-reassign
      post.feedId = id;
    });
  };

  const handleData = (data, watchedState) => {
    const { feed, posts } = data;
    feed.id = uniqueId();
    watchedState.feeds.push(feed);
    addId(posts, feed.id);
    watchedState.posts.push(...posts);
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
  const handleError = (error) => {
    if (error.isParsingError) {
      return 'notRss';
    }
    if (axios.isAxiosError(error)) {
      return 'networkError';
    }
    return error.key ?? 'unknown';
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  const form = document.querySelector('.rss-form');
  const postsList = document.querySelector('.posts');
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
      .then(() => null)
      .catch((error) => error.message);
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
          // watchedState.error = handleError(error);
          watchedState.error = error.key;
          watchedState.formState = 'inValid';
        } else {
          getData(input)
            .then((response) => {
              watchedState.formState = 'sending';
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
    console.log(watchedState);
  });

  postsList.addEventListener('click', (e) => {
    const postId = e.target.dataset.id;
    console.log(postId);
    console.log(watchedState);
    if (postId) {
      watchedState.uiState.displayedPost = postId;
      watchedState.uiState.viewedPostIds.push(postId);
    }
  });

  updatePosts(watchedState);
};
