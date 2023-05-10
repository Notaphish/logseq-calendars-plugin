import "@logseq/libs";
import { BlockEntity, PageEntity, SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user";
import { openCalendar2 } from "./calendar";

const settingsTemplate: SettingSchemaDesc[] = [
    {
      key: "template",
      type: "string",
      default: "{Start} - {End}: {Title}",
      title: "Customizing the Event's Insertion",
      description:
        "The first block that is inserted right under the calendar name for each event. You can use placeholder variables to customize the block. The following variables are available: {Description}, {Date}, {Start}, {End}, {Title}, {Location}, {RawLocation}",
    },
    {
      key: "useJSON",
      type: "boolean",
      default: false,
      title: "Use JSON to store calendar data",
      description:
        "If you require more than 5 calendars, select this option so that you can manually define calendars via json",
    },
    {
      key: "IndentCommonBlock",
      type: "boolean",
      default: false,
      title: "Indent all events under the same block",
      description: "If you want to indent all events under the same block, irrespective of the calendar they belong to",
    },
    {
      key: "templateLine2",
      type: "string",
      default: "{Description}",
      title: "Optional: A second block under the event",
      description:
        "Optionally insert a second block indented under the event. Leave blank if you don't want to insert a second blockYou can use placeholder variables to customize the block. The following variables are available: {Description}, {Date}, {Start}, {End}, {Title}, {Location}, {RawLocation}.",
    },
    {
      key: "timeFormat",
      type: "enum",
      default: ["12 hour time", "24 hour time"],
      title: "Select between 12 and 24 hour time",
      description:
        "Select between 12 and 24 hour time. This option will be followed whenever you call {end} or {start} in the template.",
      enumChoices: ["12 hour time", "24 hour time"],
      enumPicker: "select",
    },
    {
      key: "calendar1Name",
      type: "string",
      default: "Calendar 1",
      title: "What would you like to name the calendar?",
      description:
        "Choose a name for the calendar. This will be the name of the calendar block that is inserted.",
    },
    {
      key: "calendar1URL",
      type: "string",
      default: "https://calendar.google.com/calendar/ical/...",
      title: "Enter the iCal URL for calendar 1",
      description:
        "Refer to the readme if you're unsure how to get this link for your platform. This is the link to the calendar's ical file. To test if the link is working, open the link in an incognito browser tab and see if it downloads a file with the extension ics",
    },
    {
      key: "calendar2Name",
      type: "string",
      default: "",
      title: "Optional: What would you like to name the calendar?",
      description:
        "Optional: Leave blank if you don't want this calendar to be inserted",
    },
    {
      key: "calendar2URL",
      type: "string",
      default: "",
      title: "Optional: enter the iCAL URL for calendar 2",
      description:
        "Optional: Leave blank if you don't want this calendar to be inserted",
    },
    {
      key: "calendar3Name",
      type: "string",
      default: "",
      title: "Optional: What would you like to name the calendar?",
      description:
        "Optional: Leave blank if you don't want this calendar to be inserted",
    },
    {
      key: "calendar3URL",
      type: "string",
      default: "",
      title: "Optional: enter the iCAL URL for calendar 3",
      description:
        "Optional: Leave blank if you don't want this calendar to be inserted",
    },
    {
      key: "calendar4Name",
      type: "string",
      default: "",
      title: "Optional: What would you like to name the calendar?",
      description:
        "Optional: Leave blank if you don't want this calendar to be inserted",
    },
    {
      key: "calendar4URL",
      type: "string",
      default: "",
      title: "Optional: enter the iCAL URL for calendar 4",
      description:
        "Optional: Leave blank if you don't want this calendar to be inserted",
    },
    {
      key: "calendar5Name",
      type: "string",
      default: "",
      title: "Optional: What would you like to name the calendar?",
      description:
        "Optional: Leave blank if you don't want this calendar to be inserted",
    },
    {
      key: "calendar5URL",
      type: "string",
      default: "",
      title: "Optional: enter the iCAL URL for calendar 5",
      description:
        "Optional: Leave blank if you don't want this calendar to be inserted",
    },
  ];
  logseq.useSettingsSchema(settingsTemplate);


async function main() {

    let accounts2 = {};
    if (logseq.settings?.useJSON) {
      accounts2 = logseq.settings.accountsDetails
    }
    else {
      if (
        logseq.settings?.calendar2Name != "" &&
        logseq.settings?.calendar2URL != ""
      ) {
        accounts2[logseq.settings?.calendar2Name] = logseq.settings?.calendar2URL;
      }
      if (
        logseq.settings?.calendar3Name != "" &&
        logseq.settings?.calendar3URL != ""
      ) {
        accounts2[logseq.settings?.calendar3Name] = logseq.settings?.calendar3URL;
      }
      if (
        logseq.settings?.calendar1Name != "" &&
        logseq.settings?.calendar1URL != ""
      ) {
        accounts2[logseq.settings?.calendar1Name] = logseq.settings?.calendar1URL;
      }
      if (
        logseq.settings?.calendar4Name != "" &&
        logseq.settings?.calendar4URL != ""
      ) {
        accounts2[logseq.settings?.calendar4Name] = logseq.settings?.calendar4URL;
      }
      if (
        logseq.settings?.calendar5Name != "" &&
        logseq.settings?.calendar5URL != ""
      ) {
        accounts2[logseq.settings?.calendar5Name] = logseq.settings?.calendar5URL;
      }
      logseq.updateSettings({ accountsDetails: accounts2 });
    }
    logseq.provideModel({
      async openCalendar2() {
        for (const accountName in accounts2) {
          openCalendar2(accountName, accounts2[accountName]);
        }
      },
    });
  
    for (const accountName in accounts2) {
     
      let accountSetting = accounts2[accountName];
      logseq.App.registerCommandPalette(
        {
          key: `logseq-${encodeURIComponent(accountName)}-sync`,
          label: `Syncing with ${accountName}`,
        },
        () => {
          openCalendar2(accountName, accountSetting);
        }
      );
    }
  
    logseq.App.registerUIItem("toolbar", {
      key: "open-calendar2",
      template: `
        <a class="button" data-on-click="openCalendar2">
          <i class="ti ti-notebook"></i>
        </a>
      `,
    });
  }
  logseq.ready(main).catch(console.error);