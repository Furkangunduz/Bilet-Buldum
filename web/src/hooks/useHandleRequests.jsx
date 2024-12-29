import axios from "axios";
import { toast } from "react-toastify";

const apiUrl = import.meta.env.VITE_API_URL;

function useHandleRequests({
  notificationPreference,
  setSearchButtonDisabled,
  removeEmailFromPreviousSearchesAndLocalStorage,
  addMailToPreviousSearches,
  checkLocalStorageAndAddEmail,
}) {
  const submitData = (stationFromRef, stationToRef, amountRef, dateRef, timeRef, phoneRef, emailRef) => {
    const data = {
      station_from: stationFromRef?.current?.value ?? "",
      station_to: stationToRef?.current?.value ?? "",
      date: dateRef?.current?.value.replaceAll("/", ".") ?? "",
      time: timeRef?.current?.value ?? "",
      phone: phoneRef?.current?.value ?? "",
      email: emailRef?.current?.value ?? "",
      amount: amountRef?.current?.value ?? "",
      notification_preference: notificationPreference,
    };

    const validateEmail = (email) => {
      return String(email)
        .toLowerCase()
        .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    };
    const validatePhone = (phone) => {
      return String(phone).match(/^[0-9]{10}$/);
    };
    const checkIfDataHasEmptyFields = (data) => {
      return (
        data.station_from === "" ||
        data.station_to === "" ||
        data.date === "" ||
        data.time === "" ||
        data.notification_preference === "" ||
        data.amount === ""
      );
    };
    const checkStationFromAndStationTo = (data) => {
      return data.station_from === data.station_to;
    };
    const checkAmount = (data) => {
      return data.amount <= 0 || data.amount > 3;
    };

    if (checkIfDataHasEmptyFields(data)) {
      toast.error("Lütfen tüm alanları doldurunuz.", { toastId: "errorToast" });
      return;
    } else if (checkStationFromAndStationTo(data)) {
      toast.error("Biniş ve İniş alanları farklı olmalı.", { toastId: "errorToast" });
      return;
    } else if (checkAmount(data)) {
      toast.error("Lütfen bilet adedi giriniz.", { toastId: "errorToast" });
      return;
    } else if (data.notification_preference === "sms") {
      // if (data.phone === null || !validatePhone(data.phone)) {
      //   toast.error("Lütfen geçerli bir telefon numarası giriniz.", { toastId: "errorToast" });
      // }
      toast.error("Şu an sms bildirimleri aktif değil. Lütfen e-posta bildirimini seçiniz.", { toastId: "errorToast" });
      return;
    } else if (data.notification_preference === "email") {
      if (data.email === null || !validateEmail(data.email)) {
        toast.error("Lütfen geçerli bir e-posta adresi giriniz.", { toastId: "errorToast" });
        return;
      }
    }

    setSearchButtonDisabled(true);
    addMailToPreviousSearches(data.email);

    axios
      .post(apiUrl, data)
      .then(() => {
        toast.success("Bilet aradığınız için teşekkür ederim.", { toastId: "successToast" });
        checkLocalStorageAndAddEmail(data.email);
      })
      .catch((error) => {
        const errorInfo = error.response.data;
        toast.error(errorInfo.text ? errorInfo.text : "Bir hata oluştu. Lütfen tekrar deneyiniz.", { toastId: "errorToast" });
      })
      .finally(() => {
        setSearchButtonDisabled(false);
      });
  };

  const cancelSearch = (email) => {
    axios
      .delete(`${apiUrl}cancel-search/${email}`)
      .then((response) => {
        toast.success("Bilet aramanız iptal edildi.", { toastId: "successToast" });
        removeEmailFromPreviousSearchesAndLocalStorage(email);
      })
      .catch((error) => {
        const errorInfo = error.response.data;
        if (errorInfo?.remove === true) {
          removeEmailFromPreviousSearchesAndLocalStorage(email);
        }
        toast.error(errorInfo.text ? errorInfo.text : "Bir hata oluştu. Lütfen tekrar deneyiniz.", { toastId: "errorToast" });
      });
  };

  return [submitData, cancelSearch];
}

export default useHandleRequests;
