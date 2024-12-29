import React from "react";
import { Modal, Button } from "flowbite-react";

function PreviousMailModal({ showModal, setShowModal, previousSearches, cancelSearch }) {
  return (
    <Modal show={showModal} onClose={() => setShowModal(false)}>
      <Modal.Header>Geçmiş Aramalarım</Modal.Header>
      <Modal.Body className='max-h-[25rem] overflow-y-auto'>
        {previousSearches.length === 0 ? (
          <div className='text-white text-center'>Geçmiş aramalarınız bulunmamaktadır.</div>
        ) : (
          previousSearches.length > 0 &&
          previousSearches.map((email) => (
            <div
              key={email}
              className=' flex items-center justify-between border-[0.01rem] border-white/20 rounded-lg px-8 py-2 mb-2 hover:bg-white/10 '
            >
              <span className='text-white '>{email}</span>
              <Button color={"failure"} size={"xs"} onClick={() => cancelSearch(email)}>
                İptal Et
              </Button>
            </div>
          ))
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button color='gray' onClick={() => setShowModal(false)}>
          Geri Dön
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PreviousMailModal;
