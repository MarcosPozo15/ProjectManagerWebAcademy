import { PrismaClient, LessonDifficulty, QuestionType } from "@prisma/client";
import { randomBytes, scryptSync } from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const derivedKey = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

async function main() {
  await prisma.user.updateMany({ data: { role: "USER" } });
  await prisma.user.upsert({
    where: { email: "marcospoxo15@gmail.com" },
    update: {
      role: "ADMIN",
      name: "Marcos",
      passwordHash: hashPassword("pmwa12345"),
      isActive: true,
    },
    create: {
      email: "marcospoxo15@gmail.com",
      name: "Marcos",
      role: "ADMIN",
      passwordHash: hashPassword("pmwa12345"),
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "profesor@pmwa.local" },
    update: {
      role: "PROFESSOR",
      name: "Profesor",
      passwordHash: hashPassword("pmwa12345"),
      isActive: true,
    },
    create: {
      email: "profesor@pmwa.local",
      name: "Profesor",
      role: "PROFESSOR",
      passwordHash: hashPassword("pmwa12345"),
      isActive: true,
    },
  });

  const professor = await prisma.user.findUnique({
    where: { email: "profesor@pmwa.local" },
    select: { id: true },
  });

  const students = [
    { email: "alumno1@pmwa.local", name: "Alumno 1" },
    { email: "alumno2@pmwa.local", name: "Alumno 2" },
    { email: "alumno3@pmwa.local", name: "Alumno 3" },
  ];

  for (const s of students) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: {
        role: "USER",
        name: s.name,
        passwordHash: hashPassword("pmwa12345"),
        isActive: true,
      },
      create: {
        email: s.email,
        name: s.name,
        role: "USER",
        passwordHash: hashPassword("pmwa12345"),
        isActive: true,
      },
    });
  }

  if (professor) {
    const studentRows = await prisma.user.findMany({
      where: { email: { in: students.map((s) => s.email) } },
      select: { id: true },
    });
    for (const st of studentRows) {
      await prisma.teacherStudentAssignment.upsert({
        where: { studentId: st.id },
        update: { teacherId: professor.id },
        create: { teacherId: professor.id, studentId: st.id },
        select: { id: true },
      });
    }
  }

  const glossary = [
    { slug: "http", term: "HTTP", definition: "Protocolo de transferencia de hipertexto.", tags: ["web", "network"] },
    { slug: "https", term: "HTTPS", definition: "HTTP cifrado con TLS.", tags: ["security", "network"] },
    { slug: "dns", term: "DNS", definition: "Sistema de nombres de dominio.", tags: ["network"] },
    { slug: "cdn", term: "CDN", definition: "Red de distribución de contenido.", tags: ["performance"] },
    { slug: "latency", term: "Latencia", definition: "Tiempo de respuesta percibido en una petición.", tags: ["performance"] },
    { slug: "api", term: "API", definition: "Interfaz para que sistemas se comuniquen.", tags: ["backend"] },
    { slug: "rest", term: "REST", definition: "Estilo arquitectónico para APIs.", tags: ["backend"] },
    { slug: "jwt", term: "JWT", definition: "Token firmado para autenticación/autorización.", tags: ["auth", "security"] },
    { slug: "session", term: "Sesión", definition: "Estado de autenticación mantenido entre requests.", tags: ["auth"] },
    { slug: "cookie", term: "Cookie", definition: "Dato almacenado en el navegador y enviado al servidor.", tags: ["auth", "web"] },
    { slug: "cors", term: "CORS", definition: "Política del navegador para requests cross-origin.", tags: ["security", "web"] },
    { slug: "csrf", term: "CSRF", definition: "Ataque que fuerza acciones autenticadas.", tags: ["security"] },
    { slug: "xss", term: "XSS", definition: "Inyección de scripts en contenido.", tags: ["security"] },
    { slug: "sql", term: "SQL", definition: "Lenguaje para bases de datos relacionales.", tags: ["db"] },
    { slug: "index", term: "Índice", definition: "Estructura para acelerar consultas en DB.", tags: ["db", "performance"] },
    { slug: "migration", term: "Migración", definition: "Cambio versionado del esquema de la DB.", tags: ["db"] },
    { slug: "feature-flag", term: "Feature flag", definition: "Activación/desactivación de funcionalidades.", tags: ["product", "engineering"] },
    { slug: "observability", term: "Observabilidad", definition: "Logs, métricas y trazas para entender el sistema.", tags: ["ops"] },
    { slug: "cwv", term: "Core Web Vitals", definition: "Métricas UX de rendimiento web.", tags: ["performance", "ux"] },
    { slug: "slo", term: "SLO", definition: "Objetivo de nivel de servicio.", tags: ["ops", "product"] },
  ];

  await prisma.glossaryTerm.createMany({ data: glossary, skipDuplicates: true });

  const path1 = await prisma.learningPath.upsert({
    where: { slug: "web-fundamentals-para-pm" },
    update: {},
    create: {
      slug: "web-fundamentals-para-pm",
      title: "Web Fundamentals para PM",
      description: "Base técnica para colaborar con ingeniería y tomar decisiones informadas.",
      order: 1,
    },
  });

  const path2 = await prisma.learningPath.upsert({
    where: { slug: "construyendo-producto-con-ingenieria" },
    update: {},
    create: {
      slug: "construyendo-producto-con-ingenieria",
      title: "Construyendo Producto con Ingeniería",
      description: "Tradeoffs, escalabilidad vs velocidad y ejecución con equipos.",
      order: 2,
    },
  });

  const modulesPath1 = [
    { slug: "http-dns-hosting", title: "HTTP/HTTPS, DNS y hosting", description: "Cómo viaja una request y dónde vive tu app." },
    { slug: "frontend-basics", title: "Frontend basics", description: "HTML/CSS/JS y componentes." },
    { slug: "backend-apis-rest", title: "Backend basics (APIs, REST)", description: "Endpoints, contratos y errores." },
    { slug: "db-sql-basics", title: "DB basics (SQL)", description: "Modelado y queries." },
  ];

  const modulesPath2 = [
    { slug: "architectures-tradeoffs", title: "Arquitecturas y tradeoffs", description: "Monolito vs microservicios." },
    { slug: "versioning-flags", title: "Versionado y feature flags", description: "Estrategias para iterar con seguridad." },
    { slug: "testing-analytics", title: "Testing strategy + analytics", description: "Calidad y medición." },
    { slug: "roadmapping-debt", title: "Roadmapping técnico y deuda", description: "Planificación y sostenibilidad." },
  ];

  const createdModules: Array<{ moduleId: string; slug: string; pathSlug: string }> = [];

  for (const [i, m] of modulesPath1.entries()) {
    const moduleRow = await prisma.module.upsert({
      where: { learningPathId_slug: { learningPathId: path1.id, slug: m.slug } },
      update: { title: m.title, description: m.description, order: i + 1 },
      create: {
        learningPathId: path1.id,
        slug: m.slug,
        title: m.title,
        description: m.description,
        order: i + 1,
      },
    });
    createdModules.push({ moduleId: moduleRow.id, slug: m.slug, pathSlug: path1.slug });
  }

  for (const [i, m] of modulesPath2.entries()) {
    const moduleRow = await prisma.module.upsert({
      where: { learningPathId_slug: { learningPathId: path2.id, slug: m.slug } },
      update: { title: m.title, description: m.description, order: i + 1 },
      create: {
        learningPathId: path2.id,
        slug: m.slug,
        title: m.title,
        description: m.description,
        order: i + 1,
      },
    });
    createdModules.push({ moduleId: moduleRow.id, slug: m.slug, pathSlug: path2.slug });
  }

  const lessonContent = (moduleSlug: string, lessonSlug: string, title: string) => {
    const header = `# ${title}\n\n`;

    if (moduleSlug === "http-dns-hosting") {
      if (lessonSlug === "intro") {
        return (
          header +
          `## Qué vas a entender\n` +
          `- Por qué una URL termina en una IP (DNS)\n` +
          `- Qué aporta TLS/HTTPS\n` +
          `- Qué hace un CDN y qué NO hace\n\n` +
          `## Mapa mental (end-to-end)\n` +
          `1. DNS: nombre -> IP\n` +
          `2. TLS: handshake + certificados\n` +
          `3. CDN: cache estático cerca del usuario\n` +
          `4. Backend: lógica + auth\n` +
          `5. DB: persistencia + consistencia\n\n` +
          `## Recursos\n` +
          `- HTTP status codes (200/301/401/403/404/500)\n` +
          `- Conceptos: latency, throughput, availability\n`
        );
      }
      if (lessonSlug === "deep-dive") {
        return (
          header +
          `## Diagnóstico de latencia (práctico)\n` +
          `Separa en capas: red -> servidor -> DB -> frontend.\n\n` +
          `### Señales típicas\n` +
          `- TTFB alto: backend/DB/edge\n` +
          `- LCP alto: imágenes, SSR lento, JS pesado\n` +
          `- Errores intermitentes: timeouts, pools, DNS\n\n` +
          `### Qué instrumentar como PM\n` +
          `- Eventos: page_view, api_error, signup_started, signup_completed\n` +
          `- Métricas: P95 TTFB, error rate, conversion funnel\n`
        );
      }
      return (
        header +
        `## Tradeoffs\n` +
        `- SSR vs CSR (TTFB vs interactividad)\n` +
        `- CDN agresivo vs frescura de contenido\n` +
        `- Observabilidad (coste) vs velocidad de diagnóstico\n\n` +
        `## Decisión recomendada\n` +
        `Define: objetivo (p.ej. conversión) + umbrales + rollback plan.\n`
      );
    }

    if (moduleSlug === "frontend-basics") {
      if (lessonSlug === "intro") {
        return (
          header +
          `## Estructura de una landing que convierte\n` +
          `- Hero: propuesta de valor + CTA\n` +
          `- Prueba social\n` +
          `- Beneficios (no features)\n` +
          `- FAQ (reduce fricción)\n\n` +
          `## Accesibilidad mínima\n` +
          `- Labels en inputs\n` +
          `- Contraste\n` +
          `- Focus visible\n\n` +
          `## Performance\n` +
          `- Imágenes con tamaño\n` +
          `- Evitar layout shifts\n`
        );
      }
      if (lessonSlug === "deep-dive") {
        return (
          header +
          `## Estados de UI\n` +
          `Define estados explícitos: idle/loading/success/error.\n\n` +
          `## Diseño de componentes\n` +
          `- Props claras\n` +
          `- Variantes (primary/secondary/destructive)\n` +
          `- Tokens (spacing, typography)\n\n` +
          `## Instrumentación\n` +
          `Eventos sugeridos: cta_clicked, form_submitted, error_shown.\n`
        );
      }
      return (
        header +
        `## Tradeoffs de UI\n` +
        `- Animaciones vs rendimiento\n` +
        `- Componentes reutilizables vs velocidad\n` +
        `- Accesibilidad vs diseño "pixel perfect"\n\n` +
        `## Checklist PM\n` +
        `- ¿Qué métrica mejora esta iteración?\n` +
        `- ¿Qué riesgo introducimos?\n`
      );
    }

    if (moduleSlug === "backend-apis-rest") {
      if (lessonSlug === "intro") {
        return (
          header +
          `## Contrato REST (lo que importa)\n` +
          `- Recursos (nombres)\n` +
          `- Verbos (GET/POST/PATCH/DELETE)\n` +
          `- Validaciones\n` +
          `- Errores esperables\n\n` +
          `## Ejemplo\n` +
          `POST /api/tasks\n` +
          `- 201 created\n` +
          `- 400 invalid payload\n` +
          `- 401 unauthorized\n` +
          `- 409 conflict\n`
        );
      }
      if (lessonSlug === "deep-dive") {
        return (
          header +
          `## Errores con intención\n` +
          `Un error no es solo un status: es un mensaje accionable para el usuario.\n\n` +
          `### Tabla rápida\n` +
          `- 400: "Revisa los campos"\n` +
          `- 401: "Inicia sesión"\n` +
          `- 403: "No tienes permisos"\n` +
          `- 404: "No existe"\n` +
          `- 409: "Ya existe"\n\n` +
          `## Observabilidad\n` +
          `Loggear requestId + userId + errorCode.\n`
        );
      }
      return (
        header +
        `## Tradeoffs de API\n` +
        `- REST vs GraphQL\n` +
        `- Versionado vs compatibilidad\n` +
        `- Idempotencia vs simplicidad\n\n` +
        `## Plan de rollout\n` +
        `Feature flag + métricas + rollback.\n`
      );
    }

    if (moduleSlug === "db-sql-basics") {
      if (lessonSlug === "intro") {
        return (
          header +
          `## Modelado orientado a producto\n` +
          `Piensa en: consultas principales, integridad, y reporting.\n\n` +
          `## Constraints clave\n` +
          `- PK/FK\n` +
          `- UNIQUE\n` +
          `- NOT NULL\n\n` +
          `## Pregunta PM\n` +
          `¿Qué datos necesito para medir el éxito?\n`
        );
      }
      if (lessonSlug === "deep-dive") {
        return (
          header +
          `## Índices: cuándo y por qué\n` +
          `- Aceleran lecturas\n` +
          `- Encarecen escrituras\n\n` +
          `## Queries típicas\n` +
          `- Progreso usuario\n` +
          `- Pendientes\n` +
          `- Top módulos\n`
        );
      }
      return (
        header +
        `## Tradeoffs de datos\n` +
        `- Normalización vs velocidad\n` +
        `- Consistencia vs facilidad de iterar\n` +
        `- Migraciones: riesgo vs control\n`
      );
    }

    if (moduleSlug === "architectures-tradeoffs") {
      if (lessonSlug === "intro") {
        return (
          header +
          `## Monolito vs microservicios (pragmático)\n` +
          `- Monolito: velocidad + simplicidad\n` +
          `- Microservicios: independencia + coste\n\n` +
          `## Señales de cambio\n` +
          `- Equipos múltiples\n` +
          `- Límites claros de dominio\n` +
          `- Escalado desigual\n`
        );
      }
      if (lessonSlug === "deep-dive") {
        return (
          header +
          `## Matriz de riesgos\n` +
          `Define impacto/probabilidad + mitigación.\n\n` +
          `## Observabilidad\n` +
          `Logs + traces + SLOs.\n`
        );
      }
      return (
        header +
        `## Tradeoffs\n` +
        `- Complejidad operativa vs autonomía\n` +
        `- Consistencia vs disponibilidad\n\n` +
        `## Decisión\n` +
        `Empieza simple y define triggers medibles para cambiar.\n`
      );
    }

    return (
      header +
      `## Objetivo\n` +
      `Lección diseñada para que practiques con entregables reales.\n\n` +
      `## Checklist\n` +
      `- Qué problema resuelve\n` +
      `- Cómo lo medirías\n` +
      `- Qué tradeoffs aceptas\n`
    );
  };

  for (const m of createdModules) {
    const lessons = [
      { slug: "intro", title: "Introducción", order: 1 },
      { slug: "deep-dive", title: "Deep dive", order: 2 },
      { slug: "tradeoffs", title: "Tradeoffs como PM", order: 3 },
    ];

    for (const l of lessons) {
      const lessonRow = await prisma.lesson.upsert({
        where: { moduleId_slug: { moduleId: m.moduleId, slug: l.slug } },
        update: {
          title: l.title,
          order: l.order,
          mdxContent: lessonContent(m.slug, l.slug, l.title),
          durationMin: 12,
          difficulty: LessonDifficulty.BEGINNER,
          tags: ["pm", "web"],
        },
        create: {
          moduleId: m.moduleId,
          slug: l.slug,
          title: l.title,
          order: l.order,
          mdxContent: lessonContent(m.slug, l.slug, l.title),
          durationMin: 12,
          difficulty: LessonDifficulty.BEGINNER,
          tags: ["pm", "web"],
        },
        select: { id: true, slug: true },
      });

      await prisma.exercise.deleteMany({ where: { lessonId: lessonRow.id } });

      const base = {
        lessonId: lessonRow.id,
        difficulty: LessonDifficulty.BEGINNER,
      };

      const isIntro = lessonRow.slug === "intro";
      const isDeep = lessonRow.slug === "deep-dive";
      const isTradeoffs = lessonRow.slug === "tradeoffs";

      if (m.slug === "frontend-basics") {
        await prisma.exercise.createMany({
          data: [
            {
              ...base,
              title: isIntro ? "Landing responsive: estructura + jerarquía" : "Landing responsive: iteración UX",
              objective:
                "Diseñar una landing mobile-first con jerarquía clara y CTA medible.",
              instructions:
                (isIntro
                  ? "Crea una landing simple (hero + features + pricing + FAQ). Define 1 objetivo (p.ej. signup) y 2 métricas."
                  : isDeep
                    ? "Añade estados de UI (loading/error) y mejora accesibilidad (labels, contraste, focus)."
                    : "Escribe 5 tradeoffs (velocidad vs calidad, perf vs animaciones, etc.) y cómo lo decidirías como PM."),
              requiredFiles: ["index.html", "styles.css", "README.md"],
              rubric:
                "Responsive (mobile-first), jerarquía visual, accesibilidad básica, claridad de CTA y métricas definidas.",
            },
            {
              ...base,
              title: isIntro ? "A11y audit rápido" : "Definir eventos de analítica",
              objective: "Diferenciar accesibilidad real de estética y proponer instrumentación medible.",
              instructions:
                isIntro
                  ? "Elige 6 checks de accesibilidad (labels, teclado, contrastes, headings). Justifica por qué importa."
                  : isDeep
                    ? "Define 5 eventos (nombre + propiedades) para medir conversión. Incluye 1 funnel."
                    : "Elige 3 tradeoffs (métricas vs privacidad, detalle vs coste, etc.) y una decisión recomendada.",
              requiredFiles: ["audit.md"],
              rubric: "Checks claros, justificación, eventos accionables, y métricas coherentes.",
            },
          ],
        });
      } else if (m.slug === "backend-apis-rest") {
        await prisma.exercise.createMany({
          data: [
            {
              ...base,
              title: isIntro ? "Diseña un endpoint REST" : "Contrato y errores de API",
              objective:
                "Definir un contrato de API claro (request/response), validaciones y errores esperables.",
              instructions:
                (isIntro
                  ? "Propón un endpoint POST /api/tasks. Incluye payload, validaciones, response y ejemplos."
                  : isDeep
                    ? "Define 6 errores (400/401/403/404/409/500) y qué mensaje vería el usuario."
                    : "Escribe tradeoffs: REST vs GraphQL, versionado, breaking changes y cómo mitigar riesgos."),
              requiredFiles: ["api-contract.md"],
              rubric:
                "Contrato completo, validaciones realistas, buen uso de códigos HTTP, ejemplos claros.",
            },
            {
              ...base,
              title: isIntro ? "Diseña una estrategia de idempotencia" : "Plan de observabilidad",
              objective: "Crear una solución de backend robusta y medible (no solo endpoints).",
              instructions:
                isIntro
                  ? "Define cómo evitar duplicados en POST (idempotency key + storage). Incluye escenarios borde."
                  : isDeep
                    ? "Propón logs/traces mínimos: campos, niveles, y 3 alertas (error rate, latency, saturation)."
                    : "Tradeoffs: logs vs coste, sampling vs detalle, y cómo lo decidirías.",
              requiredFiles: ["backend-plan.md"],
              rubric: "Estrategia coherente, escenarios borde, y observabilidad accionable.",
            },
          ],
        });
      } else if (m.slug === "db-sql-basics") {
        await prisma.exercise.createMany({
          data: [
            {
              ...base,
              title: isIntro ? "Modela una base de datos" : "Queries + índices",
              objective:
                "Modelar una DB simple para soportar un caso de uso real y justificar índices.",
              instructions:
                (isIntro
                  ? "Diseña el esquema para 'Curso → Módulos → Lecciones → Progreso'. Incluye entidades y relaciones."
                  : isDeep
                    ? "Escribe 4 queries SQL (listar módulos, progreso usuario, pendientes, top completados) y sugiere 2 índices."
                    : "Lista tradeoffs: normalización vs velocidad, migraciones, consistencia vs velocidad de entrega."),
              requiredFiles: ["schema.sql", "queries.sql", "README.md"],
              rubric:
                "Relaciones correctas, constraints, queries coherentes, índices justificados.",
            },
            {
              ...base,
              title: isIntro ? "Diseña constraints para integridad" : "Migración sin downtime (teórica)",
              objective: "Pensar en integridad de datos y evolución del esquema.",
              instructions:
                isIntro
                  ? "Añade 5 constraints (UNIQUE, CHECK, FK) y explica qué bug previenen."
                  : isDeep
                    ? "Propón un plan: añadir columna, backfill, doble escritura, switch, cleanup."
                    : "Tradeoffs: velocidad vs seguridad en migraciones.",
              requiredFiles: ["constraints.md"],
              rubric: "Constraints relevantes, plan de migración claro y riesgos identificados.",
            },
          ],
        });
      } else if (m.slug === "http-dns-hosting") {
        await prisma.exercise.createMany({
          data: [
            {
              ...base,
              title: isIntro ? "Traza una request end-to-end" : "Riesgos y mitigaciones",
              objective:
                "Entender el camino de una request y explicar impacto en UX/performance.",
              instructions:
                (isIntro
                  ? "Describe el camino: DNS → TLS/HTTPS → CDN → backend → DB. Incluye 1 diagrama simple."
                  : isDeep
                    ? "Propón 5 causas de latencia y cómo las medirías (CWV, logs, traces)."
                    : "Define tradeoffs: edge caching, SSR/CSR, costes, y decisión recomendada."),
              requiredFiles: ["request-trace.md"],
              rubric:
                "Explicación completa, lenguaje claro, métricas propuestas y mitigaciones realistas.",
            },
            {
              ...base,
              title: isIntro ? "Checklist de incident response" : "Diseña un SLO simple",
              objective: "Diferenciar disponibilidad real de percepciones y formalizar objetivos.",
              instructions:
                isIntro
                  ? "Define 6 pasos: detectar, contener, comunicar, mitigar, verificar, post-mortem."
                  : isDeep
                    ? "Define 1 SLI + 1 SLO + error budget policy para una API."
                    : "Tradeoffs: SLO estricto vs velocidad de desarrollo.",
              requiredFiles: ["reliability.md"],
              rubric: "Pasos claros, SLO medible y decisiones justificadas.",
            },
          ],
        });
      } else if (m.slug === "architectures-tradeoffs") {
        await prisma.exercise.createMany({
          data: [
            {
              ...base,
              title: isTradeoffs ? "Monolito vs microservicios: decisión" : "Mapa de riesgos de arquitectura",
              objective:
                "Comparar opciones de arquitectura y justificar una recomendación con métricas y riesgos.",
              instructions:
                isTradeoffs
                  ? "Elige una arquitectura para un MVP + escalado. Define señales que te harían migrar."
                  : "Crea una matriz de riesgos (impacto/probabilidad) y mitigaciones para tu elección.",
              requiredFiles: ["architecture-decision.md"],
              rubric:
                "Tradeoffs claros, decisión justificable, riesgos y mitigación, métricas/alertas propuestas.",
            },
            {
              ...base,
              title: isIntro ? "Diseña límites de dominio" : "SLOs por servicio",
              objective: "Aterrizar la arquitectura en dominios y objetivos operables.",
              instructions:
                isIntro
                  ? "Propón 3 dominios (auth, learning, submissions). Define responsabilidades y datos."
                  : isDeep
                    ? "Para cada dominio define 1 SLI/SLO y qué alertas pondrías."
                    : "Tradeoffs: consistencia entre dominios vs independencia.",
              requiredFiles: ["domains.md"],
              rubric: "Dominios coherentes, límites claros y SLOs accionables.",
            },
          ],
        });
      } else {
        await prisma.exercise.createMany({
          data: [
            {
              ...base,
              title: "Actividad práctica: checklist PM",
              objective: "Convertir conceptos del módulo en acciones concretas como PM.",
              instructions:
                (isIntro
                  ? "Resume el módulo en 10 bullets y 3 decisiones que tomarías diferente." 
                  : isDeep
                    ? "Propón 3 métricas + instrumentación mínima para este módulo." 
                    : "Escribe 5 tradeoffs y un plan de mitigación para los 2 más riesgosos."),
              requiredFiles: ["activity.md"],
              rubric: "Claridad, aplicabilidad, métricas realistas y tradeoffs bien argumentados.",
            },
            {
              ...base,
              title: "Actividad práctica: define un experimento",
              objective: "Diseñar un experimento medible (no una tarea).",
              instructions:
                isIntro
                  ? "Define hipótesis + métrica primaria + métrica guardrail + duración."
                  : isDeep
                    ? "Diseña segmentación y criterios de éxito/fallo."
                    : "Tradeoffs: velocidad vs significancia estadística.",
              requiredFiles: ["experiment.md"],
              rubric: "Hipótesis clara, métricas correctas y criterio de decisión.",
            },
          ],
        });
      }
    }

    const quiz = await prisma.quiz.upsert({
      where: { moduleId_slug: { moduleId: m.moduleId, slug: "quiz" } },
      update: { title: "Quiz del módulo" },
      create: { moduleId: m.moduleId, slug: "quiz", title: "Quiz del módulo" },
    });

    await prisma.question.deleteMany({ where: { quizId: quiz.id } });

    const quizQuestions =
      m.slug === "http-dns-hosting"
        ? [
            {
              quizId: quiz.id,
              type: QuestionType.MULTIPLE_CHOICE,
              prompt: "¿Cuál es el propósito principal de DNS?",
              options: ["Cifrar tráfico", "Resolver nombres a IP", "Cachear HTML", "Ejecutar JS"],
              answer: "Resolver nombres a IP",
              explanation: "DNS traduce dominios (ej. example.com) a direcciones IP.",
              topic: "dns",
              order: 1,
            },
            {
              quizId: quiz.id,
              type: QuestionType.TRUE_FALSE,
              prompt: "HTTPS implica TLS y protege la confidencialidad e integridad del tráfico.",
              options: ["Verdadero", "Falso"],
              answer: "Verdadero",
              explanation: "TLS cifra y autentica la comunicación.",
              topic: "https",
              order: 2,
            },
            {
              quizId: quiz.id,
              type: QuestionType.FILL_IN,
              prompt: "Completa: Un CDN sirve contenido desde nodos en el ____ para reducir latencia.",
              options: [""],
              answer: "borde",
              explanation: "CDN = edge network; acerca el contenido al usuario.",
              topic: "cdn",
              order: 3,
            },
          ]
        : m.slug === "frontend-basics"
          ? [
              {
                quizId: quiz.id,
                type: QuestionType.MULTIPLE_CHOICE,
                prompt: "¿Qué mejora suele reducir CLS (layout shift)?",
                options: ["No definir tamaños", "Definir width/height en imágenes", "Más fuentes", "Más JS"],
                answer: "Definir width/height en imágenes",
                explanation: "Reservar espacio evita saltos de layout.",
                topic: "cwv",
                order: 1,
              },
              {
                quizId: quiz.id,
                type: QuestionType.TRUE_FALSE,
                prompt: "Accesibilidad (a11y) es solo un tema legal y no afecta a conversión.",
                options: ["Verdadero", "Falso"],
                answer: "Falso",
                explanation: "A11y mejora UX y suele impactar conversión y SEO.",
                topic: "a11y",
                order: 2,
              },
              {
                quizId: quiz.id,
                type: QuestionType.FILL_IN,
                prompt: "Completa: El atributo HTML para texto alternativo en imágenes es ____ .",
                options: [""],
                answer: "alt",
                explanation: "alt mejora accesibilidad y SEO.",
                topic: "html",
                order: 3,
              },
            ]
          : m.slug === "backend-apis-rest"
            ? [
                {
                  quizId: quiz.id,
                  type: QuestionType.MULTIPLE_CHOICE,
                  prompt: "¿Qué código HTTP es más apropiado para un recurso no encontrado?",
                  options: ["200", "201", "404", "500"],
                  answer: "404",
                  explanation: "404 Not Found cuando el recurso no existe.",
                  topic: "http",
                  order: 1,
                },
                {
                  quizId: quiz.id,
                  type: QuestionType.TRUE_FALSE,
                  prompt: "Un 409 suele usarse para conflictos (ej. email ya existe).",
                  options: ["Verdadero", "Falso"],
                  answer: "Verdadero",
                  explanation: "409 Conflict representa conflicto con el estado actual.",
                  topic: "errors",
                  order: 2,
                },
                {
                  quizId: quiz.id,
                  type: QuestionType.FILL_IN,
                  prompt: "Completa: Un contrato de API debería ser ____ para no romper clientes.",
                  options: [""],
                  answer: "estable",
                  explanation: "Contratos estables reducen riesgo y aceleran iteración.",
                  topic: "contracts",
                  order: 3,
                },
              ]
            : m.slug === "db-sql-basics"
              ? [
                  {
                    quizId: quiz.id,
                    type: QuestionType.MULTIPLE_CHOICE,
                    prompt: "¿Qué constraint evita filas duplicadas?",
                    options: ["FOREIGN KEY", "UNIQUE", "DEFAULT", "CHECK"],
                    answer: "UNIQUE",
                    explanation: "UNIQUE garantiza unicidad del valor.",
                    topic: "sql",
                    order: 1,
                  },
                  {
                    quizId: quiz.id,
                    type: QuestionType.TRUE_FALSE,
                    prompt: "Un índice puede acelerar lecturas pero empeorar escrituras.",
                    options: ["Verdadero", "Falso"],
                    answer: "Verdadero",
                    explanation: "Cada write debe actualizar índices.",
                    topic: "indexes",
                    order: 2,
                  },
                  {
                    quizId: quiz.id,
                    type: QuestionType.FILL_IN,
                    prompt: "Completa: JOIN une tablas mediante una ____ .",
                    options: [""],
                    answer: "relación",
                    explanation: "Normalmente a través de claves (PK/FK).",
                    topic: "joins",
                    order: 3,
                  },
                ]
              : [
                  {
                    quizId: quiz.id,
                    type: QuestionType.MULTIPLE_CHOICE,
                    prompt: "¿Qué describe mejor un tradeoff?",
                    options: ["Una decisión sin coste", "Un compromiso entre objetivos", "Un bug", "Una métrica"],
                    answer: "Un compromiso entre objetivos",
                    explanation: "En producto/ingeniería casi siempre optimizas algo a costa de otra cosa.",
                    topic: "tradeoffs",
                    order: 1,
                  },
                  {
                    quizId: quiz.id,
                    type: QuestionType.TRUE_FALSE,
                    prompt: "El PM debe confiar solo en el frontend para RBAC.",
                    options: ["Verdadero", "Falso"],
                    answer: "Falso",
                    explanation: "RBAC debe validarse en backend; el frontend solo ayuda a UX.",
                    topic: "security",
                    order: 2,
                  },
                  {
                    quizId: quiz.id,
                    type: QuestionType.FILL_IN,
                    prompt: "Completa: Un endpoint REST debería tener un contrato ____ .",
                    options: [""],
                    answer: "estable",
                    explanation: "Contratos estables reducen riesgo y aceleran colaboración.",
                    topic: "apis",
                    order: 3,
                  },
                ];

    await prisma.question.createMany({
      data: quizQuestions,
    });
  }

  const projectModules = createdModules.filter((_, idx) => idx % 2 === 1);
  for (const [i, pm] of projectModules.entries()) {
    const projectContent =
      pm.slug === "backend-apis-rest"
        ? {
            title: "Mini-lab: Diseña una API de tareas",
            brief: "Crea un PRD corto y un contrato de API (endpoints + errores + ejemplos) para una app de tareas.",
            checklist: ["Objetivo y no-goals", "Modelo de datos", "Endpoints", "Errores", "Métricas"],
            rubric: "Contrato claro, errores correctos, ejemplos, tradeoffs y métricas.",
            pmLens: "Enfócate en contratos estables, rollout y casos borde.",
          }
        : pm.slug === "db-sql-basics"
          ? {
              title: "Mini-lab: Modela progreso de aprendizaje",
              brief: "Diseña el esquema SQL para progreso y escribe queries clave para reporting.",
              checklist: ["Tablas y relaciones", "Constraints", "Queries", "Índices", "Tradeoffs"],
              rubric: "Modelo consistente, queries correctas, índices justificados.",
              pmLens: "Piensa en analítica, reporting y coste de mantenimiento.",
            }
          : pm.slug === "frontend-basics"
            ? {
                title: "Mini-lab: Landing con métricas",
                brief: "Diseña una landing (estructura + copy) y define instrumentación mínima (eventos + funnel).",
                checklist: ["Propuesta de valor", "CTA", "Accesibilidad", "Eventos", "Métricas"],
                rubric: "Jerarquía clara, métricas accionables, a11y básica.",
                pmLens: "Tradeoffs entre conversión, performance y complejidad.",
              }
            : {
                title: "Mini-lab: Build a feature",
                brief: "Diseña una feature end-to-end: DB + API + UI.",
                checklist: ["Definir objetivo", "Modelar DB", "Diseñar endpoints", "UI básica", "Métricas"],
                rubric: "Autoevalúa claridad, scope, riesgos y métricas.",
                pmLens: "Qué mirar como PM: tradeoffs, riesgos, dependencias y métricas.",
              };

    await prisma.project.upsert({
      where: { moduleId_slug: { moduleId: pm.moduleId, slug: "mini-lab" } },
      update: { order: 1 },
      create: {
        moduleId: pm.moduleId,
        slug: "mini-lab",
        title: projectContent.title,
        brief: projectContent.brief,
        checklist: projectContent.checklist,
        rubric: projectContent.rubric,
        pmLens: projectContent.pmLens,
        prdTemplate: "Problema\nObjetivo\nUsuarios\nMétricas\nNo-goals\nRiesgos\n",
        userStories:
          "Como usuario, quiero ... para ...\nAC: Dado ..., cuando ..., entonces ...\n",
        order: i + 1,
      },
    });
  }
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
