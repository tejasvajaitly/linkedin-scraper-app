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

export default async function Page() {
  const client = await createClerkSupabaseClientSsr();
  const { data, error } = await client.from("templates").select();
  return (
    <div>
      My Dashboard
      <Button asChild>
        <Link href="/dashboard/new-template">Create new template</Link>
      </Button>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {data?.map((template) => (
          <Link key={template.id} href={`/dashboard/template/${template.id}`}>
            <Card className="w-full">
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription>Card Description</CardDescription>
              </CardHeader>
              <CardContent>
                <Button>Rerun</Button>
              </CardContent>
              <CardFooter>
                <p>Card Footer</p>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
