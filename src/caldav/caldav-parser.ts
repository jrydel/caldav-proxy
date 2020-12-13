import { parseStringPromise } from 'xml2js';

import { CaldavEvent } from '../types';

export interface CalDavParser {
    parseListOfEvents(responseData: string): Promise<CaldavEvent[]>;

    parseEvent(responseData: string): Promise<CaldavEvent | null>;
}

const STATUS_OK = 'HTTP/1.1 200 OK';

export class DefaultCalDavParser implements CalDavParser {

    parseListOfEvents = async (responseData: string): Promise<CaldavEvent[]> => {
        try {
            const events = [];
            const xml = await parseStringPromise(responseData);
            const response = xml['D:multistatus']['D:response'];

            for (const obj of response) {
                const url = obj['D:href'][0];
                const status = obj['D:propstat'][0]['D:status'][0];
                const data = obj['D:propstat'][0]['D:prop'][0]['C:calendar-data'][0];

                if (url && status === STATUS_OK && data) {
                    events.push({ url: url, status: status, data: data });
                }
            }
            return events;
        } catch (e) {
            throw new Error(`Error parsing events: ${e}`)
        }
    };

    parseEvent = async (responseData: string): Promise<CaldavEvent | null> => {
        try {
            const xml = await parseStringPromise(responseData);
            const url = xml['D:multistatus']['D:response'][0]['D:href'][0];
            const status = xml['D:multistatus']['D:response'][0]['D:propstat'][0]['D:status'][0];
            const data = xml['D:multistatus']['D:response'][0]['D:propstat'][0]['D:prop'][0]['cal:calendar-data'][0];

            if (url && status === STATUS_OK && data) {
                return { url: url, status: status, data: data };
            }

            throw new Error(`${url}, ${status}, ${data}`);
        } catch (err) {
            throw new Error(`Error parsing event: ${err}`);
        }
    };
}