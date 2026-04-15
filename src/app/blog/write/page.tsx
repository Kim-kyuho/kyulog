import WritePage from "@/components/WritePage";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";

export default async function Page() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/blog");
  }

  return <WritePage />;
}
