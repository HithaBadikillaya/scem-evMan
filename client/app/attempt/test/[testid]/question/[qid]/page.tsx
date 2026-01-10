import { CodeScreen } from "@/components/attempt/code";
import React from "react";
import MCQScreen from "@/components/attempt/mcq";
import { notFound } from "next/navigation";
import { auth } from "@/auth";

interface Props {
  params: Promise<{
    testid: string;
    qid: string;
  }>;
}

export const dynamic = "force-dynamic";

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

export default async function TestContentPage(props: Props) {
  const params = await props.params;
  const { testid, qid } = params;

  // Fetch populated contest data in one call
  const data = await getContestData(testid);
  const allProblems = data?.problems || [];

  const normalizedProblems = allProblems.map((p: any) => ({
    ...p,
    id: p._id || p.id,
  }));

  const problem = normalizedProblems.find((p: any) => p.id === qid);

  if (!problem) {
    return notFound();
  }

  return (
    <div className="w-full h-full">
      {problem.questionType === "Coding" ? (
        <CodeScreen problem={{ ...problem, id: problem._id } as any} />
      ) : (
        <MCQScreen
          problem={{ ...problem, id: problem._id } as any}
          problems={normalizedProblems}
        />
      )}
    </div>
  );
}
