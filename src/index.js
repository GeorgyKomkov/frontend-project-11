import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import render from './view';

// добавляем обработчик события, который вызовется после загрузки HTML-документа.
document.addEventListener('DOMContentLoaded', () => {
  // создаем объект elements, который содержит ссылки на элементы html.
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
  };
  // создаем объект состояния
  const state = { formStatus: 'valid', urlList: [] };
  /*  Создаем  watchedState, в котором при изменении объекта state вызывается функция render,
  которая отрисовывает элементы на странице. */
  const watchedState = onChange(state, render(state, elements));
  // проверока валидности для URL-адреса.
  const schemaStr = yup.string().required().url().trim();
  // проверока валидности для дублей
  const schemaMix = yup.mixed().notOneOf([state.urlList]);
  // обрабатываем ошибки валидации URL-адреса
  const handleValidationErrors = (errorType) => {
    switch (errorType) {
      case 'url':
        watchedState.error = 'Ссылка должна быть валидным URL';
        break;
      case 'notOneOf':
        watchedState.error = 'RSS уже существует';
        break;
      default:
        watchedState.error = 'Возникла неизвестная ошибка. Попробуйте еще раз';
    }
  };
  // функция для  валидации URL-адреса.
  const validate = (url) => {
    schemaStr
      .validate(url)
      .then((url1) => schemaMix.validate(url1))
      .then((url2) => {
        watchedState.formStatus = 'success';
        watchedState.formStatus = 'valid';
        watchedState.formStatus = 'success';
        watchedState.urlList.push(url2);
      })
      .catch((e) => {
        handleValidationErrors(e.type);
        watchedState.formStatus = 'invalid';
        watchedState.formStatus = 'valid';
        watchedState.formStatus = 'invalid';
      });
  };
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const rssLink = e.target[0].value;
    validate(rssLink);
  });
});
