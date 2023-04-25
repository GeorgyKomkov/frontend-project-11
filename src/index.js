/* eslint-disable import/extensions */
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';

const form = document.createElement('form');
const input = document.createElement('input');
const button = document.createElement('button');

input.type = 'text';
input.placeholder = 'Enter RSS Feed URL';
button.type = 'submit';
button.textContent = 'Add Feed';

form.appendChild(input);
form.appendChild(button);

document.body.appendChild(form);
