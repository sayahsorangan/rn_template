import {format, isThisWeek, isToday, isYesterday} from 'date-fns';

export const formatChatTime = (date: Date) => {
  const parsedDate = new Date(date);

  if (isToday(parsedDate)) {
    return format(parsedDate, 'hh:mm a');
  } else if (isYesterday(parsedDate)) {
    return `Yesterday, ${format(parsedDate, 'hh:mm a')}`;
  } else if (isThisWeek(parsedDate)) {
    return format(parsedDate, 'EEEE, hh:mm a');
  } else {
    return format(parsedDate, 'dd MMM yyyy, hh:mm a');
  }
};
