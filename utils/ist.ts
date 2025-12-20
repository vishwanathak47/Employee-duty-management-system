
import { format, addMinutes } from 'date-fns';

/**
 * Returns the current date in IST (UTC + 5:30)
 */
export const getISTDate = (date: Date = new Date()): Date => {
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const istOffset = 5.5; 
  return new Date(utc + (3600000 * istOffset));
};

export const formatToIST = (date: Date, formatStr: string = 'yyyy-MM-dd'): string => {
  return format(getISTDate(date), formatStr);
};

export const getCurrentMonthYear = (): string => {
  return format(getISTDate(), 'MMMM yyyy');
};

export const getMonthYearFromDate = (dateStr: string): string => {
  return format(new Date(dateStr), 'MMMM yyyy');
};
