import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence,
  sendEmailVerification as firebaseSendEmailVerification
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB1lP8rFHx52yhZjUXIdqnKgngjwbPFBlw",
  authDomain: "news-website-5238c.firebaseapp.com",
  projectId: "news-website-5238c",
  storageBucket: "news-website-5238c.firebasestorage.app",
  messagingSenderId: "805096078653",
  appId: "1:805096078653:web:da8c791ce3812b0d159954"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Cấu hình xác thực
const auth = getAuth(app);

// Khởi tạo Firestore
const db = getFirestore(app);

// Khởi tạo Storage
const storage = getStorage(app);

// Bật lưu trữ cục bộ để giữ đăng nhập
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error('Lỗi khi cấu hình lưu trữ xác thực:', error);
  });

export { 
  auth, 
  db, 
  storage,
  ref,
  uploadBytes,
  getDownloadURL,
  firebaseSendEmailVerification 
};

export default app;
