import { schedule } from 'node-cron';
import { log } from '../utils/logger';
import { CONFIG } from '../config';
import ATService, { ATApp } from '../channels/sms/AT/AT.service';
import { Help } from '../utils/helpers';
import NotificationRepository from '../repositories/notification.repository';
import { Channel, EventType } from '../utils/enums';
import { env } from '../utils/validate.env';

export const ProcessSystemBalances = () => {
    if (!env.SP_BALANCE_NOTIFICATION_ENABLED) return;

    log.info('...[JOB]... Setting up system balances job...');

    schedule(CONFIG.sidooh.cron.sp_balance_notification_cron, async () => {
        const smsSettings = await Help.getSMSSettings();

        const AT = {
            // sms    : await new ATService(smsSettings.africastalking_env).balance(),
            ussd: await new ATService(smsSettings.africastalking_env, ATApp.USSD).balance()
        };

        let message = `! System Balances Below Threshold:\n`;

        if (AT.ussd <= env.AT_USSD_THRESHOLD) message += `\t - AT USSD: ${AT.ussd}\n`;
        // if (AT.sms <= env.AT_SMS_THRESHOLD) message += `\t - AT SMS: ${AT.sms}\n`;

        if (message.includes('-')) {
            await NotificationRepository.store(
                Channel.SMS, message, EventType.STATUS_UPDATE, env.ADMIN_CONTACTS.split(',')
            );
        }
    });
};