import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Play } from "lucide-react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const contest = await db.findOne("contests", { _id: id });

  if (!contest) return notFound();


  let questions = [];
  try {
    if (contest.questions && contest.questions.length > 0) {
      questions = await db.find("questions", { _id: { $in: contest.questions } });
    }
  } catch (e) {
    console.error("Failed to fetch questions for landing page", e);
  }

  const firstQuestionId = contest.questions?.[0] || "";
  const isStarted = new Date() >= new Date(contest.startTime);

  return (
    <div className="min-h-screen pt-12 bg-primary text-foreground">
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-3rem)]">
        {/* Main Detail Section - Empty or could show logo/image */}
        <div className="flex-1 p-6 bg-primary/5 hidden md:block">
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-1/3 bg-card border-l shadow-xl flex flex-col">
          <ScrollArea className="flex-1 min-h-0 p-6">
            <div className="space-y-8">
              {/* Title and Description */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-primary">
                  {contest.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {contest.description}
                </p>
              </div>

              {/* Test Details Grid */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold border-b pb-2">
                  Session Information
                </h3>
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="font-medium text-muted-foreground">Start Time</span>
                    <span className="font-semibold">{new Date(contest.startTime).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="font-medium text-muted-foreground">End Time</span>
                    <span className="font-semibold">{new Date(contest.endTime).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="font-medium text-muted-foreground">Total Problems</span>
                    <span className="font-semibold">{contest.questions?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="font-medium text-muted-foreground">Host</span>
                    <span className="font-semibold">{contest.author || "SCEM Coding Club"}</span>
                  </div>
                </div>
              </div>

              {/* Assessment Questions */}
              {questions.length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="text-lg font-semibold">Assessment Questions</h4>
                  <div className="space-y-3">
                    {questions.map((problem: any, i: number) => (
                      <div key={problem._id} className="flex flex-col p-3 rounded-lg border bg-muted/20">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-sm font-medium leading-tight">{i + 1}. {problem.title}</span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-primary/10 text-primary rounded whitespace-nowrap">
                            {problem.questionType || problem.type || "Coding"}
                          </span>
                        </div>
                        <div className="flex gap-3 mt-1 text-[11px] text-muted-foreground">
                          <span>Marks: {problem.marks}</span>
                          <span>Difficulty: {problem.difficulty}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rules */}
              {contest.rules && contest.rules.length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="text-lg font-semibold">Assessment Rules</h4>
                  <ul className="space-y-3">
                    {contest.rules.map((rule: string, i: number) => (
                      <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Take Test Button */}
          <div className="p-6 border-t bg-card">
            {!isStarted ? (
              <Button disabled className="w-full py-6 text-lg font-bold opacity-50 cursor-not-allowed">
                Test not started yet
              </Button>
            ) : firstQuestionId ? (
              <Link href={`/attempt/test/${id}/question/${firstQuestionId}`}>
                <Button className="w-full py-6 text-lg font-bold gap-3 shadow-lg shadow-primary/20">
                  <Play className="w-5 h-5 fill-current" />
                  Begin Assessment
                </Button>
              </Link>
            ) : (
              <Button disabled className="w-full py-6 text-lg font-bold opacity-50">
                No Questions Available
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
