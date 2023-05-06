export default (state, elements) => (path, value) => {
  const {
    form, input, feedback, postsContainer, feedsContainer,
  } = elements;

  if (path === 'formStatus') {
    switch (value) {
      case 'valid':
        input.classList.remove('is-invalid');
        break;
      case 'invalid':
        input.classList.add('is-invalid');
        feedback.classList.remove('text-success');
        feedback.classList.add('text-danger');
        feedback.textContent = state.error;
        break;
      case 'success':
        input.classList.remove('is-invalid');
        feedback.classList.remove('text-danger');
        feedback.classList.add('text-success');
        feedback.textContent = 'RSS успешно загружен';
        form.reset();
        input.focus();
        break;
      default:
        throw new Error(`Unknown state: ${value}`);
    }
  }

  if (path === 'urlList') {
    postsContainer.replaceChildren();
    feedsContainer.replaceChildren();

    if (value.length === 0) return value;

    value.map((item) => {
      const postItem = document.createElement('li');
      postItem.innerHTML = item;
      return postsContainer.append(postItem);
    });
  }
  return elements;
};
