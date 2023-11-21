//This is the account object without info that shouldnt be sent to the account owner
export interface FilteredAccount {
    name: string,
    email: string,
    createdAt: number,
    ownedAPIs: string[],
    allowedAPIs: string[]
}


//This is for API owners to use and is meant to not return any of the account owner's API related data
export interface ExternalFacingFilteredAccount {
    name: string,
    email: string,
    createdAt: number
}