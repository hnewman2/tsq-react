import React from 'react';
import { Component, Fragment } from 'react';
import { Redirect } from 'react-router-dom';
import './ViewStatusStyles.css'
import Cookies from 'js-cookie';
import MessageModal from './MessageModal';

export default class ViewStatus extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loggedIn: true,
            processedRoutes: [],
            showProcessedRoutes: false,
            outstandingRoutes: [],
            showOutstandingRoutes: false,
            selectedRoute: '',
            showMessageModal: false,
            recipientsFilled: false,
            recipients: [],
            noDataFound: true,
        };

        this.getTakenRoutes = this.getTakenRoutes.bind(this);
        this.getOutStandingRoutes = this.getOutStandingRoutes.bind(this);
        this.getDate = this.getDate.bind(this);
        this.getPhone = this.getPhone.bind(this);
        this.refresh = this.refresh.bind(this);
    }

    componentDidMount() {

        fetch("/authorizeAdmin", {
            method: "POST",
        }).then(response => {
            if (response.status === 200) {
                this.setState({ loggedIn: true });
                Cookies.set('headerTitle', 'Route Status');
                this.props.setHeaderTitle('Route Status');
            }
            else {
                this.setState({ loggedIn: false });
            }
        });

        this.getTakenRoutes();
        this.getOutStandingRoutes();
        this.refresh();


    }

    refresh() {
        setInterval(this.getTakenRoutes, 5000);
        setInterval(this.getOutStandingRoutes, 5000);
    }



    getTakenRoutes() {
        fetch("/processedRoutes", {
            method: "POST"
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    var list = data.map(
                        i => <tr>
                            <td id='text-td'>{i.route_ID}</td> <td class='title-case'>{i.name}</td><td>{this.getPhone(i.phone)}</td><td>{this.getDate(i.activityTime)}</td>
                            <td><button id={i.phone} onClick={e => this.textProcessedRoute(e)}>&#128241;</button></td>
                        </tr>);
                    this.setState({ processedRoutes: list, showProcessedRoutes: true });
                });
            }
            else if (response.status === 204) {
                var list = [];
                list.push('No processed routes. Routes can be checked out using the Volunteer Keypad.');
                list = list.map(item => <tr><td>{item}</td></tr>);
                this.setState({ processedRoutes: list, showProcessedRoutes: true });

            }
        });


    }

    getOutStandingRoutes() {

        fetch("/outstandingRoutes", {
            method: "POST"
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    var list = data.map(
                        i => <tr id='outstanding-tr'
                            value={i.route_ID}>
                            <td id='text-td'>{i.route_ID}</td>
                            <td><button id={i.route_ID} onClick={e => this.onClickSetSelectedRoute(e)}>&#128241;</button></td>
                        </tr>);
                    this.setState({ outstandingRoutes: list, showOutstandingRoutes: true });
                });
            }
            else if (response.status === 204) {
                var list = [];
                list.push('All Routes have been taken for today.');
                list = list.map(item => <tr><td>{item}</td></tr>);
                this.setState({ outstandingRoutes: list, showOutstandingRoutes: true });
            }
        });
    }

    messageModal() {
        if (this.state.recipientsFilled) {
            return (<MessageModal
                open={this.state.showMessageModal}
                onClose={() => this.setState({ showMessageModal: false, recipientsFilled: false })}
                recipients={this.state.recipients}
                subject=''
                body=''
                isText={true}
                onClickCancel={() => this.setState({ showMessageModal: false, recipientsFilled: false })}
                setStatusMsg={(msg) => this.setState({ statusMsg: <div class="alert alert-secondary" role="alert">{msg}</div> })}
            />);
        }
    }

    textProcessedRoute(event) {
        let phone = event.target.id;
        this.setState({
            recipients: phone,
            recipientsFilled: true,
            showMessageModal: true
        });
    }

    getVolunteers(route) {
        fetch('/getVolunteersFilterByRoute', {
            method: 'POST',
            body: route,
            headers: { "Content-Type": "text/plain" }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    let phones = '';
                    data.forEach(v => {
                        if (v.sendSMS) {
                            phones = phones.concat(v.phone + ', ');
                        }

                    });
                    this.setState({
                        recipients: phones,
                        noDataFound: false,
                        recipientsFilled: true,
                        showMessageModal: true
                    });

                })
            } else if (response.status === 204) {
                this.setState({ noDataFound: true });
            } else {
                this.setState({ statusMsg: <div class="alert alert-danger" role="alert">Server error occurred....unable to retrieve volunteers</div> });
            }
        });
    }

    onClickSetSelectedRoute(event) {
        let route = event.target.id;
        this.getVolunteers(route);
    }

    getDate(date) {
        var year = date.substring(0, 4);
        var month = date.substring(5, 7);
        var day = date.substring(8, 10);
        var hour = Number(date.substring(11, 13));
        var minute = date.substring(14, 16);
        var ampm = 'AM'

        if (hour > 12) {
            hour = hour - 12;
            ampm = 'PM'
        } else if (hour == 0) {
            hour = 12;
        }

        var newDate = hour + ':' + minute + ' ' + ampm + ' ' + month + '/' + day + '/' + year;

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

        return (
            <Fragment>
                <div class='status-container'>
                    <table class='header-table'>
                        <tr>
                            <td class='header-table-first-cell'>Processed Routes</td>
                            <td class='header-table-white-cell'></td>
                            <td class='header-table-last-cell'>Outstanding Routes</td>
                        </tr>
                    </table>
                    <div class='processed-container'>
                        <table class='processed-table table table-sm table-striped'>
                            <tbody>
                                {this.state.processedRoutes}
                            </tbody>
                        </table>
                    </div>
                    <div class='outstanding-container'>
                        <table class='outstanding-table table table-sm table-striped'>
                            <tbody>
                                {this.state.outstandingRoutes}
                            </tbody>
                        </table>
                    </div>
                </div>

                {this.messageModal()}
            </Fragment>
        );
    }

}