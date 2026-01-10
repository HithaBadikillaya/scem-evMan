import { TestsList } from "@/components/admin/test/tests-list";
import { auth } from "@/auth";

async function getAdminContests() {
  try {
    const session = await auth();
    const token = session?.backendToken;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/tests`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch admin contests:", await res.text());
      return [];
    }

    const json = await res.json();
    return json.success ? json.contests : [];
  } catch (error) {
    console.error("Error fetching admin contests:", error);
    return [];
  }
}

export default async function AdminTestsPage() {
  const tests = await getAdminContests();

  return <TestsList initialTests={tests} />;
}
