import onChange from 'on-change';

const elements = {
  containerFeeds: document.querySelector('.feeds'),
  containerPosts: document.querySelector('.posts'),
  form: document.querySelector('.rss-form'),
  feedbackElement: document.querySelector('.feedback'),
  urlInput: document.querySelector('#url-input'),
  modalHeader: document.querySelector('.modal-header'),
  modalBody: document.querySelector('.modal-body'),
  modalHref: document.querySelector('.full-article'),
};

const createButton = (post, i18next) => {
  const button = document.createElement('button');
  button.setAttribute('type', 'button');
  button.setAttribute('data-id', post.id);
  button.setAttribute('data-bs-toggle', 'modal');
  button.setAttribute('data-bs-target', '#modal');
  button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  button.textContent = i18next.t('buttons.view');
  return button;
};

const createFeedContainers = (state) => {
  elements.containerFeeds.innerHTML = '';
  const divContainer = document.createElement('div');
  const divTitle = document.createElement('div');
  const ul = document.createElement('ul');
  const h2 = document.createElement('h2');

  h2.classList.add('card-title', 'h4');
  h2.textContent = 'Фиды';
  divContainer.classList.add('card', 'border-0');
  divTitle.classList.add('card-body');
  divTitle.append(h2);
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  divContainer.append(divTitle, ul);
  elements.containerFeeds.append(divContainer);

  state.feeds.forEach((feed) => {
    const li = document.createElement('li');
    const p = document.createElement('p');
    const h3 = document.createElement('h3');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    h3.classList.add('h6', 'm-0');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feed.description;
    li.prepend(p);
    li.prepend(h3);
    h3.textContent = feed.title;
    ul.prepend(li);
  });
};

const createPosts = (state, i18next) => {
  elements.containerPosts.innerHTML = '';
  const divContainer = document.createElement('div');
  const divTitle = document.createElement('div');
  const ul = document.createElement('ul');
  const h2 = document.createElement('h2');
  divContainer.classList.add('card', 'border-0');
  divTitle.classList.add('card-body');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  divContainer.append(divTitle, ul);
  h2.classList.add('card-title', 'h4');
  h2.textContent = 'Посты';
  divTitle.append(h2);
  elements.containerPosts.append(divContainer);

  state.posts.forEach((post) => {
    const li = document.createElement('li');
    const button = createButton(post, i18next);
    const a = document.createElement('a');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    a.setAttribute('href', post.link);
    a.setAttribute('data-id', post.id);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    if (state.uiState.viewedPostIds.has(post.id)) {
      a.classList.add('fw-normal');
      a.classList.add('link-secondary');
    } else {
      a.classList.add('fw-bold');
    }
    a.textContent = post.title;
    li.append(a);
    li.append(button);
    ul.append(li);
  });
};
const displayPostInModal = (state) => {
  const displayedPostId = state.uiState.displayedPost;
  if (displayedPostId) {
    const post = state.posts.find((el) => el.id === displayedPostId);
    if (post) {
      elements.modalHeader.innerHTML = `<h5>${post.title}</h5>`;
      elements.modalBody.textContent = post.description;
      elements.modalHref.setAttribute('href', post.link);
    }
  }
};
const isPost = (state, i18next) => {
  if (state.posts.length !== 0) {
    return createPosts(state, i18next);
  }
  return null;
};

const render = (state, i18next) => {
  const submit = document.querySelector('.px-sm-5');

  elements.feedbackElement.textContent = '';

  switch (state.form.status) {
    case 'inValid':
      isPost(state, i18next);
      submit.disabled = false;
      elements.feedbackElement.textContent = i18next.t(`errors.${state.error}`);
      elements.urlInput.classList.add('is-invalid');
      elements.feedbackElement.classList.remove('text-success');
      elements.feedbackElement.classList.add('text-danger');
      break;
    case 'sending':
      submit.disabled = true;
      elements.urlInput.classList.remove('is-invalid');
      elements.feedbackElement.classList.remove('text-danger');
      elements.feedbackElement.textContent = i18next.t('status.sending');
      elements.feedbackElement.classList.add('text-success');
      elements.urlInput.focus();
      break;
    case 'added':
      createFeedContainers(state);
      createPosts(state, i18next);
      submit.disabled = false;
      elements.feedbackElement.classList.remove('text-danger');
      elements.feedbackElement.classList.add('text-success');
      elements.urlInput.classList.remove('is-invalid');
      elements.feedbackElement.textContent = i18next.t('status.success');
      elements.form.reset();
      elements.urlInput.focus();
      break;
    default:
      break;
  }
};

const watchState = (state, i18nextInstance) => {
  const watchedState = onChange(state, (path) => {
    if (path === 'uiState.displayedPost') {
      displayPostInModal(watchedState);
    }
    render(watchedState, i18nextInstance, elements);
  });
  return watchedState;
};

export default watchState;
