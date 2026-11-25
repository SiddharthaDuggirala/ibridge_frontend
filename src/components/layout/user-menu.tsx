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
} from "@/components/ui/dropdown-menu";
import { ChangePasswordDialog } from "@/components/layout/change-password-dialog";
import {baseApi} from "@/store/base-api";
import {clearToken} from "@/store/token";
import { useState } from "react";

export function UserMenu() {

    const dispatch = useDispatch();
    const navigate = useNavigate(); 
    const [passwordOpen, setPasswordOpen] = useState(false);

    function handleLogout() {
        clearToken();
        dispatch(baseApi.util.resetApiState());
        navigate("/login");
    } 

    return(
        <>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Account menu">
                    <Avatar className="size-8">
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                            ME
                        </AvatarFallback>
                    </Avatar>

                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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