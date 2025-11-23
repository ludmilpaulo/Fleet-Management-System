import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  className?: string;
  inputStyle?: TextStyle;
  inputClassName?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  style,
  className = '',
  inputStyle,
  inputClassName = '',
  leftIcon,
  rightIcon,
  onRightIconPress,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRightIconPress = () => {
    if (secureTextEntry) {
      setShowPassword(!showPassword);
    } else if (onRightIconPress) {
      onRightIconPress();
    }
  };

  const getInputContainerClasses = () => {
    const baseClasses = 'flex-row bg-white border-2 rounded-xl px-4 shadow-sm';
    const alignmentClass = multiline ? 'items-start' : 'items-center';
    const paddingClass = multiline ? 'py-3' : '';
    const heightClass = multiline ? 'min-h-[80px]' : 'min-h-[48px]';
    const borderClass = error ? 'border-red-500' : isFocused ? 'border-primary-500' : 'border-gray-200';
    const disabledClass = disabled ? 'bg-gray-50 opacity-60' : '';
    
    return `${baseClasses} ${alignmentClass} ${paddingClass} ${heightClass} ${borderClass} ${disabledClass}`.trim();
  };

  return (
    <View className={`mb-4 ${className}`} style={style}>
      {label && (
        <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</Text>
      )}
      
      <View className={getInputContainerClasses()}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={isFocused ? '#3b82f6' : '#6b7280'}
            style={{ marginRight: 12 }}
          />
        )}
        
        <TextInput
          className={`flex-1 text-base text-gray-900 dark:text-gray-100 ${multiline ? 'text-top pt-3' : ''} ${inputClassName}`}
          style={inputStyle}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {(rightIcon || secureTextEntry) && (
          <TouchableOpacity
            onPress={handleRightIconPress}
            className="p-1"
            disabled={disabled}
          >
            <Ionicons
              name={
                secureTextEntry
                  ? showPassword
                    ? 'eye-off'
                    : 'eye'
                  : rightIcon || 'eye'
              }
              size={20}
              color={isFocused ? '#3b82f6' : '#6b7280'}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text className="text-xs text-red-500 mt-1">{error}</Text>
      )}
    </View>
  );
};
