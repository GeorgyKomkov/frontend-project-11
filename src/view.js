const feedsConteiner = document.querySelector('.feeds');
const postsConteiner = document.querySelector('.posts');
const form = document.querySelector('.rss-form');
const feedbackElement = document.querySelector('.feedback');
const urlInput = document.querySelector('#url-input');

const createFeeds = (state) => {
  feedsConteiner.innerHTML = '';
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
  feedsConteiner.append(divConteiner);

  state.feeds.forEach((feed) => {
    const li = document.createElement('li');
    const p = document.createElement('p');
    const h3 = document.createElement('h3');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    h3.classList.add('h6', 'm-0');
    p.classList.add('m-0', 'small', 'text-black-50');
    h3.append(p);
    li.append(h3);
    p.textContent = feed.description;
    h3.textContent = feed.title;
    ul.append(li);
  });
};
const createPosts = (state) => {
  postsConteiner.innerHTML = '';
  const divConteiner = document.createElement('div');
  divConteiner.classList.add('card', 'border-0');
  const divTitle = document.createElement('div');
  divTitle.classList.add('card-body');
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  divConteiner.append(divTitle, ul);
  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = 'Посты';
  divTitle.append(h2);
  postsConteiner.append(divConteiner);

  state.posts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const a = document.createElement('a');
    a.setAttribute('href', `${post.link}`);
    a.classList.add('fw-bold', `data-id="${post.id}"`, 'target="_blank"');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = post.title;
    li.append(a);
    ul.append(li);
  });
};

const render = (state, i18next) => {
  createFeeds(state);
  createPosts(state);
  feedbackElement.textContent = '';

  if (state.formState === 'inValid') {
    feedbackElement.textContent = i18next.t(`errors.${state.error}`);
    urlInput.classList.add('is-invalid');
    feedbackElement.classList.remove('text-success');
    feedbackElement.classList.add('text-danger');
  } else {
    feedbackElement.classList.remove('text-danger');
    feedbackElement.classList.add('text-success');
    urlInput.classList.remove('is-invalid');
    feedbackElement.textContent = i18next.t('status.success');
    form.reset();
    urlInput.focus();
  }
};

export default render;
