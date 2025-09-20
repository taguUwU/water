import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useWaterData } from '../WaterDataContext';

// 共用判斷函數
const getParameterLevels = (data) => ({
  temperature: {
    level: getTemperatureLevel(data?.temperature),
    tips: {
      cold: '水溫偏低，可考慮增加日照或使用加溫設備',
      Normal: '水溫正常，無需調整',
      hot: '水溫偏高，保持通風或使用遮陽設備'
    }
  },
  ph: {
    level: getPHLevel(data?.ph),
    tips: {
      acid: '酸鹼值偏酸，避免加入過多酸性物質',
      Normal: '酸鹼值正常，無需調整',
      alkaline: '酸鹼值偏鹼，可考慮加入適量酸性物質調節'
    }
  },
  ec: {
    level: getECLevel(data?.ec),
    tips: {
      good: '導電度偏低，若必要可補充適量礦物質',
      Normal: '導電度正常，無需調整',
      bad: '導電度過高，應更換部分水體以降低鹽分'
    }
  },
  do: {
    level: getDOLevel(data?.Do),
    tips: {
      good: '溶氧偏低，可使用打氣機增加水中含氧量',
      Normal: '溶氧正常，無需調整',
      bad: '溶氧過高，請確認水體是否過度曝氣'
    }
  },
  score: {
    level: getScoreLevel(data?.score),
    tips: {
      really_bad: '水質極差，建議立即更換水體',
      poor: '水質在任何程度上都不適合使用',
      marginal: '水質經常受到威脅或損害、狀況經常偏離自然或理想水平',
      fair: '水質狀況有時偏離自然或理想水平',
      Good: '水質偏離自然或理想水平',
      excellent: '自然水質'
    }
  }
});

// 等級判斷函數
const getTemperatureLevel = (temp) => {
  if (temp === undefined || temp === null) return 'unknown';
  return temp < 15 ? 'cold' : temp <= 25 ? 'Normal' : 'hot';
};

const getPHLevel = (ph) => {
  if (ph === undefined || ph === null) return 'unknown';
  return ph < 6.5 ? 'acid' : ph <= 8.5 ? 'Normal' : 'alkaline';
};

const getECLevel = (ec) => {
  if (ec === undefined || ec === null) return 'unknown';
  return ec < 200 ? 'good' : ec <= 800 ? 'Normal' : 'bad';
};

const getDOLevel = (Do) => {
  if (Do === undefined || Do === null) return 'unknown';
  return Do < 6.5 ? 'good' : Do <= 8 ? 'Normal' : 'bad';
};

const getScoreLevel = (score) => {
  if (score === undefined || score === null) return 'unknown';
  if (score < 0) return 'really_bad';
  if (score < 45) return 'poor';
  if (score < 65) return 'marginal';
  if (score < 80) return 'fair';
  return score < 95 ? 'Good' : 'excellent';
};

