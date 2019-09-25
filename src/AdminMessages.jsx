import React from 'react';
import { Component, Fragment } from 'react';
import MessageModal from './MessageModal';
import RoutesDropdown from './RoutesDropdown';
import { Redirect } from 'react-router-dom';
import Cookies from 'js-cookie';
import './AdminMessagesStyles.css';
import Modal from 'react-responsive-modal';
import DataListInput from 'react-datalist-input';


export default class AdminMessages extends Component {

    constructor(props) {
        super(props);
        window.AdminMessagesComponent = this;

        this.state = {
            loggedIn: true,
            allVolunteersAndRecipients: null,
            noDataFound: false,
            volunteers: [],
            volunteerTypes: [],
            recipients: [],
            subject: '',
            body: '',
            isText: false, //if false, send email
            showMessageModal: false,
            showConfirmModal: false,
            recipientsFilled: false,
            statusMsg: '',
            password: '',
            volNames: []
        };

        this.getVolunteers = this.getVolunteers.bind(this);
        this.getVolunteerTypes = this.getVolunteerTypes.bind(this);
        this.getDate = this.getDate.bind(this);
        this.setRecipients = this.setRecipients.bind(this);
        this.messageModal = this.messageModal.bind(this);
        this.eventSource2 = new EventSource('/messageStatus');
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
                Cookies.set('headerTitle', 'Messages');
                this.props.setHeaderTitle('Messages');
            }
            else {
                this.setState({ loggedIn: false });
            }
        });
        this.getVolunteers('AndRecipients', '');
        //for dev purposes only: (in production comment out below line and uncomment above line)
        //this.getVolunteers('DEV', '');
        this.getVolunteerTypes();
        this.getVolunteerNames();

        this.eventSource2.addEventListener('status', () => {
            this.addSent();
        });
    }


    getVolunteerNames() {
        fetch("/VolNameSearch", {
            method: "POST",
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {

                    const items = data.map((item, i) => {
                        return {
                            // what to show to the user
                            label: item.volunteer,
                            // key to identify the item within the array
                            key: item.phone,
                        }
                    });
                    this.setState({ volNames: items });
                });
            }
        });
    }

    addSent() {


        fetch("/addSent", {
            method: "POST",
            headers: { "Content-Type": "text/plain" }
        })

    }
    getVolunteerTypes() {
        fetch('/getVolunteerTypes', {
            method: 'POST'
        })
            .then(response => {
                response.json().then(data => {
                    this.setState({
                        volunteerTypes: data
                    });
                })
            });
    }

    getVolunteers(path, body) {
        fetch('/getVolunteers' + path, {
            method: 'POST',
            body: body,
            headers: { "Content-Type": "text/plain" }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    this.setState({
                        volunteers: data,
                        noDataFound: false
                    });

                    if (!this.state.allVolunteersAndRecipients) {
                        this.setState({ allVolunteersAndRecipients: data });
                    }
                })
            } else if (response.status === 204) {
                this.setState({ noDataFound: true });
            } else {
                this.setState({ statusMsg: <div class="alert alert-danger" role="alert">Server error occurred....unable to retrieve volunteers</div> });
            }
        });
    }

    onFilterByRoute(currentRoute) {
        //toggle the other filter to display 'all'
        let volTypes = document.getElementById('volTypes');
        volTypes.options[0].selected = true;

        if (currentRoute === 'allRoutes') {
            this.getVolunteers('', '');
        }
        else {
            this.getVolunteers('FilterByRoute', currentRoute);
        }
    }

    onFilterByVolunteerType(event) {
        //toggle the other filter to display 'all'
        let routeNums = document.getElementById('routeNums');
        routeNums.options[0].selected = true;

        var volType = event.target.value;
        if (volType === 'allVolsAndRec') {
            this.getVolunteers('AndRecipients', '');
        }
        else if (volType === 'allVols') {
            this.getVolunteers('', '');
        }
        else if (volType === 'developers') {
            this.getVolunteers('DEV', '');
        }
        else {
            this.getVolunteers('FilterByVolType', volType);
        }
    }

    onClickFilterByVol(selected){
        //toggle the other filter to display 'all'
        let routeNums = document.getElementById('routeNums');
        routeNums.options[0].selected = true;

        let volTypes = document.getElementById('volTypes');
        volTypes.options[0].selected = true;

        var volPhone = selected.key;
        
        window.AdminMessagesComponent.getVolunteers('FilterByVolName', volPhone);
    }

    //getDate and setRecipients//
    getDate(today) {
        var d = new Date();
        if (!today) {
            d.setDate(d.getDate() + 1);
        }
        var weekday = new Array(7);
        weekday[0] = "Sunday";
        weekday[1] = "Monday";
        weekday[2] = "Tuesday";
        weekday[3] = "Wednesday";
        weekday[4] = "tdursday";
        weekday[5] = "Friday";
        weekday[6] = "Saturday";
        return weekday[d.getDay()] + ', '
            + (d.getMonth() + 1) + '/'
            + d.getDate();
    }
    setRecipients(text, volunteers) {
        var recipientsFiltered = [];
        volunteers.forEach(function (vol) {
            if (text) {
                if (vol.sendSMS) {
                    recipientsFiltered.push(vol);
                }
            }
            else {
                if (vol.sendEmail && vol.email && vol.email.length > 0) {
                    recipientsFiltered.push(vol);

                }
            }
        });
        let recipientContacts = '';
        recipientsFiltered.forEach(v => {
            if (text) {
                recipientContacts = recipientContacts.concat(v.phone + ', ');
            } else {
                recipientContacts = recipientContacts.concat(v.email + ', ');
            }
        });
        this.setState({
            isText: text,
            recipients: recipientContacts,
            recipientsFilled: true
        });
    }

    /////////////// onClicks for messageButtons ////////////////
    //getDate(true) = today, pass in false for tomorrow
    //setRecipients(true) = isText, pass in false for email
    ////////////////////////////////////////////////////////////


    onClickSendIndividualText(event) {
        let volunteerID = event.target.id;
        let theVolunteer = this.state.volunteers.find(e => e.vol_ID == volunteerID);
        this.setState({
            isText: true,
            recipients: theVolunteer.phone,
            subject: '',
            body: '',
            showMessageModal: true,
            recipientsFilled: true
        });
    }
    onClickSendIndividualEmail(event) {
        let volunteerID = event.target.id;
        let theVolunteer = this.state.volunteers.find(e => e.vol_ID == volunteerID);
        this.setState({
            isText: false,
            recipients: theVolunteer.email,
            subject: '',
            body: '',
            showMessageModal: true,
            recipientsFilled: true
        });
    }
    onClickSendTextToAll() {
        this.setRecipients(true, this.state.volunteers);
        this.setState({
            subject: '',
            body: '',
            showMessageModal: true
        });
    }
    onClickSendEmailToAll() {
        this.setRecipients(false, this.state.volunteers);
        this.setState({
            subject: '',
            body: '',
            showMessageModal: true
        });
    }
    onClickComposeText() {
        this.setState({
            isText: true,
            recipients: '',
            subject: '',
            body: '',
            showMessageModal: true,
            recipientsFilled: true
        });
    }
    onClickComposeEmail() {
        this.setState({
            isText: false,
            recipients: '',
            subject: '',
            body: '',
            showMessageModal: true,
            recipientsFilled: true
        });
    }

    onChangePassword(event) {
        this.setState({ password: event.target.value });
    }

    onClickPreset(event) {

        let presetSubject = '';
        let presetBody = '';

        switch (event.target.id) {
            case 'dr1':
                presetSubject = 'TSQ Delivery Reminder';
                presetBody = 'Reminder: Tomchei Deliveries are tonight, '
                    + this.getDate(true) + '. Please make sure your route is covered!';
                break;
            case 'dr2':
                presetSubject = 'TSQ Delivery Reminder';
                presetBody = 'Reminder: Tomchei Deliveries are tomorrow night, '
                    + this.getDate(false) + '. Please make sure your route is covered!';
                break;
            case 'dr3':
                presetSubject = 'TSQ Reminder: No Delivery';
                presetBody = 'Tomchei Reminder: NO DELIVERY TONIGHT, '
                    + this.getDate(true) + '.';
                break;
            case 'dr4':
                presetSubject = 'TSQ Reminder: No Delivery';
                presetBody = 'Tomchei Reminder: NO DELIVERY TOMORROW NIGHT, '
                    + this.getDate(false) + '.';
                break;
        }

        this.setState({
            subject: presetSubject,
            body: presetBody,
            showConfirmModal: true,
        });
    }

    onClickSend() {
        if (this.state.password.length <= 0) {
            return;
        }

        //set sms recipients and set email recipients 
        let recipientsSMS = '';
        let recipientsEmail = '';
        var emailSuccess = false;
        var textSuccess = false;
        this.state.allVolunteersAndRecipients.forEach(vol => {
            if (vol.sendSMS) {
                recipientsSMS = recipientsSMS.concat(vol.phone + ' ,');
            }
            else if (vol.sendEmail && vol.email && vol.email.length > 0) {
                recipientsEmail = recipientsEmail.concat(vol.email + ' ,')
            }
        });

        //send text to all with sendSMS
        fetch('/sendText', {
            method: 'POST',
            body: JSON.stringify({ recipients: recipientsSMS, body: this.state.body }),
            headers: { "Content-Type": "application/json" }
        }).then(response => {

            if (response.status === 200) {
                console.log('text success.');
                textSuccess = true;
            }
            else if (response.status === 401) {
                console.log('Login unauthorized. Please try again.');
            }
            else {
                console.log('Error...text could not be sent');
            }
        });

        //send email to e/o who doesnt have sendSMS
        fetch('/sendEmail', {
            method: 'POST',
            body: JSON.stringify({ recipients: recipientsEmail, body: this.state.body, subject: this.state.subject, password: this.state.password }),  //how to get email and txt password
            headers: { "Content-Type": "application/json" }
        }).then(response => {
            if (response.status === 200) {
                console.log('Email sent successfully!');
                emailSuccess = true;
            }
            else if (response.status === 401) {
                console.log('Login unauthorized. Please try again.');
            }
            else {
                console.log('Error...email could not be sent');
            }
        });

        if (textSuccess && emailSuccess) {
            this.setState({ showConfirmModal: false, statusMsg: <div class="alert alert-success" role="alert">Reminders Sent Successfully</div> });
        } else if (textSuccess) {
            this.setState({ showConfirmModal: false, statusMsg: <div class="alert alert-secondary" role="alert">Reminder Texts Sent Successfully. Emails were not sent.</div> });
        } else if (emailSuccess) {
            this.setState({ showConfirmModal: false, statusMsg: <div class="alert alert-secondary" role="alert">Reminder Emails Sent Successfully. Texts were not sent.</div> });
        } else {
            this.setState({ showConfirmModal: false, statusMsg: <div class="alert alert-danger" role="alert">Error...Reminders not sent</div> });
        }

    }
    //////////////////////////////////////////////////////////


    messageModal() {
        if (this.state.recipientsFilled) {
            return (<MessageModal
                open={this.state.showMessageModal}
                onClose={() => this.setState({ showMessageModal: false, recipientsFilled: false })}
                recipients={this.state.recipients}
                subject={this.state.subject}
                body={this.state.body}
                isText={this.state.isText}
                onClickCancel={() => this.setState({ showMessageModal: false, recipientsFilled: false })}
                setStatusMsg={(msg) => this.setState({ statusMsg: msg })}
            />);
        }
    }


    setupVolRows(email, sendEmail, sendSMS, vol_ID, lastName, firstName, primaryRouteID, VolunteerType) {
        let disableEmail = false;
        let disableText = false;

        if (!email || email.length <= 0 || !sendEmail) {
            disableEmail = true;
        }

        if (!sendSMS) {
            disableText = true;
        }

        return (
            <tr>
                <td class='vol-col' id={vol_ID}>{lastName}, {firstName}</td>
                <td class='route-col'>{primaryRouteID === -1 ? 'N/A' : primaryRouteID}</td>
                <td class='type-col'>{VolunteerType}</td>
                <td class='message-col'>
                    <button id={vol_ID} disabled={disableText} onClick={(event) => this.onClickSendIndividualText(event)}>&#128241;</button>
                    &nbsp;
                <button id={vol_ID} disabled={disableEmail} onClick={(event) => this.onClickSendIndividualEmail(event)}>&#9993;</button>
                    &nbsp;
            </td>
            </tr>);

    }


    render() {
        if (!this.state.loggedIn) {
            this.props.setAdmin();
            return <Redirect to="/signIn" />;
        }

        //fill the table with volunteers and buttons
        var tableData;
        if (this.state.noDataFound) {
            tableData = [];
            tableData.push('there are no volunteers to match the specified filters.');
            tableData = tableData.map(item => <tr><td colspan='4'>{item}</td></tr>);
        }
        else {
            tableData = this.state.volunteers.map(v =>
                this.setupVolRows(v.email, v.sendEmail, v.sendSMS, v.vol_ID, v.lastName, v.firstName, v.primaryRouteID, v.VolunteerType)
            );
        }

        //map to filter by volunteer type
        let filterByVolunteerType = this.state.volunteerTypes.map(v =>
            <option value={v.type_ID}>{v.typeDescription}</option>
        );

        return (
            <Fragment>

                {this.state.statusMsg}

                <div class='admin-messages-container'>
                    <div class='volunteer-container'>
                        <div class='filter-container'>
                            <table class='filter-options'>
                                <td class='filter-cell'>Filter:</td>
                                
                                 <td class='fcroutes'>   <RoutesDropdown
                                        id={'routeNums'}
                                        optional={{ val: 'allRoutes', text: 'All Routes' }}
                                        selectedRoute={(route) => this.onFilterByRoute(route)} />
                                        </td>
                                   <td class='fcvoltypes'> <select id='volTypes' onChange={(event) => this.onFilterByVolunteerType(event)}>
                                        <option value='allVolsAndRec'>All Volunteers &amp; Pickups</option>
                                        <option value='allVols'>All Volunteers</option>
                                        <option value='developers'>Developer</option>
                                        {filterByVolunteerType}
                                    </select></td>
                                   <td class='fcvolnames'> <DataListInput
                                        inputClassName={'searchVolsMessagePg'}
                                        itemClassName={'searchVolsMessagePg'}
                                        dropDownLength={'8'}
                                        placeholder={'Search Volunteers...'}
                                        items={this.state.volNames}
                                        onSelect={this.onClickFilterByVol} /></td>
                                  <td class='fcbuttons'>
                                    <button title='Send text to volunteers displayed below' onClick={() => this.onClickSendTextToAll()}>&#128241;</button>
                                    &nbsp;
                                    <button title='Send email to volunteers displayed below' onClick={() => this.onClickSendEmailToAll()}>&#9993;</button>
                                </td>
                                <td class='compose-cell'>
                                    New:&nbsp;
                                    <button title='Compose a blank text' onClick={() => this.onClickComposeText()}>&#128241;</button>
                                    &nbsp;
                                    <button title='Compose a blank email' onClick={() => this.onClickComposeEmail()}>&#9993;</button>
                                </td>
                            </table>
                        </div>
                        <table class='messages-header-table'>
                            <tr>
                                <td class='vol-col'>Volunteer</td>
                                <td class='route-col'>Route</td>
                                <td class='type-col'>Volunteer Type</td>
                                <td class='message-col'>Message</td>
                            </tr>
                        </table>
                        <div class='volunteer-message-table-container'>
                            <table id='volunteer-message-table' class='table-sm table table-striped'>
                                <tbody>
                                    {tableData}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <table class='preset-table'>
                        <tr>
                            <td><button id='dr1' class='btn btn-info' onClick={(event) => this.onClickPreset(event)}>Delivery Reminders Tonight</button></td>
                            <td><button id='dr2' class='btn btn-info' onClick={(event) => this.onClickPreset(event)}>Delivery Reminders Tomorrow Night</button></td>
                        </tr>
                        <tr>
                            <td><button id='dr3' class='btn btn-info' onClick={(event) => this.onClickPreset(event)}>Reminder: No Delivery Tonight</button></td>
                            <td><button id='dr4' class='btn btn-info' onClick={(event) => this.onClickPreset(event)}>Reminder: No Delivery Tomorrow Night</button></td>
                        </tr>
                    </table>
                </div>

                {this.messageModal()}

                <Modal center
                    open={this.state.showConfirmModal}
                    onClose={() => this.setState({ showConfirmModal: false })}>
                    {this.state.statusMsg}
                    <h2>Are you sure you would like to send the following reminder to all volunteers and recipients?</h2><br />
                    <p>{this.state.body} </p><br/>
                    <label>Please enter password to continue:</label> <br />
                    <input type='password' onChange={event => this.onChangePassword(event)} />
                    <br /><br />
                    <button onClick={() => this.setState({ showConfirmModal: false })}>Cancel</button>
                    <button onClick={() => this.onClickSend()}>Send</button>
                </Modal>

            </Fragment>);
    }
}
