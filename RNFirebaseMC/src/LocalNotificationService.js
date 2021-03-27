import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {Platform} from 'react-native';

class LocalNotificationService {
  configure = (onOpenNotification) => {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('[LocalNotificationService] onRegister: ', token);
      },
      onNotification: function (notification) {
        console.log(
          '[LocalNotificationService] onNotification: ',
          notification,
        );
        if (!notification?.data) {
          return;
        }
        notification.userInteraction = true;
        onOpenNotification(
          Platform.OS === 'ios'
            ? notification.data.notification
            : notification.notification,
        );

        // Only call calback if not from foreground

        if (Platform.OS === 'ios') {
          // {required} Called when a remote is recieved or opened, or local notification is opened
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
      },

      // IOS ONLY (optional) : default : all - Permissions to register
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       * - if you are not using remote notification or do not have Firebase installed, use this:
       *     requestPermissions: Platform.OS === 'ios'
       */
      requestPermissions: true,
    });
  };

  unregister = () => {
    PushNotification.unregister();
  };

  showNotification = (id, title, message, data = {}, options = {}) => {
    PushNotification.localNotification({
      /* Android Only Properties */
      ...this.buildAndroidNotification(id, title, message, data, options),

      /* iOS and Android properties */
      ...this.buildIOSNotification(id, title, message, data, options),
      title: title || '', // (optional)
      message: message || '', // (required)
      playSound: options.playSound || true, // (optional) default: true
      soundName: options.soundName || 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
      userInteraction: false,
    });
  };

  buildAndroidNotification = (id, title, message, data = {}, options = {}) => {
    return {
      id: id,
      autoCancel: true,
      largeIcon: options.largeIcon || 'ic_launcher',
      smallIcon: options.smallIcon || 'ic_notification',
      bigText: message || '',
      subText: title || '',
      vibrate: options.vibrate || true,
      vibration: options.vibration || 300,
      priority: options.priority || 'high',
      importance: options.importance || 'high',
      data: data,
    };
  };

  buildIOSNotification = (id, title, message, data = {}, options = {}) => {
    return {
      alertAction: options.alertAction || 'view',
      category: options.category || '',
      userInfo: {
        id,
        item: data,
      },
    };
  };

  cancelAllLocalNotifications = () => {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.removeAllDeliveredNotifications();
    } else {
      PushNotification.cancelAllLocalNotifications();
      // PushNotification.removeAllDeliveredNotifications();
    }
  };

  removeDeliveredNotificationByID = (notificationId) => {
    console.log(
      '[LocalNotificationService] removeDeliveredNotficationByID: ',
      notificationId,
    );
    PushNotification.cancelLocalNotifications({id: `${notificationId}`});
  };
}

export const localNotificationService = new LocalNotificationService();