export default function cal() {
  const { waterData } = useWaterData();
  const parameterLevels = getParameterLevels(waterData);
  
  // 生成建議列表
  const allTips = Object.values(parameterLevels).reduce((acc, param) => {
    const tip = param.tips[param.level];
    return tip ? [...acc, tip] : acc;
  }, []);

  // 獲取當前分數的區間和顏色
  const getCurrentScoreInfo = (score) => {
    if (score === undefined || score === null) return null;
    
    if (score < 0) return { range: '<0', level: '恶劣', color: '#ff4757' };
    if (score < 45) return { range: '0-44', level: '糟糕', color: '#ff6b81' };
    if (score < 65) return { range: '45-64', level: '不良', color: '#ffa502' };
    if (score < 80) return { range: '65-79', level: '中等', color: '#2ed573' };
    return { range: '80-100', level: '優良', color: '#1e90ff' };
  };

  const currentScoreInfo = getCurrentScoreInfo(waterData?.score);

  return (
    <LinearGradient
      colors={['#0f2027', '#203a43', '#2c5364']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <View style={styles.content}>
        <Text style={styles.scoreText}>水質評分: {waterData?.score || '未獲取到資訊'}</Text>
        
        {/* 顯示當前分數狀態 */}
        {currentScoreInfo && (
          <View style={styles.currentScoreContainer}>
            <Text style={styles.currentScoreText}>
              你的水質分數目前位於 
              <Text style={{ color: currentScoreInfo.color, fontWeight: 'bold' }}>
                {currentScoreInfo.range}
              </Text> 區，狀態為
              <Text style={{ color: currentScoreInfo.color, fontWeight: 'bold' }}>
                「{currentScoreInfo.level}」
              </Text>
            </Text>
          </View>
        )}

        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/images/Score3.png')}
            style={styles.image}
          />
          <View style={styles.percentagesContainer}>
            <View style={styles.percentageItem}>
              <View style={[styles.colorBox, {backgroundColor: '#ff6b81'}]} />
              <Text style={styles.percentageText}>糟糕:58%</Text>
            </View>
            <View style={styles.percentageItem}>
              <View style={[styles.colorBox, {backgroundColor: '#ff4757'}]} />
              <Text style={styles.percentageText}>惡劣:15.6%</Text>
            </View>
            <View style={styles.percentageItem}>
              <View style={[styles.colorBox, {backgroundColor: '#2ed573'}]} />
              <Text style={styles.percentageText}>中等:13.1%</Text>
            </View>
            <View style={styles.percentageItem}>
              <View style={[styles.colorBox, {backgroundColor: '#ffa502'}]} />
              <Text style={styles.percentageText}>不良:11.0%</Text>
            </View>
            <View style={styles.percentageItem}>
              <View style={[styles.colorBox, {backgroundColor: '#1e90ff'}]} />
              <Text style={styles.percentageText}>優良:2.4%</Text>
            </View>
          </View>
        </View>

        {/* 水質分數表格 */}
        <View style={styles.tableContainer}>
          {/* 第一行：分数区间 */}
          <View style={styles.scoreRangeRow}>
            {[
              { range: '<0', color: '#ff4757' },
              { range: '0-44', color: '#ff6b81' },
              { range: '45-64', color: '#ffa502' },
              { range: '65-79', color: '#2ed573' },
              { range: '80-100', color: '#1e90ff' }
            ].map((item, index) => (
              <View key={`range-${index}`} style={styles.scoreRangeItem}>
                <Text style={[styles.rangeText, {color: item.color}]}>{item.range}</Text>
              </View>
            ))}
          </View>

          {/* 第二行：水质等级 */}
          <View style={styles.qualityLevelRow}>
            {[
              { level: '恶劣', color: '#ff4757' },
              { level: '糟糕', color: '#ff6b81' },
              { level: '不良', color: '#ffa502' },
              { level: '中等', color: '#2ed573' },
              { level: '優良', color: '#1e90ff' }
            ].map((item, index) => (
              <View key={`level-${index}`} style={styles.qualityLevelItem}>
                <Text style={[styles.levelText, {color: item.color}]}>{item.level}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 整合所有建議 */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>綜合改善建議</Text>
          {allTips.map((tip, index) => (
            <View style={styles.tipItem} key={index}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  scoreText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  currentScoreContainer: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    width: '90%',
  },
  currentScoreText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  percentagesContainer: {
    marginLeft: 15,
  },
  percentageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 7,
  },
  colorBox: {
    width: 20,
    height: 20,
    marginRight: 8,
    borderRadius: 4,
  },
  percentageText: {
    color: 'white',
    fontSize: 16,
  },
  // 表格樣式
  tableContainer: {
    width: '90%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  scoreRangeRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  qualityLevelRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  scoreRangeItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
  },
  qualityLevelItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
  },
  rangeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  levelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  // 提示區塊樣式
  tipsSection: {
    width: '90%',
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tipsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
    lineHeight: 22,
  },
  tipText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    flex: 1,
    lineHeight: 22,
  }
});