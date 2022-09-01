import * as Yup from 'yup';

export const SearchSchema = Yup.object().shape({
  location: Yup.string().required('Location is required'),
  adultCount: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('Should be more than 0')
    .moreThan(0, 'Should be more than 0'),
  roomCount: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('Should be more than 0')
    .moreThan(0, 'Should be more than 0'),
  dateRange: Yup.array()
    .of(
      Yup.object().shape({
        arrival: Yup.date().required('Pick a start date'),
        departure: Yup.date().required('Pick a end date')
      })
    )
    .required('Should have a beginning and end date')
});
