import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface Feature {
  icon: string;
  title: string;
  text: string;
}

interface Step {
  number: string;
  title: string;
  text: string;
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="landing">

      <!-- Navbar -->
      <header class="nav">
        <div class="nav-inner">
          <a routerLink="/" class="logo">
            <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="18" fill="#fff3e8" />
              <path d="M18 8 L26 14 L26 22 C26 25 23 28 18 30 C13 28 10 25 10 22 L10 14 Z" fill="#f97316" opacity="0.9" />
              <circle cx="18" cy="19" r="4" fill="white" />
            </svg>
            <span class="logo-text">TripSync</span>
          </a>

          <nav class="nav-links">
            <a href="#features" class="nav-link">Funciones</a>
            <a href="#como-funciona" class="nav-link">Cómo funciona</a>
          </nav>

          <div class="nav-actions">
            @if (isAuthenticated()) {
              <a routerLink="/trips" class="btn btn-primary btn-sm">Ir a mis viajes</a>
            } @else {
              <a routerLink="/login" class="nav-link">Iniciar sesión</a>
              <a routerLink="/register" class="btn btn-primary btn-sm">Crear cuenta</a>
            }
          </div>
        </div>
      </header>

      <!-- Hero -->
      <section class="hero">
        <div class="hero-glow"></div>
        <div class="hero-inner">
          <div class="hero-copy">
            <span class="badge">
              <span class="badge-dot"></span>
              Planificación colaborativa en tiempo real
            </span>

            <h1 class="hero-title">
              Planificá viajes en grupo<br />
              <span class="accent">sin perder el hilo.</span>
            </h1>

            <p class="hero-sub">
              Armá el itinerario día por día, ubicá cada actividad en el mapa, invitá a tus
              compañeros de viaje y dividí los gastos automáticamente. Todo en un solo lugar,
              sincronizado al instante para todo el grupo.
            </p>

            <div class="hero-cta">
              @if (isAuthenticated()) {
                <a routerLink="/trips" class="btn btn-primary btn-lg">Ir a mis viajes</a>
              } @else {
                <a routerLink="/register" class="btn btn-primary btn-lg">Empezar gratis</a>
                <a routerLink="/login" class="btn btn-ghost btn-lg">Ya tengo cuenta</a>
              }
            </div>

            <p class="hero-note">Gratis · Sin tarjeta de crédito</p>
          </div>

          <!-- Mockup -->
          <div class="hero-visual" aria-hidden="true">
            <div class="mock">
              <div class="mock-bar">
                <span class="dot dot-r"></span>
                <span class="dot dot-y"></span>
                <span class="dot dot-g"></span>
                <span class="mock-title">Europa 2026</span>
              </div>

              <div class="mock-body">
                <div class="mock-day">Día 3 · Roma</div>

                <div class="mock-item">
                  <span class="mock-check done">✓</span>
                  <div class="mock-item-body">
                    <span class="mock-item-title">Coliseo Romano</span>
                    <span class="mock-item-meta">📍 Piazza del Colosseo</span>
                  </div>
                  <span class="mock-price">€18</span>
                </div>

                <div class="mock-item">
                  <span class="mock-check"></span>
                  <div class="mock-item-body">
                    <span class="mock-item-title">Trastevere</span>
                    <span class="mock-item-meta">📍 Cena en grupo</span>
                  </div>
                  <span class="mock-price">€45</span>
                </div>

                <div class="mock-item ghost">
                  <span class="mock-check"></span>
                  <div class="mock-item-body">
                    <span class="mock-item-title">Fontana di Trevi</span>
                    <span class="mock-item-meta">Arrastrá para reordenar</span>
                  </div>
                </div>

                <div class="mock-foot">
                  <div class="mock-avatars">
                    <span class="av av-1">M</span>
                    <span class="av av-2">J</span>
                    <span class="av av-3">L</span>
                    <span class="av av-more">+2</span>
                  </div>
                  <span class="mock-split">€21 c/u</span>
                </div>
              </div>
            </div>

