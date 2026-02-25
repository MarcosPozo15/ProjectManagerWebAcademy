import { PrismaClient, LessonDifficulty, QuestionType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.updateMany({ data: { role: "USER" } });
  await prisma.user.upsert({
    where: { email: "marcospoxo15@gmail.com" },
    update: { role: "ADMIN", name: "Marcos" },
    create: {
      email: "marcospoxo15@gmail.com",
      name: "Marcos",
      role: "ADMIN",
    },
  });

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
      await prisma.lesson.upsert({
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
      });
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
