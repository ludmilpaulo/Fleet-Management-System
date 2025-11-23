import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  className?: string;
  textStyle?: TextStyle;
  textClassName?: string;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = React.memo(({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  className = '',
  textStyle,
  textClassName = '',
  fullWidth = false,
}) => {
  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 min-h-[36px]';
      case 'md':
        return 'px-6 py-3 min-h-[48px]';
      case 'lg':
        return 'px-8 py-4 min-h-[56px]';
      default:
        return 'px-6 py-3 min-h-[48px]';
    }
  }, [size]);

  const variantClasses = useMemo(() => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-500 shadow-lg shadow-primary-500/30';
      case 'secondary':
        return 'bg-gray-500 shadow-lg shadow-gray-500/30';
      case 'outline':
        return 'bg-transparent border-2 border-primary-500';
      case 'ghost':
        return 'bg-transparent';
      default:
        return 'bg-primary-500 shadow-lg shadow-primary-500/30';
    }
  }, [variant]);

  const textSizeClasses = useMemo(() => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-base';
      case 'lg':
        return 'text-lg';
      default:
        return 'text-base';
    }
  }, [size]);

  const textVariantClasses = useMemo(() => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return 'text-white';
      case 'outline':
      case 'ghost':
        return 'text-primary-500';
      default:
        return 'text-white';
    }
  }, [variant]);

  const baseClasses = useMemo(() => 
    `rounded-xl items-center justify-center flex-row ${fullWidth ? 'w-full' : ''} ${sizeClasses} ${variantClasses} ${disabled ? 'opacity-50' : ''} ${className}`,
    [fullWidth, sizeClasses, variantClasses, disabled, className]
  );
  
  const textClasses = useMemo(() => 
    `font-semibold text-center ${textSizeClasses} ${textVariantClasses} ${textClassName}`,
    [textSizeClasses, textVariantClasses, textClassName]
  );

  const ButtonContent = () => (
    <>
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? '#3b82f6' : '#ffffff'}
          style={{ marginRight: 8 }}
        />
      )}
      <Text className={textClasses} style={textStyle}>{title}</Text>
    </>
  );

  const handlePress = () => {
    if (disabled || loading || !onPress) return;
    
    // Haptic feedback for better UX (iOS only)
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
        // Ignore haptic errors
      });
    }
    
    try {
      console.log('[Button] Press handler called for:', title);
      onPress();
    } catch (error) {
      console.error('[Button] Error in onPress handler:', error);
    }
  };

  if (variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        className={baseClasses}
        style={style}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['#3b82f6', '#2563eb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute inset-0 rounded-xl"
        >
          <ButtonContent />
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      className={baseClasses}
      style={style}
      activeOpacity={0.7}
    >
      <ButtonContent />
    </TouchableOpacity>
  );
});
