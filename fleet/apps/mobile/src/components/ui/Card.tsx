import React from 'react';
import {
  View,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  className?: string;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  className = '',
  onPress,
  variant = 'default',
  padding = 'md',
}) => {
  const getPaddingClass = () => {
    switch (padding) {
      case 'sm': return 'p-3';
      case 'lg': return 'p-6';
      default: return 'p-4';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'shadow-xl';
      case 'outlined':
        return 'border border-gray-200';
      case 'gradient':
        return '';
      default:
        return 'shadow-md';
    }
  };

  const baseClasses = `rounded-2xl bg-white ${getPaddingClass()} ${getVariantClasses()} ${className}`;

  const CardContent = () => {
    if (variant === 'gradient') {
      return (
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className={baseClasses}
          style={style}
        >
          {children}
        </LinearGradient>
      );
    }

    return (
      <View className={baseClasses} style={style}>
        {children}
      </View>
    );
  };

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.95}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};
