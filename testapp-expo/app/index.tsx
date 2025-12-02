import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

// Your backend API URL
// For real device: use your computer's local IP (phone and computer must be on same WiFi)
// For emulator: use 10.0.2.2
const API_URL = 'http://192.168.1.4:8000';

export default function AuthScreen() {
  // State for phone auth
  const [phoneNumber, setPhoneNumber] = useState('+919997366505');
  const [otpCode, setOtpCode] = useState('');
  const [confirmation, setConfirmation] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  
  // State for registration (if needed)
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  // State for tokens
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [firebaseIdToken, setFirebaseIdToken] = useState('');
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Ready to authenticate');

  // Step 1: Send OTP
  const sendOtp = async () => {
    try {
      setLoading(true);
      setStatus('Sending OTP...');
      
      const result = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirmation(result);
      setStatus('OTP sent! Enter the code.');
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and get Firebase ID Token
  const verifyOtp = async () => {
    if (!confirmation) {
      Alert.alert('Error', 'Please send OTP first');
      return;
    }

    try {
      setLoading(true);
      setStatus('Verifying OTP...');
      
      await confirmation.confirm(otpCode);
      
      // Get the ID token from Firebase
      const idToken = await auth().currentUser?.getIdToken();
      if (!idToken) {
        throw new Error('Failed to get ID token');
      }
      
      setFirebaseIdToken(idToken);
      setStatus('OTP verified! Calling backend login...');
      
      // Call backend login
      await callBackendLogin(idToken);
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Call backend /auth/login
  const callBackendLogin = async (idToken: string) => {
    try {
      setStatus('Calling /auth/login...');
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_token: idToken }),
      });

      const data = await response.json();

      if (data.status === 'registration_required') {
        // New user - needs registration
        setNeedsRegistration(true);
        setStatus('New user! Please register.');
      } else if (data.tokens) {
        // Existing user - got tokens
        setAccessToken(data.tokens.access_token);
        setRefreshToken(data.tokens.refresh_token);
        setStatus('Login successful! ✅');
      } else {
        throw new Error(JSON.stringify(data));
      }
    } catch (error: any) {
      setStatus(`Login error: ${error.message}`);
      Alert.alert('Login Error', error.message);
    }
  };

  // Step 4: Register new user
  const registerUser = async () => {
    if (!username || !displayName) {
      Alert.alert('Error', 'Please fill in username and display name');
      return;
    }

    try {
      setLoading(true);
      setStatus('Registering...');
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: firebaseIdToken,
          username: username,
          display_name: displayName,
        }),
      });

      const data = await response.json();

      if (data.tokens) {
        setAccessToken(data.tokens.access_token);
        setRefreshToken(data.tokens.refresh_token);
        setNeedsRegistration(false);
        setStatus('Registration successful! ✅');
      } else {
        throw new Error(JSON.stringify(data));
      }
    } catch (error: any) {
      setStatus(`Registration error: ${error.message}`);
      Alert.alert('Registration Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset everything
  const reset = async () => {
    await auth().signOut();
    setConfirmation(null);
    setOtpCode('');
    setNeedsRegistration(false);
    setUsername('');
    setDisplayName('');
    setAccessToken('');
    setRefreshToken('');
    setFirebaseIdToken('');
    setStatus('Ready to authenticate');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔐 Auth Test App</Text>
      
      {/* Status */}
      <View style={styles.statusBox}>
        <Text style={styles.statusText}>{status}</Text>
        {loading && <ActivityIndicator style={styles.loader} />}
      </View>

      {/* Phone Number Input */}
      <View style={styles.section}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="+919997366505"
          keyboardType="phone-pad"
          editable={!confirmation}
        />
        <TouchableOpacity 
          style={[styles.button, confirmation && styles.buttonDisabled]} 
          onPress={sendOtp}
          disabled={loading || !!confirmation}
        >
          <Text style={styles.buttonText}>Send OTP</Text>
        </TouchableOpacity>
      </View>

      {/* OTP Input */}
      {confirmation && (
        <View style={styles.section}>
          <Text style={styles.label}>OTP Code</Text>
          <TextInput
            style={styles.input}
            value={otpCode}
            onChangeText={setOtpCode}
            placeholder="123321"
            keyboardType="number-pad"
            maxLength={6}
          />
          <TouchableOpacity 
            style={styles.button} 
            onPress={verifyOtp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Verify OTP</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Registration Form */}
      {needsRegistration && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Registration Required</Text>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="player123"
            autoCapitalize="none"
          />
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="John Doe"
          />
          <TouchableOpacity 
            style={styles.button} 
            onPress={registerUser}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tokens Display */}
      {(accessToken || firebaseIdToken) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎫 Tokens</Text>
          
          {firebaseIdToken && (
            <>
              <Text style={styles.label}>Firebase ID Token:</Text>
              <TextInput
                style={styles.tokenBox}
                value={firebaseIdToken}
                multiline
                editable={false}
                selectTextOnFocus
              />
            </>
          )}
          
          {accessToken && (
            <>
              <Text style={styles.label}>Access Token:</Text>
              <TextInput
                style={styles.tokenBox}
                value={accessToken}
                multiline
                editable={false}
                selectTextOnFocus
              />
            </>
          )}
          
          {refreshToken && (
            <>
              <Text style={styles.label}>Refresh Token:</Text>
              <TextInput
                style={styles.tokenBox}
                value={refreshToken}
                multiline
                editable={false}
                selectTextOnFocus
              />
            </>
          )}
        </View>
      )}

      {/* Reset Button */}
      <TouchableOpacity style={styles.resetButton} onPress={reset}>
        <Text style={styles.resetButtonText}>🔄 Reset</Text>
      </TouchableOpacity>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  statusBox: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    color: '#1565c0',
  },
  loader: {
    marginLeft: 10,
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tokenBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    maxHeight: 100,
    fontFamily: 'monospace',
  },
  resetButton: {
    backgroundColor: '#ff5722',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    height: 50,
  },
});
