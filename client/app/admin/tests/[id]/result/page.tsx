"use client";

import { useSession } from "next-auth/react";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Users,
  Award,
  User,
  ExternalLink,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

/* ---------- Types ---------- */
interface Participant {
  userId: string;
  name: string;
  email: string;
  score: number;
  submittedAt: string;
}

interface TestResult {
  id: string;
  testName: string;
  description: string;
  participants: Participant[];
  stats: {
    totalParticipants: number;
    averageScore: number;
  };
}

/* ---------- Placeholder Data ---------- */
const PLACEHOLDER_DATA: TestResult = {
  id: "placeholder-test-id",
  testName: "Frontend Placeholder Test",
  description: "This data is displayed because the backend is unreachable or you are viewing this in a frontend-only environment.",
  participants: [
    {
      userId: "user-1",
      name: "Alice Placeholder",
      email: "alice@example.com",
      score: 92,
      submittedAt: new Date().toISOString(),
    },
    {
      userId: "user-2",
      name: "Bob Mock data",
      email: "bob@example.com",
      score: 78,
      submittedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      userId: "user-3",
      name: "Charlie Demo",
      email: "charlie@example.com",
      score: 85,
      submittedAt: new Date(Date.now() - 172800000).toISOString(),
    }
  ],
  stats: {
    totalParticipants: 3,
    averageScore: 85,
  },
};

export default function AdminTestResultPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TestResult | null>(null);

  /* ---------- CORE LOGIC (DYNAMIC FETCH with Placeholder Fallback) ---------- */
  const fetchData = async () => {
    if (status === "loading") return;

    // Use placeholder if not authenticated or no token
    if (status === "unauthenticated" || !session?.backendToken) {
      console.warn("No authentication detected. Using placeholder data.");
      setData(PLACEHOLDER_DATA);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/admin/tests/${id}/result`, {
        headers: {
          'Authorization': `Bearer ${session.backendToken}`
        }
      });

      if (response.status === 401) {
        console.warn("Session expired. Using placeholder data.");
        setData(PLACEHOLDER_DATA);
        return;
      }

      const json = await response.json();

      if (json.success) {
        setData(json.results);
      } else {
        console.error("Failed to fetch results:", json.error);
        setData(PLACEHOLDER_DATA);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      setData(PLACEHOLDER_DATA);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Attempt fetch even if unauthenticated to trigger fallback logic
    // But we need to wait for status to settle from "loading"
    if (status !== "loading") {
      fetchData();
    }
  }, [id, status, session]);

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-background/50 backdrop-blur-3xl p-8 space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-12 w-1/3 bg-mountain-meadow-100/20" />
          <Skeleton className="h-4 w-1/2 bg-mountain-meadow-100/10" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-32 rounded-2xl bg-mountain-meadow-100/5" />
          <Skeleton className="h-32 rounded-2xl bg-mountain-meadow-100/5" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-3xl bg-mountain-meadow-100/5" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex-1 overflow-auto bg-background selection:bg-mountain-meadow-200/30">
      <div className="container mx-auto p-6 lg:p-10 space-y-12">
        {/* Header Section */}
        <header className="relative space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mountain-meadow-100/30 border border-mountain-meadow-200/50 text-mountain-meadow-700 text-xs font-bold tracking-widest uppercase mb-2">
            <Award className="h-3 w-3" />
            Test Analytics
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            {data.testName}
          </h1>
          <p className="text-mountain-meadow-600 text-base max-w-2xl leading-relaxed font-medium">
            {data.description}
          </p>

          {/* Abstract Background Glow */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-mountain-meadow-300/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
        </header>

        {/* SECTION 1: STATISTICAL OVERVIEW */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-400">Statistical Metrics</h2>
            <div className="h-px flex-1 mx-6 bg-border/40" />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <AdvancedStatCard
              label="Total Enrolled"
              value={data.stats.totalParticipants}
              icon={<Users className="h-5 w-5" />}
              color="bg-mountain-meadow-100"
              textColor="text-mountain-meadow-600"
              trend="+12% from last test"
            />
            <AdvancedStatCard
              label="Mean Score"
              value={data.stats.averageScore.toFixed(1)}
              icon={<Award className="h-5 w-5" />}
              color="bg-blue-100"
              textColor="text-blue-600"
              trend="Above average"
            />
          </div>
        </section>

        {/* SECTION 2: STUDENT DETAILS */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-400">Student Submissions</h2>
              <Badge variant="outline" className="rounded-full px-3 py-0 border-mountain-meadow-200 text-mountain-meadow-600 bg-mountain-meadow-50/50">
                {data.participants.length} total
              </Badge>
            </div>
            <div className="h-px flex-1 ml-6 bg-border/40" />
          </div>

          <div className="group relative">
            {/* Table Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-mountain-meadow-400 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-10 transition duration-1000 group-hover:duration-200 blur" />

            <div className="relative rounded-2xl border bg-card/60 backdrop-blur-sm overflow-hidden shadow-2xl shadow-mountain-meadow-900/5">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-b border-border/50">
                    <TableHead className="py-5 px-6 font-bold text-foreground">Candidate</TableHead>
                    <TableHead className="font-bold text-foreground">Score Index</TableHead>
                    <TableHead className="font-bold text-foreground">Submission Date</TableHead>
                    <TableHead className="text-right px-6 font-bold text-foreground">Detail View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.participants.map((p, idx) => (
                    <TableRow
                      key={`${p.userId}-${idx}`}
                      className="group/row transition-colors hover:bg-mountain-meadow-50/30 border-b border-border/40 last:border-none"
                    >
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-mountain-meadow-100 to-mountain-meadow-200 flex items-center justify-center font-bold text-mountain-meadow-700 shadow-sm border border-white/50">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-foreground text-base group-hover/row:text-mountain-meadow-700 transition-colors">{p.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-lg font-bold">{p.score}</span>
                          <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-mountain-meadow-500 rounded-full transition-all duration-1000"
                              style={{ width: `${(p.score / 100) * 100}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-medium text-sm">
                        {new Date(p.submittedAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full hover:bg-mountain-meadow-100 hover:text-mountain-meadow-700 transition-all border border-transparent hover:border-mountain-meadow-200/50"
                            onClick={() => router.push(`/admin/users/${p.userId}`)}
                          >
                            <User className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-mountain-meadow-400 hover:bg-mountain-meadow-500 text-white font-bold rounded-lg px-4 gap-2 shadow-lg shadow-mountain-meadow-200 transition-all active:scale-95"
                            onClick={() =>
                              router.push(`/admin/tests/${data.id}/submissions/${p.userId}`)
                            }
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Review
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------- Advanced Helper Components ---------- */

function AdvancedStatCard({ label, value, icon, color, textColor, trend }: any) {
  return (
    <Card className="relative overflow-hidden group border-none shadow-xl shadow-mountain-meadow-900/5 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl">
      <div className={`absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity ${textColor}`}>
        {React.cloneElement(icon, { size: 64 })}
      </div>
      <CardHeader className="pb-2 space-y-0">
        <div className={`w-10 h-10 rounded-xl ${color} ${textColor} flex items-center justify-center mb-4 shadow-inner`}>
          {icon}
        </div>
        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-4xl font-black font-mono tracking-tighter text-foreground decoration-mountain-meadow-400 decoration-2">{value}</div>
        <p className="text-[10px] font-bold text-mountain-meadow-600/80 tracking-wide uppercase">{trend}</p>
      </CardContent>

      {/* Decorative Bottom Line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-mountain-meadow-400 to-transparent opacity-30" />
    </Card>
  );
}
