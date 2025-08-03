import React from "react";
import Modal from "./Modal";

const ListLike = ({ isModalOpenLike, closeModalLike }) => {
  return (
    <div>
      {/* Dùng Modal component */}
      <Modal isOpen={isModalOpenLike} onClose={closeModalLike}>
        <h3>Danh sách người thích </h3>
        <hr />
        <div>
            <div className='row d-flex justify-content-start '>
                <div className='col-1'>
                <img src="" alt="" className=''/>
                </div>
                <div className='col-11'>
                <h4>Ninh Van Nam</h4>
                </div>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default ListLike;
