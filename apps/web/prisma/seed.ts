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
        where: { teacherId_studentId: { teacherId: professor.id, studentId: st.id } },
        update: {},
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
    const module = await prisma.module.upsert({
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
    createdModules.push({ moduleId: module.id, slug: m.slug, pathSlug: path1.slug });
  }

  for (const [i, m] of modulesPath2.entries()) {
    const module = await prisma.module.upsert({
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
    createdModules.push({ moduleId: module.id, slug: m.slug, pathSlug: path2.slug });
  }

  const lessonTemplate = (title: string) => `# ${title}\n\n## Conceptos clave\n- ...\n\n## PM Lens\n- Tradeoffs\n- Riesgos\n\n## PM Decision Checklist\n- Impacto\n- Riesgos\n- Scope\n- Métricas\n- Dependencias\n`;

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
          mdxContent: lessonTemplate(l.title),
          durationMin: 12,
          difficulty: LessonDifficulty.BEGINNER,
          tags: ["pm", "web"],
        },
        create: {
          moduleId: m.moduleId,
          slug: l.slug,
          title: l.title,
          order: l.order,
          mdxContent: lessonTemplate(l.title),
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

    await prisma.question.createMany({
      data: [
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
          prompt: "Completa: Un endpoint REST debería tener un contrato _____ .",
          options: [""],
          answer: "estable",
          explanation: "Contratos estables reducen riesgo y aceleran colaboración.",
          topic: "apis",
          order: 3,
        },
      ],
    });
  }

  const projectModules = createdModules.filter((_, idx) => idx % 2 === 1);
  for (const [i, pm] of projectModules.entries()) {
    await prisma.project.upsert({
      where: { moduleId_slug: { moduleId: pm.moduleId, slug: "mini-lab" } },
      update: { order: 1 },
      create: {
        moduleId: pm.moduleId,
        slug: "mini-lab",
        title: "Mini-lab: Build a feature",
        brief: "Diseña una feature end-to-end: DB + API + UI.",
        checklist: ["Definir objetivo", "Modelar DB", "Diseñar endpoints", "UI básica", "Métricas"],
        rubric: "Autoevalúa claridad, scope, riesgos y métricas.",
        pmLens: "Qué mirar como PM: tradeoffs, riesgos, dependencias y métricas.",
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
