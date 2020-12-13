export interface CaldavConfig {
    url: string;
    username: string;
    password: string;
}

export interface CaldavEvent {
    url: string;
    status: string,
    data: string;
}

export type AtendeeStatus = 'ATTENDEE_STATUS_NEEDS_ACTION' | 'ATTENDEE_STATUS_ACCEPTED' | 'ATTENDEE_STATUS_DECLINED' | 'ATTENDEE_STATUS_TENTATIVE';

export interface Attendee {
    email: string;
    displayName?: string;
    status?: AtendeeStatus;
}