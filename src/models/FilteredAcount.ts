//This is the account object without info that shouldnt be sent to the user
export interface FilteredAccount {
    name: string,
    email: string,
    APIKeys: string[],
    createdAt: number,
    allowedAPIKeys: string[]
}