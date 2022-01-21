import moment from "moment";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

const REFERENCE = moment(); // fixed just for testing, use moment();
const TODAY = REFERENCE.clone().startOf("day");
const YESTERDAY = REFERENCE.clone().subtract(1, "days").startOf("day");
const A_WEEK_OLD = REFERENCE.clone().subtract(7, "days").startOf("day");

export const Help = {
    isToday: momentDate => momentDate.isSame(TODAY, "d"),
    isYesterday: momentDate => momentDate.isSame(YESTERDAY, "d"),
    isWithinAWeek: momentDate => momentDate.isAfter(A_WEEK_OLD),
    isTwoWeeksOrMore: momentDate => !this.isWithinAWeek(momentDate),

    toast: data => {
        let duration = (data.duration ?? 7) * 1000,
            type = data.type ?? 'success',
            close = data.close ?? 'true'

        Toastify({
            text: data.msg,
            duration: duration,
            close: close,
            gravity: data.gravity ?? 'bottom',
            position: data.position ?? 'right',
            className: type,
        }).showToast();
    }
};