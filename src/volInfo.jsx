import React from 'react';
import { Component, Fragment } from 'react';
import Modal from 'react-responsive-modal';
import { Redirect } from 'react-router-dom';
import PrintComponents from 'react-print-components';
import RoutesDropdown from './RoutesDropdown';
import StatesDropdown from './StatesDropdown';
import ShulDropdown from './ShulDropdown';
import ConfirmModal from './ConfirmModal';
import Cookies from 'js-cookie';
import RoutesPDF from './RoutesPDF';

export default class VolInfo extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loggedIn: true,
            currentRoute: this.props.currentVolunteer.primaryRouteID,
            currentRouteInformation: '',
            statusMsg: '',
            routeCheckoutStatus: '',

            showRouteInformation: false,
            showCheckoutWindow: false,
            showEditInfoWindow: false,
            showRouteWindow: false,
            returnToLogin: false,

            vol_ID: this.props.currentVolunteer.vol_ID,
            firstName: this.props.currentVolunteer.firstName,
            lastName: this.props.currentVolunteer.lastName,
            address: this.props.currentVolunteer.address,
            city: this.props.currentVolunteer.city,
            state: this.props.currentVolunteer.state,
            zip: this.props.currentVolunteer.zip,
            phone: this.props.currentVolunteer.phone,
            sendSMS: this.props.currentVolunteer.sendSMS,
            email: this.props.currentVolunteer.email,
            sendEmail: this.props.currentVolunteer.sendEmail,
            shul_ID: this.props.currentVolunteer.shul_ID,
            primaryRouteID: this.props.currentVolunteer.primaryRouteID,
            currentVolTypes: [],

            resetEmail: false,
            password: '',
        }

        this.setUpRoutesTable = this.setUpRoutesTable.bind(this);
        this.checkOutRoute = this.checkOutRoute.bind(this);
        this.getPhone = this.getPhone.bind(this);
        this.getVolunteerTypes = this.getVolunteerTypes.bind(this);
        this.getCurrentVolTypes = this.getCurrentVolTypes.bind(this);

    }
    componentDidMount() {
        document.onclick = () => {
            this.setState({
                statusMsg: ''
            });
        }

        fetch("/authorizeUser", {
            method: "POST",
        }).then(response => {
            if (response.status === 200) {
                this.setState({ loggedIn: true });
                Cookies.set('headerTitle', 'Volunteer Information');
                this.props.setHeaderTitle('Volunteer Information');
            }
            else {
                this.setState({ loggedIn: false });
            }
        });

        this.getVolunteerTypes();
        this.getCurrentVolTypes();
    }

    getCurrentVolTypes(){
        fetch('/getCurrVolunteerTypes', {
            method: 'POST',
            body: this.state.vol_ID,
            headers: { "Content-Type": "text/plain" }
        }).then(response => {
                response.json().then(data => {
                    let list = data.map(v=>
                       v.type_ID);
                    this.setState({
                        currentVolTypes: list
                    });
                })
            });
    }

    getVolunteerTypes() {
        fetch('/getVolunteerTypes', {
            method: 'POST'
        })
            .then(response => {
                response.json().then(data => {
                    let list = data.map(v=>
                        <Fragment >
                        <label class='check-box-labels-not-bold'><input type='checkbox' defaultChecked={()=>this.hasVolType(v.type_ID)} id={v.type_ID} onChange={(e) => this.onChangeVolTypeCheckbox(e)}/>{v.typeDescription}</label>&nbsp;&nbsp;</Fragment>
                        );
                    this.setState({
                        volTypes: list
                    });
                })
            });
    }

    hasVolType(type_ID){
        if(this.state.currentVolTypes.indexOf(type_ID)>0){
            return true;
        }else{
            return false;
        }
    }

    onChangeRoute(value) {
        this.setState({ currentRoute: value });
    }

    onClickCheckOutRoute(event) {

        event.preventDefault();
        let e = document.getElementById('checkoutRouteNums');
        let selected = e.options[e.selectedIndex].value;

        console.log('the selected route: ' + selected);
        if (selected !== 'placeholder') {
            this.setState({
                showEditInfoWindow: false,
                showCheckoutWindow: !this.state.showCheckoutWindow,
            })
        }

    }

    onClickEditInfo(event) {
        this.setState({
            showCheckoutWindow: false,
            showEditInfoWindow: !this.state.showEditInfoWindow,
        })
    }

    onClickCancel(event) {
        this.setState({ showCheckoutWindow: false });
    }

    onClickYesCheckout(event) {
        this.setState({
            showCheckoutWindow: false,
            showRouteWindow: !this.state.showRouteWindow,
        });

        //write query to add this route to log
        this.checkOutRoute();

        //display route information
        this.getRouteInformation();
    }

    onChangeFirstName(event) {
        this.setState({ firstName: event.target.value });
    }

    onChangeLastName(event) {
        this.setState({ lastName: event.target.value });
    }

    onChangeAddress(event) {
        this.setState({ address: event.target.value });
    }

    onChangeCity(event) {
        this.setState({ city: event.target.value });
    }

    onChangeZip(event) {
        this.setState({ zip: event.target.value });
    }

    onChangePhone(event) {
        this.setState({ phone: event.target.value });
    }

    onChangeSendSMS(event) {
        this.setState({ sendSMS: event.target.checked });
    }

    onChangeEmail(event) {
        this.setState({ email: event.target.value });
    }

    onChangeSendEmail(event) {
        this.setState({ sendEmail: event.target.checked });
    }

    onClickDoneEditingInfo(event) {
        event.preventDefault();
        this.setState({
            showEditInfoWindow: false,
            currentRoute: this.state.primaryRouteID
        });
        //add info back into the database
        this.updateDatabase();
        this.props.setCurrentVolunteer({
            vol_ID: this.state.vol_ID,
            firstName: this.state.firstName,
            lastName: this.state.lastName,
            address: this.state.address,
            city: this.state.city,
            state: this.state.state,
            zip: this.state.zip,
            phone: this.state.phone,
            sendSMS: this.state.sendSMS,
            email: this.state.email,
            sendEmail: this.state.sendEmail,
            isActive: this.props.currentVolunteer.isActive,
            primaryRouteID: this.state.primaryRouteID,
            shul_ID: this.state.shul_ID
        });

    }

    onClickOK() {
        this.setState({ returnToLogin: true });
    }

    checkOutRoute() {
        let infoToSend = { vol_ID: this.state.vol_ID, route_ID: this.state.currentRoute };
        fetch("/logPickup", {
            method: "POST",
            body: JSON.stringify(infoToSend),
            headers: { "Content-Type": "application/json" }
        }).then(response => {
            //check if response is valid
            if (response.status === 200) {
                this.setState({ routeCheckoutStatus: <div class="alert alert-success" role="alert">Route {this.state.currentRoute} checked out successfully</div> });
            } else {
                //display error message
                this.setState({ routeCheckoutStatus: <div class="alert alert-danger" role="alert">Error...Checkout Route unsuccessful</div> });
            }
        });
    }

    updateDatabase() {
        fetch("/editVol", {
            method: "POST",
            body: JSON.stringify(this.state),
            headers: { "Content-Type": "application/json" }
        }).then(response => {
            //check if response is valid
            if (response.status === 200) {
                this.setState({ statusMsg: <div class="alert alert-success" role="alert">Volunteer information updated successfully</div> });
            } else {
                //display error message
                this.setState({ statusMsg: <div class="alert alert-danger" role="alert">Error...Edit unsuccessful</div> });
            }
        });
    }

    getRouteInformation() {
        fetch('/getRouteInformation', {
            method: 'POST',
            body: this.state.currentRoute,
            headers: { "Content-Type": "text/plain" }
        })
            .then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        var list = data.map(
                            i => <tr>
                                <td>{i.fName} {i.lName}</td>
                                <td>{i.addressLine1}, &nbsp; {i.addressLine2}</td>
                                <td>{i.city}</td>
                                <td>{i.familySize}</td>
                                <td>{i.phone}</td>
                                <td>
                                    {i.addressNotes} <br />
                                    {i.centerNotes} <br />
                                    {i.notes}
                                </td>
                            </tr>
                        )
                        this.setState({ currentRouteInformation: list });
                        this.setState({ showRouteInformation: true });
                    })
                } else {
                    this.setState({ statusMsg: <div class="alert alert-danger" role="alert">Unable to retrieve route information. Please contact IT for help.</div> });
                }
            });
    }

    setUpRoutesTable() {
        return (
            <div>
                <h3>Route &nbsp; {this.state.currentRoute}</h3>

                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Address</th>
                            <th>City</th>
                            <th>Family Size</th>
                            <th>Phone Number</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.currentRouteInformation}
                    </tbody>
                </table>
            </div>
        );
    }

    getPhone(phone) {
        var areaCode = phone.substring(0, 3);
        var three = phone.substring(3, 6);
        var four = phone.substring(6, 11);

        var newPhone = '(' + areaCode + ') ' + three + '-' + four;

        return newPhone;
    }


    onClickSendRouteEmail() {
        /*check if email needs to be updated in db*/
        if(this.state.resetEmail && this.state.email !== this.props.currentVolunteer.email){
            fetch('/updateVolEmail', {
                method: 'POST',
                body: JSON.stringify({email: this.state.email, vol_ID: this.state.vol_ID}),
                headers: { "Content-Type": "application/json" }
            }).then(response=>{
                if(response.status ===200){
                    console.log('email updated successfully');
                }
            });
        }

        /*send route info to selected email address*/
        fetch('/create-pdf', {
            method: 'POST',
            body: JSON.stringify({route: this.state.currentRoute, recipients: this.state.email,
                 password: this.state.password, subject: 'Tomchei Deliveries Route '+ this.state.currentRoute,
                    body: 'See attached Route Sheet for '+ this.getTodayDate()+'. \nThank you and Tizku L\'Mitzvos!'}),
            headers: { "Content-Type": "application/json" }
        }).then(response => {
            if (response.status === 200) {
                console.log('all good');
            }
        });
        this.setState({ returnToLogin: true });

    }

    getTodayDate=()=>{
        var today = new Date();
        var todayString = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
        return todayString;
    }

    render() {

        if (!this.state.loggedIn) {
            this.props.resetAdmin();
            return <Redirect to="/signIn" />;
        }

        if (this.state.returnToLogin) {
            return <Redirect to='/keyPad' />;
        }

        const { showCheckoutWindow, showEditInfoWindow, showRouteWindow } = this.state;

        return (

            <Fragment>
                {this.state.statusMsg}
                <table class='vol-info-table'>
                    <tr>
                        <th colspan='3' class='edit-info-row'>
                            <button class='edit-info-button btn btn-secondary btn-sm' onClick={(event) => this.onClickEditInfo(event)}>
                                Edit Information</button>
                        </th>
                    </tr>
                    <tr>
                        <td class='column1'>Name:</td>
                        <td class='column2 title-case' colspan='2'>{this.props.currentVolunteer.firstName}&nbsp;{this.props.currentVolunteer.lastName}</td>
                    </tr>
                    <tr>
                        <td class='column1'>Phone Number:</td>
                        <td class='column2' colspan='2'>{this.getPhone(this.props.currentVolunteer.phone)}</td>
                    </tr>
                    <tr>
                        <td class='column1'>Email:</td>
                        <td class='column2 ' colspan='2'>{this.props.currentVolunteer.email}</td>
                    </tr>
                    <tr>
                        <td class='column1'>Primary Route:</td>
                        <td class='column2'>{this.props.currentVolunteer.primaryRouteID}</td>
                    </tr>
                    <tr>
                        <td class='select-route-dropdown'>
                            <RoutesDropdown
                                id={'checkoutRouteNums'}
                                getOutstandingRoutes={true}
                                primaryRouteID={this.props.currentVolunteer.primaryRouteID}
                                optional={{ val: 'placeholder', text: 'Select a Route' }}
                                selectedRoute={val => this.onChangeRoute(val)} />
                        </td>
                        <td colspan='2'>
                            <button class='checkout-route-btn btn btn-info btn-lg' onClick={(event) => this.onClickCheckOutRoute(event)}>
                                Check Out Route
                            </button>
                        </td>
                    </tr>
                </table>

                <ConfirmModal
                    open={showCheckoutWindow}
                    onClose={() => this.setState({
                        showCheckoutWindow: false
                    })}
                    prompt={'You selected route ' + this.state.currentRoute + '.  Would you like to take this route?'}
                    header={'Checkout a Route'}
                    onClickOK={(event) => this.onClickYesCheckout(event)}
                    onClickCancel={(event) => this.onClickCancel(event)}
                    okText={'Yes'}
                    cancelText={'Cancel'}
                >
                </ConfirmModal>

                <Modal center
                    open={showEditInfoWindow}
                    onClose={() => this.setState({
                        showEditInfoWindow: false
                    })}>
                    <div class='edit-info-modal'>
                        <h3>Edit My Information</h3>
                        <form onSubmit={(event) => this.onClickDoneEditingInfo(event)}>
                            <table>
                                <tr>
                                    <td class='column1'>First Name: </td>
                                    <td class='column2'><input type="text"
                                        id="firstName"
                                        onChange={(event) => this.onChangeFirstName(event)}
                                        defaultValue={this.props.currentVolunteer.firstName}
                                    /></td>
                                    <td rowspan='6' class='vol-types-checkboxes'>Volunteer Type:<br/>{this.state.volTypes}</td>
                                </tr>
                                <tr>
                                    <td class='column1'>Last Name: </td>
                                    <td class='column2'><input type="text"
                                        id="lastName"
                                        onChange={(event) => this.onChangeLastName(event)}
                                        defaultValue={this.props.currentVolunteer.lastName}
                                    /></td>
                                </tr>
                                <tr>
                                    <td class='column1'>Address: </td>
                                    <td class='column2'><input type="text"
                                        id="address"
                                        onChange={(event) => this.onChangeAddress(event)}
                                        defaultValue={this.props.currentVolunteer.address}
                                    /></td>
                                </tr>
                                <tr><td class='column1'>City: </td>
                                    <td class='column2'><input type="text"
                                        id="city"
                                        onChange={(event) => this.onChangeCity(event)}
                                        defaultValue={this.props.currentVolunteer.city} />
                                    </td>
                                </tr>
                                <tr>
                                    <td class='column1'>State: </td>
                                    <td class='column2'><StatesDropdown
                                        selectedState={val => this.setState({ state: val })}
                                        defaultStateVal={this.props.currentVolunteer.state}
                                    />
                                    </td>
                                </tr>
                                <tr>
                                    <td class='column1'>Zip: </td>
                                    <td class='column2'><input type="text"
                                        id="zip"
                                        onChange={(event) => this.onChangeZip(event)}
                                        defaultValue={this.props.currentVolunteer.zip}
                                    /></td>
                                </tr>
                                <tr>
                                    <td class='column1'>Phone Number: </td>
                                    <td class='column2'><input type="text"
                                        id="phone"
                                        onChange={(event) => this.onChangePhone(event)}
                                        defaultValue={this.props.currentVolunteer.phone}
                                        placeholder='(___)-___-____'
                                        pattern='^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})$' title='Enter a valid 10 digit phone number' required />
                                    </td>
                                    <td>
                                        <input type="checkbox"
                                            id="sendSMS"
                                            onChange={(event) => this.onChangeSendSMS(event)}
                                            defaultChecked={this.props.currentVolunteer.sendSMS}
                                        />&nbsp;Send me Text Reminders
                                        </td>
                                </tr>
                                <tr>
                                    <td class='column1'>Email Address: </td>
                                    <td class='column2'><input type="email"
                                        id="email"
                                        onChange={(event) => this.onChangeEmail(event)}
                                        defaultValue={this.props.currentVolunteer.email}
                                    /></td>

                                    <td>
                                        <input type="checkbox"
                                            id="sendEmai"
                                            onChange={(event) => this.onChangeSendEmail(event)}
                                            defaultChecked={this.props.currentVolunteer.sendEmail}
                                        />&nbsp;Send me Email Reminders
                                        </td>
                                </tr>
                                <tr>
                                    <td class='column1'>Shul: </td>
                                    <td colspan='2'><ShulDropdown class='shul-dropdown'
                                        selectedShul={val => this.setState({ shul_ID: val })}
                                        defaultShulVal={this.props.currentVolunteer.shul_ID}
                                    /></td>
                                </tr>
                                <tr>
                                    <td class='column1'>Primary Route: </td>
                                    <td class='column2'><RoutesDropdown
                                        id={'editRouteNums'}
                                        optional={{ val: '-1', text: 'Not a Driver' }}
                                        selectedRoute={val => this.setState({ primaryRouteID: val })}
                                        primaryRouteID={this.props.currentVolunteer.primaryRouteID}
                                    /></td>
                                </tr>
                            </table>
                            <button class='btn btn-primary btn-sm' type='submit'>Done</button>
                        </form>
                    </div>
                </Modal>

                <Modal center
                    open={showRouteWindow}
                    onClose={() => this.onClickOK()}>
                    <div class='route-info-modal'>
                        {this.state.routeCheckoutStatus}
                        <br />
                        {this.setUpRoutesTable()}
                        <PrintComponents trigger={<button class='btn btn-secondary'>Print</button>}>
                            {this.setUpRoutesTable()}
                        </PrintComponents>
                        &nbsp;<button class='btn btn-secondary' onClick={() => this.setState({ showEmailModal: true })}>
                            Email
                    </button>
                        &nbsp;<button class='btn btn-info' onClick={() => this.onClickOK()}>
                            OK
                    </button>
                    </div>
                </Modal>

                <Modal
                    center
                    open={this.state.showEmailModal}
                    onClose={() => this.setState({ showEmailModal: false })}>
                    <div class='email-routes-modal'>
                        <p>Please confirm that the below email is correct: </p>
                        <input type='email' defaultValue={this.props.currentVolunteer.email}
                            onChange={(e) => this.setState({ email: e.target.value })} /><br />
                        <input type='checkbox' onChange={(e) => this.setState({ resetEmail: e.target.checked })} />
                        <label>Set as Preferred Email</label><br />
                        <label>Enter password for TSQ email:</label>
                        <input type='password' onChange={(e) => this.setState({ password: e.target.value })} />
                        <button class='btn btn-secondary' onClick={() => this.onClickSendRouteEmail()}>Send</button>
                        &nbsp;<button class='btn btn-info' onClick={() => this.setState({ showEmailModal: false })}>Cancel</button>
                    </div>
                </Modal>

                {/*<RoutesPDF pageData={this.setUpRoutesTable()} />*/}

            </Fragment >
        );
    }
}




