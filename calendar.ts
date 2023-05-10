
import ical from "node-ical";
import axios from "axios";
import {
  getDateForPageWithoutBrackets,
} from "logseq-dateutils";
import moment from "moment-timezone";
import { insertJournalBlocks } from "./journal";

let mainBlockUUID = ""
// const md = require('markdown-it')().use(require('markdown-it-mark'));

function sortDate(data) {
  return data.sort(function (a, b) {
    return (
      Math.round(new Date(a.start).getTime() / 1000) -
      Math.round(new Date(b.start).getTime() / 1000)
    );
  });
}
async function findDate(preferredDateFormat) {
  if ((await logseq.Editor.getCurrentPage()) != null) {
    //@ts-expect-error
    if ((await logseq.Editor.getCurrentPage())["journal?"] == false) {
      const date = getDateForPageWithoutBrackets(
        new Date(),
        preferredDateFormat
      );
      logseq.App.showMsg("Filtering Calendar Items for " + date);
      // insertJournalBlocks(hello, preferredDateFormat, calendarName, settings, date)
      return date;
    } else {
      //@ts-expect-error
      const date = (await logseq.Editor.getCurrentPage()).name;
      logseq.App.showMsg(`Filtering Calendar Items for ${date}`);
      return date;
    }
  } else {
    return getDateForPageWithoutBrackets(new Date(), preferredDateFormat);
  }
}
function rawParser(rawData) {
  logseq.App.showMsg("Parsing Calendar Items");
  var eventsArray = [];
  var rawDataV2 = ical.parseICS(rawData);
  for (const dataValue in rawDataV2) {
    const event = rawDataV2[dataValue];
    if (typeof event.rrule == "undefined") {
      //@ts-expect-error
      eventsArray.push(rawDataV2[dataValue]); //simplifying results, credits to https://github.com/muness/obsidian-ics for this implementations
    } else {
      const dates = event.rrule.between(
        new Date(2021, 0, 1, 0, 0, 0, 0),
        new Date(2023, 11, 31, 0, 0, 0, 0)
      );
      console.log(dates);
      if (dates.length === 0) continue;

      console.log("Summary:", event.summary);
      console.log("Original start:", event.start);
      console.log(
        "RRule start:",
        `${event.rrule.origOptions.dtstart} [${event.rrule.origOptions.tzid}]`
      );

      dates.forEach((date) => {
        let newDate;
        if (event.rrule.origOptions.tzid) {
          // tzid present (calculate offset from recurrence start)
          const dateTimezone = moment.tz.zone("UTC");
          const localTimezone = moment.tz.guess();
          
          const tz =
            event.rrule.origOptions.tzid === localTimezone
              ? event.rrule.origOptions.tzid
              : localTimezone;
          const timezone = moment.tz.zone(tz);
          const offset =
            timezone.utcOffset(date) - dateTimezone.utcOffset(date);
          // newDate = moment(date).add(offset, "minutes").toDate();
          // console.log(offset)
          newDate = date
          //FIXME: this is a hack to get around the fact that the offset is not being calculated correctly
        } else {
          // tzid not present (calculate offset from original start)
          newDate = new Date(
            date.setHours(
              date.getHours() -
                (event.start.getTimezoneOffset() - date.getTimezoneOffset()) /
                  60
            )
          );
        }
        const start = moment(newDate);
        const secondaryEvent = { ...event, start: start["_d"] };
        eventsArray.push(secondaryEvent);
      });

      console.log(
        "-----------------------------------------------------------------------------------------"
      );
    }
  }
  console.log(eventsArray);
  return sortDate(eventsArray);
}

export async function openCalendar2(calendarName, url) {
  try {
    const userConfigs = await logseq.App.getUserConfigs();
    const preferredDateFormat = userConfigs.preferredDateFormat;
    logseq.App.showMsg("Fetching Calendar Items");
    let response2 = await axios.get(url);
    console.log(response2);
    var hello = await rawParser(response2.data);
    const date = await findDate(preferredDateFormat);
    insertJournalBlocks(
      hello,
      preferredDateFormat,
      calendarName,
      date
    );
  } catch (err) {
    if (`${err}` == `Error: Request failed with status code 404`) {
      logseq.App.showMsg("Calendar not found: Check your URL");
    }
    console.log(err);
  }
}
