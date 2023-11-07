//This is the account object without info that shouldnt be sent to the user
export interface FilteredAccount {
    name: string,
    email: string,
    createdAt: number,
    ownedAPIs: string[],
    allowedAPIs: string[]
}


//This is for API owners to use and is meant to not return any of the users API related data
export interface ExternalFacingFilteredAccount {
    name: string,
    email: string,
    createdAt: number
}