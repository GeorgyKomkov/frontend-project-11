import onChange from 'on-change';

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

const createFeeds = (state, elements) => {
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

const createPosts = (state, i18next, elements) => {
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
    li.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );
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

const displayPostInModal = (state, elements) => {
  const displayedPostId = state.uiState.currentPostId;
  const currentPost = state.posts.find((post) => post.id === displayedPostId);

  const modalTitleElement = elements.modalHeader.querySelector('.modal-title');
  if (modalTitleElement) {
    const titleElement = document.createElement('h5');
    titleElement.textContent = currentPost.title;
    modalTitleElement.innerHTML = '';
    modalTitleElement.appendChild(titleElement);
  }
  elements.modalBody.textContent = currentPost.description;
  elements.modalHref.setAttribute('href', currentPost.link);
};

const renderFormStatus = (state, i18next, elements) => {
  elements.feedback.textContent = '';
  switch (state.form.status) {
    case 'inValid':
      elements.submit.disabled = false;
      elements.feedback.textContent = i18next.t(`errors.${state.error}`);
      elements.urlInput.classList.add('is-invalid');
      elements.feedback.classList.remove('text-success');
      elements.feedback.classList.add('text-danger');
      break;
    case 'sending':
      elements.submit.disabled = true;
      elements.urlInput.classList.remove('is-invalid');
      elements.feedback.classList.remove('text-danger');
      elements.feedback.textContent = i18next.t('status.sending');
      elements.feedback.classList.add('text-success');
      elements.urlInput.focus();
      break;
    case 'added':
      elements.submit.disabled = false;
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');
      elements.urlInput.classList.remove('is-invalid');
      elements.feedback.textContent = i18next.t('status.success');
      elements.form.reset();
      elements.urlInput.focus();
      break;
    default:
      break;
  }
};

const watchState = (state, i18nextInstance, elements) => {
  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'uiState.currentPostId' || 'uiState.viewedPostIds':
        displayPostInModal(watchedState, elements);
        break;
      case 'feeds':
        createFeeds(state, elements);
        break;
      case 'posts':
        createPosts(state, i18nextInstance, elements);
        break;
      case 'form.status':
        renderFormStatus(watchedState, i18nextInstance, elements);
        break;
      default:
        break;
    }
    renderFormStatus(watchedState, i18nextInstance, elements);
  });
  return watchedState;
};

export default watchState;
