import axios from "axios";
import { Help } from "../utils/helpers.utils";

export const SettingService = {
    all: () => {
        return axios.get("/api/settings").then(response => response.data);
    },
    create: setting => {
        return console.log(setting);
    },
    update: setting => {
        return axios.post(`/api/settings`, setting).then(response => {
            Help.toast({ msg: "Setting Updated!", type: "success" });
            response.data;
        }).catch(error => Help.toast({ msg: error.msg, type: "danger" }));
    }
};