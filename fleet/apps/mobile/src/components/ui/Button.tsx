import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      ...(fullWidth && { width: '100%' }),
    };

    const sizeStyles: Record<string, ViewStyle> = {
      sm: { paddingHorizontal: 16, paddingVertical: 8, minHeight: 36 },
      md: { paddingHorizontal: 24, paddingVertical: 12, minHeight: 48 },
      lg: { paddingHorizontal: 32, paddingVertical: 16, minHeight: 56 },
    };

    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: '#3b82f6',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
      },
      secondary: {
        backgroundColor: '#6b7280',
        shadowColor: '#6b7280',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#3b82f6',
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(disabled && {
        opacity: 0.5,
        shadowOpacity: 0,
        elevation: 0,
      }),
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    const sizeStyles: Record<string, TextStyle> = {
      sm: { fontSize: 14 },
      md: { fontSize: 16 },
      lg: { fontSize: 18 },
    };

    const variantStyles: Record<string, TextStyle> = {
      primary: { color: '#ffffff' },
      secondary: { color: '#ffffff' },
      outline: { color: '#3b82f6' },
      ghost: { color: '#3b82f6' },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...textStyle,
    };
  };

  const ButtonContent = () => (
    <>
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? '#3b82f6' : '#ffffff'}
          style={{ marginRight: 8 }}
        />
      )}
      <Text style={getTextStyle()}>{title}</Text>
    </>
  );

  if (variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={getButtonStyle()}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#3b82f6', '#2563eb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            ...getButtonStyle(),
            backgroundColor: 'transparent',
            shadowOpacity: 0,
            elevation: 0,
          }}
        >
          <ButtonContent />
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={getButtonStyle()}
      activeOpacity={0.8}
    >
      <ButtonContent />
    </TouchableOpacity>
  );
};
