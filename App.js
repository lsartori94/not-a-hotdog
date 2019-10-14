import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Image } from 'react-native';
import * as Permissions from 'expo-permissions'
import firebase from './config/Firebase';
import uuid from 'uuid';
import * as ImagePicker from 'expo-image-picker';

import AppHeader from './components/AppHeader/AppHeader';
import UploadingOverlay from './components/UploadingOverlay/UploadingOverlay';

const VISION_API_KEY = 'AIzaSyDUqEWgoP37L5Lo9GiEB9XOqzD0ISyY5wA';
const VISION_API_URL = 'https://vision.googleapis.com/v1/images';

async function uploadImageAsync(uri) {
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = (e) => {
      console.log(e);
      reject(new TypeError('Network request failed'));
    }
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });

  const ref = firebase
    .storage()
    .ref()
    .child(uuid.v4());

  const snapshot = await ref.put(blob);

  blob.close();
  return await snapshot.ref.getDownloadURL();
}


export default function App() {
  const [hasGrantedCameraPermission, sethasGrantedCameraPermission] = useState(false);
  const [hasGrantedCameraRollPermission, sethasGrantedCameraRollPermission] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState(null);
  const [googleResponse, setGoogleResponse] = useState(false);

  function checkPermissions() {
    const cameraRollAccess = async() => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL)

        if (status === 'granted') {
            sethasGrantedCameraRollPermission(true);
        }
    }

    const cameraAccess = async() => {
      const { status } = await Permissions.askAsync(Permissions.CAMERA)

      if (status === 'granted') {
        sethasGrantedCameraPermission(true);
      }
    }

    cameraAccess();
    cameraRollAccess();
  }

  useEffect(checkPermissions, []);

  async function handleImagePicked(pickerResult) {
    try {
      setUploading(true);

      if (!pickerResult.cancelled) {
        const uploadUrl = await uploadImageAsync(pickerResult.uri);
        setImage(uploadUrl);
      }
    } catch (e) {
      console.log(e);
      alert('Image Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function takePhoto() {
    const pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3]
    });

    handleImagePicked(pickerResult);
  }

  async function pickImage() {
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [16, 9]
    });

    handleImagePicked(pickerResult);
  }

  async function submitToGoogle() {
    try {
      setUploading(true);
      const body = JSON.stringify({
        requests: [
          {
            features: [{ type: 'LABEL_DETECTION', maxResults: 7 }],
            image: {
              source: {
                imageUri: image
              }
            }
          }
        ]
      });
      const response = await fetch(
        `${VISION_API_URL}:annotate?key=${VISION_API_KEY}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: body
        }
      );
      const reponseJSON = await response.json();
      debugger;
      const getLabel = reponseJSON.responses[0].labelAnnotations.map(
        obj => obj.description
      );
      const result =
        getLabel.includes('Hot dog') ||
        getLabel.includes('hot dog') ||
        getLabel.includes('Hot dog bun');

      setGoogleResponse(result);
      setUploading(false);
    } catch(e) {
      console.log(e);
    }
  }

  function renderImage() {
    if (!image) {
      return (
        <View style={styles.renderImageContainer}>
          <Button
            buttonStyle={styles.button}
            onPress={() => submitToGoogle()}
            title="Check"
            titleStyle={styles.buttonTitle}
            disabled
          />
          <View style={styles.imageContainer}>
            <Text style={styles.title}>Upload an image to verify a hotdog!</Text>
            <Text style={styles.hotdogEmoji}>🌭</Text>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.renderImageContainer}>
          <Button
            buttonStyle={styles.button}
            onPress={() => submitToGoogle()}
            title="Check"
            titleStyle={styles.buttonTitle}
          />
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.imageDisplay} />
          </View>
          {googleResponse ? (
            <Text style={styles.hotdogEmoji}>🌭</Text>
          ) : (
            <Text style={styles.hotdogEmoji}>❌</Text>
          )}
        </View>
    );
  }

  return (
    <View style={ styles.container }>
      <AppHeader pickImage={pickImage} takePhoto={takePhoto}/>
      {
        !hasGrantedCameraPermission &&
        !hasGrantedCameraRollPermission &&
        (
          <View style = {{ flex: 1, marginTop: 100 } }>
            <Text>No access to Camera or Gallery!</Text>
          </View>
        )
      }
      {
        hasGrantedCameraPermission &&
        hasGrantedCameraPermission &&
        (
          <View style={ styles.container }>
            { 
              renderImage()
            }
          </View>
        )
      }
      {
        uploading ? <UploadingOverlay /> : null
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  renderImageContainer: {
    marginTop: 20,
    alignItems: 'center'
  },
  button: {
    backgroundColor: '#97caef',
    borderRadius: 10,
    width: 150,
    height: 50
  },
  buttonTitle: {
    fontWeight: '600'
  },
  imageContainer: {
    margin: 25,
    alignItems: 'center'
  },
  imageDisplay: {
    width: 300,
    height: 300
  },
  title: {
    fontSize: 36
  },
  hotdogEmoji: {
    marginTop: 20,
    fontSize: 90
  }
});