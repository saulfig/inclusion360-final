import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, ViewStyle } from 'react-native';

const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'bell.fill': 'notifications',
  'hand.raised.fill': 'pan-tool',
  'map.fill': 'map',
  'person.fill': 'person',
  'message.fill': 'message',
  'person.crop.circle.fill': 'account-circle',
  'mappin.circle.fill': 'location-on',
  'ear.fill': 'hearing',
  'exclamationmark.triangle.fill': 'warning',
  'questionmark.circle.fill': 'help',
  'clock.arrow.circlepath': 'history',
  'camera.fill': 'photo-camera',
  'viewfinder': 'center-focus-strong',
  'keyboard': 'keyboard',
  'arrow.clockwise': 'refresh',
  'magnifyingglass': 'search',
  'slider.horizontal.3': 'tune',
  'xmark': 'close',
  'keyboard.fill': 'keyboard',
  'figure.roll': 'accessible',
  'accessible': 'accessible',
  'accessibility': 'accessible',
} as Partial<
  Record<
    string,
    React.ComponentProps<typeof MaterialIcons>['name']
  >
>;

export type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<any>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
