import React from 'react';
import { Component, Fragment } from 'react';
import { Redirect } from 'react-router-dom';
import Cookies from 'js-cookie';
import DataListInput from 'react-datalist-input';

export default class SearchRecipients extends Component {

    constructor(props) {

        super(props);
        window.SearchRecipientsComponent = this;
        this.state = {
            loggedIn: true,
            selectedRecipient: '',
            recipients: [],
            selectedRecipientInfo: []
        }

        this.getRecipientInfo = this.getRecipientInfo.bind(this);
        this.getRecipients = this.getRecipients.bind(this);
        this.getPhone = this.getPhone.bind(this);
    }

    componentDidMount() {
        fetch("/authorizeUser", {
            method: "POST",
        }).then(response => {
            if (response.status === 200) {
                this.setState({ loggedIn: true });
                Cookies.set('headerTitle', 'Search Recipients');
                this.props.setHeaderTitle('Search Recipients');
            }
            else {
                this.setState({ loggedIn: false });
            }
        });

        this.getRecipients();
    }

    getRecipients() {

        fetch("/getRecipients", {
            method: "POST",
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    const items = data.map((item, i) => {
                        return {
                            // what to show to the user
                            label: item.recipient,
                            // key to identify the item within the array
                            key: item.detail_ID,
                        }
                    });
                    this.setState({ recipients: items });
                });
            }
        });

    }

    onClickSearchRecipients(selectedVal) {
        var value = selectedVal.key;
        window.SearchRecipientsComponent.setState({ selectedRecipient: value }, window.SearchRecipientsComponent.getRecipientInfo);
    }


    getRecipientInfo() {
        fetch("/getRecipientInfo", {
            method: "POST",
            body: this.state.selectedRecipient,
            headers: { "Content-Type": "text/plain" }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    var list = data.map(
                        i => <tr>
                            <td >{i.route_ID}</td>
                            <td >{i.familySize}</td>
                            <td class='title-case'>{i.recipient}</td>
                            <td class='title-case'>{i.address}</td>
                            <td >{this.getPhone(i.phone)}</td>
                            <td class='uppercase'>{i.addressNotes ? <p>{i.addressNotes} <br /></p> : <Fragment />}
                                {i.centerNotes ? <p>{i.centerNotes} <br /></p> : <Fragment />}
                                {i.notes ? <p>{i.notes} <br /></p> : <Fragment />}
                            </td>
                        </tr>);
                    this.setState({ selectedRecipientInfo: list });
                });
            }

            else {
                this.setState({ errorMsg: <div class="alert alert-danger" role="alert">An error has occurred. Please contact IT</div> });
            }
        });
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

    render() {
        if (!this.state.loggedIn) {
            this.props.setAdmin();
            return <Redirect to="/signIn" />;
        }

        return (

            <div class='search-recipients-container'>
                <div class='recipient-search'>
                    <DataListInput
                        inputClassName={'recipients-input'}
                        itemClassName={'recipients-input'}
                        dropDownLength={'12'}
                        placeholder={'Search Recipients...'}
                        items={this.state.recipients}
                        onSelect={this.onClickSearchRecipients} />
                </div>

                <table id='volunteer-message-table' class='table-sm table table-striped'>
                    <tr>
                        <th >Route </th>
                        <th >QTY</th>
                        <th >Name</th>
                        <th >Address</th>
                        <th >Phone</th>
                        <th >Notes</th>
                    </tr>
                    {this.state.selectedRecipientInfo}
                </table>
            </div>
        );
    }
}