import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { getBanners, Banner } from '../services/api';

const { width } = Dimensions.get('window');

const BannerCarousel: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    getBanners({ status: 'active', limit: 10 })
      .then((data) => setBanners(data.banners ?? []));
  }, []);

  if (banners.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.info}>Nenhum banner disponível</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Carousel
        width={width * 0.9}
        height={width * 0.7}
        autoPlay
        data={banners}
        scrollAnimationDuration={1000}
        autoPlayInterval={5000}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image
              source={{ uri: item.url_image }}
              style={styles.image}
              resizeMode="cover"
            />
            <Text style={styles.title}>{item.title}</Text>
            {item.description ? (
              <Text style={styles.desc}>{item.description}</Text>
            ) : null}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '70%',
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  desc: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    fontSize: 20,
    color: '#888',
  },
});

export default BannerCarousel;