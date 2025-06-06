import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User,
  updateProfile,
  sendPasswordResetEmail,
  UserCredential,
  updatePassword
} from 'firebase/auth';
import { auth, db, firebaseSendEmailVerification } from '../firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { message } from 'antd';

// Định nghĩa kiểu dữ liệu cho người dùng
type AppUser = User & {
  displayName?: string | null;
  photoURL?: string | null;
  emailVerified: boolean;
  phoneNumber?: string | null;
  address?: string | null;
  dateOfBirth?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  bio?: string | null;
};

type AuthContextType = {
  currentUser: AppUser | null;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  reloadUser: () => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: {
    displayName?: string;
    photoURL?: string;
    phoneNumber?: string;
    address?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | null;
    bio?: string;
  }) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async (user: User) => {
      try {
        // Tải thông tin từ Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        // Chuyển đổi từ Firebase User sang AppUser và kết hợp với dữ liệu từ Firestore
        const appUser: AppUser = {
          ...user,
          emailVerified: user.emailVerified,
          displayName: user.displayName || '',
          photoURL: user.photoURL || null,
          phoneNumber: userData?.phoneNumber || null,
          address: userData?.address || null,
          dateOfBirth: userData?.dateOfBirth || null,
          gender: userData?.gender || null,
          bio: userData?.bio || null
        };
        
        return appUser;
      } catch (error) {
        console.error('Lỗi khi tải thông tin người dùng từ Firestore:', error);
        // Nếu có lỗi, vẫn hiển thị thông tin cơ bản
        return {
          ...user,
          emailVerified: user.emailVerified,
          displayName: user.displayName || '',
          photoURL: user.photoURL || null,
          phoneNumber: null,
          address: null,
          dateOfBirth: null,
          gender: null,
          bio: null
        } as AppUser;
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true);
        try {
          const appUser = await loadUserData(user);
          setCurrentUser(appUser);
        } catch (error) {
          console.error('Lỗi khi tải dữ liệu người dùng:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password: string, displayName: string): Promise<void> => {
    try {
      // Tạo tài khoản mới
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (!user) {
        throw new Error('Không thể tạo tài khoản');
      }
      
      // Cập nhật thông tin hiển thị
      await updateProfile(user, {
        displayName: displayName || email.split('@')[0],
      });
      
      // Gửi email xác thực
      await firebaseSendEmailVerification(user);
      
      // Cập nhật lại thông tin người dùng
      await user.reload();
      
      // Đăng xuất người dùng để yêu cầu xác thực email
      await signOut(auth);
      
      // Trả về thông báo thành công
      return Promise.resolve();
    } catch (error: any) {
      console.error('Lỗi đăng ký:', error);
      let errorMessage = 'Có lỗi xảy ra khi đăng ký tài khoản';
      
      // Xử lý các lỗi thường gặp
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email này đã được sử dụng';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Mật khẩu quá yếu, vui lòng nhập mật khẩu mạnh hơn';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email không hợp lệ';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Kiểm tra xem email đã được xác thực chưa
      if (userCredential.user && !userCredential.user.emailVerified) {
        await signOut(auth);
        await firebaseSendEmailVerification(userCredential.user);
        throw new Error('auth/email-not-verified');
      }
      
      return userCredential;
    } catch (error: any) {
      console.error('Lỗi đăng nhập:', error);
      
      if (error.message === 'auth/email-not-verified') {
        message.error('Vui lòng xác thực email trước khi đăng nhập. Chúng tôi đã gửi lại email xác thực.');
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message.error('Email hoặc mật khẩu không đúng');
      } else if (error.code === 'auth/too-many-requests') {
        message.error('Đăng nhập thất bại quá nhiều lần. Vui lòng thử lại sau ít phút.');
      } else {
        message.error('Có lỗi xảy ra khi đăng nhập');
      }
      
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  const sendVerificationEmail = async () => {
    if (!auth.currentUser) {
      throw new Error('Không có người dùng đăng nhập');
    }
    
    try {
      await firebaseSendEmailVerification(auth.currentUser);
      message.success('Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư của bạn.');
    } catch (error) {
      console.error('Lỗi khi gửi email xác thực:', error);
      message.error('Có lỗi xảy ra khi gửi email xác thực');
      throw error;
    }
  };

  // TODO: Implement reloadUser if needed in the future
  // const reloadUser = async (): Promise<User> => {
  //   const user = auth.currentUser;
  //   if (!user) {
  //     throw new Error('No user is currently signed in');
  //   }
  //   
  //   await user.reload();
  //   
  //   try {
  //     // Tải thông tin từ Firestore
  //     const userDoc = await getDoc(doc(db, 'users', user.uid));
  //     const userData = userDoc.data();
  //     
  //     // Cập nhật state với dữ liệu mới
  //     setCurrentUser({
  //       ...user,
  //       ...userData
  //     } as AppUser);
  //     
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (data: {
    displayName?: string;
    photoURL?: string;
    phoneNumber?: string;
    address?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | null;
    bio?: string;
  }): Promise<void> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Không tìm thấy người dùng hiện tại');
    }
    
    try {
      setLoading(true);
      
      // 1. Cập nhật thông tin cơ bản lên Firebase Auth
      const { phoneNumber, address, dateOfBirth, gender, bio, ...authData } = data;
      
      // Chỉ cập nhật các trường có giá trị
      const updateData: any = {};
      if (authData.displayName !== undefined) updateData.displayName = authData.displayName;
      if (authData.photoURL !== undefined) updateData.photoURL = authData.photoURL;
      
      if (Object.keys(updateData).length > 0) {
        await updateProfile(user, updateData);
      }
      
      // 2. Cập nhật thông tin bổ sung vào state
      const updatedUser: AppUser = {
        ...user,
        ...updateData,
        phoneNumber: phoneNumber !== undefined ? phoneNumber : currentUser?.phoneNumber || null,
        address: address !== undefined ? address : currentUser?.address || null,
        dateOfBirth: dateOfBirth !== undefined ? dateOfBirth : currentUser?.dateOfBirth || null,
        gender: gender !== undefined ? gender : currentUser?.gender || null,
        bio: bio !== undefined ? bio : currentUser?.bio || null,
        emailVerified: user.emailVerified
      };
      
      setCurrentUser(updatedUser);
      
      // 3. Lưu thông tin bổ sung vào Firestore
      try {
        const userRef = doc(db, 'users', user.uid);
        const userData = {
          displayName: updatedUser.displayName,
          email: user.email,
          phoneNumber: updatedUser.phoneNumber,
          address: updatedUser.address,
          dateOfBirth: updatedUser.dateOfBirth,
          gender: updatedUser.gender,
          bio: updatedUser.bio,
          lastUpdated: serverTimestamp()
        };
        
        await setDoc(userRef, userData, { merge: true });
        message.success('Cập nhật thông tin thành công');
      } catch (firestoreError) {
        console.error('Lỗi khi lưu thông tin vào Firestore:', firestoreError);
        throw new Error('Có lỗi xảy ra khi lưu thông tin bổ sung');
      }
    } catch (error) {
      console.error('Lỗi cập nhật thông tin:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật thông tin';
      message.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserPassword = async (newPassword: string) => {
    if (!currentUser) {
      throw new Error('Người dùng chưa đăng nhập');
    }
    
    try {
      setLoading(true);
      await updatePassword(currentUser, newPassword);
      message.success('Cập nhật mật khẩu thành công');
    } catch (error: any) {
      console.error('Lỗi đổi mật khẩu:', error);
      let errorMessage = 'Có lỗi xảy ra khi đổi mật khẩu';
      
      switch (error.code) {
        case 'auth/weak-password':
          errorMessage = 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn';
          break;
        case 'auth/requires-recent-login':
          errorMessage = 'Vui lòng đăng nhập lại để thực hiện thao tác này';
          break;
      }
      
      message.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const reloadCurrentUser = async () => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Người dùng chưa đăng nhập');
    }
    
    try {
      setLoading(true);
      // Reload the user from Firebase Auth
      await user.reload();
      
      // Get the latest user data
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Không tìm thấy người dùng sau khi tải lại');
      }
      
      // Load additional data from Firestore
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      
      // Merge the data
      const updatedUser: AppUser = {
        ...currentUser,
        displayName: currentUser.displayName || '',
        photoURL: currentUser.photoURL || null,
        emailVerified: currentUser.emailVerified,
        phoneNumber: userData?.phoneNumber || null,
        address: userData?.address || null,
        dateOfBirth: userData?.dateOfBirth || null,
        gender: userData?.gender || null,
        bio: userData?.bio || null
      };
      
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Lỗi tải lại thông tin người dùng:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    signup,
    login,
    logout,
    sendVerificationEmail,
    reloadUser: reloadCurrentUser,
    resetPassword,
    updateUserProfile,
    updatePassword: updateUserPassword,
    loading: loading || currentUser === undefined
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
