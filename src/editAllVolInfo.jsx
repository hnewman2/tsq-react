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

        this.state = {
            columns: [],

            rows: [],
            rowCount: 0,
            boolDropDown: [],
            stateDR: [],
            shulDR: []
        }
        this.getVolInfo = this.getVolInfo.bind(this);
        this.setUpCols = this.setUpCols.bind(this);
        this.getStateDropDown = this.getStateDropDown.bind(this);
        this.getShulDropDown = this.getShulDropDown.bind(this);
    }

    setUpCols() {


        const defaultColumnProperties = {
            resizable: true,
            width: 120,
            sortable: true
        };
        const boolDROptions = [{ id: 0, value: 'false' },
        { id: 1, value: 'true' }];
        const IssueTypeEditor = <DropDownEditor options={boolDROptions} />;

        const shulDROptions = this.state.shulDR;
        const IssueTypeEditorShul = <DropDownEditor options={shulDROptions} />;

        const stateDROptions = this.state.stateDR;
        const IssueTypeEditorState = <DropDownEditor options={stateDROptions} />;


        let cols = [
            { key: 'id', name: 'ID' },
            { key: 'fName', name: 'First Name', editable: true },
            { key: 'lName', name: 'Last Name', editable: true },
            { key: 'address', name: 'Address', editable: true },
            { key: 'city', name: 'City', editable: true },
            { key: 'state', name: 'State', editable: true, editor: IssueTypeEditorState },
            { key: 'zip', name: 'Zip', editable: true },
            { key: 'phone', name: 'Phone', editable: true },
            { key: 'sendSMS', name: 'Send SMS', editor: IssueTypeEditor },
            { key: 'email', name: 'Email', editable: true },
            { key: 'sendEmail', name: 'Send Email', editable: true, editor: IssueTypeEditor },
            { key: 'isActive', name: 'Is Active', editable: true, editor: IssueTypeEditor },
            { key: 'primaryRoute_id', name: 'Primary Route', editable: true },
            { key: 'shul_ID', name: 'Shul', editable: true, editor: IssueTypeEditorShul },
        ].map(c => ({ ...c, ...defaultColumnProperties }));

        this.setState({ columns: cols });
    }

    getStateDropDown() {
        fetch('/getStates', {
            method: 'POST'
        }).then(response => {
            response.json().then(data => {
                let list = data.map(st => {
                    return ({
                        id: st.state_ID,
                        value: st.abbr
                    });
                })
                // console.log(list);
                this.setState({ stateDR: list }, this.setUpCols);
            })
        });
    }
    getShulDropDown() {
        fetch('/getShuls', {
            method: 'POST'
        }).then(response => {
            response.json().then(data => {

                let list = data.map(sh => {
                    return ({
                        id: sh.shul_ID,
                        value: sh.name
                    });
                })
                //  console.log(list);
                this.setState({ shulDR: list }, this.setUpCols);
            })
        });
    }
    componentDidMount() {
        this.getShulDropDown();
        this.getStateDropDown();
        //this.setUpCols();
        this.getVolInfo();


     /*   const sortRows = (initialRows, sortColumn, sortDirection) => rows => {
            const comparer = (a, b) => {
              if (sortDirection === "ASC") {]=
                return a[sortColumn] > b[sortColumn] ? 1 : -1;
              } else if (sortDirection === "DESC") {
                return a[sortColumn] < b[sortColumn] ? 1 : -1;
              }
            };
            return sortDirection === "NONE" ? initialRows : [...rows].sort(comparer);
          };*/
    }

  /*  sortRows(initialRows, sortColumn, sortDirection){
        const comparer = (a, b) => {
            if (sortDirection === "ASC") {
              return a[sortColumn] > b[sortColumn] ? 1 : -1;
            } else if (sortDirection === "DESC") {
              return a[sortColumn] < b[sortColumn] ? 1 : -1;
            }
          };
          return sortDirection === "NONE" ? initialRows : [...rows].sort(comparer);
        };*/
    

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
                            state: v.abbr,
                            zip: v.zip,
                            phone: v.phone,
                            sendSMS: v.sendSMS == 0 ? 'false' : 'true',
                            email: v.email,
                            sendEmail: v.sendEmail == 0 ? 'false' : 'true',
                            isActive: v.isActive == 0 ? 'false' : 'true',
                            primaryRoute_id: v.primaryRouteID,
                            shul_ID: v.name

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
        console.log('updated: ' + updated);

        let derivedKey = Object.keys(updated);

          if(derivedKey == 'state'){
              let value = updated[derivedKey].id;
              console.log('in the if(){} the value is: '+value);
          }

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
                onGridRowsUpdated={this.onGridRowsUpdated}
                onGridSort={(sortColumn, sortDirection) => console.log('sortColumn has: ' + sortColumn
                + '\n sortDirection has: '+ sortDirection)
                  /*  setRows(sortRows(initialRows, sortColumn, sortDirection))*/
                  } />
        );
    }
}