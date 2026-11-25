const TOKEN_KEY = "token";
const ROLE_KEY = "role";
const NAME_KEY = "name";

// The signed-in person's name, only for showing on screen.
export function getUserName(): string | null {
    return localStorage.getItem(NAME_KEY);
}

export function setUserName(name: string): void {
    localStorage.setItem(NAME_KEY, name);
}

export function getToken(): string|null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token:string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function getRole(): string | null {
    return localStorage.getItem(ROLE_KEY);
}

export function setRole(role:string | null): void {
    if (role){
        localStorage.setItem(ROLE_KEY, role);
    }
    else{
        localStorage.removeItem(ROLE_KEY);
    }
}

export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(NAME_KEY);
}