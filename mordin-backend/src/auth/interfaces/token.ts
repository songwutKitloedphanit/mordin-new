import { UserRoles } from "src/users/enums/user.enum";

export type JWTToken = {
    access_token: string;
}

export type JWTPayload = {
    sub: number | string;
    username: string;
    email: string;
    role: UserRoles;
}