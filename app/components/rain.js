import { Dimensions, View } from 'react-native';
import * as Animatable from 'react-native-animatable';

const RainDrop = ({ delay, duration, left }) => (
  <Animatable.View 
    style={[
      styles.rainDrop,
      { left }
    ]}
    animation={{  
      from: { top: - 150 },
      to: { top: Dimensions.get('window').height },
    }}  
    delay={delay}
    duration={duration}
    easing="linear"
    iterationCount="infinite"
  />
);

const generateRainDrops = (count) => {
  const drops = [];
  const windowWidth = Dimensions.get('window').width;
  
  for (let i = 0; i < count; i++) {
    drops.push(
      <RainDrop 
        key={i}
        delay={Math.random() * 5000}
        duration={2000 + Math.random() * 5000}
        left={Math.random() * windowWidth}
      />
    );
  }
  return drops;
};

const Rain = ({ dropCount = 45 }) => (
  <View style={styles.rainContainer}>
    {generateRainDrops(dropCount)}
  </View>
);

const styles = {
  rainContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  rainDrop: {
    position: 'absolute',
    width: 2,
    height: 25,
    backgroundColor: 'rgba(191, 220, 255, 0.6)',
  }
};

export default Rain;