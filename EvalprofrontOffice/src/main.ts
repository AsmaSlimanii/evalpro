// --- polyfill pour libs CommonJS (SockJS/STOMP) ---
(window as any).global = window;
(window as any).process = (window as any).process || { env: { DEBUG: undefined } };

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
