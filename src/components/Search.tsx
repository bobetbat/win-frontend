import type { LatLngTuple } from 'leaflet';
import axios from 'axios';
import { DateTime } from 'luxon';
import {
  Box,
  Button,
  DateInput,
  DropButton,
  Form,
  FormField,
  Grid,
  TextInput
} from 'grommet';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logger from '../utils/logger';
import { MessageBox } from './MessageBox';
import { useWindowsDimension } from '../hooks/useWindowsDimension';
import { useAppDispatch, useAppState } from '../store';
import { CoordinatesRequest, CoordinatesResponse } from '../api/CoordinatesRequest';

const logger = Logger('Search');
const today = DateTime.local().toISO();
const tomorrow = DateTime.local().plus({ days: 1 }).toISO();

const prarseAdults = (count) => (count === 1 ? `${count} adult` : `${count} adults`);
const prarseChildren = (count) => (count === 1 ? `${count} child` : `${count} children`);
const prarseRooms = (count) => (count === 1 ? `${count} room` : `${count} rooms`);

export const ResponsiveTopGrid = (winWidth: number) => {
  if (winWidth >= 1300) {
    return ['5fr', '3fr', '4fr', '2fr'];
  } else if (winWidth >= 1000) {
    return ['5fr', '3fr', '4fr', '2fr'];
  } else if (winWidth >= 768) {
    return ['1fr', '1fr'];
  } else if (winWidth >= 600) {
    return ['1fr', '1fr'];
  } else if (winWidth <= 500) {
    return ['1fr'];
  } else if (winWidth <= 400) {
    return ['1fr'];
  }
};
export const ResponsiveBottomGrid = (winWidth: number) => {
  if (winWidth >= 1300) {
    return ['25%', '25%', '25%', '25%'];
  } else if (winWidth >= 1000) {
    return ['25%', '25%', '25%', '25%'];
  } else if (winWidth >= 768) {
    return ['25%', '25%', '25%', '25%'];
  } else if (winWidth >= 600) {
    return ['100%'];
  } else if (winWidth <= 500) {
    return ['100%'];
  } else if (winWidth <= 400) {
    return ['100%'];
  }
};
export const Search: React.FC<{
  onSubmit: React.Dispatch<React.SetStateAction<LatLngTuple>>;
  center: LatLngTuple;
}> = ({ onSubmit }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { winWidth } = useWindowsDimension();
  const { searchParams } = useAppState();

  const [searchValue, setSearchValue] = useState<string>('');
  const [checkInCheckOut, setCheckInCheckOut] = useState<[string, string]>([
    today,
    tomorrow
  ]);
  const [numSpacesReq, setNumSpacesReq] = useState<number>(1);
  const [numAdults, setNumAdults] = useState<number>(1);
  const [numChildren, setNumChildren] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<undefined | string>();

  const handleMapSearch: () => Promise<LatLngTuple | undefined> =
    useCallback(async () => {
      logger.info('requst map');
      setLoading(true);
      setError(undefined);

      try {
        if (searchParams === undefined) {
          setLoading(false);
          return;
        }
        const res = await axios.request<CoordinatesResponse>(
          new CoordinatesRequest(searchParams?.place)
        );

        if (res.data === undefined) {
          throw Error('Something went wrong');
        }
        if (res.data[0].length === 0) {
          throw Error('Could not find place');
        }

        onSubmit([Number(res.data[0].lat), Number(res.data[0].lon)]);
        setLoading(false);
        logger.info('map successfully fetched');
        return [res.data[0].lat, res.data[0].lon] as unknown as LatLngTuple;
      } catch (error) {
        logger.error(error);
        const message = (error as Error).message || 'Unknown Search error';
        setError(message);
        setLoading(false);
      }
    }, [searchParams, dispatch]);

  const handleSubmit = useCallback(async () => {
    if (searchValue === '') {
      throw Error('Place field should not be empty');
    }

    dispatch({
      type: 'SET_SEARCH_PARAMS',
      payload: {
        place: searchValue,
        arrival: checkInCheckOut[0],
        departure: checkInCheckOut[1],
        roomCount: numSpacesReq,
        children: numChildren,
        adults: numAdults
      }
    });
    navigate('/search');
  }, [
    dispatch,
    searchValue,
    checkInCheckOut,
    numSpacesReq,
    numAdults,
    numChildren,
    navigate
  ]);

  const handleDateChange = ({ value }: { value: string[] }) => {
    const checkInisInPast =
      DateTime.fromISO(today).toMillis() > DateTime.fromISO(value[0]).toMillis();
    const checkOutisInPast =
      DateTime.fromISO(tomorrow).toMillis() > DateTime.fromISO(value[1]).toMillis();
    setCheckInCheckOut([
      checkInisInPast ? today : value[0],
      checkOutisInPast ? tomorrow : value[1]
    ]);
  };

  useEffect(() => {
    setSearchValue(searchParams?.place ?? '');
    setCheckInCheckOut([
      searchParams?.arrival ?? today,
      searchParams?.departure ?? tomorrow
    ]);
    setNumSpacesReq(searchParams?.roomCount ?? 1);
    setNumAdults(searchParams?.adults ?? 1);
    setNumChildren(searchParams?.children ?? 0);
  }, [searchParams]);

  useEffect(() => {
    handleMapSearch();
  }, [searchParams, handleMapSearch]);

  return (
    <Box alignSelf="center">
      <Form onSubmit={() => handleSubmit()}>
        <Grid
          margin={{ horizontal: 'large' }}
          gap="small"
          align="center"
          columns={ResponsiveTopGrid(winWidth)}
          responsive={true}
        >
          <FormField margin="0">
            <TextInput
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Where are you going"
            />
          </FormField>
          <FormField margin="0">
            <DateInput
              buttonProps={{
                placeholder: 'check-in check-out',
                label: `${DateTime.fromISO(checkInCheckOut[0]).toFormat(
                  'dd.MM.yy'
                )}-${DateTime.fromISO(checkInCheckOut[1]).toFormat('dd.MM.yy')}`,
                icon: undefined,
                alignSelf: 'start',
                style: {
                  border: 'none',
                  padding: '0.51rem 0.75rem'
                }
              }}
              calendarProps={{
                // bounds: [defaultStartDay.toISO(), defaultEndDay.toISO()],
                fill: false,
                alignSelf: 'center',
                margin: 'small',
                size: 'medium'
              }}
              value={[
                DateTime.fromISO(checkInCheckOut[0]).toString(),
                DateTime.fromISO(checkInCheckOut[1]).toString()
              ]}
              onChange={({ value }) => handleDateChange({ value } as { value: string[] })}
            />
          </FormField>

          <DropButton
            label={`
              ${prarseAdults(numAdults)} 
              ${prarseChildren(numChildren)} 
              ${prarseRooms(numSpacesReq)}
            `}
            dropContent={
              <Box>
                <FormField label="Spaces">
                  <TextInput
                    value={numSpacesReq}
                    type="number"
                    min={1}
                    disabled
                    onChange={(e) => setNumSpacesReq(Number(e.target.value))}
                    placeholder="type here"
                  />
                </FormField>
                <FormField label="Adults">
                  <TextInput
                    min={1}
                    value={numAdults}
                    type="number"
                    onChange={(e) => setNumAdults(Number(e.target.value))}
                    placeholder="type here"
                  />
                </FormField>
                <FormField label="Children">
                  <TextInput
                    min={0}
                    value={numChildren}
                    type="number"
                    onChange={(e) => setNumChildren(Number(e.target.value))}
                    placeholder="type here"
                  />
                </FormField>
              </Box>
            }
          />
          <Box alignSelf="center">
            <Button type="submit" label="Search" />
          </Box>
        </Grid>
        <MessageBox loading type="info" show={loading}>
          loading...
        </MessageBox>
        <MessageBox type="error" show={!!error}>
          {error}
        </MessageBox>
      </Form>
    </Box>
  );
};
