import { InputAdornment, SxProps, useMediaQuery, useTheme } from '@mui/material';
import { forwardRef, MouseEventHandler } from 'react';
import { RHFAutocomplete } from '../../components/hook-form';
import Iconify from '../../components/Iconify';
import { emptyFunction } from '../../utils/common';
import { autocompleteData } from './helpers';

export interface SearchLocationInputProps {
  onClick?: MouseEventHandler;
  highlighted?: boolean;
  highlightedColor?: string;
  allowDropdownOpen?: boolean;
  OnEnterKey?: (...args: unknown[]) => void;
}

export const SearchLocationInput = forwardRef<HTMLInputElement, SearchLocationInputProps>(
  (
    {
      onClick,
      allowDropdownOpen = true,
      highlightedColor = 'primary.main',
      highlighted = true,
      OnEnterKey = emptyFunction
    }: SearchLocationInputProps,
    ref?
  ) => {
    const theme = useTheme();
    const isMobileView = useMediaQuery(theme.breakpoints.down('md'));
    const LocationIcon = () => (
      <Iconify icon={'eva:pin-outline'} width={18} height={18} marginLeft={0.5} />
    );

    const highlightedStyle: SxProps =
      isMobileView && highlighted
        ? {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: highlightedColor,
              borderWidth: '3px'
            }
          }
        : {};

    return (
      <RHFAutocomplete<string>
        variant={isMobileView ? 'outlined' : 'standard'}
        placeholder="Where are you going?"
        name="location"
        options={autocompleteData}
        width={isMobileView ? '320px' : '200px'}
        open={allowDropdownOpen ? undefined : false}
        inputProps={{
          style: {
            textAlign: 'start',
            paddingLeft: theme.spacing(0)
          },
          id: 'location-input',
          onClickCapture: onClick,
          onKeyDown: (e) => {
            e.code === 'Enter' && OnEnterKey();
          }
        }}
        InputProps={{
          ...(!isMobileView ? { disableUnderline: true } : {}),
          startAdornment: (
            <InputAdornment position="start">
              <LocationIcon />
            </InputAdornment>
          ),
          sx: highlightedStyle,
          inputRef: ref
        }}
      />
    );
  }
);
