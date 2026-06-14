export type AuthenResponse<T = string> = {
    code: number;
    record: number;
    message: string;
    result: T;
}

export type AuthenProfileResponse = AuthenResponse<AuthenProfile[]>;

export type AuthenProfile = {
    name: string;
    telephoneNumber: string;
    employeeType: string;
    manager: string;
    plantName: string;
    plantCode: string;
    mail: string;
    department: string;
    companyName: string;
    companyCode: string;
    userPrincipalName: string;
    description: string;
}