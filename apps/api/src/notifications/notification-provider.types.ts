export const NOTIFICATION_PROVIDER = Symbol('NOTIFICATION_PROVIDER');

export interface NotificationProvider {
    send(message: string): Promise<void>;
}
