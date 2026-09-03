import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Datos de locale para que DatePipe pueda formatear fechas en español.
registerLocaleData(localeEs, 'es');

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
