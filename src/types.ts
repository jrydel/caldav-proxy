import { VEvent } from "node-ical";

export interface CaldavConfig {
    url: string;
    auth: string;
}

export interface CaldavEvent {
    url: string;
    status: string,
    data: string;
}

export interface Person {
    mail: string;
    name: string;
}

export interface Event {
    id: string;
    name: string;
    start: string;
    end: string;
    organizer: Person | null;
    attendee: Person[];
    repeat: { start: string, end: string, freq: number } | null;
}

export interface CustomVEvent extends VEvent {
    attendee: any;
    rrule: any;
}