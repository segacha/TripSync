import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { routes } from './app.routes';

describe('routes', () => {
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        {
          provide: AuthService,
          useValue: {
            ready: signal(true),
            isAuthenticated: signal(false),
            session: signal(null),
            user: signal(null),
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('muestra la landing en la raíz', async () => {
    await router.navigateByUrl('/');
    expect(router.url).toBe('/');
  });

  it('manda una URL desconocida a la landing', async () => {
    await router.navigateByUrl('/ruta-que-no-existe');
    expect(router.url).toBe('/');
  });

  it('manda a login cuando un invitado entra a /trips', async () => {
    await router.navigateByUrl('/trips');
    expect(router.url).toBe('/login');
  });
});
