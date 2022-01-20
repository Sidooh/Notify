import moment from "moment";

const REFERENCE = moment(); // fixed just for testing, use moment();
const TODAY = REFERENCE.clone().startOf("day");
const YESTERDAY = REFERENCE.clone().subtract(1, "days").startOf("day");
const A_WEEK_OLD = REFERENCE.clone().subtract(7, "days").startOf("day");

export const Help = {
    isToday: momentDate => momentDate.isSame(TODAY, "d"),
    isYesterday: momentDate => momentDate.isSame(YESTERDAY, "d"),
    isWithinAWeek: momentDate => momentDate.isAfter(A_WEEK_OLD),
    isTwoWeeksOrMore: momentDate => !this.isWithinAWeek(momentDate)
};