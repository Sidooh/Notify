import 'dotenv/config'
import 'module-alias/register'
import validateEnv from './utils/validateEnv'
import App from "./app";
import NotificationController from "@/resources/notification/notification.controller";
import SettingController from "@/resources/settings/setting.controller";

console.log(process.env.NODE_ENV !== 'test')
validateEnv()

const app = new App([
    new NotificationController(),
    new SettingController(),
], Number(process.env.PORT))

export {app}

app.listen()
