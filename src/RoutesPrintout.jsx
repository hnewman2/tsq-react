import React from 'react';
import { Component, Fragment } from 'react';
import PrintComponents from 'react-print-components';
import './RoutesPrintoutStyles.css';
import Cookies from 'js-cookie';

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
            memos: []

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
                        //  let list=data.map(i=> i)
                        // this.setState({ currentRouteInformation: list });
                        // this.setState({ showRouteInformation: true });
                    })
                } else {
                    //  this.setState({ statusMsg: <div class="alert alert-danger" role="alert">Unable to retrieve route information. Please contact IT for help.</div> });
                }
            });
    }

    componentDidMount() {

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
        /* i => this.setupRouteTables(i.route_ID, i.fName, i.lName, i.addressLine1, i.addressLine2, i.city, i.familySize, i.phone, i.addressNotes, i.centerNotes, i.notes)*/
    }




    setupRouteTables(route_ID, fName, lName, addressLine1, addressLine2, city,
        familySize, phone, addressNotes, centerNotes, notes) {


        let table =
            <tr id={route_ID}>
                <td class='route-table-name'>{fName} {lName}</td>
                <td class='route-table-address'>{addressLine1}, &nbsp; {addressLine2}</td>
                <td class='route-table-city'>{city}</td>
                <td class='route-table-size'>{familySize}</td>
                <td class='route-table-phone'>{this.getPhone(phone)}</td>
                <td class='uppercase route-table-notes'>
                    {addressNotes ? <p>{addressNotes}</p> : null}
                    {centerNotes ? <p>{centerNotes}</p> : null}
                    {notes ? <p>{notes}</p> : null}
                </td>
            </tr>


        return table;


        /*let temp = this.state.routeInfo;
        temp.push(table);
        this.setState({ routeInfo: temp });*/

    }
    getMemos() {
        fetch('/getTodaysMemos', {
            method: 'POST'
        }).then(response => {
            response.json().then(data => {
                let list = data.map(m => <p class='memos'>{m.body}</p>);
                this.setState({ memos: list });
            });
        });
    }

    createTables() {
        let tables = [];
        let hiddenTables = [];
        //this.state.routes.forEach(i=>{
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
                            <th class='route-table-name'>Name</th>
                            <th class='route-table-address'>Address</th>
                            <th class='route-table-city'>City</th>
                            <th class='route-table-size'>Qty</th>
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
                        {<div class='print-table'>{table}</div>}
                    </PrintComponents>
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
        return (
            <Fragment>
                <div class='routes-tables-container'>
                    {this.state.routeTablesDetails}
                </div>
                <div class='print-all'>
                    <PrintComponents trigger={<button class='btn btn-info'>Print All</button>}>
                        {this.state.routeTables}
                        {/*<div class='print-table'>{this.state.routeTables}</div>*/}
                    </PrintComponents>
                </div>
            </Fragment>
        );
    }
}
