import { useState, useEffect } from "react";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

function useCheckLocalstorageEmails(setShowModal) {
  const [previousSearches, setPreviousSearches] = useState([]);

  const removeEmailFromPreviousSearchesAndLocalStorage = (email) => {
    setPreviousSearches((prev) => prev.filter((item) => item !== email));
    localStorage.setItem("activeEmails", JSON.stringify(previousSearches.filter((item) => item !== email)));
    if (previousSearches.length === 0) {
      setShowModal(false);
    }
  };

  const addMailToPreviousSearches = (email) => {
    const activeEmails = JSON.parse(localStorage.getItem("activeEmails")) ?? [];
    if (activeEmails.includes(email)) return;

    setPreviousSearches((prev) => [...prev, email]);
    localStorage.setItem("activeEmails", JSON.stringify(activeEmails));
  };

  const checkLocalStorageAndAddEmail = (email) => {
    const activeEmails = JSON.parse(localStorage.getItem("activeEmails"));
    if (activeEmails?.length > 0) {
      if (!activeEmails.includes(email)) {
        activeEmails.push(email);
        localStorage.setItem("activeEmails", JSON.stringify(activeEmails));
      }
    } else {
      localStorage.setItem("activeEmails", JSON.stringify([email]));
    }
  };

  useEffect(() => {
    const activeEmails = JSON.parse(localStorage.getItem("activeEmails")) ?? [];
    setPreviousSearches(activeEmails);
    if (activeEmails?.length > 0) {
      for (let i = 0; i < activeEmails.length; i++) {
        let email = activeEmails[i];
        axios.post(`${apiUrl}is-active-search`, { email }).then((response) => {
          if (response.data?.isActive === false) {
            console.log(`${email} is not active`);
            removeEmailFromPreviousSearchesAndLocalStorage(email);
          }
        });
      }
      setShowModal(true);
    }
  }, []);

  return [previousSearches, removeEmailFromPreviousSearchesAndLocalStorage, addMailToPreviousSearches, checkLocalStorageAndAddEmail];
}

export default useCheckLocalstorageEmails;
