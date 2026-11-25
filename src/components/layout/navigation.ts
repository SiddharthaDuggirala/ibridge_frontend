import { BarChart3,Briefcase,
    Building2,
CalendarCheck,
CalendarOff,
ClipboardCheck,
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
type LucideIcon,
UserCog,
UserMinus,
Workflow,
Coffee,
} from "lucide-react";
import { ROLES } from "@/constants/roles";

export interface NavItem{
    label:string;
    path:string;
    icon:LucideIcon;
    roles?: string[];
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
            {label:"Clients", path:"/clients", icon:Building2, roles:[ROLES.SYSADMIN]},
            {label:"Requirements", path:"/requirements",icon:ClipboardList},
        ],
    },
    {
        label:"Recruting",
        items:[ { label: "Candidates", path: "/candidates", icon: Users, roles: [ROLES.RECRUITER, ROLES.LEAD, ROLES.BU_HEAD,ROLES.MD,ROLES.HR] },
            { label: "Proposals", path: "/proposals", icon: ClipboardCheck,roles:[ROLES.RECRUITER,ROLES.LEAD,ROLES.BU_HEAD,ROLES.MD,ROLES.HR] },
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
          { label: "Onboarding", path: "/onboarding", icon: UserPlus, roles: [ROLES.RECRUITER, ROLES.LEAD, ROLES.BU_HEAD, ROLES.MD, ROLES.HR] },
          { label: "Exits", path: "/exits", icon: UserMinus, roles: [ROLES.LEAD, ROLES.BU_HEAD, ROLES.MD, ROLES.HR] },
          { label: "Bench", path: "/bench", icon: Coffee, roles: [ROLES.LEAD, ROLES.BU_HEAD, ROLES.MD, ROLES.HR] },
          { label: "Pipeline Overview", path: "/pipeline", icon: Workflow, roles: [ROLES.MD, ROLES.BU_HEAD] },
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
          { label: "Team", path: "/team", icon: UserCog },
            { label: "Settings", path: "/settings", icon: Settings },
        ],
    },
    
];

export const NAV_ITEMS:NavItem[] = NAV_GROUPS.flatMap(group => group.items);

export function findNavItem(pathname: string): NavItem | undefined {
    const firstPart = "/" + (pathname.split("/").filter(Boolean)[0] ?? "");
    return NAV_ITEMS.find((item) => item.path === firstPart);
  }


  export function navGroupsFor(role: string | null): NavGroup[] {
    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => role === ROLES.SYSADMIN || (role !== null && item.roles?.includes(role)),
      ),
    })).filter((group) => group.items.length > 0);
  }
