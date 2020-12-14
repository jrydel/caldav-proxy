
import ical, { CalendarComponent } from 'node-ical';

import { CalDavService, DefaultCalDavService } from './caldav/caldav-service.js';
import { CalDavParser, DefaultCalDavParser } from './caldav/caldav-parser.js';
import { CaldavConfig } from './types.js';

interface CalDavClient {

    getEventByUid(eventUid: string): Promise<Record<string, CalendarComponent>>;

    getEvents(): Promise<Record<string, CalendarComponent>[]>;

    getEventsBetween(startDate: Date, endDate?: Date): Promise<Record<string, CalendarComponent>[]>;

    // deleteEvent(eventUid: string): Promise<void>;

    // createEvent(eventUrl: string,
    //     id: string,
    //     referenceIds: string[],
    //     title: string,
    //     description: string,
    //     location: string,
    //     startDate: ICAL.TimeJsonData,
    //     endDate: ICAL.TimeJsonData,
    //     attendees: Attendee[],
    //     categories: string[]): Promise<void>;

    // updateEvent(eventUrl: string,
    //     event: ICAL.Event,
    //     referenceIds: string[],
    //     title: string,
    //     description: string,
    //     location: string,
    //     startDate: ICAL.TimeJsonData,
    //     endDate: ICAL.TimeJsonData,
    //     attendees: Attendee[],
    //     categories: string[]): Promise<void>;

    // multiGetEvents(eventUrls: string[]): Promise<ICAL.Event[]>;
}

export class DefaultCalDavClient implements CalDavClient {
    service: CalDavService;
    parser: CalDavParser;

    constructor(caldavConfig: CaldavConfig) {
        this.service = new DefaultCalDavService(caldavConfig);
        this.parser = new DefaultCalDavParser();
    }

    getEventByUid = async (eventUid: string): Promise<Record<string, CalendarComponent>> => {
        try {
            const response = await this.service.getEventByUid(eventUid);
            if (response.status === 207) {
                const eventData = await this.parser.parseEvent(await response.text());
                return await ical.async.parseICS(eventData.data);
            }
            throw new Error(`Unexpected response status: ${response.status}`);
        } catch (e) {
            throw new Error(`CalDavClient.GetEventByUid: ${e.message}. `);
        }
    };

    getEvents = async (): Promise<Record<string, CalendarComponent>[]> => {
        try {
            const response = await this.service.getEvents();
            if (response.status === 207) {
                return await this.parseListOfEvents(await response.text(), 'ListAllEvents');
            }
            throw new Error(`Unexpected response status: ${response.status}`);
        } catch (e) {
            throw new Error(`CalDavClient.ListAllEvents: ${e.message}. `);
        }
    };

    getEventsBetween = async (startDate: Date, endDate?: Date): Promise<Record<string, CalendarComponent>[]> => {
        try {
            const response = await this.service.getEventsBetween(startDate, endDate);
            if (response.status === 207) {
                return this.parseListOfEvents(await response.text(), 'ListEventsInTimeRange');
            }
            throw new Error(`Unexpected response status: ${response.status}`);
        } catch (e) {
            throw new Error(`CalDavClient.ListEventsInTimRange: ${e.message}. `);
        }
    };


    // deleteEvent = async (eventUrl: string): Promise<void> => {
    //     try {
    //         const response = await this.service.deleteEvent(eventUrl);

    //         if (response.status === 204) {
    //             console.info(`CalDavClient.DeleteEvent: Successfully deleted event ${eventUrl}. `);
    //             return;
    //         }
    //         throw new Error(`Unexpected response status: ${response.status}`);
    //     } catch (e) {
    //         throw new Error(`CalDavClient.DeleteEvent: ${e.message}. `);
    //     }
    // };

    // multiGetEvents = async (eventUrls: string[]): Promise<ICAL.Event[]> => {
    //     try {
    //         const response = await this.service.multiGetEvents(eventUrls);

    //         if (response.status === 207) {
    //             return await this.parseListOfEvents(await response.text(), 'MultiGetEvents');
    //         }
    //         throw new Error(`Unexpected response status: ${response.status}`);
    //     } catch (e) {
    //         throw new Error(`CalDavClient.ListEventsInTimRange: ${e.message}. `);
    //     }
    // };

