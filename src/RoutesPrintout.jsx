import React from 'react';
import { Component, Fragment } from 'react';
import PrintComponents from 'react-print-components';
import './RoutesPrintoutStyles.css';
import Cookies from 'js-cookie';
import { Redirect } from 'react-router-dom';
import Modal from 'react-responsive-modal';

export default class AdminHome extends Component {

    constructor(props) {
        super(props);
        this.state = {
            routeInfo: [],
            routes: [],
            routeTables: [],
            gotInfo: false,
            gotRoutes: false,
            routeTablesDetails: [],
            memos: [],
            loggedIn: true,
            currentRoute: '',
            email: '',
            password: '',
            memoList: [],
            statusMsg: '',

        }
        this.setupRouteTables = this.setupRouteTables.bind(this);
        this.getRouteInformation = this.getRouteInformation.bind(this);
        this.getMemos = this.getMemos.bind(this);
        this.getPhone = this.getPhone.bind(this);

    }


    getRouteInformation() {
        fetch('/getAllRouteInfo', {
            method: 'POST',
            headers: { "Content-Type": "text/plain" }
        })
            .then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        this.setState({ routeInfo: data }, this.createTables)

                    })
                }
            });
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
                Cookies.set('headerTitle', 'View Routes');
                this.props.setHeaderTitle('View Routes');
            }
            else {
                this.setState({ loggedIn: false });
            }
        });

        this.getRouteInformation();
        this.getRoutes();
        this.getMemos();
    }


    setupRouteTables(route_ID, fName, lName, addressLine1, addressLine2, city,
        familySize, phone, addressNotes, centerNotes, notes) {


        let table =
            <tr id={route_ID} class='thick-bottom-border'>
                <td class='route-table-size'>{familySize}</td>
                <td class='route-table-name'>{lName}, {fName} </td>
                <td class='route-table-address'>{addressLine1}, &nbsp; {addressLine2}</td>
                <td class='route-table-city'>{city}</td>
                <td class='route-table-phone'>{this.getPhone(phone)}</td>
                <td class='uppercase route-table-notes'>
                    {addressNotes ? <p>{addressNotes}</p> : null}
                    {centerNotes ? <p>{centerNotes}</p> : null}
                    {notes ? <p>{notes}</p> : null}
                </td>
            </tr>


        return table;


    }
    getMemos() {
        fetch('/getTodaysMemos', {
            method: 'POST'
        }).then(response => {
            response.json().then(data => {
                let list = data.map(m => <p class='memos'>{m.body}</p>);
                this.setState({ memos: list, memoList: data });
            });
        });
    }

    createTables() {
        let tables = [];
        let hiddenTables = [];

        for (let k = 0; k < this.state.routes.length; k++) {

            let i = this.state.routes[k];
            let list = [];

            this.state.routeInfo.forEach(j => {
                if (j.route_ID === i.route_ID) {

                    let tr = this.setupRouteTables(j.route_ID, j.fName, j.lName, j.addressLine1, j.addressLine2,
                        j.city, j.familySize, j.phone, j.addressNotes, j.centerNotes, j.notes);
                    list.push(tr);
                }
            });
            let table = <div class='pg-brk'>
                <table class="route-table" id={i.route_ID}>
                    <thead>
                        <tr><th class='route-table-id' colspan='6'>Route {i.route_ID}</th></tr>
                        <tr class='route-table-header-row'>
                            <th class='route-table-size'>Qty</th>
                            <th class='route-table-name'>Name</th>
                            <th class='route-table-address'>Address</th>
                            <th class='route-table-city'>City</th>
                            <th class='route-table-phone'>Contact</th>
                            <th class='route-table-notes'>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list}
                    </tbody>
                </table>

                {this.state.memos}

                <label class='contact-info-string' >
                    <a> WHOSE TURN IS IT NEXT TIME? </a>
                    <br />
                    Please ask for your alternate's number in case you need to switch.
                    <br />
                    <a>Changes? </a>
                    Call (718) 850-8070.
                    <a> Anything Irregular? </a>
                    Let us know at info@tsqinc.org.
                </label>
            </div>

            let HideTables = <details>
                <summary>
                    {' Route: ' + i.route_ID}

                    <PrintComponents trigger={<button class='print-btn btn btn-secondary btn-sm'>Print </button>}>
                        <div /*class='print-table'*/>{table}</div>
                    </PrintComponents>
                    <button class='print-btn btn btn-secondary btn-sm' id={i.route_ID} onClick={(e) => this.setState({ showEmailModal: true, currentRoute: e.target.id })}>Email</button>
                </summary>
                {table}
            </details>

            let tempHideTables = hiddenTables;
            tempHideTables.push(HideTables);
            hiddenTables = tempHideTables;

            let temp = tables;
            temp.push(table);
            tables = temp;
        }
        this.setState({ routeTables: tables, routeTablesDetails: hiddenTables });
    }

    getPhone(phone) {
        var areaCode, three, four, newPhone;

        switch (phone.length) {
            case 7:
                areaCode = '718';
                three = phone.substring(0, 3);
                four = phone.substring(3, 7);
                break;
            case 8:
                areaCode = '718';
                three = phone.substring(0, 3);
                four = phone.substring(4, 8);
                break;
            case 10:
                areaCode = phone.substring(0, 3);
                three = phone.substring(3, 6);
                four = phone.substring(6, 11);
                break;
            case 12:
                areaCode = phone.substring(0, 3);
                three = phone.substring(4, 7);
                four = phone.substring(8, 12);
                break;
            case 0:
                return phone;
            default:
                return phone;
        }
        newPhone = '(' + areaCode + ') ' + three + '-' + four;
        return newPhone;
    }
    getTodayDate = () => {
        var today = new Date();
        var todayString = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
        return todayString;
    }

    onClickSendRouteEmail() {
        fetch('/create-pdf', {
            method: 'POST',
            body: JSON.stringify({
                route: this.state.currentRoute, recipients: this.state.email,
                password: this.state.password, subject: 'Tomchei Deliveries Route ' + this.state.currentRoute,
                body: 'See attached Route Sheet for ' + this.getTodayDate() + '. \nThank you and Tizku L\'Mitzvos!',
                memos: this.state.memoList
            }),
            headers: { "Content-Type": "application/json" }
        }).then(response => {
            if (response.status === 200) {
                this.setState({ returnToLogin: true, statusMsg: <div class="alert alert-success" role="alert">Email Sent Successfully.</div> });
            } else {
                this.setState({ returnToLogin: true, statusMsg: <div class="alert alert-danger" role="alert">Error...Unable to send email.</div> });
            }
        });

        this.setState({ showEmailModal: false });
    }

    getRoutes() {
        fetch('/getRoutes', {
            method: 'POST'
        }).then(response => {
            response.json().then(data => {
                this.setState({ routes: data, gotRoutes: true });
            })
        });
    }

    render() {
        if (!this.state.loggedIn) {
            this.props.setAdmin();
            return <Redirect to="/signIn" />;
        }

        return (
            <Fragment>
                {this.state.statusMsg}
                <div class='routes-tables-container'>
                    {this.state.routeTablesDetails}
                </div>
                <div class='print-all'>

                    <PrintComponents trigger={<button class='btn btn-info'>Print All</button>}>
                        {this.state.routeTables}
                        {/*<div class='print-table'>{this.state.routeTables}</div>*/}
                    </PrintComponents>
                </div>


                <Modal
                    center
                    open={this.state.showEmailModal}
                    onClose={() => this.setState({ showEmailModal: false })}>
                    <div class='email-routes-modal'>
                        <h4>Email Route Sheet</h4>
                        <table class='all-routes-email-sheet'>
                            <tr>
                                <td>Enter email address: </td>
                                <td><input type='email'
                                    onChange={(e) => this.setState({ email: e.target.value })} /></td>
                            </tr>
                            <tr>
                                <td>Enter password for TSQ email:</td>
                                <td><input type='password' autoComplete='new-password' onChange={(e) => this.setState({ password: e.target.value })} /></td>
                            </tr>
                            </table><br/>
                            <button class='btn btn-secondary' onClick={() => this.onClickSendRouteEmail()}>Send</button>
                            &nbsp;<button class='btn btn-info' onClick={() => this.setState({ showEmailModal: false })}>Cancel</button>
                    </div>
                </Modal>
            </Fragment>
        );
    }
}
