import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CalendarStrip({ selectedDate, onDateSelect }) {
  // Build a 7-day window around the selected date (today by default)
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const selectedDay = selectedDate.getDate();
  const windowSize = 7;
  const halfWindow = Math.floor(windowSize / 2); // 3 days on each side when possible

  let startDay = selectedDay - halfWindow;
  let endDay = selectedDay + halfWindow;

  // Clamp to month bounds
  if (startDay < 1) {
    const diff = 1 - startDay;
    startDay = 1;
    endDay = Math.min(daysInMonth, endDay + diff);
  }
  if (endDay > daysInMonth) {
    const diff = endDay - daysInMonth;
    endDay = daysInMonth;
    startDay = Math.max(1, startDay - diff);
  }

  const monthDates = [];
  for (let d = startDay; d <= endDay; d += 1) {
    monthDates.push(new Date(year, month, d));
  }

  const formatDate = (date) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const goToPrevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    onDateSelect(prev);
  };

  const goToNextMonth = () => {
    const next = new Date(year, month + 1, 1);
    onDateSelect(next);
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
        <TouchableOpacity onPress={goToPrevMonth} style={styles.monthArrow}>
          <Ionicons name="chevron-back" size={20} color="#01559d" />
        </TouchableOpacity>
        <Text style={styles.dateDisplayText}>{formatDate(selectedDate)}</Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.monthArrow}>
          <Ionicons name="chevron-forward" size={20} color="#01559d" />
        </TouchableOpacity>
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
    backgroundColor: '#01559d',
  },
  dayText: {
    fontSize: 12,
    color: '#4F5B62',
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedDayText: {
    color: '#fff',
  },
  dateText: {
    fontSize: 18,
    color: '#01559d',
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
    borderTopColor: '#01559d',
  },
  monthArrow: {
    paddingHorizontal: 8,
  },
  dateDisplayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#01559d',
    marginRight: 8,
  },
});
