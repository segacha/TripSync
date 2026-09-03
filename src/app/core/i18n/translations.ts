/**
 * Diccionario de traducciones de TripSync.
 *
 * `es` es la fuente de verdad: define las claves disponibles y `en` está
 * tipado contra ella, así que si falta una traducción el build falla.
 * Los placeholders se escriben como {nombre} y los resuelve I18nService.
 */
export const es = {
  // Común
  'common.cancel': 'Cancelar',
  'common.save': 'Guardar',
  'common.saving': 'Guardando...',
  'common.loading': 'Cargando...',
  'common.add': 'Añadir',
  'common.edit': 'Editar',
  'common.delete': 'Eliminar',
  'common.unknownError': 'Error desconocido',
  'common.activities.one': '{count} actividad',
  'common.activities.other': '{count} actividades',
  'common.days.one': '{count} día',
  'common.days.other': '{count} días',

  // Metadatos del documento
  'meta.title': 'TripSync — Planifica viajes en equipo',

  // Selector de idioma
  'lang.switchTo.es': 'Cambiar a español',
  'lang.switchTo.en': 'Cambiar a inglés',
  'lang.label': 'Idioma',

  // Navegación
  'nav.features': 'Funciones',
  'nav.howItWorks': 'Cómo funciona',
  'nav.goToTrips': 'Ir a mis viajes',
  'nav.login': 'Iniciar sesión',
  'nav.register': 'Crear cuenta',
  'nav.myTrips': 'Mis viajes',

  // Landing · hero
  'landing.hero.badge': 'Planificación colaborativa en tiempo real',
  'landing.hero.titleLine1': 'Planificá viajes en grupo',
  'landing.hero.titleLine2': 'sin perder el hilo.',
  'landing.hero.sub':
    'Armá el itinerario día por día, ubicá cada actividad en el mapa, invitá a tus compañeros de viaje y dividí los gastos automáticamente. Todo en un solo lugar, sincronizado al instante para todo el grupo.',
  'landing.hero.ctaStart': 'Empezar gratis',
  'landing.hero.ctaHaveAccount': 'Ya tengo cuenta',
  'landing.hero.note': 'Gratis · Sin tarjeta de crédito',

  // Landing · mockup
  'landing.mock.tripTitle': 'Europa 2026',
  'landing.mock.day': 'Día 3 · Roma',
  'landing.mock.item1': 'Coliseo Romano',
  'landing.mock.item1Meta': 'Piazza del Colosseo',
  'landing.mock.item2': 'Trastevere',
  'landing.mock.item2Meta': 'Cena en grupo',
  'landing.mock.item3': 'Fontana di Trevi',
  'landing.mock.item3Meta': 'Arrastrá para reordenar',
  'landing.mock.split': '€21 c/u',
  'landing.mock.placesTitle': '3 lugares',
  'landing.mock.placesSub': 'en el mapa',
  'landing.mock.liveTitle': 'Julia editando',
  'landing.mock.liveSub': 'en vivo',

  // Landing · funciones
  'landing.features.eyebrow': 'Todo lo que podés hacer',
  'landing.features.titleLine1': 'Un viaje tiene mil detalles.',
  'landing.features.titleLine2': 'Acá entran todos.',
  'landing.features.sub':
    'Desde la primera idea hasta el último gasto, TripSync mantiene a todo el grupo mirando la misma página.',
  'landing.feature1.title': 'Itinerario día por día',
  'landing.feature1.text':
    'Creá un día por cada fecha del viaje y sumá actividades con descripción, ubicación y enlaces. Arrastrá para reordenar y marcá lo que ya está hecho.',
  'landing.feature2.title': 'Mapa interactivo',
  'landing.feature2.text':
    'Buscá lugares por nombre y quedan geolocalizados. Todas las actividades del viaje se ven juntas en el mapa para entender cómo se conecta cada día.',
  'landing.feature3.title': 'Sincronizado en tiempo real',
  'landing.feature3.text':
    'Si alguien agrega, edita o reordena una actividad, el resto lo ve al instante. Sin recargar y sin versiones distintas del mismo plan.',
  'landing.feature4.title': 'Gastos compartidos',
  'landing.feature4.text':
    'Poné precio a cada actividad y elegí cómo se reparte: en partes iguales, entre personas concretas o por persona. TripSync calcula cuánto paga cada uno.',
  'landing.feature5.title': 'Invitá a tu grupo',
  'landing.feature5.text':
    'Sumá gente por email con permisos de edición o de solo lectura. Si todavía no tiene cuenta, queda invitada y entra al viaje al registrarse.',
  'landing.feature6.title': 'Cada viaje, con su cara',
  'landing.feature6.text':
    'Ponele una portada y elegí la tipografía del viaje. Una escapada de fin de semana y una vuelta al mundo no tienen por qué verse igual.',

  // Landing · cómo funciona
  'landing.steps.eyebrow': 'Cómo funciona',
  'landing.steps.title': 'De la idea al itinerario en tres pasos',
  'landing.step1.title': 'Creá el viaje',
  'landing.step1.text':
    'Ponele nombre y fechas. TripSync arma la estructura de días lista para completar.',
  'landing.step2.title': 'Sumá lugares y actividades',
  'landing.step2.text':
    'Buscá cada lugar, agregalo al día que corresponde y ordenalo como quieras.',
  'landing.step3.title': 'Invitá y repartí gastos',
  'landing.step3.text':
    'Sumá a tu grupo, planifiquen juntos en tiempo real y mirá cuánto pone cada uno.',

  // Landing · CTA + footer
  'landing.cta.title': '¿Listos para el próximo viaje?',
  'landing.cta.sub':
    'Creá tu cuenta y armá el primer itinerario en minutos. Invitá a tu grupo cuando quieras.',
  'landing.cta.button': 'Crear mi cuenta gratis',
  'landing.footer.note': 'Planificá viajes en equipo, sin caos.',

  // Auth · común
  'auth.email': 'Email',
  'auth.password': 'Contraseña',
  'auth.emailPlaceholder': 'tu@email.com',

  // Auth · login
  'login.brandTitle': 'Planifica viajes, a tu manera.',
  'login.brandPoint1': 'Itinerarios día por día',
  'login.brandPoint2': 'Mapa interactivo en tiempo real',
  'login.brandPoint3': 'Colaboración con amigos',
  'login.title': 'Bienvenido',
  'login.subtitle': 'Ingresá a tu cuenta para continuar',
  'login.submit': 'Entrar',
  'login.submitting': 'Entrando...',
  'login.noAccount': '¿No tenés cuenta?',
  'login.registerLink': 'Registrate',

  // Auth · registro
  'register.brandTitle': 'Tu próxima aventura empieza aquí.',
  'register.brandPoint1': 'Organizá cada detalle del viaje',
  'register.brandPoint2': 'Guardá tus lugares favoritos',
  'register.brandPoint3': 'Viajá en equipo, sin complicaciones',
  'register.title': 'Crear cuenta',
  'register.subtitle': 'Empezá a planificar tus viajes hoy',
  'register.passwordPlaceholder': 'Mínimo 6 caracteres',
  'register.submit': 'Crear cuenta',
  'register.submitting': 'Creando...',
  'register.haveAccount': '¿Ya tenés cuenta?',
  'register.loginLink': 'Iniciá sesión',
  'register.confirmEmail':
    'Cuenta creada. Revisá tu email para confirmarla y luego iniciá sesión.',
  'register.alreadyRegistered':
    'Ese email ya tiene una cuenta. Probá iniciar sesión.',
  'register.noEmailHint': '¿No te llegó el mail?',
  'register.resend': 'Reenviar',
  'register.resending': 'Reenviando...',
  'register.resent': 'Listo, te reenviamos el email de confirmación.',

  // Shell
  'shell.yourAccount': 'Tu cuenta',
  'shell.changeAvatar': 'Cambiar foto de perfil',
  'shell.uploading': 'Subiendo...',
  'shell.avatarFormats': 'JPG, PNG o GIF',
  'shell.logout': 'Cerrar sesión',

  // Lista de viajes
  'trips.title': 'Mis viajes',
  'trips.subtitle': 'Organizá y planificá tus próximas aventuras',
  'trips.new': 'Nuevo viaje',
  'trips.form.titleLabel': 'Título del viaje *',
  'trips.form.titlePlaceholder': 'Ej: Europa 2025',
  'trips.form.descriptionLabel': 'Descripción (opcional)',
  'trips.form.descriptionPlaceholder': 'Añadí una breve descripción...',
  'trips.form.submit': 'Crear viaje',
  'trips.form.submitting': 'Creando...',
  'trips.created': 'Viaje creado con éxito',
  'trips.empty.title': 'Aún no tenés viajes',
  'trips.empty.text': 'Creá tu primer viaje y empezá a planificar tu aventura',
  'trips.empty.cta': '+ Crear mi primer viaje',
  'trips.card.badge': 'Viaje',
  'trips.card.open': 'Abrir',

  // Detalle del viaje
  'trip.back': 'Mis viajes',
  'trip.cover.add': 'Añadir portada',
  'trip.cover.change': 'Cambiar portada',
  'trip.cover.uploading': 'Subiendo...',
  'trip.dates.edit': 'Editar fechas',
  'trip.dates.title': 'Fechas del viaje',
  'trip.dates.error': 'Error guardando fechas',
  'trip.cover.error': 'Error subiendo imagen',
  'trip.notFound': 'Viaje no encontrado.',
  'trip.itinerary.title': 'Itinerario',
  'trip.itinerary.subtitle': 'Organizá tus actividades día a día',
  'trip.itinerary.loading': 'Cargando itinerario...',
  'trip.addDay': '+ Añadir día',
  'trip.addDay.label': 'Fecha del día',
  'trip.days.empty1': 'No hay días en el itinerario aún.',
  'trip.days.empty2': 'Añadí el primer día para empezar.',

  // Tarjeta de día
  'day.noActivities': 'Sin actividades',
  'day.noActivitiesYet': 'Sin actividades aún',
  'day.deleteDay': 'Eliminar día',
  'day.deleteDayConfirm': 'Eliminar este día borrará todas sus actividades. ¿Continuar?',
  'day.deleteActivityConfirm': '¿Eliminar "{title}"?',
  'day.newActivity': '+ Nueva actividad...',
  'day.moreDetails': '+ Más detalles',
  'day.lessDetails': '− Menos detalles',
  'day.activityTitle': 'Título de la actividad',
  'day.location': 'Ubicación (opcional)',
  'day.descriptionShort': 'Descripción breve (opcional)',
  'day.description': 'Descripción (opcional)',
  'day.link': 'Enlace externo (opcional, https://...)',
  'day.price': 'Precio (opcional, ej: 25.50)',
  'day.openLink': 'Abrir enlace externo',
  'day.viewOnMaps': 'Ver en Google Maps',
  'day.distribution.placeholder': 'Selecciona cómo repartir el precio',
  'day.distribution.equal': 'Partes iguales entre todos',
  'day.distribution.assigned': 'Asignado a miembros específicos',
  'day.distribution.perPerson': 'Cada persona paga el precio completo',

  // Buscador de lugares
  'place.placeholder': 'Buscar lugar',
  'place.searching': 'Buscando...',
  'place.error': 'Error de búsqueda',

  // Mapa
  'map.title': 'Mapa del viaje',
  'map.emptyHint': 'Añadí actividades con ubicación para verlas aquí',
  'map.dayShort': 'Día {number}',

  // Miembros
  'members.title': 'Miembros',
  'members.you': '(vos)',
  'members.role.owner': 'Dueño',
  'members.role.editor': 'Editor',
  'members.role.viewer': 'Lector',
  'members.pendingTitle': 'Invitaciones pendientes',
  'members.pendingBadge': 'Pendiente',
  'members.inviteTitle': 'Invitar alguien',
  'members.invitePlaceholder': 'email@ejemplo.com',
  'members.invite': 'Invitar',
  'members.inviting': 'Invitando...',
  'members.remove': 'Quitar miembro',
  'members.removeConfirm': '¿Quitar a {email} del viaje?',
  'members.cancelInviteConfirm': '¿Cancelar invitación a {email}?',
  'members.addedNotice': '{email} ya tenía cuenta — añadido como {role}.',
  'members.invitedNotice': 'Invitación pendiente enviada a {email}.',

  // Costos
  'cost.title': 'Costos del viaje',
  'cost.none': 'Sin costos registrados',
  'cost.yourTotal': 'Tu total: €{amount}',
  'cost.noneForYou': 'No hay costo asignado para vos',
  'cost.emptyState': 'No hay costos registrados en este viaje aún.',
  'cost.breakdown': 'Desglose',
  'cost.fullPrice': 'Precio completo',
  'cost.dividedBy': '€{amount} ÷ personas',
  'cost.totalForMe': 'Total para mí',
  'cost.noCostAssigned': 'Sin costo asignado',
} as const;