            <div class="float-card float-card-map float-soft">
              <span class="fc-icon">🗺️</span>
              <div>
                <div class="fc-title">3 lugares</div>
                <div class="fc-sub">en el mapa</div>
              </div>
            </div>

            <div class="float-card float-card-live">
              <span class="live-dot"></span>
              <div>
                <div class="fc-title">Julia editando</div>
                <div class="fc-sub">en vivo</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Funciones -->
      <section id="features" class="section">
        <div class="section-inner">
          <div class="section-head">
            <span class="eyebrow">Todo lo que podés hacer</span>
            <h2 class="section-title">Un viaje tiene mil detalles.<br />Acá entran todos.</h2>
            <p class="section-sub">
              Desde la primera idea hasta el último gasto, TripSync mantiene a todo el grupo
              mirando la misma página.
            </p>
          </div>

          <div class="grid">
            @for (feature of features; track feature.title) {
              <article class="card">
                <span class="card-icon">{{ feature.icon }}</span>
                <h3 class="card-title">{{ feature.title }}</h3>
                <p class="card-text">{{ feature.text }}</p>
              </article>
            }
          </div>
        </div>
      </section>

      <!-- Cómo funciona -->
      <section id="como-funciona" class="section section-alt">
        <div class="section-inner">
          <div class="section-head">
            <span class="eyebrow">Cómo funciona</span>
            <h2 class="section-title">De la idea al itinerario en tres pasos</h2>
          </div>

