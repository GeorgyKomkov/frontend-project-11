const renderValid = (state) => {
  const form = document.querySelector('.rss-form');
  const feedbackElement = document.querySelector('.feedback');
  const urlInput = document.querySelector('#url-input');

  feedbackElement.textContent = '';

  if (state.error) {
    feedbackElement.textContent = state.error;
    urlInput.classList.add('is-invalid');
    feedbackElement.classList.remove('text-success');
    feedbackElement.classList.add('text-danger');
  } else {
    feedbackElement.textContent = 'RSS успешно загружен';
    feedbackElement.classList.remove('text-danger');
    feedbackElement.classList.add('text-success');
    urlInput.classList.remove('is-invalid');
    form.reset();
    urlInput.focus();
  }
};

export default renderValid;
