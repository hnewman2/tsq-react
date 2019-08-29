import React from 'react';
import { Component, Fragment } from 'react';
import Modal from 'react-responsive-modal';

export default class MessageModal extends Component {

    /*
    MessageModal takes props:
    1.open
    2.onClose
    3.recipients
    4.subject
    5.body
    6.onClickCancel
    7.onClickSendText
    8.onClickSendEmail
    9.isText
    */

    constructor(props) {
        super(props);
        this.state = {
            isText: this.props.isText,
            recipients: this.props.recipients,
            subject: this.props.subject,
            body: this.props.body,
            showMessageModal: this.props.showMessageModal,
            showConfirmModal: false,
            password: '',
            errorMsg: '',
        }

        this.SendEmail = this.SendEmail.bind(this);
        this.SendText = this.SendText.bind(this);
        this.subject = this.subject.bind(this);
    }

    componentDidMount() {
        document.onclick = () => {
            this.setState({
                errorMsg: ''
            });
        }
    }

    SendEmail() {

        this.props.onClickCancel();
        this.setState({ errorMsg: <div class="alert alert-secondary" role="alert">Sending email...</div> });
        fetch('/sendEmail', {
            method: 'POST',
            body: JSON.stringify(this.state),
            headers: { "Content-Type": "application/json" }
        }).then(response => {
            if (response.status === 200) {
                this.closeConfirmModal();
                window.alert('Email sent successfully!');
                this.resetState();
            }
            else if (response.status === 401) {
                this.setState({ errorMsg: <div class="alert alert-danger" role="alert">Login unauthorized. Please try again.</div> });
            }
            else {
                this.closeConfirmModal();
                window.alert('Error...email could not be sent');
                this.resetState();
            }
        });
    }

    SendText() {
        this.props.onClickCancel();
        this.setState({ errorMsg: <div class="alert alert-secondary" role="alert">Sending text...</div> });
        fetch('/sendText', {
            method: 'POST',
            body: JSON.stringify(this.state),
            headers: { "Content-Type": "application/json" }
        }).then(response => {

            if (response.status === 200) {
                this.closeConfirmModal();
                window.alert('Text sent successfully!');
                this.resetState();
            }
            else {
                this.closeConfirmModal();
                window.alert('Error...text could not be sent');
                this.resetState();
            }
        });
    }

    resetState() {
        this.setState({
            recipients: this.props.recipients,
            subject: this.props.subject,
            body: this.props.body,
        });
    }

    handleClickCancel() {
        this.props.onClickCancel();
    }

    handleClickSend() {
        if (this.state.isText) {

            this.setState({ showConfirmModal: true });
        }
        else {

            this.setState({ showConfirmModal: true });
        }
    }

    onChangeBody(event) {
        this.setState({ body: event.target.value });
    }
    onChangeTo(event) {
        this.setState({ recipients: event.target.value });
    }
    onChangeSubject(event) {
        this.setState({ subject: event.target.value });
    }
    onChangePassword(event) {
        this.setState({ password: event.target.value });
    }

    closeConfirmModal() {
        this.setState({ showConfirmModal: false });
    }

    subject() {
        if (!this.state.isText) {
            return (
                <tr>
                    <td><p>Subject:</p></td>
                    <td><textarea rows="1" cols="75" defaultValue={this.state.subject} onChange={event => this.onChangeSubject(event)} /></td>
                </tr>
            );
        }
    }


    passwordControl() {
        if (!this.state.isText) {
            return (
                <Fragment>
                    <label>Please enter password to continue:</label> <br />
                    <input type='password' onChange={event => this.onChangePassword(event)} />
                    <br /><br />
                </Fragment>
            );
        }
    }

    render() {
        return (
            <Fragment>
                <Modal center
                    open={this.props.open}
                    onClose={this.props.onClose}>
                    <h3>Send {this.state.isText ? 'A Text' : 'An Email'}</h3>
                    <table>
                        <tr>
                            <td><p>To:</p></td>
                            <td><textarea rows="2" cols="75" defaultValue={this.state.recipients} onChange={event => this.onChangeTo(event)} /></td>
                        </tr>
                        {this.subject()}
                        <tr>
                            <td><p>Body:</p></td>
                            <td><textarea rows="10" cols="75" defaultValue={this.state.body} onChange={event => this.onChangeBody(event)} /></td>
                        </tr>
                    </table>
                    <button onClick={this.handleClickCancel.bind(this)}>
                        Cancel
                </button>
                    <button onClick={this.handleClickSend.bind(this)}>
                        Send
                </button>
                </Modal>

                <Modal center
                    open={this.state.showConfirmModal}
                    onClose={this.closeConfirmModal.bind(this)}>
                    {this.state.errorMsg}
                    <h2>Are you sure you want to send this message?</h2><br />
                    {this.passwordControl()}
                    <button onClick={this.closeConfirmModal.bind(this)}>Cancel</button>
                    <button onClick={this.state.isText ? this.SendText.bind(this) : this.SendEmail.bind(this)}>Send</button>
                </Modal>
            </Fragment>
        );
    }
}                
