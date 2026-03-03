import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/infrastructure/db/prisma";
import { getSessionUser } from "@/infrastructure/auth/session";
import { ProjectSubmissionForm } from "@/components/projects/project-submission-form";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ pathSlug: string; moduleSlug: string; projectSlug: string }>;
}) {
  const session = await getSessionUser();
  if (!session) return null;

  const me = await prisma.user.findUnique({ where: { email: session.email }, select: { id: true } });
  if (!me) return null;

  const { pathSlug, moduleSlug, projectSlug } = await params;

  const path = await prisma.learningPath.findUnique({ where: { slug: pathSlug }, select: { id: true, slug: true, title: true } });
  if (!path) notFound();

  const moduleRow = await prisma.module.findFirst({
    where: { learningPathId: path.id, slug: moduleSlug },
    select: { id: true, slug: true, title: true },
  });
  if (!moduleRow) notFound();

  const project = await prisma.project.findFirst({
    where: { moduleId: moduleRow.id, slug: projectSlug },
    select: {
      id: true,
      title: true,
      brief: true,
      checklist: true,
      rubric: true,
      pmLens: true,
      prdTemplate: true,
      userStories: true,
    },
  });

  if (!project) notFound();

  const existing = await prisma.projectSubmission.findFirst({
    where: { userId: me.id, projectId: project.id },
    select: { deliverableUrl: true, deliverableText: true },
  });

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        <Link className="underline underline-offset-4 hover:text-foreground" href="/projects">
          Mini proyectos
        </Link>
        {" / "}
        <span>{path.title}</span>
        {" / "}
        <span>{moduleRow.title}</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{project.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground whitespace-pre-wrap">{project.brief}</div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Checklist</div>
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              {project.checklist.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Rúbrica</div>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">{project.rubric}</div>
          </div>

          <ProjectSubmissionForm projectId={project.id} initialUrl={existing?.deliverableUrl ?? ""} initialText={existing?.deliverableText ?? ""} />
        </CardContent>
      </Card>
    </div>
  );
}
