import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

const waitUntilReady = async (auth: AuthService) => {
  if (auth.ready()) return;
  await new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      if (auth.ready()) {
        clearInterval(interval);
        resolve();
      }
    }, 25);
  });
};

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await waitUntilReady(auth);
  return auth.isAuthenticated() ? true : router.parseUrl('/login');
};

export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await waitUntilReady(auth);
  return auth.isAuthenticated() ? router.parseUrl('/trips') : true;
};
