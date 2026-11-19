import {Shield, Users} from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function RoleManagementPanel () {
    const accountCount = 0;

    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">Role management</h2>
                    <p className="text-sm text-muted-foreground">
                        Assign access and portal responsibilities to signed-in accounts.
                    </p>
                </div>
                <Badge variant="outline">
                    <Users className="mr-1 size-3.5" /> {accountCount} accounts
                </Badge>
            </div>

            <Card>
                <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="size-4" /> Account access
                </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                <Table className="min-w-[720px]">
                    <TableHeader className="bg-muted">
                    <TableRow>
                        <TableHead className="px-6">Account</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Current role</TableHead>
                        <TableHead className="px-6 text-right">Assign role</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    <TableRow>
                        <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                        No accounts to show yet.
                        </TableCell>
                    </TableRow>
                    </TableBody>
                </Table>
                </CardContent>
            </Card>

        </section>
    )
}