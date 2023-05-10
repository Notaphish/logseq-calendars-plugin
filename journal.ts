
import "@logseq/libs";
import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import urlRegexSafe from 'url-regex-safe';
import {
    getDateForPage,
    getDateForPageWithoutBrackets,
  } from "logseq-dateutils";

  
export async function insertJournalBlocks(
    data,
    preferredDateFormat: string,
    calendarName,
    emptyToday,
    useCommonBlock = false
  ) {
    // let emptyToday = (getDateForPageWithoutBrackets(new Date(), preferredDateFormat))
    console.log(`Current Date: ${emptyToday}`);
    let pageID = await logseq.Editor.createPage(emptyToday, {
      createFirstBlock: true,
    });
    // logseq.App.pushState('page', { name: pageID.name })
    // let pageBlocks = await logseq.Editor.getPageBlocksTree(pageID.name)
    // let footerBlock = pageBlocks[pageBlocks.length -1]
    let startBlock = (await logseq.Editor.insertBlock(pageID!.name, calendarName, {
      sibling: true,
      isPageBlock: true,
    })) as BlockEntity;
    for (const dataKey in data) {
      try {
        let description = data[dataKey]["description"]; //Parsing result from rawParser into usable data for templateFormatter
        let formattedStart = new Date(data[dataKey]["start"]);
        let startDate = getDateForPageWithoutBrackets(
          formattedStart,
          preferredDateFormat
        );
        let startTime = await formatTime(formattedStart) ;
        let endTime = await formatTime(data[dataKey]["end"]);
        let location = data[dataKey]["location"];
        let summary;
        summary = data[dataKey]["summary"];
        // }
        // using user provided template
        let headerString = templateFormatter(
          logseq.settings?.template,
          description,
          startDate,
          startTime,
          endTime,
          summary,
          location
        );
        if (startDate.toLowerCase() == emptyToday.toLowerCase()) {
          var currentBlock = await logseq.Editor.insertBlock(
            startBlock.uuid,
            `${headerString.replaceAll("\\n", "\n")}`,
            { sibling: false }
          );
          if (logseq.settings?.templateLine2 != "") {
            let SecondTemplateLine = templateFormatter(
              logseq.settings?.templateLine2,
              description,
              startDate,
              startTime,
              endTime,
              summary,
              location
            );
            await logseq.Editor.insertBlock(
              currentBlock!.uuid,
              `${SecondTemplateLine.replaceAll("\\n", "\n")}`,
              { sibling: false }
            );
          }
        }
      } catch (error) {
        console.log(data[dataKey]);
        console.log("error");
        console.log(error);
      }
    }
    let updatedBlock = await logseq.Editor.getBlock(startBlock.uuid, {
      includeChildren: true,
    })
    if (updatedBlock?.children?.length == 0) {
      logseq.Editor.removeBlock(startBlock.uuid);
      logseq.App.showMsg("No events for the day detected");
    }
  }
  
async function formatTime(rawTimeStamp) {
    let formattedTimeStamp = new Date(rawTimeStamp);
    let initialHours = formattedTimeStamp.getHours();
    let hours;
    if (initialHours == 0) {
      hours = "00";
    } else {
      hours = initialHours;
      if (formattedTimeStamp.getHours() < 10) {
        hours = "0" + formattedTimeStamp.getHours();
      }
    }
    var formattedTime;
    if (formattedTimeStamp.getMinutes() < 10) {
      formattedTime = hours + ":" + "0" + formattedTimeStamp.getMinutes();
    } else {
      formattedTime = hours + ":" + formattedTimeStamp.getMinutes();
    }
    if (
      typeof logseq.settings?.timeFormat == "undefined" ||
      logseq.settings?.timeFormat == "12 hour time"
    ) {
      return new Date("1970-01-01T" + formattedTime + "Z").toLocaleTimeString(
        "en-US",
        { timeZone: "UTC", hour12: true, hour: "numeric", minute: "numeric" }
      );
    } else {
      return formattedTime;
    }
  }
  
  function templateFormatter(
    template,
    description = "No Description",
    date = "No Date",
    start = "No Start",
    end = "No End",
    title = "No Title",
    location = "No Location"
  ) {
    let properDescription;
    let properLocation;
    let parsedLocation;
    if (description == "") {
      properDescription = "No Description";
    } else {
      properDescription = description;
    }
    if (location == "") {
      properLocation = "No Location";
    } else {
      properLocation = location;
    }
    parsedLocation = parseLocation(properLocation);
    let subsitutions = {
      "{Description}": properDescription,
      "{Date}": date,
      "{Start}": start,
      "{End}": end,
      "{Title}": title,
      "{RawLocation}": properLocation,
      "{Location}": parsedLocation,
    };
    var templatex1 = template;
  
    for (const substitute in subsitutions) {
      let template2 = templatex1.replace(substitute, subsitutions[substitute]);
      let template3 = template2.replace(
        substitute.toLowerCase(),
        subsitutions[substitute]
      );
      templatex1 = template3;
    }
    return templatex1;
  }
  
   
function parseLocation(rawLocation){
    const matches = rawLocation.match(urlRegexSafe());
    var parsed = rawLocation;
    var linkDesc;
    for (const match of matches) {
      try{
        var url = new URL(match);
        linkDesc = url.hostname + '/...';
      } catch (e){
        //this really shouldn't happen
        //but if the regex returns a url that URL doesn't like, just use the whole link
        linkDesc = match;
      }
      //console.log('match', match);
      parsed = parsed.replace(match, '[' + linkDesc + '](' + match + ')');
    }
    return parsed;
  }
  