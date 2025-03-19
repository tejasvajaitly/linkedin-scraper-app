import Link from "next/link";
import { createClerkSupabaseClientSsr } from "@/app/dashboard/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function Page({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  const client = await createClerkSupabaseClientSsr();
  const { data: template } = await client
    .from("templates")
    .select()
    .eq("id", templateId)
    .single();

  const { data: runs } = await client
    .from("runs")
    .select()
    .eq("template_id", templateId);
  return (
    <div>
      <p>Template Id: {template.id}</p>
      <p>Template name: {template.name}</p>
      <Button>Rerun</Button>
      {
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
          {runs?.map((run) => (
            <Link
              key={run.id}
              href={`/dashboard/template/${templateId}/run/${run.id}`}
            >
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>{run.id}</CardTitle>
                  <CardDescription>{run.status}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Card Content</p>
                </CardContent>
                <CardFooter>
                  <p>Card Footer</p>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      }
    </div>
  );
}
