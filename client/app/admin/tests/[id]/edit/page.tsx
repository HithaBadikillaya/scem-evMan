import { notFound } from "next/navigation";
import TestForm from "@/components/admin/test/test-form";
import { auth } from "@/auth";
import { db } from "@/lib/db";

interface IdParams {
  id: string;
}

async function getAdminTestDetail(id: string) {
  try {
    const session = await auth();
    const token = session?.backendToken;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/tests/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch admin test detail:", await res.text());
      return null;
    }

    const json = await res.json();
    return json.success ? json.contest : null;
  } catch (error) {
    console.error("Error fetching admin test detail:", error);
    return null;
  }
}

export default async function AdminTestEditPage({
  params,
}: {
  params: Promise<IdParams>;
}) {
  const { id } = await params;

  let availableQuestions = [];
  try {
    availableQuestions = await db.find("questions");
  } catch (e) {
    console.error("Failed to fetch questions", e);
  }

  // Handle "new" - Render empty form for creation
  if (id === "new") {
    return (
      <div className="flex-1 h-full bg-background text-foreground overflow-x-hidden">
        <div className="h-full w-full">
          <TestForm testData={null} availableQuestions={availableQuestions} />
        </div>
      </div>
    );
  }

  let testData = await getAdminTestDetail(id);

  // Ensure compatibility with TestForm
  if (testData) {
    // Map if necessary, e.g. startsAt handling
    const start = new Date(testData.startTime).getTime();
    const end = new Date(testData.endTime).getTime();
    const diffMs = end - start;
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    const seconds = Math.floor(((diffMs % 3600000) % 60000) / 1000);
    const durationStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    testData = {
      ...testData,
      id: testData._id,
      startsAt: testData.startTime ? new Date(testData.startTime).toISOString() : '',
      duration: durationStr,
      problems: testData.questions?.map((q: any) => q._id || q) || [],
      status: testData.status || "waiting",
    };
  }

  if (!testData) {
    return notFound();
  }



  return (
    <div className="flex-1 h-full bg-background text-foreground overflow-x-hidden">
      <div className="h-full w-full">
        <TestForm testData={testData} availableQuestions={availableQuestions} />
      </div>
    </div>
  );
}
