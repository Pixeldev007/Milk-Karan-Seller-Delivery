import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CalendarStrip({ selectedDate, onDateSelect }) {
  // Build all dates for the current month of selectedDate
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthDates = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));

  const formatDate = (date) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <View style={styles.container}>
      <View style={styles.calendarHeader}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysContainer}
        >
          {monthDates.map((dateObj) => {
            const isSelected =
              dateObj.getDate() === selectedDate.getDate() &&
              dateObj.getMonth() === selectedDate.getMonth() &&
              dateObj.getFullYear() === selectedDate.getFullYear();
            const dayLabel = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][dateObj.getDay()];
            return (
              <TouchableOpacity
                key={dateObj.toISOString()}
                style={[styles.dayCard, isSelected && styles.selectedDayCard]}
                onPress={() => onDateSelect(dateObj)}
              >
                <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
                  {dayLabel}
                </Text>
                <Text style={[styles.dateText, isSelected && styles.selectedDateText]}>
                  {dateObj.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      <View style={styles.dateDisplay}>
        <Text style={styles.dateDisplayText}>{formatDate(selectedDate)}</Text>
        <Ionicons name="chevron-down" size={20} color="#66BB6A" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  calendarHeader: {
    marginBottom: 12,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayCard: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 50,
  },
  selectedDayCard: {
    backgroundColor: '#66BB6A',
  },
  dayText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedDayText: {
    color: '#fff',
  },
  dateText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  selectedDateText: {
    color: '#fff',
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dateDisplayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
});
