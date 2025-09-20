import { LinearGradient } from 'expo-linear-gradient'; // 漸層
import { useRouter } from 'expo-router';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import * as Animatable from 'react-native-animatable'; // 動畫

// 漸層按鈕組件
const GradientButton = ({ colors, onPress, text }) => {
  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>

      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <LinearGradient
          colors={colors}
          style={styles.btn}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.btnInner}>
            <Text style={styles.btnText}>{text}</Text>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

export default function WaterMirrorApp() {
  const router = useRouter();

  // 按鈕漸層配色 (與背景協調)
  const buttonGradients = {
    data: ['#3a7bd5', '#00d2ff'],    // 水藍
    report: ['#11998e', '#38ef7d'],   // 碧綠
    contact: ['#4568dc', '#b06ab3'],  // 紫藍
    tutorial: ['#ff7e5f', '#feb47b']  // 珊瑚
  };

  return (
    <LinearGradient
      colors={['#0f2027', '#203a43', '#2c5364']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >

      {/* 頂部標題 */}
      <Animatable.View 
        style={styles.top}
        animation="fadeInDown"
        duration={1000}
      >   
        <Text style={[styles.title, styles.textShadow]}>WaterMirror</Text>
        <Text style={[styles.subtitle, styles.textShadow]}>智慧水質分析與改善評估系統</Text>
        <Text style={[styles.platform, styles.textShadow]}>版本: WaterMirror-{Platform.OS}-v1.0.0</Text>
      </Animatable.View>

      {/* 按鈕區塊 */}
      <View style={styles.content}>
        <View style={styles.btnContainer}>
          {/* 第一行按鈕 */}
          <View style={styles.btnRow}>
            <GradientButton 
              colors={buttonGradients.data}
              onPress={() => router.push('/GetInfo')}
              text="獲取資料"
            />
            <View style={styles.btnSpace} />
            <GradientButton 
              colors={buttonGradients.report}
              onPress={() => router.push('/cal')}
              text="查閱報表"
            />
          </View>

          {/* 第二行按鈕 */}
          <View style={styles.btnRow}>
            <GradientButton 
              colors={buttonGradients.contact}
              onPress={() => router.push('/log')}
              text="歷史紀錄"
            />
            <View style={styles.btnSpace} />
            <GradientButton 
              colors={buttonGradients.tutorial}
              onPress={() => router.push('/log')}
              text="使用教學"
            />
          </View>
        </View>
      </View>

      {/* 底部資訊 */}
      <Animatable.View 
        style={styles.bottom}
        animation="fadeInUp"
        duration={1000}
      >
        <Text style={[styles.blue, styles.textShadow]}>本專案由國立台中科技大學</Text>
        <Text style={[styles.blue, styles.bottomText, styles.textShadow]}>
          資訊工程系 柯睿恩, 顏夏榛, 蕭詠森, 翁緯宸, 接續開發
        </Text>
      </Animatable.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  top: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 50 : 30,
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: 'rgba(255,255,255,0.9)',
  },
  platform: {
    fontSize: 14,
    color: '#4FC3F7',
  },
  textShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  btnContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  btn: {
    width: 160,
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  btnInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 20,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    padding: 0,
    margin: 0,
    color: '#fff',
    fontWeight: '600',
    ...Platform.select({
      android: {
        lineHeight: 24,
      },
      ios: {
        lineHeight: 24,
      }
    }),
  },
  btnSpace: {
    width: 24,
  },
  bottom: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  blue: {
    color: '#4FC3F7',
  },
  bottomText: {
    marginBottom: 10,
  },
});