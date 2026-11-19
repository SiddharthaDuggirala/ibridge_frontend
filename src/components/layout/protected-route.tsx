import {Navigate,Outlet} from "react-router";

import {getToken} from "@/store/token";

export function ProtectedRoute() {

    if(!getToken()){
        return <Navigate to="/login" replace/>

    }
    return <Outlet/>
} 
