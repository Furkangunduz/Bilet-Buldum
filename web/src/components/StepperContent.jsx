import { Tooltip, Label, Select, Radio, TextInput, Button } from "flowbite-react";

import DatePicker from "./DatePicker";
import { ArrowRight } from "react-feather";
import { useRef } from "react";

function StepperContent({
  stepperRef,
  stepperContentRef,
  stepCount,
  goNextStepperContent,
  notificationPreference,
  setNotificationPreference,
  submitData,
  searchButtonDisabled,
}) {
  const stations = ["İzmit YHT", "Ankara Gar", "Eskişehir", "İstanbul(Halkalı)", "İstanbul(Söğütlüçeşme)"];
  const amount = ["1", "2", "3"];
  const hours = ["00:00 - 02:00", "06:00 - 12:00", "12:00 - 18:00", "18:00 - 24:00"];
  const stationFromRef = useRef();
  const stationToRef = useRef();
  const dateRef = useRef();
  const timeRef = useRef();
  const phoneRef = useRef();
  const emailRef = useRef();
  const amountRef = useRef();

  return (
    <>
      <div ref={stepperRef} className='flex items-center justify-start bg-gray-800 '>
        {/* Step 1 */}
        <div ref={stepperContentRef} className='xs:flex items-center justify-center gap-2 md:gap-12 pt-6 w-full shrink-0 bg-gray-800'>
          <div className='flex gap-2 justify-between px-2'>
            <div>
              <Tooltip placement='bottom' content='Biniş yapmak istediğiniz YHT istasyonunu seçiniz.'>
                <Label
                  htmlFor='from'
                  className='mb-2 pl-1 block hover:underline hover:decoration-wavy hover:underline-offset-4 cursor-pointer'
                >
                  Nereden
                </Label>
              </Tooltip>

              <Select ref={stationFromRef} id='from' required={true}>
                {stations.map((station) => (
                  <option value={station} key={station + `-from`}>
                    {station}
                  </option>
                ))}
              </Select>
            </div>
            <div className='mt-6 hidden md:flex'>
              <ArrowRight color='white' size={28} />
            </div>
            <div>
              <div className='mb-2 pl-1 block underline-offset-1'>
                <Tooltip content='İniş yapmak istediğiniz YHT istasyonunu seçiniz.'>
                  <Label
                    htmlFor='to'
                    className='mb-2 pl-1 block hover:underline hover:decoration-wavy hover:underline-offset-4 cursor-pointer'
                  >
                    Nereye
                  </Label>
                </Tooltip>
              </div>
              <Select ref={stationToRef} id='to' required={true}>
                {stations.reverse().map((station) => (
                  <option value={station} key={station + `-from`}>
                    {station}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className='px-2'>
            <div className='mt-5 xs:mt-0 mb-2 pl-1 block underline-offset-1'>
              <Tooltip placement='bottom' content='Almak istediğiniz bilet adetini seçiniz'>
                <Label
                  htmlFor='to'
                  className='mb-2 pl-1 block hover:underline hover:decoration-wavy hover:underline-offset-4 cursor-pointer'
                >
                  Adet
                </Label>
              </Tooltip>
            </div>
            <Select ref={amountRef} id='to' required={true}>
              {amount.map((amount) => (
                <option value={amount} key={amount + `-amount`}>
                  {amount}
                </option>
              ))}
            </Select>
          </div>
        </div>
        {/* Step 2 */}
        <div className='flex items-center justify-between gap-2 sm:gap-28 pt-6 px-2 sm:px-[2rem] w-full shrink-0 bg-gray-800 '>
          <div>
            <Tooltip placement='bottom' content='Biniş yapmak istediğiniz tarihi seçiniz.'>
              <Label
                htmlFor='from'
                className='mb-2 pl-1 block hover:underline hover:decoration-wavy hover:underline-offset-4 cursor-pointer'
              >
                Tarih
              </Label>
            </Tooltip>
            <DatePicker ref={dateRef} />
          </div>
          <div>
            <div className='mb-2 pl-1 block underline-offset-1'>
              <Tooltip
                placement='bottom'
                content='Biniş yapmak istediğiniz Saati Seçiniz. Belirttiğiniz saate en yakın bileti aramaya başlayacağız.'
              >
                <Label
                  htmlFor='to'
                  className='mb-2 pl-1 block hover:underline hover:decoration-wavy hover:underline-offset-4 cursor-pointer'
                >
                  Saat
                </Label>
              </Tooltip>
            </div>
            <Select ref={timeRef} id='Hour' required={true}>
              {hours.map((hour) => (
                <option value={hour} key={hour}>
                  {hour}
                </option>
              ))}
            </Select>
          </div>
        </div>
        {/* Step 3 */}
        <div className='flex items-center justify-between gap-2 sm:gap-28 pt-6 px-2 sm:px-[2rem] w-full shrink-0 bg-gray-800 '>
          <div className=' flex flex-col gap-2'>
            <Tooltip placement='bottom' content='Bildirim tercihinizi seçiniz.'>
              <Label
                htmlFor='mailOrSms'
                className='mb-2 block hover:underline hover:decoration-wavy hover:underline-offset-4 cursor-pointer'
              >
                Bildirim Tercihi
              </Label>
            </Tooltip>
            <div className='flex items-center gap-2'>
              <Radio
                onChange={(e) => {
                  e.target.checked && setNotificationPreference(e.target.value);
                }}
                id='email'
                name='NotificationPreference'
                value='email'
                defaultChecked={true}
              />
              <Label htmlFor='email'>E-mail</Label>
              <Radio
                onChange={(e) => {
                  e.target.checked && setNotificationPreference(e.target.value);
                }}
                id='sms'
                name='NotificationPreference'
                value='sms'
              />
              <Label htmlFor='sms'>sms</Label>
            </div>
          </div>

          {notificationPreference == "email" ? (
            <div>
              <Tooltip placement='bottom' content='Bildirim almak istediğiniz e-mail adresinizi giriniz.'>
                <Label htmlFor='email' className='mb-2 block hover:underline hover:decoration-wavy hover:underline-offset-4 cursor-pointer'>
                  E-mail Adresi
                </Label>
              </Tooltip>
              <TextInput ref={emailRef} type=' mail' id='email' placeholder='E-mail adresinizi giriniz.' />
            </div>
          ) : (
            <div>
              <Tooltip placement='bottom' content='Bildirim almak istediğiniz telefon numarasını giriniz.'>
                <Label
                  htmlFor='phoneNumber'
                  className='mb-2 block hover:underline hover:decoration-wavy hover:underline-offset-4 cursor-pointer'
                >
                  Telefon Numaranız
                </Label>
              </Tooltip>
              <TextInput ref={phoneRef} type='text' id='phoneNumber' placeholder='532 123 4567' />
            </div>
          )}
        </div>
      </div>
      <div className='flex w-full justify-end pr-2 sm:pr-[2rem] bg-gray-800 border-b pt-4 sm:pt-16 pb-6 border-gray-700 '>
        <Button
          onClick={() => {
            stepCount !== 3
              ? goNextStepperContent()
              : submitData(stationFromRef, stationToRef, amountRef, dateRef, timeRef, phoneRef, emailRef);
          }}
          disabled={searchButtonDisabled}
          size={"sm"}
        >
          {stepCount === 3 ? "Bilet Bul" : "Devam Et"}
        </Button>
      </div>
    </>
  );
}

export default StepperContent;
