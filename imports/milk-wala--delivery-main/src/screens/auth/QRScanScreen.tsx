import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { HeaderBar } from '../../components/HeaderBar';
import { Colors } from '../../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

export const QRScanScreen: React.FC = () => {
  const nav = useNavigation();
  const { setScanned } = useAuth();
  const [hasPermission, setHasPermission] = React.useState<boolean | null>(null);
  const [scannedOnce, setScannedOnce] = React.useState(false);
  const [Scanner, setScanner] = React.useState<any>(null);
  const [scannerLoadError, setScannerLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const mod = await import('expo-barcode-scanner');
        setScanner(() => mod.BarCodeScanner as any);
        const { status } = await (mod as any).BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (e: any) {
        setScanner(null);
        setScannerLoadError('Barcode scanner not available in this client. Update Expo Go or rebuild the dev client.');
        setHasPermission(false);
      }
    })();
  }, []);

  const onScan = React.useCallback(({ data }: { data: string }) => {
    if (scannedOnce) return;
    setScannedOnce(true);
    setScanned(true);
    nav.navigate('RoleSelect' as never);
  }, [nav, scannedOnce, setScanned]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <HeaderBar title="Scan QR" showBack onPressBack={() => nav.goBack()} />
      {hasPermission === null && (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.msg}>Requesting camera permission...</Text>
        </View>
      )}
      {hasPermission === false && (
        <View style={styles.center}>
          <Text style={styles.msg}>Camera permission not granted</Text>
          <Text style={[styles.msg, { color: Colors.muted }]}>Enable camera access in settings</Text>
          {!!scannerLoadError && (
            <>
              <Text style={[styles.msg, { color: Colors.muted, marginTop: 8 }]}>{scannerLoadError}</Text>
              <Text style={[styles.msg, { color: Colors.muted }]}>Then restart: stop server, close Expo Go, run "npx expo start -c".</Text>
            </>
          )}
          <TouchableOpacity onPress={() => { setScanned(true); (nav as any).navigate('RoleSelect'); }} accessibilityRole="button" style={[styles.debugBtn, { marginTop: 12 }]}>
            <Text style={styles.debugText}>Continue without scan</Text>
          </TouchableOpacity>
        </View>
      )}
      {hasPermission && Scanner && (
        <View style={{ flex: 1 }}>
          <Scanner
            onBarCodeScanned={onScan as any}
            style={{ flex: 1 }}
          />
          <View style={styles.footer}>
            <Text style={styles.hint}>Align the QR within the frame</Text>
            {Platform.OS === 'web' && (
              <TouchableOpacity onPress={() => onScan({ data: 'web-debug' })} accessibilityRole="button" style={styles.debugBtn}>
                <Text style={styles.debugText}>Debug: Continue without scan</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  msg: { color: Colors.text, marginTop: 12 },
  footer: { padding: 16, backgroundColor: '#00000088' },
  hint: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  debugBtn: { alignSelf: 'center', marginTop: 8 },
  debugText: { color: '#fff', textDecorationLine: 'underline' },
});
