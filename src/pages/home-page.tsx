import {PageHeader} from "@/components/page-header";
import {ROLES} from "@/constants/roles"; 
import { DashboardPage } from "@/pages/dashboard-page";
import {getRole} from "@/store/token";

export function HomePage() {
    if (getRole() === ROLES.SYSADMIN){
        return <DashboardPage/>
    }

    return(
        <PageHeader 
        title="Welcome to TalentOps"
        description="Please select an option from the menu."/>
    );
} 

