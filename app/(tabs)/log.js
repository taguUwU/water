import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// API 請求函式
const fetchHistoryDataFromAPI = async (page = 1, pageSize = 10) => {
  const response = await fetch(`http://192.168.50.172:8001/history?page=${page}&limit=${pageSize}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

export default function HistoryScreen() {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const isFocused = useIsFocused();
  const hasLoaded = useRef(false);

  // 初次載入資料（只載入一次）
  useEffect(() => {
    if (isFocused && !hasLoaded.current) {
      loadInitialData();
      hasLoaded.current = true;
    }
  }, [isFocused]);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchHistoryDataFromAPI(1, 10);
      setHistoryData(data);
      setPage(2);
      setHasMore(data.length === 10);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await fetchHistoryDataFromAPI(1, 10);

      if (historyData.length > 0) {
        const latestTimestamp = Math.max(...historyData.map(item => new Date(item.timestamp).getTime()));
        const newData = data.filter(item => new Date(item.timestamp).getTime() > latestTimestamp);
        if (newData.length > 0) {
          setHistoryData(prev => [...newData, ...prev]);
        }
      } else {
        setHistoryData(data);
      }

      setPage(2);
      setHasMore(true);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  }, [historyData]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const data = await fetchHistoryDataFromAPI(page, 10);

      if (data.length > 0) {
        const oldestTimestamp = Math.min(...historyData.map(item => new Date(item.timestamp).getTime()));
        const newData = data.filter(item => new Date(item.timestamp).getTime() < oldestTimestamp);
        if (newData.length > 0) {
          setHistoryData(prev => [...prev, ...newData]);
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }

      setPage(prev => prev + 1);
    } catch (err) {
      console.error('載入更多資料失敗:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [page, loadingMore, hasMore, historyData]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const getScoreLevel = (score) => {
    if (score === undefined || score === null) return 'unknown';
    if (score < 0) return 'really_bad';
    if (score < 45) return 'poor';
    if (score < 65) return 'marginal';
    if (score < 80) return 'fair';
    if (score < 95) return 'Good';
    return 'excellent';
  };

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <Text style={styles.historyDate}>{formatTimestamp(item.timestamp)}</Text>
      <View style={styles.dataGrid}>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>溫度:</Text>
          <Text style={styles.dataValue}>{item.temperature} °C</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>酸鹼值:</Text>
          <Text style={styles.dataValue}>{item.ph}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>導電度:</Text>
          <Text style={styles.dataValue}>{item.ec}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>溶氧:</Text>
          <Text style={styles.dataValue}>{item.Do}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>水質分數:</Text>
          <Text style={[styles.dataValue, styles[`score${getScoreLevel(item.score)}`]]}>
            {item.score}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color="#4FC3F7" />
        <Text style={styles.footerText}>載入更多歷史資料...</Text>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#0f2027', '#203a43', '#2c5364']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>水質歷史紀錄</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#4FC3F7" />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4FC3F7" />
          <Text style={styles.loadingText}>正在加載歷史數據...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ 數據獲取失敗</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity onPress={loadInitialData} style={styles.retryButton}>
            <Text style={styles.retryText}>重試</Text>
          </TouchableOpacity>
        </View>
      ) : historyData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={48} color="rgba(255,255,255,0.5)" />
          <Text style={styles.emptyText}>暫無歷史數據</Text>
          <TouchableOpacity onPress={loadInitialData} style={styles.retryButton}>
            <Text style={styles.retryText}>刷新</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={historyData}
          renderItem={renderHistoryItem}
          keyExtractor={(item, index) => `${item.timestamp}_${index}`}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#4FC3F7']}
              tintColor="#4FC3F7"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 5,
  },
  listContainer: {
    padding: 15,
    paddingBottom: 20,
  },
  historyItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  historyDate: {
    color: '#4FC3F7',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 5,
  },
  dataGrid: {
    flexDirection: 'column',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dataLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  dataValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },

  // 分數顏色樣式
  scorereally_bad: {
    color: 'rgba(204, 0, 0, 0.7)',
  },
  scorepoor: {
    color: 'rgba(255, 0, 0, 0.7)',
  },
  scoremarginal: {
    color: 'rgba(255, 81, 0, 0.7)',
  },
  scorefair: {
    color: 'rgba(255, 174, 0, 0.7)',
  },
  scoreGood: {
    color: 'rgba(200, 255, 0, 0.7)',
  },
  scoreexcellent: {
    color: 'rgb(52, 221, 0)',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 10,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  errorMessage: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: 'rgba(79, 195, 247, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  retryText: {
    color: '#4FC3F7',
    fontSize: 16,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    marginTop: 10,
  },

  footerContainer: {
    padding: 10,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 5,
    fontSize: 12,
  },
});

