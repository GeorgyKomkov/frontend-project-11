import onChange from 'on-change';

const elements = {
  feedsConteiner: document.querySelector('.feeds'),
  postsConteiner: document.querySelector('.posts'),
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
const createFeeds = (state) => {
  elements.feedsConteiner.innerHTML = '';
  const divConteiner = document.createElement('div');
  const divTitle = document.createElement('div');
  const ul = document.createElement('ul');
  const h2 = document.createElement('h2');

  h2.classList.add('card-title', 'h4');
  h2.textContent = 'Фиды';
  divConteiner.classList.add('card', 'border-0');
  divTitle.classList.add('card-body');
  divTitle.append(h2);
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  divConteiner.append(divTitle, ul);
  elements.feedsConteiner.append(divConteiner);

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
  elements.postsConteiner.innerHTML = '';
  const divConteiner = document.createElement('div');
  const divTitle = document.createElement('div');
  const ul = document.createElement('ul');
  const h2 = document.createElement('h2');
  divConteiner.classList.add('card', 'border-0');
  divTitle.classList.add('card-body');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  divConteiner.append(divTitle, ul);
  h2.classList.add('card-title', 'h4');
  h2.textContent = 'Посты';
  divTitle.append(h2);
  elements.postsConteiner.append(divConteiner);

  state.posts.forEach((post) => {
    const li = document.createElement('li');
    const button = createButton(post, i18next);
    const a = document.createElement('a');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    a.setAttribute('href', post.link);
    a.setAttribute('data-id', post.id);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    if (state.uiState.viewedPostIds.includes(post.id)) {
      a.classList.add('fw-normal');
      a.classList.add('link-secondary');
    } else {
      a.classList.add('fw-bold');
    }
    a.textContent = post.title;
    button.addEventListener('click', () => {
      const modalHeader = document.querySelector('.modal-header');
      const modalBody = document.querySelector('.modal-body');
      const modalHref = document.querySelector('.full-article');
      modalHeader.innerHTML = `<h5>${post.title}</h5>`;
      modalBody.textContent = post.description;
      modalHref.setAttribute('href', post.link);
    });
    li.append(a);
    li.append(button);
    ul.append(li);
  });
};

const render = (state, i18next) => {
  const submit = document.querySelector('.px-sm-5');

  elements.feedbackElement.textContent = '';

  if (state.formState === 'inValid') {
    submit.disabled = false;
    elements.feedbackElement.textContent = i18next.t(`errors.${state.error}`);
    elements.urlInput.classList.add('is-invalid');
    elements.feedbackElement.classList.remove('text-success');
    elements.feedbackElement.classList.add('text-danger');
  } else if (state.formState === 'sending') {
    submit.disabled = true;
    elements.urlInput.classList.remove('is-invalid');
    elements.feedbackElement.classList.remove('text-danger');
    elements.feedbackElement.textContent = i18next.t('status.sending');
    elements.feedbackElement.classList.add('text-success');
    elements.feedbackElement.textContent = i18next.t('status.success');
    elements.form.reset();
    elements.urlInput.focus();
  } else if (state.formState === 'added') {
    createFeeds(state);
    createPosts(state, i18next);
    submit.disabled = false;
    elements.feedbackElement.classList.remove('text-danger');
    elements.feedbackElement.classList.add('text-success');
    elements.urlInput.classList.remove('is-invalid');
    elements.feedbackElement.textContent = i18next.t('status.success');
    elements.form.reset();
    elements.urlInput.focus();
  }
};

const watch = (state, i18nextInstance) => {
  const watchedState = onChange(state, () => {
    render(watchedState, i18nextInstance);
  });
  return watchedState;
};

export default watch;
