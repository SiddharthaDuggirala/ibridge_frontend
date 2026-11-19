import { BarChart3,Briefcase,
    Building2,
CalendarCheck,
CalendarOff,
ClipboardList,
Clock,
FileSignature,
Gauge,
GitBranch,
History,
IdCard,
Landmark,
LayoutDashboard,
LifeBuoy,
//LifeBuoyIcon,
MessagesSquare,
ReceiptText,
Send,
Settings,
ShieldCheck,
Target,
UserPlus,
Users,
Wallet,
type LucideIcon,} from "lucide-react";

export interface NavItem{
    label:string;
    path:string;
    icon:LucideIcon;
}

export interface NavGroup{
    label:string;
    items:NavItem[];
}

export const NAV_GROUPS:NavGroup[] = [{
    label:"Workspace",
    items: [
        {label:"Dashboard",path:'/', icon: LayoutDashboard},
        {label:"Recruiter Workbench", path:'/workbench',icon:Gauge},
        {label:"Tickets",path:"/tickets", icon:LifeBuoy},
    ]
    },
    {
        label:"Sales & Clients",
        items:[
            {label:"Clients", path:"/clients", icon:Building2},
            {label:"Requirements", path:"/requirements",icon:ClipboardList},
        ],
    },
    {
        label:"Recruting",
        items:[ { label: "Candidates", path: "/candidates", icon: Users },
            { label: "Pipeline", path: "/applications", icon: GitBranch },
            { label: "Submissions", path: "/submissions", icon: Send },
            { label: "Communications", path: "/communications", icon: MessagesSquare },
            { label: "Interviews", path: "/interviews", icon: CalendarCheck },
            { label: "Offers", path: "/offers", icon: FileSignature },
            { label: "Fill priorities", path: "/priorities", icon: Target },
        ],
    },
    {
        label: "People",
        items: [
          { label: "Onboarding", path: "/onboarding", icon: UserPlus },
          { label: "Verification", path: "/verification", icon: ShieldCheck },
          { label: "Employees", path: "/employees", icon: IdCard },
          { label: "Leave", path: "/leave", icon: CalendarOff },
        ],
    },
    {
        label: "Delivery",
        items: [
          { label: "Assignments", path: "/assignments", icon: Briefcase },
          { label: "Timesheets", path: "/timesheets", icon: Clock },
        ],
    },
    {
        label: "Finance",
        items: [
      { label: "Payroll", path: "/payroll", icon: Wallet },
      { label: "Invoices", path: "/invoices", icon: ReceiptText },
      { label: "Collections", path: "/collections", icon: Landmark },
    ],
    },
    {
        label: "Insights",
    items: [
      { label: "Reports", path: "/reports", icon: BarChart3 },
      { label: "Audit history", path: "/audit", icon: History },
    ],
    },
    {
        label: "Administration",
        items: [
            { label: "Settings", path: "/settings", icon: Settings }
        ],
    },
];

export const NAV_ITEMS:NavItem[] = NAV_GROUPS.flatMap(group => group.items);

export function findNavItem(pathname: string): NavItem | undefined {
    const firstPart = "/" + (pathname.split("/").filter(Boolean)[0] ?? "");
    return NAV_ITEMS.find((item) => item.path === firstPart);
  }


