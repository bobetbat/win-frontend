import { format } from 'date-fns';

const formatDisplayDate = (date) => {
  const dayNumber = format(date, 'dd');
  const dayName = format(date, 'EEEE');
  const shortendDayName = dayName.slice(0, 3);
  const month = format(date, 'LLLL');
  const shortendMonth = month.slice(0, 3);

  const displayedDate = `${shortendDayName}, ${shortendMonth} ${dayNumber}`;
  return displayedDate;
};

export const startDateDisplay = (dateRange) => {
  const arrival = dateRange[0].arrival;

  if (!arrival) return 'Check-in';

  return formatDisplayDate(arrival);
};

export const endDateDisplay = (dateRange) => {
  const departure = dateRange[0].departure;

  if (!departure) return 'Check-out';

  return formatDisplayDate(departure);
};

export const autocompleteData = [
  ...new Set([
    'Amsterdam',
    'Berlin',
    'Bogota',
    'Sydney',
    'New York',
    'London',
    'Denver',
    'San Francisco',
    'Valletta',
    'San Salvador',
    'Las Vegas',
    'Buenos Aires',
    'Paris',
    'New York',
    'Singapore',
    'Kyoto',
    'Oakland',
    'Perth',
    'Nice',
    'Minneapolis',
    'Vienna',
    'Atlanta',
    'Helsinki',
    'Tallinn',
    'Warsaw',
    'Zurich',
    'Sydney',
    'Brussels',
    'Dallas',
    'Puerto Rico',
    'Cancun',
    'Austin',
    'Boston',
    'Perth',
    'Milan',
    'Palermo',
    'Phoenix',
    'Seattle',
    'Manchester',
    'Andorra la Vella'
  ])
];
