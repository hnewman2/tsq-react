import React from 'react';
import { Component, Fragment } from 'react';
import { Link, Redirect } from 'react-router-dom';
import Modal from 'react-responsive-modal';
import './AdminHomeStyles.css';
import Cookies from 'js-cookie';
import DataListInput from 'react-datalist-input';

export default class AdminHome extends Component {

    constructor(props) {
        super(props);

        window.AdminHomeComponent = this;
        this.state = {
            userID: '',
            statusMsg: '',
            loggedIn: true,
            unread: null,
            showMemoModal: false,
            memos: [],
            selectedText: '',
            currentMemos: [],
            memosToRemove: [],
            currEmailAdd: '',
            currEmailFrom: '',
            currEmailPass: ''
        }
        this.getPhone = this.getPhone.bind(this);
        this.getCurrEmailConfig = this.getCurrEmailConfig.bind(this);

    }

    componentDidMount() {

        document.onclick = () => {
            this.setState({
                statusMsg: ''
            });
        }


        fetch("/authorizeAdmin", {
            method: "POST",
        }).then(response => {
            if (response.status === 200) {
                this.setState({ loggedIn: true });
                Cookies.set('headerTitle', 'Admin Homepage');
                this.props.setHeaderTitle('Admin Homepage');

            }
            else {
                this.setState({ loggedIn: false });
            }
        });

        this.getVolunteers();
        this.getAllMemos();
        this.getCurrentMemos();
        this.getCurrEmailConfig();

    }

    getCurrEmailConfig() {
        fetch('/getCurrEmailConfig', {
            method: 'POST'
        }).then(response => {
            response.json().then(data => {
                this.setState({
                    currEmailAdd: data[0].user,
                    currEmailFrom: data[0].fromName,
                    currEmailPass: data[0].pswd
                });
            });

        });
    }

    onClickUpdateEmailConfig() {
        this.setState({ showEmailConfigModal: false });

        fetch('/updateEmailConfig', {
            method: 'POST',
            body: JSON.stringify({ user: this.state.currEmailAdd, from: this.state.currEmailFrom, pswd: this.state.currEmailPass }),
            headers: { "Content-Type": "application/json" }
        }).then(response => {
            if (response.status === 200) {
                this.setState({ statusMsg: <div class="alert alert-success" role="alert">Email Config Updated Successfully</div> });
            } else {
                this.setState({ statusMsg: <div class="alert alert-danger" role="alert">Error... Unable to Update Email Config</div> });
            }
        });

    }

    onChangeEmailAddress(e) {
        this.setState({ currEmailAdd: e.target.value });
    }

    onChangeFrom(e) {
        this.setState({ currEmailFrom: e.target.value });
    }
    onChangepass(e) {
        this.setState({ currEmailPass: e.target.value });
    }



    getPhone(phone) {
        var areaCode = phone.substring(0, 3);
        var three = phone.substring(3, 6);
        var four = phone.substring(6, 11);

        var newPhone = '(' + areaCode + ') ' + three + '-' + four;

        return newPhone;
    }
    getCurrentMemos() {

        fetch('/getTodaysMemos', {
            method: 'POST'
        }).then(response => {
            response.json().then(data => {
                if (data.length > 0) {
                    let list = data.map(m => <p><input type='checkbox' id={m.id} onChange={(e) => this.onChangeCheckbox(e)} /><lable>{m.body}</lable></p>);
                    this.setState({ currentMemos: list });
                } else {
                    this.setState({ currentMemos: 'No memos selected.' });
                }
            })
        });
    }

    getAllMemos() {
        fetch('/getMemos', {
            method: 'POST'
        }).then(response => {
            response.json().then(data => {
                let list = data.map(m => <option id={m.id}>{m.body}</option>);
                this.setState({ memos: list });
            })
        });
    }

    onChangeUserID(selectedVal) {
        window.AdminHomeComponent.setState({ userID: selectedVal.key });
    }
    onChangeCheckbox(e) {
        let checked = e.target.checked;
        let temp = this.state.memosToRemove;
        if (checked) {
            temp.push(e.target.id);
            this.setState({ memosToRemove: temp });
        } else {
            let index = this.state.memosToRemove.indexOf(e.target.id);
            temp.splice(index, 1);
            this.setState({ memosToRemove: temp });
        }
    }

