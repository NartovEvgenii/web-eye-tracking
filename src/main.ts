import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

var clm1: any;

const ROOT_ELEMENT_TAG = 'app-root';

let rootElement = document.querySelector(ROOT_ELEMENT_TAG);

if (!rootElement) {
  rootElement = document.createElement(ROOT_ELEMENT_TAG);
  rootElement.id = 'web-eye-tracking';
  document.body.appendChild(document.createElement(ROOT_ELEMENT_TAG));
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
