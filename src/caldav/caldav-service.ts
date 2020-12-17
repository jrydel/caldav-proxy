import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';
import moment from 'moment';

import { CaldavConfig, Event } from '../types';

const caldavFormat = 'YYYYMMDD[T]HHmmss[Z]';

const fetchRequest = async (url: RequestInfo, options: RequestInit): Promise<Response> => {
    console.log("OUTGOING", { timestamp: new Date(), url: url, method: options.method, headers: options.headers });
    return await fetch(url, options);
}

interface CaldavFetcher {
    fetchEventByUid(config: CaldavConfig, id: string): Promise<Response>;

    fetchEvents(config: CaldavConfig): Promise<Response>;

    fetchEventsBetween(config: CaldavConfig, startDate: string, endDate: string): Promise<Response>;

    fetchCreateUpdateEvent(config: CaldavConfig, event: Event): Promise<Response>;

    fetchDeleteEvent(config: CaldavConfig, id: string): Promise<Response>;
}

export class CaldavFetcherImpl implements CaldavFetcher {

    fetchEventByUid = async (config: CaldavConfig, id: string): Promise<Response> => {
        // Method for getting single event
        // Response status upon successfull request is 200
        const url = `${config.url}`;

        const xml = '<C:calendar-query xmlns:C="urn:ietf:params:xml:ns:caldav">' +
            '<D:prop xmlns:D="DAV:">' +
            '<D:getetag/>' +
            '<C:calendar-data/>' +
            '</D:prop>' +
            '<C:filter>' +
            '<C:comp-filter name="VCALENDAR">' +
            '<C:comp-filter name="VEVENT">' +
            '<C:prop-filter name="UID">' +
            `<C:text-match collation="i;octet">${id}</C:text-match>` +
            '</C:prop-filter>' +
            '</C:comp-filter>' +
            '</C:comp-filter>' +
            '</C:filter>' +
            '</C:calendar-query>`';

        return await fetchRequest(url, {
            method: 'REPORT',
            headers: {
                'Authorization': `Basic ${config.auth}`,
                'Content-Type': 'text/xml; charset=utf-8',
                'Depth': '1'
            },
            body: xml
        });
    };

    fetchEvents = async (config: CaldavConfig): Promise<Response> => {
        // Method for getting all events in calendar
        // Response status upon successfull request is 207

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

        return await fetchRequest(config.url, {
            method: 'REPORT',
            headers: {
                'Authorization': `Basic ${config.auth}`,
                'Content-type': 'application/xml; charset=utf-8',
                'Prefer': 'return-minimal',
                'Depth': '1',
            },
            body: xml
        });
    };

    fetchEventsBetween = async (config: CaldavConfig, startUTC: string, endUTC: string): Promise<Response> => {
        // Method for getting events from calendar in certain time range
        // Response status upon successfull request is 207
        const startDateString = new Date(startUTC).toISOString();
        const endDateString = new Date(endUTC).toISOString();

        const xml = '<c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">' +
            '<d:prop>' +
            '<d:getetag />' +
            '<c:calendar-data />' +
            '</d:prop>' +
            '<c:filter>' +
            '<c:comp-filter name="VCALENDAR">' +
            '<c:comp-filter name="VEVENT">' +
            `<c:time-range start="${startDateString}" end="${endDateString}"/>` +
            '</c:comp-filter>' +
            '</c:comp-filter>' +
            '</c:filter>' +
            '</c:calendar-query>';

        return await fetchRequest(config.url, {
            method: 'REPORT',
            headers: {
                'Authorization': `Basic ${config.auth}`,
                'Content-type': 'application/xml; charset=utf-8',
                'Prefer': 'return-minimal',
                'Depth': '1',
            },
            body: xml
        });
    };

    fetchCreateUpdateEvent = async (config: CaldavConfig, event: Event): Promise<Response> => {
        // Method for creating or updating single event
        // Response status upon successfull request 204 - updated or 201 - created
        const url = `${config.url}${event.id}.ics`;

        const data = 'BEGIN:VCALENDAR\n' +
            'BEGIN:VEVENT\n' +
            `UID:${event.id}\n` +
            `SUMMARY:${event.name}\n` +
            `DTSTART:${moment.utc(event.start).format(caldavFormat)}\n` +
            `DTEND:${moment.utc(event.end).format(caldavFormat)}\n` +
            `ORGANIZER;CN=${event.organizer?.name}:mailto:${event.organizer?.mail}\n` +
            'END:VEVENT\n' +
            'END:VCALENDAR\n';

        console.log(data);

        return await fetchRequest(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Basic ${config.auth}`,
                'Content-Type': 'text/calendar; charset=utf-8'
            },
            body: data
        });
    };

    fetchDeleteEvent = async (config: CaldavConfig, id: string): Promise<Response> => {
        // Method for deleting single event
        // Response status upon successfull request is 204
        const url = `${config.url}${id}.ics`;

        return await fetchRequest(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Basic ${config.auth}`,
            },
        });
    };
}