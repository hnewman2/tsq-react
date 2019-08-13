import React from 'react';
import { Component, Fragment } from 'react';
import { Redirect } from 'react-router-dom';
import './InboxStyles.css';
import Cookies from 'js-cookie';
import DataListInput from 'react-datalist-input';
import ReactDataGrid from 'react-data-grid';
import { Editors } from "react-data-grid-addons";
const { DropDownEditor } = Editors;

export default class EditAllVolInfo extends Component {


    constructor(props) {
        super(props);
        window.EditAllVolInfo = this;

        const defaultColumnProperties = {
            resizable: true,
            width: 120
        };
       /* const dropDownOptions= [{ id: 0, value: 'false' },
            { id: 1, value: 'true' }];*/

      const IssueTypeEditor = <DropDownEditor options={dropDownOptions} />;

        this.state = {
            columns: [
                { key: 'id', name: 'ID' },
                { key: 'fName', name: 'First Name', editable: true },
                { key: 'lName', name: 'Last Name', editable: true },
                { key: 'address', name: 'Address', editable: true },
                { key: 'city', name: 'City', editable: true },
                { key: 'state', name: 'State', editable: true },
                { key: 'zip', name: 'Zip', editable: true },
                { key: 'phone', name: 'Phone', editable: true },
                { key: 'sendSMS', name: 'Send SMS', editor:IssueTypeEditor },
                { key: 'email', name: 'Email', editable: true },
                { key: 'sendEmail', name: 'Send Email', editable: true, editor:IssueTypeEditor  },
                { key: 'isActive', name: 'Is Active', editable: true, editor:IssueTypeEditor  },
                { key: 'primaryRoute_id', name: 'Primary Route', editable: true },
                { key: 'shul_ID', name: 'Shul', editable: true },
            ].map(c => ({ ...c, ...defaultColumnProperties })),

            rows: [],
            rowCount: 0,
            boolDropDown:[]
        }
        this.getVolInfo = this.getVolInfo.bind(this);
        this.setUpBoolDropDown=this.setUpBoolDropDown.bind(this);
    }

    setUpBoolDropDown(){
        this.setState({boolDropDown:[{ id: 0, value: 'false' },
        { id: 1, value: 'true' }]});
    }


    componentDidMount() {
        this.getVolInfo();
    }

    getVolInfo() {
        let rows = 0;
        fetch('/getAllVol', {
            method: 'POST',
            headers: { "Content-Type": "text/plain" }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    let list = data.map(v => {
                        return ({
                            id: v.vol_ID,
                            fName: v.firstName,
                            lName: v.lastName,
                            address: v.address,
                            city: v.city,
                            state: v.state,
                            zip: v.zip,
                            phone: v.phone,
                            sendSMS: v.sendSMS==0?"false":"true",
                            email: v.email,
                            sendEmail: v.sendEmail==0?'false':'true',
                            isActive: v.isActive==0?'false':'true',
                            primaryRoute_id: v.primaryRouteID,
                            shul_ID: v.shul_ID

                        });
                    });
                    data.forEach(() => ++rows);
                    this.setState({ rows: list, rowCount: rows });
                })
            }
        });
    }

    onGridRowsUpdated = ({ fromRow, toRow, updated }) => {

        console.log('fromRow: ' + fromRow);
        console.log('toRow: ' + toRow);
        console.log(updated);
        let derivedKey = Object.keys(updated);
        let value = updated[derivedKey];
        let volID = this.state.rows[toRow].id;

        let updateData = { key: derivedKey, value: value, id: volID }

        fetch('/massUpdateVolInfo', {
            method: 'POST',
            body: JSON.stringify(updateData),
            headers: { "Content-Type": "application/json" }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(() => {

                })
            }
        });


        console.log('the key is:' + derivedKey);
        console.log('the value is:' + value);
        console.log('the ID of the row is: ' + this.state.rows[toRow].id);


        this.setState(state => {
            const rows = state.rows.slice();
            for (let i = fromRow; i <= toRow; i++) {
                rows[i] = { ...rows[i], ...updated };
            }
            return { rows };
        });
    };

    render() {
        return (

            <ReactDataGrid
                columns={window.EditAllVolInfo.state.columns}
                rowGetter={i => window.EditAllVolInfo.state.rows[i]}
                rowsCount={window.EditAllVolInfo.state.rowCount}
                minHeight={600}
                enableCellSelect={true}
                onGridRowsUpdated={this.onGridRowsUpdated} />
        );
    }
}