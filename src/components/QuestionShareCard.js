import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const QuestionShareCard = React.forwardRef(({
  question,
  label,
  color,
  minHeight = height * 0.44,
  footerUrl = 'cardwho.app',
}, ref) => (
  <View
    ref={ref}
    collapsable={false}
    style={[styles.card, { minHeight }]}
  >
    <LinearGradient
      colors={['#FFFFFF', '#FAFAFE']}
      style={StyleSheet.absoluteFill}
    />
    <View style={[styles.stripe, { backgroundColor: color }]} />
    <View style={styles.inner}>
      {!!label && (
        <Text style={[styles.label, { color }]}>
          {label}
        </Text>
      )}
      <Text style={styles.question}>{question}</Text>
      <View style={styles.footer}>
        <View style={styles.footerDivider} />
        <Text style={styles.footerUrl}>{footerUrl}</Text>
      </View>
    </View>
  </View>
));

const styles = StyleSheet.create({
  card: {
    width: width - 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    overflow: 'hidden',
  },
  stripe: {
    height: 7,
    width: '100%',
  },
  inner: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 22,
    textAlign: 'center',
  },
  question: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1A1545',
    lineHeight: 34,
    textAlign: 'center',
  },
  footer: {
    marginTop: 28,
    alignItems: 'center',
    gap: 6,
  },
  footerDivider: {
    width: 40,
    height: 1,
    backgroundColor: '#DDD8F0',
    marginBottom: 4,
  },
  footerUrl: {
    fontSize: 12,
    color: '#A67C2E',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default QuestionShareCard;
