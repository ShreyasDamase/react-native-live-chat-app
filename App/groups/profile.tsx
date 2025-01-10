import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { FIRESTORE_DB } from "../../config/FirebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";

// Define the UserProfile type
type UserProfile = {
  username: string;
  email: string;

  // Add more fields if needed
};

const Profile = () => {
  const { user } = useAuth(); // Authenticated user
  const [profileData, setProfileData] = useState<UserProfile | null>(null); // State to store user data

  const fetchUserData = async () => {
    if (user == null) return;
    try {
      // Reference to the user's document in Firestore
      const userDocRef = doc(FIRESTORE_DB, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setProfileData(userDoc.data() as UserProfile); // Cast data to UserProfile
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      fetchUserData();
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {profileData ? (
        <View>
          <Text>Name: {profileData.username}</Text>
          <Text>Email: {profileData.email}</Text>

          {/* Add more fields as needed */}
        </View>
      ) : (
        <Text>Loading profile...</Text>
      )}
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
