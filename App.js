import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";

//what should we do before the notification is displayed to the user
Notifications.setNotificationHandler({
    handleNotification: async () => {
        return {
            shouldShowAlert: true,
            shouldPlaySound: true,
        };
    },
});

export default function App() {
    const [pushToken, setPushToken] = useState();

    useEffect(() => {
        Permissions.getAsync(Permissions.NOTIFICATIONS)
            .then((statusObj) => {
                if (statusObj.status !== "granted") {
                    return Permissions.askAsync(Permissions.NOTIFICATIONS);
                }
                return statusObj;
            })
            .then((statusObj) => {
                if (statusObj.status !== "granted") {
                    throw new Error("Permission not granted!");
                }
            })
            .then(() => {
                return Notifications.getExpoPushTokenAsync();
            })
            .then((response) => {
                const token = response.data;
                setPushToken(token);
                console.log("token", token);
            })
            .catch((err) => {
                console.log("err", err);
                return null;
            });
    }, []);

    useEffect(() => {
        //function to define what will happen if the user interacts with the notification when the app is not running
        const backgroundSubscription =
            Notifications.addNotificationResponseReceivedListener(
                (response) => {
                    console.log("response", response);
                }
            );
        const foregroundSubscription =
            Notifications.addNotificationReceivedListener((notification) => {
                console.log("notification", notification);
            });
        return () => {
            backgroundSubscription.remove();
            foregroundSubscription.remove();
        };
    }, []);

    const triggerNotificationHandler = () => {
        //local notification scheduler
        // Notifications.scheduleNotificationAsync({
        //     content: {
        //         title: "My first local notification",
        //         body: "The first local notification we are sending.",
        //     },
        //     trigger: {
        //         seconds: 10,
        //     },
        // });

        fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                "Accept-Encoding": "gzip, deflate",
                "Content-Type": 'application/json',
            },
            body: JSON.stringify({
                to: pushToken,
                data: { extraData: "Some Data" },
                title: "Sent via app",
                body: "This push notification was sent via app",
            }),
        }).then((response) => {
          console.log('response', response);
        }).catch((err) => {
          console.log('err', err);
        });
    };
    return (
        <View style={styles.container}>
            <Button
                title="Trigger Notification"
                onPress={triggerNotificationHandler}
            ></Button>
            <Text>Open up App.js to start working on your app!</Text>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
});