export type TranslationKey = keyof typeof es;

export const en: Record<TranslationKey, string> = {
  // Common
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.saving': 'Saving...',
  'common.loading': 'Loading...',
  'common.add': 'Add',
  'common.edit': 'Edit',
  'common.delete': 'Delete',
  'common.unknownError': 'Unknown error',
  'common.activities.one': '{count} activity',
  'common.activities.other': '{count} activities',
  'common.days.one': '{count} day',
  'common.days.other': '{count} days',

  // Document metadata
  'meta.title': 'TripSync — Plan trips as a team',

  // Language switch
  'lang.switchTo.es': 'Switch to Spanish',
  'lang.switchTo.en': 'Switch to English',
  'lang.label': 'Language',

  // Navigation
  'nav.features': 'Features',
  'nav.howItWorks': 'How it works',
  'nav.goToTrips': 'Go to my trips',
  'nav.login': 'Log in',
  'nav.register': 'Sign up',
  'nav.myTrips': 'My trips',

  // Landing · hero
  'landing.hero.badge': 'Real-time collaborative planning',
  'landing.hero.titleLine1': 'Plan group trips',
  'landing.hero.titleLine2': 'without losing track.',
  'landing.hero.sub':
    'Build the itinerary day by day, pin every activity on the map, invite your travel companions and split the costs automatically. All in one place, synced instantly for the whole group.',
  'landing.hero.ctaStart': 'Start for free',
  'landing.hero.ctaHaveAccount': 'I already have an account',
  'landing.hero.note': 'Free · No credit card',

  // Landing · mockup
  'landing.mock.tripTitle': 'Europe 2026',
  'landing.mock.day': 'Day 3 · Rome',
  'landing.mock.item1': 'Roman Colosseum',
  'landing.mock.item1Meta': 'Piazza del Colosseo',
  'landing.mock.item2': 'Trastevere',
  'landing.mock.item2Meta': 'Group dinner',
  'landing.mock.item3': 'Fontana di Trevi',
  'landing.mock.item3Meta': 'Drag to reorder',
  'landing.mock.split': '€21 each',
  'landing.mock.placesTitle': '3 places',
  'landing.mock.placesSub': 'on the map',
  'landing.mock.liveTitle': 'Julia is editing',
  'landing.mock.liveSub': 'live',

  // Landing · features
  'landing.features.eyebrow': 'Everything you can do',
  'landing.features.titleLine1': 'A trip has a thousand details.',
  'landing.features.titleLine2': 'They all fit in here.',
  'landing.features.sub':
    'From the first idea to the last expense, TripSync keeps the whole group looking at the same page.',
  'landing.feature1.title': 'Day-by-day itinerary',
  'landing.feature1.text':
    'Create a day for every date of the trip and add activities with a description, location and links. Drag to reorder and check off whatever is already done.',
  'landing.feature2.title': 'Interactive map',
  'landing.feature2.text':
    'Search places by name and they get geolocated automatically. Every activity of the trip shows up together on the map, so you can see how each day connects.',
  'landing.feature3.title': 'Synced in real time',
  'landing.feature3.text':
    'When someone adds, edits or reorders an activity, everyone else sees it instantly. No reloading, and no competing versions of the same plan.',
  'landing.feature4.title': 'Shared expenses',
  'landing.feature4.text':
    'Put a price on each activity and choose how it is split: evenly, between specific people, or per person. TripSync works out what everyone pays.',
  'landing.feature5.title': 'Invite your group',
  'landing.feature5.text':
    'Add people by email with edit or view-only permissions. If they do not have an account yet, the invite waits for them and they join the trip when they sign up.',
  'landing.feature6.title': 'Every trip, its own look',
  'landing.feature6.text':
    'Give it a cover photo and pick the typography for the trip. A weekend getaway and a trip around the world do not have to look the same.',

  // Landing · how it works
  'landing.steps.eyebrow': 'How it works',
  'landing.steps.title': 'From idea to itinerary in three steps',
  'landing.step1.title': 'Create the trip',
  'landing.step1.text':
    'Give it a name and dates. TripSync sets up the day structure, ready to fill in.',
  'landing.step2.title': 'Add places and activities',
  'landing.step2.text':
    'Search each place, add it to the right day and order it however you like.',
  'landing.step3.title': 'Invite people and split costs',
  'landing.step3.text':
    'Add your group, plan together in real time and see how much each person pays.',

  // Landing · CTA + footer
  'landing.cta.title': 'Ready for the next trip?',
  'landing.cta.sub':
    'Create your account and build the first itinerary in minutes. Invite your group whenever you want.',
  'landing.cta.button': 'Create my free account',
  'landing.footer.note': 'Plan trips as a team, without the chaos.',

  // Auth · shared
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.emailPlaceholder': 'you@email.com',

  // Auth · login
  'login.brandTitle': 'Plan trips, your way.',
  'login.brandPoint1': 'Day-by-day itineraries',
  'login.brandPoint2': 'Interactive real-time map',
  'login.brandPoint3': 'Collaborate with friends',
  'login.title': 'Welcome back',
  'login.subtitle': 'Sign in to your account to continue',
  'login.submit': 'Sign in',
  'login.submitting': 'Signing in...',
  'login.noAccount': 'No account yet?',
  'login.registerLink': 'Sign up',

  // Auth · register
  'register.brandTitle': 'Your next adventure starts here.',
  'register.brandPoint1': 'Organise every detail of the trip',
  'register.brandPoint2': 'Save your favourite places',
  'register.brandPoint3': 'Travel as a team, without the hassle',
  'register.title': 'Create account',
  'register.subtitle': 'Start planning your trips today',
  'register.passwordPlaceholder': 'At least 6 characters',
  'register.submit': 'Create account',
  'register.submitting': 'Creating...',
  'register.haveAccount': 'Already have an account?',
  'register.loginLink': 'Sign in',
  'register.confirmEmail':
    'Account created. Check your email to confirm it, then sign in.',
  'register.alreadyRegistered':
    'That email already has an account. Try signing in instead.',
  'register.noEmailHint': "Didn't get the email?",
  'register.resend': 'Resend',
  'register.resending': 'Resending...',
  'register.resent': 'Done, we sent the confirmation email again.',

  // Shell
  'shell.yourAccount': 'Your account',
  'shell.changeAvatar': 'Change profile picture',
  'shell.uploading': 'Uploading...',
  'shell.avatarFormats': 'JPG, PNG or GIF',
  'shell.logout': 'Log out',

  // Trips list
  'trips.title': 'My trips',
  'trips.subtitle': 'Organise and plan your next adventures',
  'trips.new': 'New trip',
  'trips.form.titleLabel': 'Trip title *',
  'trips.form.titlePlaceholder': 'e.g. Europe 2025',
  'trips.form.descriptionLabel': 'Description (optional)',
  'trips.form.descriptionPlaceholder': 'Add a short description...',
  'trips.form.submit': 'Create trip',
  'trips.form.submitting': 'Creating...',
  'trips.created': 'Trip created successfully',
  'trips.empty.title': 'No trips yet',
  'trips.empty.text': 'Create your first trip and start planning your adventure',
  'trips.empty.cta': '+ Create my first trip',
  'trips.card.badge': 'Trip',
  'trips.card.open': 'Open',

  // Trip detail
  'trip.back': 'My trips',
  'trip.cover.add': 'Add cover',
  'trip.cover.change': 'Change cover',
  'trip.cover.uploading': 'Uploading...',
  'trip.dates.edit': 'Edit dates',
  'trip.dates.title': 'Trip dates',
  'trip.dates.error': 'Error saving dates',
  'trip.cover.error': 'Error uploading image',
  'trip.notFound': 'Trip not found.',
  'trip.itinerary.title': 'Itinerary',
  'trip.itinerary.subtitle': 'Organise your activities day by day',
  'trip.itinerary.loading': 'Loading itinerary...',
  'trip.addDay': '+ Add day',
  'trip.addDay.label': 'Day date',
  'trip.days.empty1': 'No days in the itinerary yet.',
  'trip.days.empty2': 'Add the first day to get started.',

  // Day card
  'day.noActivities': 'No activities',
  'day.noActivitiesYet': 'No activities yet',
  'day.deleteDay': 'Delete day',
  'day.deleteDayConfirm': 'Deleting this day will remove all of its activities. Continue?',
  'day.deleteActivityConfirm': 'Delete "{title}"?',
  'day.newActivity': '+ New activity...',
  'day.moreDetails': '+ More details',
  'day.lessDetails': '− Fewer details',
  'day.activityTitle': 'Activity title',
  'day.location': 'Location (optional)',
  'day.descriptionShort': 'Short description (optional)',
  'day.description': 'Description (optional)',
  'day.link': 'External link (optional, https://...)',
  'day.price': 'Price (optional, e.g. 25.50)',
  'day.openLink': 'Open external link',
  'day.viewOnMaps': 'View on Google Maps',
  'day.distribution.placeholder': 'Choose how to split the price',
  'day.distribution.equal': 'Split evenly between everyone',
  'day.distribution.assigned': 'Assigned to specific members',
  'day.distribution.perPerson': 'Each person pays the full price',

  // Place search
  'place.placeholder': 'Search place',
  'place.searching': 'Searching...',
  'place.error': 'Search error',

  // Map
  'map.title': 'Trip map',
  'map.emptyHint': 'Add activities with a location to see them here',
  'map.dayShort': 'Day {number}',

  // Members
  'members.title': 'Members',
  'members.you': '(you)',
  'members.role.owner': 'Owner',
  'members.role.editor': 'Editor',
  'members.role.viewer': 'Viewer',
  'members.pendingTitle': 'Pending invitations',
  'members.pendingBadge': 'Pending',
  'members.inviteTitle': 'Invite someone',
  'members.invitePlaceholder': 'email@example.com',
  'members.invite': 'Invite',
  'members.inviting': 'Inviting...',
  'members.remove': 'Remove member',
  'members.removeConfirm': 'Remove {email} from the trip?',
  'members.cancelInviteConfirm': 'Cancel the invitation to {email}?',
  'members.addedNotice': '{email} already had an account — added as {role}.',
  'members.invitedNotice': 'Pending invitation sent to {email}.',

  // Costs
  'cost.title': 'Trip costs',
  'cost.none': 'No costs recorded',
  'cost.yourTotal': 'Your total: €{amount}',
  'cost.noneForYou': 'No cost assigned to you',
  'cost.emptyState': 'No costs recorded for this trip yet.',
  'cost.breakdown': 'Breakdown',
  'cost.fullPrice': 'Full price',
  'cost.dividedBy': '€{amount} ÷ people',
  'cost.totalForMe': 'Total for me',
  'cost.noCostAssigned': 'No cost assigned',
};

export const TRANSLATIONS = { es, en } as const;
