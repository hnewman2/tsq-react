import React from 'react';
import { Component, Fragment } from 'react';
import { Redirect } from 'react-router-dom';
import './InboxStyles.css';
import Cookies from 'js-cookie';
import ReactDataGrid from 'react-data-grid';
import { Editors } from "react-data-grid-addons";
import PrintComponents from 'react-print-components';
import ReactToExcel from 'react-html-table-to-excel';

const { DropDownEditor } = Editors;


const sortRowsConst = (sortColumn, sortDirection) => {
    return rows => {
        console.log('got to sortRows');
        const comparer = (a, b) => {
            console.log('got to testing sortDirection');
            if (sortDirection === "ASC") {
    
                console.log('sortDirection is ASC');
                return a[sortColumn] > b[sortColumn] ? 1 : -1;
            } else if (sortDirection === "DESC") {
                console.log('sortDirection is DESC');
                return a[sortColumn] < b[sortColumn] ? 1 : -1;
            }
        };
        console.log('atempting to return...');
        return [...rows].sort(comparer);
    }
}
 ;

export default class EditAllVolInfo extends Component {


    constructor(props) {
        super(props);
        window.EditAllVolInfo = this;

        this.state = {
            loggedIn: true,
            columns: [],
            rows: [],
            rowCount: 0,
            boolDropDown: [],
            stateDR: [],
            shulDR: [],
            exportTableRows: []
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
        const boolDROptions = [{ id: 0, value: false },
        { id: 1, value: true }];
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
            { key: 'States', name: 'State', editable: true, editor: IssueTypeEditorState },
            { key: 'zip', name: 'Zip', editable: true },
            { key: 'phone', name: 'Phone', editable: true },
            { key: 'sendSMS', name: 'Send SMS', editor: IssueTypeEditor },
            { key: 'email', name: 'Email', editable: true },
            { key: 'sendEmail', name: 'Send Email', editable: true, editor: IssueTypeEditor },
            { key: 'isActive', name: 'Is Active', editable: true, editor: IssueTypeEditor },
            { key: 'primaryRoute_id', name: 'Primary Route', editable: true },
            { key: 'Shuls', name: 'Shul', editable: true, editor: IssueTypeEditorShul },
            { key: 'volTypes', name: 'Volunteer types' },
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

        fetch("/authorizeAdmin", {
            method: "POST",
        }).then(response => {
            if (response.status === 200) {
                this.setState({ loggedIn: true });
                Cookies.set('headerTitle', 'All Volunteer Information');
                this.props.setHeaderTitle('All Volunteer Information');
            }
            else {
                this.setState({ loggedIn: false });
            }
        });

        this.getShulDropDown();
        this.getStateDropDown();
        //this.setUpCols();
        this.getVolInfo();

    }

    getVolInfo() {

        fetch('/getAllVol', {
            method: 'POST',
            headers: { "Content-Type": "text/plain" }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    this.createTableView(data);
                    this.createTableExport(data);
                })
            }
        });
    }

    createTableView(data) {
        let rows = 0;
        let list = data.map(v => {
            return ({
                id: v.vol_ID,
                fName: v.firstName,
                lName: v.lastName,
                address: v.address,
                city: v.city,
                States: v.abbr,
                zip: v.zip,
                phone: v.phone,
                sendSMS: v.sendSMS == 0 ? 'false' : 'true',
                email: v.email,
                sendEmail: v.sendEmail == 0 ? 'false' : 'true',
                isActive: v.isActive == 0 ? 'false' : 'true',
                primaryRoute_id: v.primaryRouteID,
                Shuls: v.name,
                volTypes: v.VolunteerType
            });
        });
        data.forEach(() => ++rows);
        this.setState({ rows: list, rowCount: rows });
    }

    createTableExport(data) {

        let list = data.map(v =>
            <tr>
                <td>{v.vol_ID}</td>
                <td>{v.firstName}</td>
                <td>{v.lastName}</td>
                <td>{v.address}</td>
                <td>{v.city}</td>
                <td>{v.abbr}</td>
                <td>{v.zip}</td>
                <td>{v.phone}</td>
                <td>{v.sendSMS == 0 ? <p>&#10008;</p> : <p>&#10003;</p>}</td>
                <td>{v.email}</td>
                <td>{v.sendEmail == 0 ? <p>&#10008;</p> : <p>&#10003;</p>}</td>
                <td>{v.isActive == 0 ? <p>&#10008;</p> : <p>&#10003;</p>}</td>
                <td>{v.primaryRouteID}</td>
                <td>{v.name}</td>
            </tr>
        );
        this.setState({ exportTableRows: list });
    }


    onGridRowsUpdated = ({ fromRow, toRow, updated }) => {

        console.log('fromRow: ' + fromRow);
        console.log('toRow: ' + toRow);
        console.log('updated: ' + updated);

        let derivedKey = Object.keys(updated);


        let value = updated[derivedKey];
        let volID = this.state.rows[toRow].id;

        let updateData = { key: derivedKey, value: value, id: volID }



        if (derivedKey == 'States' || derivedKey == 'Shuls') {
            fetch('/updateVolState', {
                method: 'POST',
                body: JSON.stringify(updateData),
                headers: { "Content-Type": "application/json" }
            }).then(response => {
                if (response.status === 200) {
                    response.json().then(() => {

                    })
                }
            })

        }
        else {

            fetch('/massUpdateVolInfo', {
                method: 'POST',
                body: JSON.stringify(updateData),
                headers: { "Content-Type": "application/json" }
            }).then(response => {
                if (response.status === 200) {
                    response.json().then(() => {

                    })
                }
            })
        };


        console.log('the derived-key is:' + derivedKey);
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

    volSheet() {

        let currRows= this.state.rows;
      let currCol= this.state.columns;
        return (
            <ReactDataGrid
                columns={currCol}
                rowGetter={i => currRows[i]}
                rowsCount={currRows.length}
                enableCellSelect={true}
                onGridRowsUpdated={this.onGridRowsUpdated}
                onGridSort={(sortColumn, sortDirection) => {
                    console.log("test 1")
                    return this.setState({rows: this.sortRows(/*initialRows,*/ sortColumn, sortDirection)})}
                    /* console.log('sortColumn has: ' + sortColumn
                    + '\n sortDirection has: ' + sortDirection)*/
                    
                } />
        );
    }
    sortRows(sortColumn, sortDirection) {
        console.log("test 2")
        
        console.log('got to sortRows');
        const comparer = (a, b) => {
            console.log('a: '+a);
            if (sortDirection === "ASC") {
    
                console.log('sortDirection is ASC');
                return a[sortColumn] > b[sortColumn] ? 1 : -1;
            } else if (sortDirection === "DESC") {
                console.log('sortDirection is DESC');
                return a[sortColumn] < b[sortColumn] ? 1 : -1;
            }
        };
        console.log('atempting to return...');
        return [...this.state.rows].sort(comparer);
    
    }
    /*
            function comparer (a, b){
                  if (sortDirection === "ASC") {
            
                    console.log('sortDirection is ASC');
                    return a[sortColumn] > b[sortColumn] ? 1 : -1;
                  } 
                  else if (sortDirection === "DESC") {
                    console.log('sortDirection is DESC');
                    return a[sortColumn] < b[sortColumn] ? 1 : -1;
                  }
            };
            console.log('atempting to return...');
            ;
        };*/



    setupTable() {
        return (<table id="tableExport">
            <thead>
                <th>ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Address </th>
                <th>City</th>
                <th>State</th>
                <th>Zip</th>
                <th>Phone</th>
                <th>Send SMS</th>
                <th>Email</th>
                <th>Send Email</th>
                <th>Is Active</th>
                <th>Primary Route</th>
                <th>Shul</th>
            </thead>
            <tbody>
                {this.state.exportTableRows}
            </tbody>
        </table>)
    }


    render() {

        if (!this.state.loggedIn) {
            this.props.setAdmin();
            return <Redirect to="/signIn" />;
        }

        return (

            <div class='vol-excel-page'>
                {this.volSheet()}
                <PrintComponents trigger={<button class='btn btn-secondary print-volinfo-btn'>Print</button>}>
                    {this.setupTable()}
                </PrintComponents>
                <div class='invisible-table'>
                    {this.setupTable()}
                </div>
                <ReactToExcel
                    className='btn btn-secondary print-volinfo-btn'
                    table='tableExport'
                    filename='volunteer data'
                    sheet='sheet 1'
                    buttonText='Export to Excel'
                />

            </div>
        );
    }
}