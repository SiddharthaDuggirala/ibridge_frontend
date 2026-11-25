import {Database} from "lucide-react"; 
import {Link} from "react-router";


import { BUILT_PATHS, NAV_ITEMS } from "@/components/layout/navigation";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";


const AREAS = NAV_ITEMS.filter((item) => item.path !== "/" && BUILT_PATHS.includes(item.path));

export function AllEntities() {
    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">All entities</h2>
                    <p className ="text-sm text-muted-foreground">Direct access to every operational area </p>

                </div>
                <Badge variant="outline">
                    <Database className="mr-1 size-3.5" /> {AREAS.length} areas
                </Badge>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {AREAS.map((item) => (
                <Button key={item.path} variant="outline" className="h-auto justify-start py-3" asChild>
                    <Link to={item.path}>
                        <item.icon className="size-4 text-muted-foreground" />
                        <span className="truncate">{item.label}</span>
                    </Link>
                </Button>
                ))}
            </div>
        </section>
    )
}