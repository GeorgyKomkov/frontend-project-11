const renderValid = (state, i18next) => {
  const form = document.querySelector('.rss-form');
  const feedbackElement = document.querySelector('.feedback');
  const urlInput = document.querySelector('#url-input');

  feedbackElement.textContent = '';

  if (state.formState === 'inValid') {
    feedbackElement.textContent = state.error;
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

export default renderValid;
