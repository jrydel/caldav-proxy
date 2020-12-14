export interface CaldavConfig {
    url: string;
    auth: string;
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

export interface Event {
    id: string;
    name: string;
    start: Date;
    end: Date;
    organiser: { id: string, name: string };
    attendee: { id: string, name: string }[];
}