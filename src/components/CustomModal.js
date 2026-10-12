import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

/**
 * Reusable Modern Custom Modal for UPI Preloved
 * Types:
 * - 'success': Green checkmark icon
 * - 'warning': Amber alert-circle icon
 * - 'danger': Red trash/warning icon (e.g. Delete, Logout)
 * - 'info': Blue / Red information icon
 */
const CustomModal = ({
  visible,
  type = 'info',
  title = '',
  message = '',
  confirmText = 'OK',
  cancelText = 'Batal',
  onConfirm,
  onCancel,
  showCancel = false,
}) => {
  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return {
          name: 'checkmark-circle',
          color: '#2E7D32',
          bgColor: '#E8F5E9',
          btnColor: '#2E7D32',
        };
      case 'warning':
        return {
          name: 'alert-circle',
          color: '#E65100',
          bgColor: '#FFF3E0',
          btnColor: '#E65100',
        };
      case 'danger':
        return {
          name: 'trash',
          color: '#C62828',
          bgColor: '#FFEBEE',
          btnColor: '#C62828',
        };
      case 'logout':
        return {
          name: 'log-out',
          color: '#C62828',
          bgColor: '#FFEBEE',
          btnColor: '#C62828',
        };
      case 'info':
      default:
        return {
          name: 'information-circle',
          color: '#C62828',
          bgColor: '#FFEBEE',
          btnColor: '#C62828',
        };
    }
  };

  const iconConfig = getIconConfig();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel || onConfirm}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogCard}>
          {/* Top Decorative Icon Circle */}
          <View style={[styles.iconCircle, { backgroundColor: iconConfig.bgColor }]}>
            <Ionicons name={iconConfig.name} size={36} color={iconConfig.color} />
          </View>

          {/* Title & Message */}
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}

          {/* Action Buttons */}
          <View style={[styles.buttonRow, !showCancel && styles.buttonSingle]}>
            {showCancel ? (
              <TouchableOpacity
                style={styles.btnCancel}
                activeOpacity={0.7}
                onPress={onCancel}
              >
                <Text style={styles.btnCancelText}>{cancelText}</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[
                styles.btnConfirm,
                { backgroundColor: iconConfig.btnColor },
                !showCancel && { flex: 1 },
              ]}
              activeOpacity={0.85}
              onPress={onConfirm}
            >
              <Text style={styles.btnConfirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  dialogCard: {
    width: Math.min(width - 48, 360),
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 13.5,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  buttonSingle: {
    justifyContent: 'center',
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  btnConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  btnConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default CustomModal;