          <div class="steps">
            @for (step of steps; track step.number) {
              <div class="step">
                <span class="step-num">{{ step.number }}</span>
                <h3 class="card-title">{{ step.title }}</h3>
                <p class="card-text">{{ step.text }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- CTA final -->
      <section class="cta">
        <div class="cta-inner">
          <h2 class="cta-title">¿Listos para el próximo viaje?</h2>
          <p class="cta-sub">
            Creá tu cuenta y armá el primer itinerario en minutos. Invitá a tu grupo cuando quieras.
          </p>
          @if (isAuthenticated()) {
            <a routerLink="/trips" class="btn btn-invert btn-lg">Ir a mis viajes</a>
          } @else {
            <a routerLink="/register" class="btn btn-invert btn-lg">Crear mi cuenta gratis</a>
          }
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <div class="footer-inner">
          <a routerLink="/" class="logo">
            <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="18" fill="#fff3e8" />
              <path d="M18 8 L26 14 L26 22 C26 25 23 28 18 30 C13 28 10 25 10 22 L10 14 Z" fill="#f97316" opacity="0.9" />
              <circle cx="18" cy="19" r="4" fill="white" />
            </svg>
            <span class="logo-text footer-logo-text">TripSync</span>
          </a>
          <span class="footer-note">Planificá viajes en equipo, sin caos.</span>
        </div>
      </footer>
    </div>
  `,
  styles: [
    `
      :host { display: block; font-family: 'Outfit', sans-serif; }
      .landing { background: #f8fafc; color: #0f172a; overflow-x: hidden; }
      a { text-decoration: none; }

      /* Navbar */
      .nav {
        position: sticky; top: 0; z-index: 30; height: 64px;
        background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px);
        border-bottom: 1px solid #e2e8f0;
      }
      .nav-inner {
        max-width: 1140px; margin: 0 auto; height: 100%; padding: 0 24px;
        display: flex; align-items: center; justify-content: space-between; gap: 16px;
      }
      .logo { display: flex; align-items: center; gap: 9px; }
      .logo-text { font-size: 19px; font-weight: 700; letter-spacing: -0.3px; color: #0f172a; }
      .footer-logo-text { font-size: 16px; }
      .nav-links { display: flex; align-items: center; gap: 4px; }
      .nav-link { font-size: 14px; font-weight: 500; color: #64748b; padding: 7px 14px; border-radius: 8px; }
      .nav-link:hover { color: #0f172a; background: #f1f5f9; }
      .nav-actions { display: flex; align-items: center; gap: 8px; }

      /* Botones */
      .btn {
        display: inline-flex; align-items: center; justify-content: center;
        border-radius: 50px; font-weight: 600; white-space: nowrap; border: 1.5px solid transparent;
      }
      .btn-sm { padding: 8px 18px; font-size: 14px; }
      .btn-lg { padding: 14px 30px; font-size: 16px; }
      .btn-primary { background: #f97316; color: #fff; box-shadow: 0 12px 32px -12px rgba(249, 115, 22, 0.35); }
      .btn-primary:hover { background: #ea580c; transform: translateY(-1px); }
      .btn-ghost { background: #fff; color: #0f172a; border-color: #e2e8f0; }
      .btn-ghost:hover { border-color: #f97316; color: #ea580c; }
      .btn-invert { background: #fff; color: #ea580c; }
      .btn-invert:hover { transform: translateY(-1px); box-shadow: 0 12px 32px -12px rgba(0, 0, 0, 0.3); }

      /* Hero */
      .hero { position: relative; padding: 88px 24px 96px; }
      .hero-glow {
        position: absolute; top: -180px; left: 50%; transform: translateX(-50%);
        width: 900px; height: 500px; pointer-events: none;
        background: radial-gradient(ellipse at center, rgba(249, 115, 22, 0.13), transparent 68%);
      }
      .hero-inner {
        position: relative; max-width: 1140px; margin: 0 auto;
        display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center;
      }
      .badge {
        display: inline-flex; align-items: center; gap: 8px; margin-bottom: 22px;
        padding: 6px 14px 6px 10px; border-radius: 50px;
        background: #fff7ed; border: 1px solid #fed7aa;
        font-size: 13px; font-weight: 500; color: #9a3412;
      }
      .badge-dot {
        width: 7px; height: 7px; border-radius: 50%; background: #f97316;
        animation: pulse-soft 1.8s ease-in-out infinite;
      }
      .hero-title { font-size: 54px; line-height: 1.08; font-weight: 800; letter-spacing: -1.6px; margin: 0 0 22px; }
      .accent {
        background: linear-gradient(120deg, #f97316, #ea580c);
        -webkit-background-clip: text; background-clip: text; color: transparent;
      }
      .hero-sub { font-size: 18px; line-height: 1.65; color: #64748b; margin: 0 0 32px; max-width: 520px; }
      .hero-cta { display: flex; flex-wrap: wrap; gap: 12px; }
      .hero-note { margin: 18px 0 0; font-size: 13px; color: #94a3b8; }

      /* Mockup */
      .hero-visual { position: relative; }
      .mock {
        background: #fff; border: 1.5px solid #e2e8f0; border-radius: 20px;
        box-shadow: 0 24px 60px -24px rgba(15, 23, 42, 0.22); overflow: hidden;
      }
      .mock-bar {
        display: flex; align-items: center; gap: 6px;
        padding: 12px 16px; border-bottom: 1px solid #f1f5f9; background: #fcfcfd;
      }
      .dot { width: 9px; height: 9px; border-radius: 50%; }
      .dot-r { background: #fca5a5; }
      .dot-y { background: #fcd34d; }
      .dot-g { background: #86efac; }
      .mock-title { margin-left: 10px; font-size: 13px; font-weight: 600; color: #64748b; }
      .mock-body { padding: 18px; display: flex; flex-direction: column; gap: 10px; }
      .mock-day {
        font-size: 12px; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.6px; color: #f97316;
      }
      .mock-item {
        display: flex; align-items: center; gap: 12px;
        padding: 12px 14px; border: 1.5px solid #e2e8f0; border-radius: 12px; background: #fff;
      }
      .mock-item.ghost { border-style: dashed; background: #fff7ed; border-color: #fdba74; opacity: 0.85; }
      .mock-check {
        width: 20px; height: 20px; border-radius: 6px; border: 1.5px solid #cbd5e1; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center; font-size: 12px; color: #fff;
      }
      .mock-check.done { background: #f97316; border-color: #f97316; }
      .mock-item-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
      .mock-item-title { font-size: 14px; font-weight: 600; color: #0f172a; }
      .mock-item-meta { font-size: 12px; color: #94a3b8; }
      .mock-price { margin-left: auto; font-size: 13px; font-weight: 700; color: #ea580c; }
      .mock-foot {
        display: flex; align-items: center; justify-content: space-between;
        margin-top: 4px; padding-top: 14px; border-top: 1px solid #f1f5f9;
      }
      .mock-avatars { display: flex; }
      .av {
        width: 28px; height: 28px; border-radius: 50%; border: 2px solid #fff; margin-right: -8px;
        display: flex; align-items: center; justify-content: center;
        font-size: 11px; font-weight: 700; color: #fff;
      }
      .av-1 { background: #f97316; }
      .av-2 { background: #0ea5e9; }
      .av-3 { background: #8b5cf6; }
      .av-more { background: #e2e8f0; color: #64748b; }
      .mock-split { font-size: 12px; font-weight: 600; color: #64748b; }

      .float-card {
        position: absolute; display: flex; align-items: center; gap: 10px;
        padding: 11px 15px; background: #fff; border: 1.5px solid #e2e8f0;
        border-radius: 14px; box-shadow: 0 12px 32px -12px rgba(15, 23, 42, 0.25);
      }
      .float-card-map { top: -22px; right: -14px; }
      .float-card-live { bottom: -22px; left: -18px; }
      .fc-icon { font-size: 18px; }
      .fc-title { font-size: 13px; font-weight: 700; color: #0f172a; }
      .fc-sub { font-size: 11px; color: #94a3b8; }
      .live-dot {
        width: 8px; height: 8px; border-radius: 50%; background: #22c55e;
        box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.18);
        animation: pulse-soft 1.8s ease-in-out infinite;
      }

      /* Secciones */
      .section { padding: 88px 24px; }
      .section-alt { background: #fff; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
      .section-inner { max-width: 1140px; margin: 0 auto; }
      .section-head { max-width: 620px; margin: 0 auto 52px; text-align: center; }
      .eyebrow {
        display: inline-block; margin-bottom: 14px; font-size: 13px; font-weight: 700;
        text-transform: uppercase; letter-spacing: 1px; color: #f97316;
      }
      .section-title { font-size: 38px; line-height: 1.18; font-weight: 800; letter-spacing: -1px; margin: 0 0 14px; }
      .section-sub { font-size: 17px; line-height: 1.6; color: #64748b; margin: 0; }

      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
      .card {
        background: #fff; border: 1.5px solid #e2e8f0; border-radius: 18px; padding: 28px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
        transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 220ms, border-color 220ms;
      }
      .section-alt .card { background: #f8fafc; }
      .card:hover { transform: translateY(-3px); border-color: #fdba74; box-shadow: 0 8px 28px rgba(0, 0, 0, 0.1); }
      .card-icon {
        display: flex; align-items: center; justify-content: center;
        width: 46px; height: 46px; margin-bottom: 18px; border-radius: 13px;
        background: #fff7ed; border: 1px solid #fed7aa; font-size: 22px;
      }
      .card-title { font-size: 17px; font-weight: 700; margin: 0 0 8px; letter-spacing: -0.2px; }
      .card-text { font-size: 14.5px; line-height: 1.65; color: #64748b; margin: 0; }

      .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
      .step { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 18px; padding: 28px; }
      .step-num {
        display: flex; align-items: center; justify-content: center;
        width: 38px; height: 38px; margin-bottom: 18px; border-radius: 50%;
        background: linear-gradient(135deg, #f97316, #ea580c);
        color: #fff; font-size: 15px; font-weight: 700;
      }

      /* CTA */
      .cta { padding: 24px; }
      .cta-inner {
        max-width: 1140px; margin: 0 auto; padding: 72px 32px; text-align: center;
        border-radius: 28px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
        box-shadow: 0 24px 60px -28px rgba(234, 88, 12, 0.6);
      }
      .cta-title { font-size: 36px; font-weight: 800; letter-spacing: -0.9px; color: #fff; margin: 0 0 14px; }
      .cta-sub {
        font-size: 17px; line-height: 1.6; color: rgba(255, 255, 255, 0.92);
        margin: 0 auto 30px; max-width: 480px;
      }

      /* Footer */
      .footer { padding: 36px 24px 48px; }
      .footer-inner {
        max-width: 1140px; margin: 0 auto; padding-top: 28px; border-top: 1px solid #e2e8f0;
        display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
      }
      .footer-note { font-size: 13.5px; color: #94a3b8; }

      /* Responsive */
      @media (max-width: 980px) {
        .hero-inner { grid-template-columns: 1fr; gap: 64px; }
        .hero-title { font-size: 42px; letter-spacing: -1.2px; }
        .hero-sub { font-size: 17px; }
        .grid, .steps { grid-template-columns: repeat(2, 1fr); }
        .nav-links { display: none; }
      }
      @media (max-width: 640px) {
        .hero { padding: 56px 20px 72px; }
        .hero-title { font-size: 34px; letter-spacing: -0.9px; }
        .section { padding: 64px 20px; }
        .section-title { font-size: 29px; }
        .grid, .steps { grid-template-columns: 1fr; }
        .cta-inner { padding: 52px 24px; border-radius: 22px; }
        .cta-title { font-size: 28px; }
        .float-card-map { top: -16px; right: 0; }
        .float-card-live { bottom: -16px; left: 0; }
        .btn-lg { padding: 13px 24px; font-size: 15px; }
        .hero-cta .btn { flex: 1 1 100%; }
      }
    `,
  ],
})
export class LandingPage {
  private readonly auth = inject(AuthService);

  protected readonly isAuthenticated = this.auth.isAuthenticated;

  protected readonly features: Feature[] = [
    {
      icon: '🗓️',
      title: 'Itinerario día por día',
      text: 'Creá un día por cada fecha del viaje y sumá actividades con descripción, ubicación y enlaces. Arrastrá para reordenar y marcá lo que ya está hecho.',
    },
    {
      icon: '🗺️',
      title: 'Mapa interactivo',
      text: 'Buscá lugares por nombre y quedan geolocalizados. Todas las actividades del viaje se ven juntas en el mapa para entender cómo se conecta cada día.',
    },
    {
      icon: '⚡',
      title: 'Sincronizado en tiempo real',
      text: 'Si alguien agrega, edita o reordena una actividad, el resto lo ve al instante. Sin recargar y sin versiones distintas del mismo plan.',
    },
    {
      icon: '💸',
      title: 'Gastos compartidos',
      text: 'Poné precio a cada actividad y elegí cómo se reparte: en partes iguales, entre personas concretas o por persona. TripSync calcula cuánto paga cada uno.',
    },
    {
      icon: '👥',
      title: 'Invitá a tu grupo',
      text: 'Sumá gente por email con permisos de edición o de solo lectura. Si todavía no tiene cuenta, queda invitada y entra al viaje al registrarse.',
    },
    {
      icon: '🎨',
      title: 'Cada viaje, con su cara',
      text: 'Ponele una portada y elegí la tipografía del viaje. Una escapada de fin de semana y una vuelta al mundo no tienen por qué verse igual.',
    },
  ];

  protected readonly steps: Step[] = [
    {
      number: '1',
      title: 'Creá el viaje',
      text: 'Ponele nombre y fechas. TripSync arma la estructura de días lista para completar.',
    },
    {
      number: '2',
      title: 'Sumá lugares y actividades',
      text: 'Buscá cada lugar, agregalo al día que corresponde y ordenalo como quieras.',
    },
    {
      number: '3',
      title: 'Invitá y repartí gastos',
      text: 'Sumá a tu grupo, planifiquen juntos en tiempo real y mirá cuánto pone cada uno.',
    },
  ];
}
