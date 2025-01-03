export interface Station {
  id: string;
  text: string;
}

export interface StationMap {
  [station: string]: {
    id: string;
    destinations: Station[];
  };
}

export interface CrawlParams {
  fromStation: string;
  toStation: string;
  date?: Date;
  passengerCount?: number;
}

export const DEFAULT_PARAMS: CrawlParams = {
  fromStation: "ANKARA GAR , ANKARA",
  toStation: "İSTANBUL(PENDİK) , İSTANBUL",
  date: undefined, // Will use tomorrow by default in the code
  passengerCount: 1
};

export const SELECTORS = {
  // Station inputs
  FROM_STATION_INPUT: '#fromTrainInput',
  TO_STATION_INPUT: '#toTrainInput',
  STATION_BUTTONS: 'button.dropdown-item.station',
  STATION_TEXT: '.textLocation',

  // Date picker
  DATE_PICKER_INPUT: '.col-6.pr-0 .datePickerInput.departureDate input.form-control.calenderPurpleImg[type="text"][readonly]',
  CALENDAR_CONTAINER: '.calendars-container',
  DATE_CELL: 'td[data-date]',

  // Passenger selection
  PASSENGER_INPUT: 'input[selenium-test="passenger"]',
  PASSENGER_DROPDOWN: '.dropdown-menu.show',
  PASSENGER_COUNT_INPUT: '.number-input input[type="number"]',
  PASSENGER_ADD_BUTTON: 'button[aria-label="btnAdd"]',
  PASSENGER_REMOVE_BUTTON: 'button[aria-label="btnRemove"]',
  PASSENGER_APPLY_BUTTON: 'button[selenium-test="passenger-btn"]',

  // Search
  SEARCH_BUTTON: '#searchSeferButton',
  SEARCH_RESULTS: '.seferSonuc'
} as const; 