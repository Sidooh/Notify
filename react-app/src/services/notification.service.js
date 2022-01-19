import axios from "axios";

export const NotificationService = {
    index: () => {
        return axios.get('/notifications').then(response => response.data)
    }
}