    removeMemos() {

        fetch('/removeMemo', {
            method: 'POST',
            body: JSON.stringify({ memos: this.state.memosToRemove }),
            headers: { "Content-Type": "application/json" }
        }).then(response => {
            if (response.status == 200) {
               
                this.getCurrentMemos();
            }
          

        });
    }
    getVolunteers() {
        fetch("/VolNameSearch", {
            method: "POST",
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {

                    const items = data.map((item, i) => {
                        return {
                            // what to show to the user
                            label: item.volunteer + ' ' + this.getPhone(item.phone),
                            // key to identify the item within the array
                            key: item.phone,
                        }
                    });
                    this.setState({ volNames: items });
                });
            }
        });
    }

    onClickUpdate() {

        if (this.state.userID.length <= 0) {
            return;
        }
        this.setState({ showUpdateModal: false });
        fetch("/updateVolStatusInactive", {
            method: "POST",
            body: this.state.userID,
            headers: { "Content-Type": "text/plain" }
        }).then(response => {
            //check if response is valid
            if (response.status === 200) {
                this.setState({ statusMsg: <div class="alert alert-success" role="alert">Volunteer status updated to Inactive successfully</div> });
            }
            else if (response.status === 204) {
                //display error message
                this.setState({ statusMsg: <div class="alert alert-danger" role="alert">An Error occurred... Unable to change status of volunteer. Please check that the phone/email entered is correct.</div> });
            }
            else {
                this.setState({ statusMsg: <div class="alert alert-danger" role="alert">An Error occurred... Unable to change status of volunteer.</div> });
            }
        });
    }
    onChangeMemo(e) {

        let selected = document.getElementById("select");
        selected = selected[selected.selectedIndex].id;


        this.setState({ selectedText: selected });
    }
    onClickSelect() {

        if (this.state.selectedText === 'placeholder' || this.state.selectedText === '') {
            return;
        }

        console.log(this.state.selectedText);
        fetch('/updateMemo', {
            method: 'POST',
            body: this.state.selectedText,
            headers: { "Content-Type": "text/plain" }
        }).then(response => {
            if (response.status == 200) {
                
                this.getCurrentMemos();
            }
           

        });
    }

    onClickAdd(e) {
        e.preventDefault();

        let bodyText = document.getElementById('new-message').value;
        console.log(bodyText);
        if (bodyText.length > 0) {

            fetch('/addMemo', {
                method: 'POST',
                body: bodyText,
                headers: { "Content-Type": "text/plain" }
            }).then(response => {
                if (response.status == 200) {
                    
                    document.getElementById('new-message').value = '';
                    this.getCurrentMemos();
                    this.getAllMemos();
                }
                

            });
        }
    }

    
    render() {

        if (!this.state.loggedIn) {
            this.props.setAdmin();
            return <Redirect to="/signIn" />;
        }

        return (
            <Fragment>
                {this.state.statusMsg}
                <table class='admin-home-table'>
                    <tr> <td>
                        <Link class='admin-home-link' to='/viewStatus'>Route Status</Link><br />
                    </td>
                        <td>
                            <Link class='admin-home-link' to='/messages'>Send Messages</Link><br />
                        </td>
                        <td>
                            <Link class='admin-home-link' to='/editAllVolInfo'>All Volunteer Information</Link><br />
                        </td>

                    </tr>

                    <tr>
                        <td>
                            <Link class='admin-home-link' to='/viewLogs'>View Route History</Link><br />
                        </td>
                        <td>
                            <Link class='admin-home-link' to='/smsInbox'>SMS Inbox </Link><br />
                        </td>
                        <td>
                            <Link class='admin-home-link' to='/searchRecipients'>Search Recipients</Link><br />
                        </td>
                    </tr>

                    <tr>
                        <td>
                            <Link class='admin-home-link' to='/RoutesPrintout'>View or Print routes</Link><br />
                        </td>
                        <td>
                            <button class='admin-home-button' onClick={() => this.setState({ showMemoModal: true })}>Set Memo to Print</button><br />
                        </td>
                        <td>
                            <button class='admin-home-button' onClick={() => this.setState({ showUpdateModal: true })}>Mark Volunteer as Inactive</button><br />
                        </td>
                    </tr>

                    <tr>
                        <td>
                            <Link class='admin-home-link' to='/routesImport'>Import routes</Link>
                        </td>
                        <td>
                            <button class='admin-home-button' onClick={() => this.setState({ showEmailConfigModal: true })}>Email Config</button><br />
                        </td>
                    </tr>

                </table>



                <Modal center
                    open={this.state.showUpdateModal}
                    onClose={() => this.setState({ showUpdateModal: false })}>
                    <div class='update-vol-status-modal'>
                        <h4>Mark Volunteer as Inactive</h4>
                        <DataListInput inputClassName={'volunteer-input'} itemClassName={'volunteer-input'}
                            dropDownLength={'6'} placeholder={'Search Volunteers...'} items={this.state.volNames} onSelect={this.onChangeUserID} />
                        <br />

                        <button class='btn btn-info' onClick={(event) => this.onClickUpdate(event)}>Update</button>&nbsp;
                        <button class='btn btn-secondary' onClick={() => this.setState({ showUpdateModal: false })}>Cancel</button>
                    </div>
                </Modal>


                <Modal center
                    open={this.state.showMemoModal}
                    onClose={() => this.setState({ showMemoModal: false })}>
                    <div class='memo-modal'>
                        <h4>Route Sheet Memos</h4><br />
                        <select id="select" onChange={event => this.onChangeMemo(event)}>
                            <option id='placeholder'>Choose a previously used memo</option>
                            {this.state.memos}
                        </select> <button class='btn btn-info btn-sm btn-select-memo' onClick={(event) => this.onClickSelect(event)}>Select</button>
                        <br />
                        <div class='add-new-memo-div'>
                        <textarea id='new-message' placeholder='Type a new memo...' /><br />

                        <button class='btn btn-info btn-sm add-new-memo-btn' onClick={(event) => this.onClickAdd(event)}>Add</button>&nbsp;</div>

                        <br /><br />
                        <div class='remove-memos'>
                            <h5>Select Memos to Remove</h5>
                            {this.state.currentMemos}
                            <br /><button class='btn btn-secondary btn-sm' onClick={() => this.removeMemos()}>Remove</button>
                        </div>
                    </div>
                </Modal>

                <Modal center
                    open={this.state.showEmailConfigModal}
                    onClose={() => this.setState({ showEmailConfigModal: false })}>
                    <div class='email-config-modal'>
                        <h4>Email Config</h4>
                        <form onSubmit={(event) => this.onClickUpdateEmailConfig(event)}>
                            <table>
                                <tr>
                                    <td class='column1'>Email Address: </td>
                                    <td class='column2'><input type="email" required
                                        id="emailAddress"
                                        onChange={(event) => this.onChangeEmailAddress(event)}
                                        defaultValue={this.state.currEmailAdd}
                                    /></td>
                                </tr>
                                <tr>
                                    <td class='column1'>'From' Name: </td>
                                    <td class='column2'><input type="text"
                                        id="fromName"
                                        required
                                        onChange={(event) => this.onChangeFrom(event)}
                                        defaultValue={this.state.currEmailFrom}
                                    /></td>
                                </tr>
                                <tr>
                                    <td class='column1'>Password: </td>
                                    <td class='column2'><input type="password"
                                        id="pass"
                                        required
                                        onChange={(event) => this.onChangepass(event)}
                                        defaultValue={this.state.currEmailPass}
                                    /></td>
                                </tr>
                                <tr>
                                    <td colspan='2' class='security-notice'>*Please note that settings may need to be changed to allow less secure apps on your gmail account</td>
                                </tr>
                            </table>
                            <button class='btn btn-info btn-sm' type='submit'>Update</button>&nbsp;
                    <button class='btn btn-secondary btn-sm' onClick={(e) => { e.preventDefault(); this.setState({ showEmailConfigModal: false }); this.getCurrEmailConfig() }}>Cancel</button>
                            {/*calls getCurrEmailConfig which resets the state to the original ones in case the user changed it and then pressed cancel, so it will still appear with the old ones when the modal opens again*/}
                        </form>
                    </div>
                </Modal>
                {/*this.emailConfigModal()*/}
            </Fragment>
        );
    }
}