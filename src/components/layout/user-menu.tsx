import { LogOut,KeyRound } from "lucide-react";
import { useDispatch } from "react-redux";
import {useNavigate} from "react-router";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChangePasswordDialog } from "@/components/layout/change-password-dialog";
import {baseApi} from "@/store/base-api";
import { ROLE_OPTIONS } from "@/constants/roles";
import {clearToken, getRole, getUserName} from "@/store/token";
import { initials } from "@/utils/initials";
import { useState } from "react";

export function UserMenu() {

    const dispatch = useDispatch();
    const navigate = useNavigate(); 
    const [passwordOpen, setPasswordOpen] = useState(false);
    const name = getUserName();
    const role = getRole();
    const roleLabel = ROLE_OPTIONS.find((option) => option.value === role)?.label ?? "";

    function handleLogout() {
        clearToken();
        dispatch(baseApi.util.resetApiState());
        navigate("/login");
    } 

    return(
        <>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto gap-2 px-2 py-1" aria-label="Account menu">
                    <span className="hidden text-right leading-tight sm:block">
                        <span className="block text-sm font-medium">{name ?? "Account"}</span>
                        <span className="block text-xs font-normal text-muted-foreground">{roleLabel}</span>
                    </span>
                    <Avatar className="size-8">
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                            {initials(name ?? "")}
                        </AvatarFallback>
                    </Avatar>

                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                    {name ?? "Account"}
                    <p className="text-xs font-normal text-muted-foreground">{roleLabel}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setPasswordOpen(true)}>
                    <KeyRound className="size-4"/>
                    Change password
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleLogout}>
                    <LogOut className="size-4"/>
                        Sign Out

                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
        </>
    )


}