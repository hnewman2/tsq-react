import React from 'react';
import { Component, Fragment } from 'react';
import RoutesDropdown from './RoutesDropdown';
import { Redirect } from 'react-router-dom';
import Cookies from 'js-cookie';
import MessageModal from './MessageModal';
import DataListInput from 'react-datalist-input';

export default class ViewLogs extends Component {

    constructor(props) {
        super(props);
        window.ViewLogsComponent = this;

        this.state = {
            loggedIn: true,
            history: [],
            volNames: [],
            showHistory: false,
            errorMsg: '',
            statusMsg: '',
            showMessageModal: false,
            recipientsFilled: false,
            subject: '',
            body: '',
            recipients: '',
            isText: true,
        };

        this.getHistory = this.getHistory.bind(this);
        this.getDate = this.getDate.bind(this);
        this.getPhone = this.getPhone.bind(this);
        this.getVolunteers = this.getVolunteers.bind(this);

    }

    componentDidMount() {

        /*
        document.onclick = () => {
            this.setState({
                statusMsg: <div class="alert alert-success" role="alert">test</div>
            });
        }*/

        fetch("/authorizeAdmin", {
            method: "POST",
        }).then(response => {
            if (response.status === 200) {
                this.setState({ loggedIn: true });
                Cookies.set('headerTitle', 'Route History');
                this.props.setHeaderTitle('Route History');
            }
            else {
                this.setState({ loggedIn: false });
            }
        });

        var body = '';
        var path = '';
        this.getHistory(path, body);
        this.getVolunteers();

    }

    getHistory(path, body) {
        fetch("/routeHistory" + path, {
            method: "POST",
            body: body,
            headers: { "Content-Type": "text/plain" }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    var list = data.map(
                        i => <tr>
                            <td class='vl1'>{i.route_ID}</td>
                            <td class='vl2 title-case'>{i.volunteer}</td>
                            <td class='vl3'>{this.getDate(i.date.toString())}</td>
                            <td class='vl4'>{this.getPhone(i.phone)}</td>
                            <td class='vl5'><button id={i.phone} onClick={(event) => this.onClickSendText(event)}>&#128241;</button></td>
                        </tr>);
                    this.setState({ history: list, showHistory: true });
                });
            }
            else if (response.status === 204) {
                var list = [];
                list.push('There is no history to match the specified filters.');
                list = list.map(item => <tr><td colspan='3'>{item}</td></tr>);
                this.setState({ history: list, showHistory: true });
            }
            else {
                this.setState({ errorMsg: <div class="alert alert-danger" role="alert">An error has occurred. Please contact IT</div> });
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

    onFilterByRoute(route) {
        // document.getElementById('volPhone').value = '';
        document.getElementById('selectDate').value = '';
        if (route !== 'placeholder') {
            // this.setState({ showHistory: false });
            this.getHistory('ByRoute', route);
        }
    }

    onClickFilterByVol(selectedVal) {
        console.log('got to onclick filter, phone is: ' + selectedVal.key);
        //event.preventDefault();
        document.getElementById('routeNums').value = 'placeholder';
        document.getElementById('selectDate').value = '';
        var path = 'ByVol';
        var phone = selectedVal.key;
        window.ViewLogsComponent.setState({ showHistory: false });
        window.ViewLogsComponent.getHistory(path, phone);
    }

    onFilterByDate(event) {
        document.getElementById('routeNums').value = 'placeholder';
        // document.getElementById('volPhone').value = '';
        var date = event.target.value;
        this.getHistory('ByDate', date);
    }

    onClickClearFilter() {
        // document.getElementById('volPhone').value = '';
        document.getElementById('selectDate').value = '';
        document.getElementById('routeNums').value = 'placeholder';
        this.getHistory('', '');
    }

    onClickSendText(event) {
        var phone = event.target.id;
        this.setState({
            recipientsFilled: true,
            showMessageModal: true,
            recipients: phone
        });
    }

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
                setStatusMsg={(msg) => this.setState({ statusMsg: <div class="alert alert-danger" role="alert">{msg}</div> })}
            />);
        }
    }

    getDate(date) {
        var year = date.substring(0, 4);
        var month = date.substring(5, 7);
        var day = date.substring(8, 10);

        var newDate = month + '/' + day + '/' + year;

        return newDate;
    }

    getPhone(phone) {
        var areaCode = phone.substring(0, 3);
        var three = phone.substring(3, 6);
        var four = phone.substring(6, 11);

        var newPhone = '(' + areaCode + ') ' + three + '-' + four;

        return newPhone;
    }

    render() {
        if (!this.state.loggedIn) {
            this.props.setAdmin();
            return <Redirect to="/signIn" />;
        }

        if (this.state.showHistory) {

            return (
                <Fragment>
                    {this.state.statusMsg}
                    <div class='view-logs'>
                        <table class='view-logs-header-table'>
                            <td class='filter'>Filter:</td>
                            <td class='routes-dropdown'>
                                <RoutesDropdown
                                    id={'routeNums'}
                                    optional={{ val: 'placeholder', text: 'Select a Route' }}
                                    selectedRoute={val => this.onFilterByRoute(val)} />
                            </td>
                            <td>
                                <input class='date-input' type='date' id='selectDate' onChange={(event) => this.onFilterByDate(event)} /><br />
                            </td>
                            <td class='vol-input'>
                                <DataListInput inputClassName={'volunteer-input'} itemClassName={'volunteer-input'} dropDownLength={'8'} placeholder={'Search Volunteers...'} items={this.state.volNames}
                                    onSelect={this.onClickFilterByVol} />
                            </td>
                            <td class='filter-button'>
                                <button class='clear-filter-button' onClick={() => this.onClickClearFilter()}>Clear Filter</button>
                            </td>
                        </table>

                        <table class='title-table'>
                            <thead>
                                <th class='vl1'>Route</th>
                                <th class='vl2'>Taken By</th>
                                <th class='vl3'>Date</th>
                                <th class='vl4'>Phone</th>
                                <th class='vl5-left-align'>Text</th>
                            </thead>
                        </table>
                        <div class='route-history-table'>
                            <table class='table table-sm table-striped'>
                                <tbody>
                                    {this.state.history}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {this.messageModal()}
                </Fragment>
            );
        }
        else {
            return this.state.errorMsg;
        }
    }
}