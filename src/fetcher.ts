import ical, { CalendarComponent } from 'node-ical';
import { CaldavParserImpl } from './caldav/caldav-parser.js';
import { CaldavFetcherImpl } from './caldav/caldav-service.js';

import { CaldavConfig } from './types.js';

const parser = new CaldavParserImpl();
const fetcher = new CaldavFetcherImpl();

export const getEventByUid = async (config: CaldavConfig, eventUid: string): Promise<Record<string, CalendarComponent>> => {
    try {
        const response = await fetcher.fetchEventByUid(config, eventUid);
        if (response.status === 207) {
            const eventData = await parser.parseCalEvent(await response.text());
            return await ical.async.parseICS(eventData.data);
        }
        throw new Error(`Unexpected response status: ${response.status}`);
    } catch (e) {
        throw new Error(`CalDavClient.GetEventByUid: ${e.message}. `);
    }
};

export const getEvents = async (config: CaldavConfig): Promise<Record<string, CalendarComponent>[]> => {
    try {
        const response = await fetcher.fetchEvents(config);
        if (response.status === 207) {
            return await parseEvents(await response.text());
        }
        throw new Error(`Unexpected response status: ${response.status}`);
    } catch (e) {
        throw new Error(`CalDavClient.ListAllEvents: ${e.message}. `);
    }
};

export const getEventsBetween = async (config: CaldavConfig, startDate: Date, endDate?: Date): Promise<Record<string, CalendarComponent>[]> => {
    try {
        const response = await fetcher.fetchEventsBetween(config, startDate, endDate);
        if (response.status === 207) {
            return parseEvents(await response.text());
        }
        throw new Error(`Unexpected response status: ${response.status}`);
    } catch (e) {
        throw new Error(`CalDavClient.ListEventsInTimRange: ${e.message}. `);
    }
};

export const deleteEvent = async (config: CaldavConfig, eventUrl: string): Promise<void> => {
    try {
        const response = await fetcher.fetchDeleteEvent(config, eventUrl);
        if (response.status === 204) {
            return;
        }
        throw new Error(`Unexpected response status: ${response.status}`);
    } catch (e) {
        throw new Error(`CalDavClient.DeleteEvent: ${e.message}. `);
    }
};

const parseEvents = async (responseData: string): Promise<Record<string, CalendarComponent>[]> => {
    const eventsData = await parser.parseCalEvents(responseData);
    const events: Record<string, CalendarComponent>[] = [];
    if (eventsData.length) {
        for (const eventData of eventsData) {
            const event = await ical.async.parseICS(eventData.data);
            events.push(event);
        }
    }
    return events;
};


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

