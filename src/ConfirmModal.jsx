import React from 'react';
import Modal from 'react-responsive-modal';

const ConfirmModal = (props) => {

    /*
    ConfirmModal takes props:
    1.open
    2.onClose
    3.okText
    4.cancelText
    5.handleClickOK
    6.handleClickCancel
    7.prompt
    */

    const handleClickCancel = () => {
        props.onClickCancel();
    }

    const handleClickOK = () => {
        props.onClickCancel();
        props.onClickOK();
    }

    return (
        <Modal
            center
            open={props.open}
            onClose={props.onClose}>
            <div class='confirm-modal-design' >
                <h3>{props.header ? props.header:''}</h3>
                <p>{props.prompt}</p>
                <button class='btn btn-info btn-lg' onClick={handleClickOK}>{props.okText}</button>&nbsp;
            <button class='btn btn-secondary btn-lg' onClick={handleClickCancel}>{props.cancelText}</button>
            </div>

        </Modal>
    );
}

export default ConfirmModal;