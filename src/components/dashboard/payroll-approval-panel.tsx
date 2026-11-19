import { Clock3,ReceiptText,Users,type LucideIcon } from "lucide-react";
import type {ReactNode} from "react";

import {Badge} from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


const TRACK = ["Draft", "Submitted", "Approved", "Processing", "Paid"];

export function PayRollApprovalPanel () {
  const timesheetCount = 0;
  const invoiceCount = 0;
  const payrollCount = 0;
  const total = timesheetCount + invoiceCount + payrollCount;

  return (
    <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
            <div> 
                <h2 className="text-lg font-semibold">Payroll approval center</h2>
                <p className="text-sm text-muted-foreground">
                    Manager decisions across hours, client billing and salary runs.
                </p>
            </div>
            <Badge variant={total > 0 ? "secondary" : "outline"}>{total} pending</Badge>
        </div>
        <div className="grid gap-2 sm:grid-cols-5">
        {TRACK.map((step, index) => (
          <div
            key={step}
            className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2"
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {index + 1}
            </span>
            <span className="truncate text-xs font-medium">{step}</span>
          </div>
        ))}
      </div>

      {/* The three approval lists */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ApprovalCard title="Employee timesheets" icon={Clock3} count={timesheetCount} />
        <ApprovalCard title="Client invoices" icon={ReceiptText} count={invoiceCount} />
        <ApprovalCard title="Payroll runs" icon={Users} count={payrollCount} />
      </div>
    </section>
  )
};

function ApprovalCard({
    title,
    icon: Icon,
    count,
    children,
  }: {
    title: string;
    icon: LucideIcon;
    count: number;
    children?: ReactNode;
  }) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Icon className="size-4 text-muted-foreground" />
            {title}
          </CardTitle>
          <Badge variant="outline">{count}</Badge>
        </CardHeader>
        <CardContent className="space-y-2">
          {count > 0 ? (
            children
          ) : (
            <p className="py-5 text-center text-xs text-muted-foreground">Nothing awaiting approval.</p>
          )}
        </CardContent>
      </Card>
    );
  }