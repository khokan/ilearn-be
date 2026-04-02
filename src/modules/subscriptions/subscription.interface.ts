
export interface IBookSubscriptionPayload {
    studentId : string,
    planId : string,
}

export interface IUpdateSubscriptionPayload {
    studentId? : string,
    planId? : string,
    status? : string,
}