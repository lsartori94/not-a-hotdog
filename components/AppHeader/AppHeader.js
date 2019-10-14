import React from 'react';
import { TouchableOpacity } from 'react-native'
import { Header, Icon } from 'react-native-elements'

const AppHeader = ({pickImage, takePhoto}) => {
  return(
    <Header
      statusBarProps={{ barStyle: 'light-content' }}
      backgroundColor="black"
      leftComponent={
        <TouchableOpacity onPress={() => pickImage()}>
          <Icon name="photo-album" color="#fff" />
        </TouchableOpacity>
      }
      centerComponent={{
        text: 'Not Hotdog?',
        style: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
      }}
      rightComponent={
        <TouchableOpacity onPress={() => takePhoto()}>
          <Icon name="camera-alt" color="#fff" />
        </TouchableOpacity>
      }
    />
  );
}

export default AppHeader;