import messaging from '@react-native-firebase/messaging';
import {Platform} from 'react-native';

class FCMService {
  register = (onRegister, onNotification, onOpenNotification) => {
    this.checkPermission(onRegister);
    this.createNotificationListener(
      onRegister,
      onNotification,
      onOpenNotification,
    );
  };

  registerAppWithFCM = async () => {
    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages();
      await messaging().setAutoInitEnabled(true);
    }
  };

  checkPermission = (onRegister) => {
    messaging()
      .hasPermission()
      .then((enabled) => {
        if (enabled) {
          //   User has permission
          this.getToken(onRegister);
        } else {
          // User doesn't have permission
          this.requestPermission(onRegister);
        }
      })
      .catch((err) => {
        console.log('[FCMServise Permission rejected', err);
      });
  };

  getToken = (onRegister) => {
    messaging()
      .getToken()
      .then((fcmToken) => {
        if (fcmToken) {
          onRegister(fcmToken);
        } else {
          console.log("User doesn't have a device token");
        }
      })
      .catch((err) => console.log('FCMService getToken rejected', err));
  };

  requestPermission = (onRegister) => {
    messaging()
      .requestPermission()
      .then(() => {
        this.getToken(onRegister);
      })
      .catch((err) => console.log('FCMServise permission rejected', err));
  };

  deleteToken = () => {
    console.log('FCMServise token deleted');
    messaging()
      .deleteToken()
      .catch((err) => console.log('FCMService delete token error', err));
  };

  createNotificationListener = (
    onRegister,
    onNotification,
    onOpenNotification,
  ) => {
    // when aplication is running but in the background

    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('FCMService onNotifiationApp caused to open App');
      if (remoteMessage) {
        const notification = remoteMessage.notification;
        onOpenNotification(notification);
        // this.removeDeliveredNotification(notification.notificationId)
      }
    });

    // when application is opened from a quite state

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        console.log(
          '[FCMService] getInitialNotification Notification caused to open it from background',
          remoteMessage,
        );
        if (remoteMessage) {
          const notification = remoteMessage.notification;
          onOpenNotification(notification);
          // this.removeDeliveredNotification(notification.notificationId)
        }
      });

    // Foreground state messages
    this.messageListener = messaging().onMessage(async (remoteMessage) => {
      console.log('[FCMServise] A new message arrived', remoteMessage);
      if (remoteMessage) {
        let notification = null;
        if (Platform.os === 'ios') {
          notification = remoteMessage.data.notification;
        } else {
          notification = remoteMessage.notification;
        }
        onNotification(notification);
      }
    });

    //Triggerd when have new Token
    messaging().onTokenRefresh((fcmToken) => {
      console.log('[FCMService] New token refresh ', fcmToken);
      onRegister(fcmToken);
    });
  };

  //

  unRegister = () => {
    this.messageListener();
  };
}

export const fcmService = new FCMService();
