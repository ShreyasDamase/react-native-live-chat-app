import React, { useLayoutEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Button,
  TextInput,
  Text,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
  SafeAreaView,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import {
  DocumentData,
  addDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
  doc,
} from "firebase/firestore";
import { FIRESTORE_DB } from "../../config/FirebaseConfig";
import { useAuth } from "../../context/AuthContext";

const ChatPage = () => {
  const route = useRoute();
  const { id } = route.params; // Accessing the group ID passed from GroupsPage
  const { user } = useAuth();
  const [messages, setMessages] = useState<DocumentData[]>([]);
  const [message, setMessage] = useState<string>("");

  const [userNames, setUserNames] = useState<{ [key: string]: string }>({}); // Store users' names

  useLayoutEffect(() => {
    const msgCollectionRef = collection(FIRESTORE_DB, `groups/${id}/messages`);
    const q = query(msgCollectionRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messages);
    });

    return unsubscribe;
  }, [id]);

  const fetchUserName = async (userId: string) => {
    const userDocRef = doc(FIRESTORE_DB, "users", userId); // Assuming users are stored in the 'users' collection
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data()?.username || "Unknown"; // Default to "Unknown" if name doesn't exist
    }
    return "Unknown";
  };

  const sendMessage = async () => {
    const msg = message.trim();
    if (msg.length === 0) return;

    if (!user) {
      console.error("User is not logged in");
      return;
    }

    try {
      const msgCollectionRef = collection(
        FIRESTORE_DB,
        `groups/${id}/messages`
      );
      await addDoc(msgCollectionRef, {
        message: msg,
        sender: user.uid,
        createdAt: serverTimestamp(),
      });
      setMessage("");
    } catch (error) {
      ToastAndroid.show("Error sending message", ToastAndroid.SHORT);
    }
  };

  const renderMessage = ({ item }: { item: DocumentData }) => {
    if (!user) {
      return null; // Don't render anything if user is null
    }
    const myMessage = item.sender === user.uid;

    // Check if username is already fetched
    const senderName = myMessage
      ? "me"
      : userNames[item.sender] || "Loading...";

    return (
      <View
        style={[
          styles.messageContainer,
          myMessage
            ? styles.userMessageContainer
            : styles.otherMessageContainer,
        ]}
      >
        <Text style={styles.messageText}>{item.message}</Text>
        <Text style={styles.senderName}>{senderName}</Text>
        {item.createdAt && (
          <Text style={styles.time}>
            {new Date(item.createdAt.toDate()).toLocaleTimeString()}
          </Text>
        )}
      </View>
    );
  };

  useLayoutEffect(() => {
    // Fetch usernames when component mounts
    const fetchNames = async () => {
      const names: { [key: string]: string } = {};
      for (const message of messages) {
        if (!names[message.sender]) {
          const name = await fetchUserName(message.sender);
          names[message.sender] = name;
        }
      }
      setUserNames(names);
    };

    fetchNames();
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
        />
        <View style={styles.inputContainer}>
          <TextInput
            multiline
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message"
            style={styles.messageInput}
          />
          <Button
            disabled={message === ""}
            title="Send"
            onPress={sendMessage}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    gap: 10,
    backgroundColor: "#fff",
  },
  messageInput: {
    flex: 1,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    maxWidth: "80%",
  },
  userMessageContainer: {
    backgroundColor: "#dcf8c6",
    alignSelf: "flex-end",
  },
  otherMessageContainer: {
    backgroundColor: "#fff",
  },
  messageText: {
    fontSize: 16,
  },
  senderName: {
    fontSize: 12,
    color: "#777",
    textAlign: "right",
    marginTop: 5,
  },
  time: {
    fontSize: 12,
    color: "#777",
    alignSelf: "flex-end",
  },
});

export default ChatPage;
