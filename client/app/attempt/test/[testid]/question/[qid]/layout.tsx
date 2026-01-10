import TestHeader from "@/components/attempt/test-header";
import { auth } from "@/auth";

async function getContestData(contestId: string) {
  try {
    const session = await auth();
    const token = session?.backendToken;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/test/data?contestId=${contestId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch contest data:", await res.text());
      return null;
    }

    const json = await res.json();
    return json.success ? json.data : null;
  } catch (error) {
    console.error("Error fetching contest data:", error);
    return null;
  }
}

export default async function TestLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ testid: string; qid: string }>;
}) {
  const { testid } = await params;

  // Fetch populated contest data in one call
  const data = await getContestData(testid);
  const problems = data?.problems || [];

  const problemMeta = problems.map((q: any) => ({
    id: q.id || q._id,
    type: q.questionType || q.type || "Coding"
  }));

  return (
    <main className="w-screen h-screen pt-12">
      <TestHeader problems={problemMeta} />
      {children}
    </main>
  );
}
