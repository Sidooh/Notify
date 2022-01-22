import axios from "axios";

export const NotificationService = {
    index: () => {
        return axios.get('/api/notifications').then(response => response.data)
    },

    retry: notification => {
        return axios.post('/api/notifications/retry', {id: notification.id}).then(response => response.data)
    }
}