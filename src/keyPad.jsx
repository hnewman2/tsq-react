import React from 'react';
import { Component, Fragment } from 'react';
import { Redirect } from 'react-router-dom';
import Modal from 'react-responsive-modal';
import RoutesDropdown from './RoutesDropdown';
import StatesDropdown from './StatesDropdown';
import ShulDropdown from './ShulDropdown';
import ConfirmModal from './ConfirmModal';
import Cookies from 'js-cookie';

export default class KeyPad extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loggedIn: true,
            phone: '',
            email: '',
            volunteer: '',
            redirectToVol: false,
            addNewVol: false,
            errorMsg: '',

            showConfirmChangeStatusModal: false,
            showConfirmAddNewVolModal: false,
            prompt: '',
            okText: '',
            cancelText: '',

            vol_ID: '',
            firstName: '',
            lastName: '',
            address: '',
            city: '',
            state: '33',
            zip: '',
            sendSMS: true,
            sendEmail: false,
            primaryRouteID: '-1',
            shul_ID: '12',
            phoneNumber: '',
            selectedVolTypes: [],
            volTypes: []
        };

        this.createKeyPad = this.createKeyPad.bind(this);
        this.logUserIn = this.logUserIn.bind(this);
        this.getVolunteerTypes = this.getVolunteerTypes.bind(this);
    }

    componentDidMount() {

        document.onclick = () => {
            this.setState({
                errorMsg: ''
            });
        }

        fetch("/authorizeUser", {
            method: "POST",
        }).then(response => {
            if (response.status === 200) {
                this.setState({ loggedIn: true });
                Cookies.set('headerTitle', 'Volunteer Sign In');
                this.props.setHeaderTitle('Volunteer Sign In');
            }
            else {
                this.setState({ loggedIn: false });
            }
        });

        this.getVolunteerTypes();
    }

    getVolunteerTypes() {
        fetch('/getVolunteerTypes', {
            method: 'POST'
        })
            .then(response => {
                response.json().then(data => {
                    let list = data.map(v=>
                        <div >
                        <span class='check-box-labels-not-bold'>
                            <input type='checkbox' id={v.type_ID}
                             onChange={(e) => this.onChangeVolTypeCheckbox(e)}/>
                             {v.typeDescription}</span>&nbsp;&nbsp;</div>
                        );
                    this.setState({
                        volTypes: list
                    });
                })
            });
    }

    onChangeVolTypeCheckbox(e){
        let checked = e.target.checked;
        let temp=this.state.selectedVolTypes;
        if (checked){
            temp.push(e.target.id);
            this.setState({selectedVolTypes:temp});
        }else{
            let index= this.state.selectedVolTypes.indexOf(e.target.id);
            temp.splice(index,1);
            this.setState({selectedVolTypes:temp});
        }
    }

    createKeyPad() {
        return (
            <div class='keypad-page-container'>
                <div class='keypad-numbers'>
                    <h4>Phone Login</h4>
                    <table >
                        <tr>
                            <td><button value='1' onClick={event => this.onClickNumber(event)}>1</button> </td>
                            <td><button value='2' onClick={event => this.onClickNumber(event)}>2</button> </td>
                            <td><button value='3' onClick={event => this.onClickNumber(event)}>3</button> </td>
                        </tr>
                        <tr>
                            <td><button value='4' onClick={event => this.onClickNumber(event)}>4</button> </td>
                            <td><button value='5' onClick={event => this.onClickNumber(event)}>5</button> </td>
                            <td><button value='6' onClick={event => this.onClickNumber(event)}>6</button> </td>
                        </tr>
                        <tr>
                            <td><button value='7' onClick={event => this.onClickNumber(event)}>7</button> </td>
                            <td><button value='8' onClick={event => this.onClickNumber(event)}>8</button> </td>
                            <td><button value='9' onClick={event => this.onClickNumber(event)}>9</button> </td>
                        </tr>
                        <tr>
                            <td><button onClick={event => this.onClickCancel(event)}>&#10008;</button> </td>
                            <td><button value='0' onClick={event => this.onClickNumber(event)}>0</button> </td>
                            <td><button onClick={event => this.onClickUndo(event)}>&#8630;</button> </td>
                        </tr>
                    </table>
                    <form onSubmit={event => this.onSearchPhone(event)} method='POST'>
                        <input type='text' id='phone' onChange={event => this.onChangePhoneNum(event)} placeholder='(___)-___-____'
                            pattern='^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})$' title='Enter a valid 10 digit phone number' required
                        />
                        <button type='submit' id='submitPhoneSearch'>&#x1f50d;</button>
                    </form>
                </div>

                <div class='keypad-form'>
                    <h4>Email Login</h4>
                    <br />
                    <br />
                    <form onSubmit={event => this.onSearchEmail(event)} method='POST'>
                        <input type='email' name='email' onChange={event => this.onChangeEmail(event)} placeholder='example@yourmail.com' required />
                        <button type='submit' id='submitEmailSearch'>&#x1f50d;</button>
                    </form>
                </div>
            </div>
        );
    }

    onChangePhoneNum(event) {
        this.setState({
            phone: event.target.value
        });
    }

    onSearchPhone(event) {
        //fetch from db the vounteer with the phone
        event.preventDefault();
        fetch("/searchPhone", {
            method: "POST",
            body: this.state.phone,
            headers: { "Content-Type": "text/plain" }
        }).then(response => {
            //check if response is valid
            if (response.status === 200) {
                response.json().then(data => {
                    if (data[0].isActive) {
                        this.props.setCurrentVolunteer(data[0]);
                        this.setState({ redirectToVol: true }); //redirect to route checkout page, send in the vol info
                    } else {
                        this.setState({
                            prompt: 'Volunteer is currently inactive. Would you like to change the status?',
                            okText: 'Yes',
                            cancelText: 'No',
                            showConfirmChangeStatusModal: true,
                        });
                    }
                });
            }
            else {
                //display error message
                //volunteer doesnt exist in our system - would you like to add it?
                this.setState({
                    prompt: 'Phone number does not exist in the system. Would you like to add it as a new volunteer?',
                    okText: 'Yes',
                    cancelText: 'No',
                    showConfirmAddNewVolModal: true,
                });
                //let addNew = window.confirm("Phone number does not exist in the system.\nWould you like to add it as a new volunteer?");

            }
        });
    }

    onSearchEmail(event) {
        //fetch from db the volunteer with this email
        event.preventDefault();
        fetch("/searchEmail", {
            method: "POST",
            body: this.state.email,
            headers: { "Content-Type": "text/plain" }
        }).then(response => {
            //check if response is valid
            if (response.status === 200) {
                response.json().then(data => {
                    if (data[0].isActive) {
                        this.props.setCurrentVolunteer(data[0]);
                        this.setState({ redirectToVol: true }); //redirect to route checkout page, send in the vol info
                    } else {
                        this.setState({
                            prompt: 'Volunteer is currently inactive. \nWould you like to change the status?',
                            okText: 'Yes',
                            cancelText: 'No',
                            showConfirmChangeStatusModal: true,
                        });
                    }
                });
            }
            else {
                //display error message
                this.setState({ errorMsg: <div class="alert alert-danger" role="alert">There are no volunteers with this email address. Please try logging in with a phone number.</div> })
            }
        });
    }

    onChangeStatus() {
        fetch("/updateVolStatusActive", {
            method: "POST",
            body: this.state.phone || this.state.email,
            headers: { "Content-Type": "text/plain" }
        }).then(response => {
            //check if response is valid
            if (response.status === 200) {
                if (this.state.phone) {
                    document.getElementById('submitPhoneSearch').click();
                }
                else {
                    document.getElementById('submitEmailSearch').click();
                }
            }
            else {
                //display error message
                this.setState({ errorMsg: <div class="alert alert-danger" role="alert">An Error occurred... Unable to change status of volunteer.</div> })
            }
        });
    }

    onClickNumber(event) {
        document.getElementById('phone').value += event.target.value;
        this.setState({
            phone: document.getElementById('phone').value,
        });

    }

    onClickCancel(event) {
        document.getElementById('phone').value = '';
    }

    onClickUndo(event) {
        var phone = document.getElementById('phone').value;
        document.getElementById('phone').value = phone.substring(0, phone.length - 1);
    }

    onClickAddVolunteer(event) {
        event.preventDefault();
        //close the modal
        this.setState({ addNewVol: false });
        //add it to the database
        fetch("/addNewVolunteer", {
            method: "POST",
            body: JSON.stringify(this.state),
            headers: { "Content-Type": "application/json" }
        }).then(response => {
            //check if response is valid
            if (response.status === 200) {
                //redirect to volInfo- manually log the volunteer in
                this.setState({ phone: this.state.phoneNumber });
                this.logUserIn();
            }
            else {
                //display error message
                this.setState({ errorMsg: <div class="alert alert-danger" role="alert">Error... unable to add volunteer</div> });
            }
        });
    }

    logUserIn() {
        document.getElementById('submitPhoneSearch').click();
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

    onChangeState(event) {
        this.setState({ state: event.target.value });
    }

    onChangeZip(event) {
        this.setState({ zip: event.target.value });
    }

    onChangePhone(event) {
        this.setState({ phoneNumber: event.target.value });
    }

    onChangeSendSMS(event) {
        this.setState({ sendSMS: event.target.checked });
    }

    onChangeEmail(event) {
        this.setState({
            email: event.target.value
        });
    }

    onChangeSendEmail(event) {
        this.setState({ sendEmail: event.target.checked });
    }


    render() {

        if (!this.state.loggedIn) {
            this.props.resetAdmin();
            return <Redirect to="/signIn" />;
        }

        else if (this.state.redirectToVol) {
            return <Redirect to="/volInfo" />;
        }
        else {
            return (
                <Fragment>

                    {this.state.errorMsg}
                    <Modal center
                        open={this.state.addNewVol}
                        onClose={() => this.setState({
                            addNewVol: false
                        })}>
                        <div class='add-new-vol-modal'>
                            <h3>Add New Volunteer</h3>
                            <form onSubmit={(event) => this.onClickAddVolunteer(event)}>
                                <table>
                                    <tr>
                                        <td class='column1'>First Name: </td>
                                        <td class='column2'><input type="text"
                                            id="firstName"
                                            onChange={(event) => this.onChangeFirstName(event)}
                                        /></td>
                                        <td rowspan='6' class='vol-types-checkboxes'>Volunteer Type:<br/>{this.state.volTypes}</td>
                                    </tr>
                                    <tr>
                                        <td class='column1'>Last Name: </td>
                                        <td class='column2'><input type="text"
                                            id="lastName"
                                            onChange={(event) => this.onChangeLastName(event)}
                                        /></td>
                                    </tr>
                                    <tr>
                                        <td class='column1'>Address: </td>
                                        <td class='column2'><input type="text"
                                            id="address"
                                            onChange={(event) => this.onChangeAddress(event)}
                                        /></td>
                                    </tr>
                                    <tr><td class='column1'>City: </td>
                                        <td class='column2'><input type="text"
                                            id="city"
                                            onChange={(event) => this.onChangeCity(event)}
                                        /></td>
                                    </tr>
                                    <tr>
                                        <td class='column1'>State: </td>
                                        <td class='column2'><StatesDropdown
                                            selectedState={val => this.setState({ state: val })}
                                            defaultStateVal={33} />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class='column1'>Zip: </td>
                                        <td class='column2'><input type="text"
                                            id="zip"
                                            onChange={(event) => this.onChangeZip(event)}
                                        /></td>
                                    </tr>
                                    <tr>
                                        <td class='column1'>Phone Number: </td>
                                        <td class='column2'><input type="text"
                                            id="phone"
                                            onChange={(event) => this.onChangePhone(event)}
                                            defaultValue={this.state.phone}
                                            placeholder='(___)-___-____'
                                            pattern='^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})$' title='Enter a valid 10 digit phone number' required />
                                        </td>
                                        <td>
                                            <input type="checkbox"
                                                id="sendSMS"
                                                onChange={(event) => this.onChangeSendSMS(event)}
                                                defaultChecked={this.state.sendSMS}
                                            />&nbsp;Send me Text Reminders
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class='column1'>Email Address: </td>
                                        <td class='column2'><input type="email"
                                            id="email"
                                            onChange={(event) => this.onChangeEmail(event)}
                                        /></td>

                                        <td>
                                            <input type="checkbox"
                                                id="sendEmai"
                                                onChange={(event) => this.onChangeSendEmail(event)}
                                            />&nbsp;Send me Email Reminders
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class='column1'>Shul: </td>
                                        <td colspan='2'><ShulDropdown class='shul-dropdown'
                                            selectedShul={val => this.setState({ shul_ID: val })}
                                        /></td>
                                    </tr>
                                    <tr>
                                        <td class='column1'>Primary Route: </td>
                                        <td class='column2'><RoutesDropdown
                                            id={'routeNums'}
                                            optional={{ val: '-1', text: 'Not a Driver' }}
                                            selectedRoute={val => this.setState({ primaryRouteID: val })}
                                        /></td>
                                    </tr>
                                </table><button class='btn btn-primary btn-sm' type='submit'>Add Volunteer</button>
                            </form>
                        </div>
                    </Modal>

                    <ConfirmModal
                        open={this.state.showConfirmAddNewVolModal}
                        onClose={() => this.setState({ showConfirmAddNewVolModal: false })}
                        prompt={this.state.prompt}
                        okText={this.state.okText}
                        cancelText={this.state.cancelText}
                        onClickCancel={() => this.setState({ showConfirmAddNewVolModal: false, addNewVol: false })}
                        onClickOK={() => this.setState({ showConfirmAddNewModal: false, addNewVol: true, phoneNumber: this.state.phone })}
                    />

                    <ConfirmModal
                        open={this.state.showConfirmChangeStatusModal}
                        onClose={() => this.setState({ showConfirmChangeStatusModal: false })}
                        prompt={this.state.prompt}
                        okText={this.state.okText}
                        cancelText={this.state.cancelText}
                        onClickCancel={() => this.setState({ showConfirmChangeStatusModal: false })}
                        onClickOK={() => {
                            this.setState({ showConfirmChangeStatusModal: false })
                            this.onChangeStatus();
                        }}
                    />

                    {this.createKeyPad()}
                </Fragment>
            );
        }
    }
}


