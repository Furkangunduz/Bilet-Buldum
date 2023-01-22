import Datepicker from "flowbite-datepicker/Datepicker";
import { useEffect, forwardRef } from "react";

const DatePicker = forwardRef(function (props, ref) {
  useEffect(() => {
    const dateRangePickerEl = document.getElementById("datepicker");
    new Datepicker(dateRangePickerEl, {
      format: "dd/mm/yyyy",
      minDate: new Date(),
      maxDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 15),
    });
  }, []);

  return (
    <div className='relative'>
      <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
        <svg
          aria-hidden='true'
          className='w-5 h-5 text-gray-500 dark:text-gray-400'
          fill='currentColor'
          viewBox='0 0 20 20'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            fillRule='evenodd'
            d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
            clipRule='evenodd'
          ></path>
        </svg>
      </div>
      <input
        ref={ref}
        id='datepicker'
        type='text'
        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
        placeholder='Select date'
      />
    </div>
  );
});

export default DatePicker;