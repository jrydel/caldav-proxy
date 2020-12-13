import fetch, { Response } from 'node-fetch';
import moment from 'moment';

import { CaldavConfig } from '../types';

export interface CalDavService {
    getEventByUrl(eventUrl: string): Promise<Response>;

    getEventByUid(eventUid: string): Promise<Response>;

    createUpdateEvent(eventData: string, eventUid: string): Promise<Response>;

    deleteEvent(eventUid: string): Promise<Response>;

    listAllEvents(): Promise<Response>;

    listEventsInTimeRange(startDate: Date, endDate?: Date): Promise<Response>;

    multiGetEvents(eventUrls: string[]): Promise<Response>;

    getCtag(): Promise<Response>;

    getEtags(): Promise<Response>;
}

const auth = (username: string, password: string) => Buffer.from(username + ':' + password).toString('base64');

export class DefaultCalDavService implements CalDavService {

    caldavConfig: CaldavConfig;

    constructor(caldavConfig: CaldavConfig) {
        this.caldavConfig = caldavConfig;
    }

    getEventByUrl = async (eventUrl: string): Promise<Response> => {
        // Method for getting single event
        // Response status upon successfull request is 200
        const url = `${this.caldavConfig.url}${eventUrl}`;

        return await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': auth(this.caldavConfig.username, this.caldavConfig.password)
            }
        });
    };

    getEventByUid = async (eventUid: string): Promise<Response> => {
        // Method for getting single event
        // Response status upon successfull request is 200
        const url = `${this.caldavConfig.url}`;

        const xml = '<C:calendar-query xmlns:C="urn:ietf:params:xml:ns:caldav">' +
            '<D:prop xmlns:D="DAV:">' +
            '<D:getetag/>' +
            '<C:calendar-data/>' +
            '</D:prop>' +
            '<C:filter>' +
            '<C:comp-filter name="VCALENDAR">' +
            '<C:comp-filter name="VEVENT">' +
            '<C:prop-filter name="UID">' +
            `<C:text-match collation="i;octet">${eventUid}</C:text-match>` +
            '</C:prop-filter>' +
            '</C:comp-filter>' +
            '</C:comp-filter>' +
            '</C:filter>' +
            '</C:calendar-query>`';

        return await fetch(url, {
            method: 'REPORT',
            headers: {
                'Authorization': auth(this.caldavConfig.username, this.caldavConfig.password),
                'Content-Type': 'text/calendar; charset=utf-8',
                'Depth': '1'
            },
            body: xml
        });
    };

    createUpdateEvent = async (eventData: string, eventUid: string): Promise<Response> => {
        // Method for creating or updating single event
        // Response status upon successfull request 204 - updated or 201 - created
        const url = `${this.caldavConfig.url}${eventUid}`;

        return await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `basic ${auth(this.caldavConfig.username, this.caldavConfig.password)}`,
                'Content-Type': 'text/calendar; charset=utf-8'
            },
            body: eventData
        });
    };

    deleteEvent = async (eventUid: string): Promise<Response> => {
        // Method for deleting single event
        // Response status upon successfull request is 204
        const url = `${this.caldavConfig.url}${eventUid}`;

        return await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `basic ${auth(this.caldavConfig.username, this.caldavConfig.password)}`,
            },
        });
    };

    listAllEvents = async (): Promise<Response> => {
        // Method for getting all events in calendar
        // Response status upon successfull request is 207

        const url = this.caldavConfig.url;

        const xml = '<c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">' +
            '<d:prop>' +
            '<d:getetag />' +
            '<c:calendar-data />' +
            '</d:prop>' +
            '<c:filter>' +
            '<c:comp-filter name="VCALENDAR">' +
            '<c:comp-filter name="VEVENT" />' +
            '</c:comp-filter>' +
            '</c:filter>' +
            '</c:calendar-query>';

        return await fetch(url, {
            method: 'REPORT',
            headers: {
                'Authorization': `basic ${auth(this.caldavConfig.username, this.caldavConfig.password)}`,
                'Content-type': 'application/xml; charset=utf-8',
                'Prefer': 'return-minimal',
                'Depth': '1',
            },
            body: xml
        });
    };

    listEventsInTimeRange = async (startDate: Date, endDate?: Date): Promise<Response> => {
        // Method for getting events from calendar in certain time range
        // Response status upon successfull request is 207
        const startDateString = moment(startDate).utc().format('YYYYMMDD[T]HHmmss[Z]');
        const endDateString = (endDate) ? moment(endDate).utc().format('YYYYMMDD[T]HHmmss[Z]') : null;
        const endTimeRange = (endDateString) ? ` end="${endDateString}"` : '';

        const url = this.caldavConfig.url;

        const xml = '<c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">' +
            '<d:prop>' +
            '<d:getetag />' +
            '<c:calendar-data />' +
            '</d:prop>' +
            '<c:filter>' +
            '<c:comp-filter name="VCALENDAR">' +
            '<c:comp-filter name="VEVENT">' +
            `<c:time-range start="${startDateString}"${endTimeRange}/>` +
            '</c:comp-filter>' +
            '</c:comp-filter>' +
            '</c:filter>' +
            '</c:calendar-query>';

        return await fetch(url, {
            method: 'REPORT',
            headers: {
                'Authorization': `basic ${auth(this.caldavConfig.username, this.caldavConfig.password)}`,
                'Content-type': 'application/xml; charset=utf-8',
                'Prefer': 'return-minimal',
                'Depth': '1',
            },
            body: xml
        });
    };

    multiGetEvents = async (eventUrls: string[]): Promise<Response> => {
        // Method for getting multiple by their url
        // Response status upon successfull request is 207
        const url = this.caldavConfig.url;

        const xml = '<C:calendar-multiget xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">' +
            '<D:prop>' +
            '<D:getetag/>' +
            '<C:calendar-data/>' +
            `</D:prop>${this.multiGetSetRequestUrls(eventUrls)}` +
            '</C:calendar-multiget>';

        return await fetch(url, {
            method: 'REPORT',
            headers: {
                'Authorization': `basic ${auth(this.caldavConfig.username, this.caldavConfig.password)}`,
                'Content-type': 'application/xml; charset=utf-8',
                'Prefer': 'return-minimal',
            },
            body: xml
        });
    };

    getCtag = async (): Promise<Response> => {
        // Method for getting ctag (for checking if anything changed on the calendar)
        // Response status upon successfull request is 207
        // Status in xml response must also be checked, it has to be 200 OK
        const url = this.caldavConfig.url;

        const xml = '<d:propfind xmlns:d="DAV:" xmlns:cs="http://calendarserver.org/ns/">' +
            '<d:prop>' +
            '<d:displayname />' +
            '<cs:getctag />' +
            '</d:prop>' +
            '</d:propfind>';

        return await fetch(url, {
            method: 'PROPFIND',
            headers: {
                'Authorization': `basic ${auth(this.caldavConfig.username, this.caldavConfig.password)}`,
                'Content-type': 'application/xml; charset=utf-8',
                'Prefer': 'return-minimal',
                'Depth': '0',
            },
            body: xml
        });
    };

    getEtags = async (): Promise<Response> => {
        // Method for getting etags of events, to check if any specific event has changed
        // Response status upon successfull request is 207

        const url = this.caldavConfig.url;

        const xml = '<c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">' +
            '<d:prop>' +
            '<d:getetag />' +
            '</d:prop>' +
            '<c:filter>' +
            '<c:comp-filter name="VCALENDAR">' +
            '<c:comp-filter name="VEVENT" />' +
            '</c:comp-filter>' +
            '</c:filter>' +
            '</c:calendar-query>';

        return await fetch(url, {
            method: 'REPORT',
            headers: {
                'Authorization': `basic ${auth(this.caldavConfig.username, this.caldavConfig.password)}`,
                'Content-type': 'application/xml; charset=utf-8',
                'Prefer': 'return-minimal',
                'Depth': '1',
            },
            body: xml
        });
    };

    private multiGetSetRequestUrls(eventUrls: string[]): string {
        let data = '';

        for (const url of eventUrls) {
            data += `<D:href>${url}</D:href>\r\n`;
        }

        return data;
    }
}