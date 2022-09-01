import { yupResolver } from '@hookform/resolvers/yup';
import { useAccommodationsAndOffers } from 'src/hooks/useAccommodationsAndOffers.tsx';
import {
  Box,
  Button,
  InputAdornment,
  Stack,
  useTheme,
  Toolbar,
  Divider,
  useMediaQuery,
  Alert,
  styled
} from '@mui/material';
import { FormProvider } from 'src/components/hook-form';
import { useForm } from 'react-hook-form';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Iconify from 'src/components/Iconify';
import { autocompleteData, endDateDisplay, startDateDisplay } from './helpers';
import { LoadingButton } from '@mui/lab';
import {
  createSearchParams,
  useNavigate,
  useSearchParams,
  useLocation
} from 'react-router-dom';
import { formatISO, parseISO } from 'date-fns';
import { SearchSchema } from './SearchScheme';
import { convertToLocalTime } from 'src/utils/date';
import RHFTAutocomplete from 'src/components/hook-form/RHFAutocomplete';
import { SearchPopovers } from './SearchPopovers';

const ToolbarStyle = styled(Toolbar)(({ theme }) => ({
  zIndex: 2,
  paddingBottom: theme.spacing(1),
  display: 'flex',
  justifyContent: 'center',
  border: 'none',
  width: '100%',
  backgroundColor: theme.palette.background.default,

  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(2),
    width: 'max-content',
    border: `3px solid ${theme.palette.primary.main}`,
    borderRadius: 10
  }
}));

type FormValuesProps = {
  location: string;
  roomCount: number | string;
  adultCount: number | string;
  dateRange: {
    arrival: Date | null;
    departure: Date | null;
    key: string;
  }[];
};

const LocationIcon = () => <Iconify icon={'eva:pin-outline'} width={12} height={12} />;

export const SearchForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { pathname, search } = useLocation();

  /**
   * Logic in relation to the popovers.
   */
  const formRef = useRef<HTMLDivElement>(null);
  const [dateRangeAnchorEl, setDateRangeAnchorEl] = useState<HTMLDivElement | null>(null);
  const [guestsAnchorEl, setGuestsAnchorEl] = useState<HTMLDivElement | null>(null);
  const isDatePopoverOpen = Boolean(dateRangeAnchorEl);
  const isGuestsPopoverOpen = Boolean(guestsAnchorEl);

  /**
   * Logic in relation to handling the form
   */
  const defaultValues: FormValuesProps = useMemo(() => {
    const startDateParams = searchParams.get('arrival');
    const endDateParams = searchParams.get('departure');

    return {
      location: searchParams.get('location') || '',
      adultCount: Number(searchParams.get('adultCount')) || 2,
      roomCount: Number(searchParams.get('roomCount')) || 1,
      dateRange: [
        {
          arrival: startDateParams ? parseISO(startDateParams) : null,
          departure: endDateParams ? parseISO(endDateParams) : null,
          key: 'selection'
        }
      ]
    };
  }, [searchParams]);

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(SearchSchema),
    defaultValues
  });
  const {
    watch,
    handleSubmit,
    formState: { errors }
  } = methods;
  const values = watch();

  const hasValidationErrors = Object.keys(errors).length != 0;
  const { roomCount, adultCount, dateRange, location } = values;
  const arrival = dateRange[0].arrival && convertToLocalTime(dateRange[0].arrival);
  const departure = dateRange[0].departure && convertToLocalTime(dateRange[0].departure);
  /**
   * Logic in relation to executing the query
   */
  const { refetch, isFetching, error } = useAccommodationsAndOffers({
    arrival: arrival,
    departure: departure,
    adultCount: Number(adultCount),
    location: location,
    roomCount: Number(roomCount)
  });

  const onSubmit = useCallback(() => {
    //TODO: update search params when submitting the form
    if (dateRange[0].arrival !== null && dateRange[0].departure !== null) {
      const params = {
        roomCount: roomCount.toString(),
        adultCount: adultCount.toString(),
        arrival: formatISO(dateRange[0].arrival),
        departure: formatISO(dateRange[0].departure),
        location
      };

      navigate({
        pathname: '/search',
        search: `?${createSearchParams(params)}`
      });
      return;
    }
  }, [roomCount, adultCount, dateRange, location, refetch]);

  /**
   * Conduct a search on the initial render when conditions are met.
   */
  useEffect(() => {
    if (pathname !== '/search') return;

    const includesAllSearchParams =
      !!searchParams.get('location') &&
      !!searchParams.get('departure') &&
      !!searchParams.get('arrival') &&
      !!searchParams.get('roomCount') &&
      !!searchParams.get('roomCount') &&
      !!searchParams.get('adultCount');

    if (includesAllSearchParams) {
      refetch();
    }
  }, [search]);

  /**
   * Logic in relation to styling and textual UI
   */
  const roomText = roomCount === 1 ? 'room' : 'rooms';
  const guestDetailsText = `${adultCount} guests, ${roomCount} ${roomText}`;
  const fontStyling = theme.typography.body2;
  const buttonSize = useMediaQuery(theme.breakpoints.down('md')) ? 'small' : 'large';

  const popOversState = {
    isGuestsPopoverOpen,
    guestsAnchorEl,
    setGuestsAnchorEl,
    isDatePopoverOpen,
    dateRangeAnchorEl,
    setDateRangeAnchorEl
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <SearchPopovers {...popOversState} />
      <Stack direction="column" alignItems="center">
        <ToolbarStyle ref={formRef}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems="center"
            spacing={1}
            divider={
              <Divider
                orientation={
                  useMediaQuery(theme.breakpoints.down('md')) ? 'horizontal' : 'vertical'
                }
                flexItem
              />
            }
          >
            <RHFTAutocomplete
              variant="standard"
              placeholder="Where are you going?"
              name="location"
              options={autocompleteData}
              width="230px"
              inputProps={{
                style: {
                  ...fontStyling,
                  textAlign: useMediaQuery(theme.breakpoints.down('md'))
                    ? 'center'
                    : 'left'
                }
              }}
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationIcon />
                  </InputAdornment>
                )
              }}
            />
            <Box>
              <Button
                onClick={() => setDateRangeAnchorEl(formRef.current)}
                size={buttonSize}
                variant="text"
                sx={{
                  minWidth: '230px',
                  whiteSpace: 'nowrap',
                  ...fontStyling
                }}
                color="inherit"
              >
                {startDateDisplay(dateRange)} — {endDateDisplay(dateRange)}
              </Button>
            </Box>

            <Box>
              <Button
                sx={{
                  minWidth: '144px',
                  whiteSpace: 'nowrap',
                  ...fontStyling
                }}
                onClick={() => setGuestsAnchorEl(formRef.current)}
                size={buttonSize}
                variant="text"
                color="inherit"
              >
                {guestDetailsText}
              </Button>
            </Box>
            <Box>
              <LoadingButton
                disableElevation
                type="submit"
                loading={isFetching}
                variant="contained"
                size={buttonSize}
                sx={{
                  whiteSpace: 'nowrap',
                  ...fontStyling
                }}
              >
                Search
              </LoadingButton>
            </Box>
          </Stack>
        </ToolbarStyle>
        <>
          {hasValidationErrors && (
            <Alert
              sx={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}
              severity="error"
            >
              Fill in your destination, dates and the amount of rooms/guests.
            </Alert>
          )}

          {error && (
            <Alert
              sx={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}
              severity="error"
            >
              {(error as Error) && (error as Error).message
                ? (error as Error).message
                : 'Something went wrong '}
            </Alert>
          )}
        </>
      </Stack>
    </FormProvider>
  );
};
