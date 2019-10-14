import * as firebase from 'firebase'
import Config from '../env.js'

const firebaseConfig = {
  apiKey: Config.API_KEY,
  authDomain: Config.AUTH_DOMAIN,
  databaseURL: Config.DATABASE_URL,
  projectId: Config.PROJECT_ID,
  storageBucket: Config.STORAGE_BUCKET,
  messagingSenderId: Config.MESSAGING_ID,
  appId: Config.APP_ID
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

export default firebase
