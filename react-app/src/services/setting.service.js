import axios from "axios";

export const SettingService = {
    index: () => {
        return axios.get('/api/settings').then(response => response.data)
    }
}