    // createEvent = async (eventUrl: string, id: string, referenceIds: string[], title: string, description: string, location: string, startDate: ICAL.TimeJsonData, endDate: ICAL.TimeJsonData, attendees: Attendee[], categories: string[]): Promise<void> => {
    //     try {
    //         // wrap request data in VCALENDAR
    //         const calendar = new ICAL.Component('vcalendar');
    //         const event = new ICAL.Event(calendar);

    //         event.component.addPropertyWithValue('BEGIN', 'VEVENT');
    //         event.uid = id;
    //         event.summary = title;
    //         event.description = description;
    //         event.location = location;
    //         event.startDate = new ICAL.Time(startDate);
    //         event.endDate = new ICAL.Time(endDate);

    //         if (categories.length) {
    //             for (const category of categories) {
    //                 const categoriesProperty = new ICAL.Property('categories');
    //                 categoriesProperty.setValue(category);
    //                 event.component.addProperty(categoriesProperty);
    //             }
    //         }

    //         if (attendees.length) {
    //             this.addAttendees(attendees, event);
    //         }

    //         if (referenceIds.length) {
    //             event.component.addPropertyWithValue('referenceids', referenceIds.join(','));
    //         }

    //         event.component.addPropertyWithValue('END', 'VEVENT');
    //         let eventString = event.toString();

    //         // change ATTENDEE: to ATTENDEE;
    //         eventString = eventString.replace(/ATTENDEE:/gi, 'ATTENDEE;');

    //         await this.service.createUpdateEvent(eventString, eventUrl);
    //         console.info(`CalDavClient.CreateUpdateEvent: Successfully created event ${id}. `);
    //     } catch (e) {
    //         throw new Error(`CalDavClient.CreateEvent: ${e.message}. `);
    //     }
    // };

    // updateEvent = async (eventUrl: string, event: ICAL.Event, referenceIds: string[], title: string, description: string, location: string, startDate: ICAL.TimeJsonData, endDate: ICAL.TimeJsonData, attendees: Attendee[], categories: string[]): Promise<void> => {
    //     try {
    //         event.summary = title;
    //         event.description = description;
    //         event.location = location;
    //         event.startDate = new ICAL.Time(startDate);
    //         event.endDate = new ICAL.Time(endDate);

    //         event.component.removeAllProperties('categories');
    //         event.component.removeAllProperties('attendee');
    //         event.component.removeAllProperties('referenceids');

    //         if (categories.length) {
    //             for (const category of categories) {
    //                 const categoriesProperty = new ICAL.Property('categories');
    //                 categoriesProperty.setValue(category);
    //                 event.component.addProperty(categoriesProperty);
    //             }
    //         }
    //         if (attendees.length) {
    //             this.addAttendees(attendees, event);
    //         }

    //         if (referenceIds.length) {
    //             event.component.addPropertyWithValue('referenceids', referenceIds.join(','));
    //         }

    //         // change ATTENDEE: to ATTENDEE;
    //         let eventString = event.toString();
    //         eventString = eventString.replace(/ATTENDEE:/gi, 'ATTENDEE;');

    //         await this.service.createUpdateEvent('BEGIN:VCALENDAR\r\n' + eventString + '\r\nEND:VCALENDAR', eventUrl);
    //     } catch (e) {
    //         throw new Error(`CalDavClient.UpdateEvent: ${e.message}. `);
    //     }
    // };

    private parseListOfEvents = async (responseData: string, method: string): Promise<Record<string, CalendarComponent>[]> => {
        const eventsData = await this.parser.parseListOfEvents(responseData);

        const events: Record<string, CalendarComponent>[] = [];
        if (eventsData.length) {
            for (const eventData of eventsData) {
                const event = await ical.async.parseICS(eventData.data);
                events.push(event);
            }
        }
        console.debug(`${method}: events successfully parsed.`);
        return events;
    };

    // private addAttendees(attendees: Attendee[], event: ICAL.Event): void {
    //     for (const attendee of attendees) {
    //         let attendeeValue = '';

    //         if (attendee.status) {
    //             attendeeValue += `PARTSTAT=${attendee.status};`;
    //         }

    //         if (attendee.displayName) {
    //             attendeeValue += `CN=${attendee.displayName}`;
    //         }

    //         if (attendee.email) {
    //             attendeeValue += `:mailto:${attendee.email}`;
    //         }
    //         event.component.addPropertyWithValue('ATTENDEE', attendeeValue);
    //     }
    // }
}