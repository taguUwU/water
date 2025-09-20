import { Ionicons } from '@expo/vector-icons'; // 引入圖標庫
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useWaterData } from '../WaterDataContext';

export default function GetInfo() {
  const [refreshing, setRefreshing] = useState(false);
  const [waterData, setWaterData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setWaterData: setContextWaterData } = useWaterData();
  const [tips, setTips] = useState([]);

  // 從API獲取數據
  const fetchWaterData = async () => {
    try {
      const response = await fetch('http://192.168.50.172:8001/history', {
        headers: {
          'Accept': 'application/json',
        },
      });
       
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      setContextWaterData(result[0]);
      
      // 檢查是否有數據
      if (!result || result.length === 0) {
        throw new Error('沒有接收到有效數據');
      }
      
      // 將API數據轉換為組件需要的格式
      const transformedData = [
        {
          parameter: '溫度(°C)',
          value: `${result[0].temperature} °C`,
          ranges: [
            { range: '-15°C', status: '冷', level: 'cold' },
            { range: '15°C-25°C', status: '正常', level: 'Normal' },
            { range: '25°C+', status: '熱', level: 'hot' }
          ],
          currentLevel: getTemperatureLevel(result[0].temperature)
        },
        {
          parameter: '酸鹼值(PH)',
          value: `${result[0].ph}`,
          ranges: [
            { range: '<6.5', status: '酸性', level: 'acid' },
            { range: '6.5-8.5', status: '中性', level: 'Normal' },
            { range: '>8.5', status: '鹼性', level: 'alkaline' }
          ],
          currentLevel: getph(result[0].ph)
        },
        {
          parameter: '導電度(EC)',
          value: `${result[0].ec}`,
          ranges: [
            { range: '<200', status: '低', level: 'good' },
            { range: '200-800', status: '正常', level: 'Normal' },
            { range: '>800', status: '高', level: 'bad' }
          ],
          currentLevel: getEcLevel(result[0].ec)
        },
        {
          parameter: '溶氧(do)',
          value: `${result[0].Do}`,
          ranges: [
            { range: '<6.5', status: '低', level: 'good' },
            { range: '6.5-8', status: '正常', level: 'Normal' },
            { range: '>8', status: '高', level: 'bad' }
          ],
          currentLevel: getdoLevel(result[0].Do)
        },
        {
          parameter: '水質分數',
          value: `${result[0].score}`,
          ranges: [
            { range: '<0', status: '惡劣', level: 'really_bad' },
            { range: '0-45', status: '糟糕', level: 'poor' },
            { range: '45-65', status: '不良', level: 'marginal' },
            { range: '65-80', status: '中等', level: 'fair' },
            { range: '>80', status: '優良', level: 'Good' },
          ],
          currentLevel: getScoreLevel(result[0].score)
        }
      ];
      
      setWaterData(transformedData);
      setTips(getTips(transformedData));
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('獲取數據失敗:', err);
    } finally {
      setLoading(false);
    }
  };


  // 輔助函數：判斷溫度等級
  const getTemperatureLevel = (temp) => {
    
    if (temp === undefined || temp === null) return 'unknown';
    if (temp < 15) return 'cold';
    if (temp <= 25) return 'Normal';
    return 'hot';
  };

  const getph = (ph) => {
    if (ph === undefined || ph === null) return 'unknown';
    if (ph < 6.5) return 'acid';        // 酸性
    if (ph <= 8.5) return 'Normal';     // 中性
    return 'alkaline';                  // 鹼性
  };

  // 輔助函數：判斷EC等級
  const getEcLevel = (ec) => {
    if (ec === undefined || ec === null) return 'unknown';
    if (ec < 200) return 'good';
    if (ec <= 800) return 'Normal';
    return 'bad';
  };

  const getdoLevel = (Do) => {
    if (Do === undefined || Do === null) return 'unknown';
    if (Do < 6.5) return 'good';
    if (Do <= 8) return 'Normal';
    return 'bad';
  };

  // 輔助函數：判斷分數等級
  const getScoreLevel = (score) => {
    if (score === undefined || score === null) return 'unknown';
    if (score < 0) return 'really_bad';
    if (score < 45) return 'poor';
    if (score < 65) return 'marginal';
    if (score < 80) return 'fair';
    if (score < 95) return 'Good';
    return 'excellent';
  };
  
  // 初始加載數據
  useEffect(() => {
    fetchWaterData();
  }, []);

  // 下拉刷新
  const onRefresh = () => {
    setRefreshing(true);
    fetchWaterData().finally(() => setRefreshing(false));
  };

  // 手動刷新按鈕點擊事件
  const handleRefreshPress = () => {
    setLoading(true);
    fetchWaterData();
  };

  // 提示建議
  const getTips = (data) => {
  const tips = [];

  data.forEach((item) => {
    const level = item.currentLevel;

    switch (item.parameter) {
      case '溫度(°C)':
        if (level === 'cold') tips.push('水溫偏低，可考慮增加日照或使用加溫設備');
        if (level === 'Normal') tips.push('水溫正常，無需調整');
        if (level === 'hot') tips.push('水溫偏高，保持通風或使用遮陽設備');
        break;
      case '酸鹼值(PH)':
        if (level === 'acid') tips.push('酸鹼值偏酸，避免加入過多酸性物質');
        if (level === 'Normal') tips.push('酸鹼值正常，無需調整');
        if (level === 'alkaline') tips.push('酸鹼值偏鹼，可考慮加入適量酸性物質調節');
        break;
      case '導電度(EC)':
        if (level === 'bad') tips.push('導電度過高，應更換部分水體以降低鹽分');
        if (level === 'Normal') tips.push('導電度正常，無需調整');
        if (level === 'good') tips.push('導電度偏低，若必要可補充適量礦物質');
        break;
      case '溶氧(do)':
        if (level === 'bad') tips.push('溶氧過高，請確認水體是否過度曝氣');
        if (level === 'Normal') tips.push('溶氧正常，無需調整');
        if (level === 'good') tips.push('溶氧偏低，可使用打氣機增加水中含氧量');
        break;
      case '水質分數':
        if (level === 'really_bad') tips.push('水質極差，建議立即更換水體');
        if (level === 'poor') tips.push('水質在任何程度上都不適合使用');
        if (level === 'marginal') tips.push('水質經常受到威脅或損害、狀況經常偏離自然或理想水平');
        if (level === 'fair') tips.push('水質狀況有時偏離自然或理想水平');
        if (level === 'Good') tips.push('水質偏離自然或理想水平');
        if (level === 'excellent') tips.push('自然水質');
        break;
      default:
        break;
    }
  });

  return tips;
  };


  return (
    <LinearGradient
      colors={['#0f2027', '#203a43', '#2c5364']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FFFFFF']} 
            tintColor="#FFFFFF"  
          />
        }
      >
        <View style={styles.content}>
          <Text style={styles.text_top}>WaterMirror</Text>
          <Text style={styles.text_subtitle}>水質監測數據與改善建議</Text>
          <View style={styles.divider} />
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4FC3F7" />
              <Text style={styles.loadingText}>正在獲取水質數據...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ 數據獲取失敗</Text>
              <Text style={styles.errorMessage}>{error}</Text>
              <Text style={styles.retryText} onPress={fetchWaterData}>
                點擊重試
              </Text>
            </View>
          ) : (
            waterData?.map((item, index) => (
              <View key={index} style={styles.dataSection}>
                <View style={styles.parameterHeader}>
                  <Text style={styles.parameterText}>{item.parameter}:</Text>
                  <Text style={[
                    styles.valueText,
                    styles[`value${item.currentLevel}`]
                  ]}>
                    {item.value}
                  </Text>
                </View>
                
                <View style={styles.table}>
                  <View style={styles.row}>
                    {item.ranges.map((range, i) => (
                      <View key={i} style={[
                        styles.cell, 
                        styles.cellHeader,
                      ]}>
                        <Text style={styles.cellHeaderText}>{range.range}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.row}>
                    {item.ranges.map((range, i) => (
                      <View key={i} style={[
                        styles.cell, 
                        styles[`cell${range.level}`]
                      ]}>
                        <Text style={styles.cellText}>{range.status}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                {index < waterData.length - 1 && <View style={styles.sectionDivider} />}
              </View>
            ))
          )}
          

          </View>

      </ScrollView>

      {/* 右下角刷新按鈕 */}
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={handleRefreshPress}
        activeOpacity={0.7}
      >
        <Ionicons name="refresh" size={24} color="white" />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  text_top: {
    color: 'white',
    fontSize: 36,
    fontWeight: '300',
    marginBottom: 5,
    letterSpacing: 1,
  },
  text_subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginVertical: 15,
  },
  dataSection: {
    width: '90%',
    marginBottom: 25,
  },
  parameterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  parameterText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '500',
  },
  valueText: {
    fontSize: 22,
    fontWeight: '600',
  },
  valuegood: {
    color: 'rgba(3, 169, 244, 0.7)'
  },
  valueNormal: {
    color: 'rgba(93, 251, 45, 0.7)',
  },
  valuebad: {
    color: 'rgba(211, 47, 47, 0.7)',
  },
  valuecold: {
    color: 'rgba(3, 169, 244, 0.7)',
  },
  valuehot: {
    color: 'rgba(211, 47, 47, 0.7)',
  },
  valueacid: {
    color: 'rgba(211, 47, 47, 0.7)',
  },
  valuealkaline: {
    color: 'rgba(3, 169, 244, 0.7)',
  },
  valuereally_bad: {
    color: 'rgba(204, 0, 0, 0.7)',
  },
  valuepoor: {
    color: 'rgba(255, 0, 0, 0.7)',
  },
  valuemarginal: {
    color: 'rgba(255, 81, 0, 0.7)',
  },
  valuefair: {
    color: 'rgba(255, 174, 0, 0.7)',
  },
  valueGood: {
    color: 'rgba(200, 255, 0, 0.7)',
  },
  valueexcellent: {
    color: 'rgb(52, 221, 0)',
  },
  table: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellHeader: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  cellHeaderText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  cellgood: {
    backgroundColor: 'rgba(3, 169, 244, 0.7)',  // 深綠透明
  },
  cellNormal: {
    backgroundColor: 'rgba(93, 251, 45, 0.7)',
  },
  cellbad: {
    backgroundColor: 'rgba(211, 47, 47, 0.7)',  // 鮮紅透明
  },
  cellcold: {
    backgroundColor: 'rgba(3, 169, 244, 0.7)',  // 冷藍透明
  },
  cellhot: {
    backgroundColor: 'rgba(211, 47, 47, 0.7)',  // 熱橘紅透明
  },
  cellacid: {
    backgroundColor: 'rgba(211, 47, 47, 0.7)',  // 酸性橘紅
  },
  cellalkaline: {
    backgroundColor: 'rgba(3, 169, 244, 0.7)',  // 鹼性淺藍
  },
  cellreally_bad: {
    backgroundColor: 'rgba(204, 0, 0, 0.7)',  // 惡劣
  },
  cellpoor: {
    backgroundColor: 'rgba(255, 0, 0, 0.7)',  // 糟糕
  },
  cellmarginal: {
    backgroundColor: 'rgba(255, 81, 0, 0.7)',  // 不良
  },
  cellfair: {
    backgroundColor: 'rgba(255, 238, 0, 0.7)',  // 中等
  },
  cellGood: {
    backgroundColor: 'rgba(200, 255, 0, 0.7)',  // 優良
  },
  cellexcellent: {
    backgroundColor: 'rgb(52, 221, 0)',  // 極好
  },
  cellText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  sectionDivider: {
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 20,
  },
  tipsSection: {
    width: '90%',
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  tipsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 15,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tipBullet: {
    color: '#4FC3F7',
    fontSize: 16,
    marginRight: 10,
  },
  tipText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginTop: 15,
  },
  errorContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '90%',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  errorMessage: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  retryText: {
    color: '#4FC3F7',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  // 新增的刷新按鈕樣式
  refreshButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(79, 195, 247, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});