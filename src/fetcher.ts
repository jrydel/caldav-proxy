import ical, { CalendarComponent } from 'node-ical';
import { CaldavParserImpl } from './caldav/caldav-parser.js';
import { CaldavFetcherImpl } from './caldav/caldav-service.js';

import { CaldavConfig, CustomVEvent, Event, Person } from './types.js';

const parser = new CaldavParserImpl();
const fetcher = new CaldavFetcherImpl();

export const getEventByUid = async (config: CaldavConfig, id: string): Promise<Record<string, CalendarComponent>> => {
    try {
        const response = await fetcher.fetchEventByUid(config, id);
        if (response.status === 207) {
            const eventData = await parser.parseCalEvent(await response.text());
            return await ical.async.parseICS(eventData.data);
        }
        throw new Error(`Unexpected response status: ${response.status}, message: ${await response.text()}`);
    } catch (e) {
        throw new Error(`CalDavClient.GetEventByUid: ${e.message}. `);
    }
};

export const getEvents = async (config: CaldavConfig): Promise<Event[]> => {
    try {
        const response = await fetcher.fetchEvents(config);
        if (response.status === 207) {
            return await parseEvents(await response.text());
        }
        throw new Error(`Unexpected response status: ${response.status}, message: ${await response.text()}`);
    } catch (e) {
        throw new Error(`CalDavClient.ListAllEvents: ${e.message}. `);
    }
};

export const getEventsBetween = async (config: CaldavConfig, startUTC: string, endUTC: string): Promise<Event[]> => {
    try {
        const response = await fetcher.fetchEventsBetween(config, startUTC, endUTC);
        if (response.status === 207) {
            return parseEvents(await response.text());
        }
        throw new Error(`Unexpected response status: ${response.status}, message: ${await response.text()}`);
    } catch (e) {
        throw new Error(`CalDavClient.ListEventsInTimRange: ${e.message}. `);
    }
};

export const createUpdateEvent = async (config: CaldavConfig, event: Event): Promise<void> => {
    try {
        const response = await fetcher.fetchCreateUpdateEvent(config, event);
        if (response.status === 201) {
            return;
        }
        throw new Error(`Unexpected response status: ${response.status}, message: ${await response.text()}`);
    } catch (e) {
        throw new Error(`CalDavClient.CreateEvent: ${e.message}. `);
    }
};

export const deleteEvent = async (config: CaldavConfig, id: string): Promise<void> => {
    try {
        const response = await fetcher.fetchDeleteEvent(config, id);
        if (response.status === 204) {
            return;
        }
        throw new Error(`Unexpected response status: ${response.status}, message: ${await response.text()}`);
    } catch (e) {
        throw new Error(`CalDavClient.DeleteEvent: ${e.message}. `);
    }
};

const parseEvents = async (responseData: string): Promise<Event[]> => {
    const eventsData = await parser.parseCalEvents(responseData);
    const events: Event[] = [];
    if (eventsData.length) {
        for (const eventData of eventsData) {
            const event = await ical.async.parseICS(eventData.data);
            for (const key in event) {
                if (event.hasOwnProperty(key)) {
                    const data = event[key];
                    if (data.type == 'VEVENT') {
                        const temp = data as CustomVEvent;
                        events.push({
                            id: temp.uid,
                            name: temp.summary,
                            start: temp.start.toISOString(),
                            end: temp.end.toISOString(),
                            organizer: parsePerson(temp.organizer),
                            attendee: parsePersons(temp.attendee)
                        });
                    }
                }
            }
        }
    }
    return events;
};

const parsePerson = (data: any) => {
    if (data?.params?.CN && data?.val) {
        if (data.val) {
            return { name: data.params?.CN, mail: data.val?.replace('mailto:', '') };
        }
    }
    return null;
}

const parsePersons = (data: any) => {
    const result: Person[] = [];
    if (data) {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const person = parsePerson(data[key]);
                if (person) {
                    result.push(person);
                }
            }
        }
    }
    return result;
}


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

