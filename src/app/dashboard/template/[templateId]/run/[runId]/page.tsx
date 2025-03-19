import { createClerkSupabaseClientSsr } from "@/app/dashboard/client";

export default async function Page({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;
  const client = await createClerkSupabaseClientSsr();
  const { data: run } = await client
    .from("runs")
    .select()
    .eq("id", runId)
    .single();
  return (
    <div>
      <p>Run Id: {run.id}</p>
      <p>Template name: {run.status}</p>
    </div>
  );
}
