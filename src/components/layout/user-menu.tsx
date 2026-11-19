import { LogOut } from "lucide-react";
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

import {baseApi} from "@/store/base-api";
import {clearToken} from "@/store/token";

export function UserMenu() {

    const dispatch = useDispatch();
    const navigate = useNavigate(); 

    function handleLogout() {
        clearToken();
        dispatch(baseApi.util.resetApiState());
        navigate("/login");
    } 

    return(
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
                <DropdownMenuItem onSelect={handleLogout}>
                    <LogOut className="size-4"/>
                        Sign Out
                    
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )


}