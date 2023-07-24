import onChange from 'on-change';
import * as yup from 'yup';

export default () => {
  const state = {
    formState: 'filling',
    error: null,
    feeds: [],
    url: '',
  };

  const form = document.querySelector('.rss-form');
  const feedbackElement = document.querySelector('.feedback');

  // Настройка валидации URL с помощью yup
  const schema = yup.object().shape({
    url: yup.string().url('Неверный URL').required('URL обязателен'),
  });

  const validateUrl = async () => {
    try {
      // Проверяем валидность URL согласно настройкам схемы yup
      await schema.validate({ url: state.url });

      // Если URL валидный, сбрасываем ошибку и переводим форму в состояние 'sending'
      state.error = null;
      state.formState = 'sending';
    } catch (err) {
      // Если URL невалидный, устанавливаем ошибку и оставляем форму в состоянии 'filling'
      state.error = err.message;
    }
  };

  const render = (currentState) => {
    // Обновляем представление формы на основе текущего состояния state
    if (currentState.error) {
      feedbackElement.textContent = currentState.error;
    } else {
      feedbackElement.textContent = '';
    }

    const input = form.querySelector('#url-input');
    if (currentState.error) {
      input.classList.add('is-invalid');
    } else {
      input.classList.remove('is-invalid');
    }

    if (currentState.formState === 'filling') {
      form.reset();
      form.querySelector('#url-input').focus();
    }
  };

  const watchedState = onChange(state, (path) => {
    if (path === 'url' && state.formState === 'filling') {
      validateUrl();
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Проверяем валидность URL перед добавлением в feeds
    await validateUrl();

    if (!state.error) {
      // Проверяем, что URL отсутствует в feeds (не является дублем)
      if (!state.feeds.includes(state.url)) {
        // Если URL не дубль, добавляем его в feeds
        state.feeds.push(state.url);
      } else {
        // Если URL является дублем, устанавливаем соответствующую ошибку
        state.error = 'RSS уже существует';
      }

      // Сбрасываем URL и форму в состояние 'filling' после успешного добавления
      state.url = '';
      state.formState = 'filling';
    }
  });

  watchedState(render);
};
