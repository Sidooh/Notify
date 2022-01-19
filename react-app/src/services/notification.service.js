import axios from "axios";

export const NotificationService = {
    index: () => {
        return axios.get('/api/notifications').then(response => response.data)
    }
}