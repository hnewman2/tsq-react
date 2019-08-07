import React from 'react';
import { Component, Fragment } from 'react';
import { Redirect } from 'react-router-dom';
import './InboxStyles.css';
import Cookies from 'js-cookie';
import DataListInput from 'react-datalist-input';

export default class Inbox extends Component {

    constructor(props) {
        super(props);
        window.InboxComponent = this;
        this.state = {
            loggedIn: true,
            selectedContact: '',
            gotContact: false,
            gotContactList: false,
            showMessages: false,
            statusMsg: '',
            isText: true,
            subject: '',
            notifications: 0,
            messages: [],
            recipients: [],
            body: '',
            contactName: '',
            unread: 0,
            contactsList: [],
            tempContacts: [],
            tempMessages: [],
            volNames: [],
        }
        this.getContacts = this.getContacts.bind(this);
        this.getMessages = this.getMessages.bind(this);
        this.fillContactsList = this.fillContactsList.bind(this);
        this.fillMessages = this.fillMessages.bind(this);
        this.addSent = this.addSent.bind(this);
        this.eventSource = new EventSource('/newMessage');
        this.eventSource2 = new EventSource('/messageStatus');
        this.getDate = this.getDate.bind(this);
        this.getPhone = this.getPhone.bind(this);
        this.getVolunteers = this.getVolunteers.bind(this);
    }

    getContacts() {
        let id = '', unread = '', text = '', primaryRoute = '';

        fetch("/getContactsNew", {
            method: "POST"
        }).then(response => {
            this.setState({ statusMsg: '' });
            //check if response is valid
            if (response.status === 200) {
                response.json().then(data => {

                    data.forEach(i => {
                        i.name ? text = i.name : text = this.getPhone(i.phone);
                        id = i.phone;
                        i.phone == this.state.selectedContact ? unread = 0 : unread = i.readStatus;
                        primaryRoute = i.primaryRouteId;
                        this.fillContactsList(id, unread, text, primaryRoute);
                    });

                    this.setState({ gotContactList: true, contactsList: this.state.tempContacts, tempContacts: [] });

                });

            }
            else {
                //display error message
                this.setState({ statusMsg: <div class="alert alert-danger" role="alert">An Error occurred... Unable to load contacts.</div> });
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

    fillContactsList(id, unread, text, primaryRoute) {

        let tdClass = '';
        let unreadData = '';

        if (unread >= 1) {
            tdClass = 'unread';
            unreadData = `\u25C9`;
        }

        let temp = this.state.tempContacts;
        temp.push(<tr>
            <td class={tdClass}>{unreadData}</td>
            <td id={id} onClick={(e) => this.onClickContact(e)}>
                {text}
            </td><td> {primaryRoute}</td>
        </tr>);

        this.setState({ tempContacts: temp });
    }

    getMessages() {
        let mDivClass = '', mBody = '', tDivClass = '', dateSent = '', rDivClass = '';

        fetch("/loadInbox", {
            method: "POST",
            body: this.state.selectedContact,
            headers: { "Content-Type": "text/plain" }
        }).then(response => {
            //check if response is valid
            if (response.status === 200) {
                response.json().then(data => {
                    data.sort((a, b) => (a.DateCreated > b.DateCreated) ? 1 : -1);

                    data.forEach(i => {
                        if (i.readStatus == 1) {
                            rDivClass = ' new';
                        }
                        if (i.direction === 'outbound-api' && i.ToPhone == this.state.selectedContact) {
                            mDivClass = 'sent messages' + rDivClass;
                            tDivClass = 'time-sent';
                        }
                        else {
                            mDivClass = 'received messages' + rDivClass;
                            tDivClass = 'time-received';
                        }

                        mBody = i.Body;
                        this.fillMessages(mDivClass, mBody, tDivClass, this.getDate(i.DateCreated));
                        rDivClass = '';
                    });
                    this.setState({ messages: this.state.tempMessages, showMessages: true, statusMsg: '', tempMessages: [] });
                });
            }
            else {
                //display error message
                this.setState({ statusMsg: <div class="alert alert-danger" role="alert">An Error occurred... Unable to load SMS Inbox.</div> });
            }
        });
    }
    fillMessages(mDivClass, mBody, tDivClass, dateSent) {
        let temp = this.state.tempMessages;
        temp.push(
            <div class={mDivClass}>
                <p>{mBody}</p>
                <div class={tDivClass}>{dateSent}</div>
            </div>);
        this.setState({ tempMessages: temp });
    }

    addSent() {
        let cb = () => {
            this.getContacts();
            this.getMessages();
        }

        fetch("/addSent", {
            method: "POST",
            headers: { "Content-Type": "text/plain" }
        }).then(response => {
            if (response.status === 200) {
                this.setState({ showMessages: false }, cb)
            }
        })
    }

    componentDidMount() {
        fetch("/authorizeAdmin", {
            method: "POST",
        }).then(response => {
            if (response.status === 200) {
                this.setState({ loggedIn: true });
                Cookies.set('headerTitle', 'Inbox');
                this.props.setHeaderTitle('Inbox');
            }
            else {
                this.setState({ loggedIn: false });
            }
        });

        this.getVolunteers();

        let cb = () => { this.getContacts(); this.updateReadStatus(); }

        this.eventSource.addEventListener('message', event => {
            this.getMessages();
            var parsedData = JSON.parse(event.data);
            let newMessage = (
                <div class='received messages new'>
                    <p>{parsedData.m.Body}</p>
                    <div class='time-received'>now</div>
                </div>
            );
            if (('+1' + this.state.selectedContact) == parsedData.m.From) {
                let updatedMessageList = this.state.messages;
                updatedMessageList.push(newMessage);

                this.setState({ messages: updatedMessageList }, cb);
            }
            else { this.setState({ notifications: this.state.notifications + 1 }, this.getContacts); }
        });


        this.eventSource2.addEventListener('status', () => {
            this.addSent();
        });

        this.setState({ statusMsg: <div class="alert alert-secondary" role="alert">Loading contacts...</div> }, this.getContacts);
    }

    updateReadStatus() {
        fetch("/updateReadStatus", {
            method: "POST",
            body: this.state.selectedContact,
            headers: { "Content-Type": "text/plain" }
        }).then(() =>
            this.props.resetUnread()
        );

    }
    onClickContact(e) {

        let from = e.target.id;
        let fromName = document.getElementById(from).innerHTML;

        if (fromName === this.getPhone(from)) {
            fromName = '';
        }
        let cb = () => {
            this.updateReadStatus();
            this.getMessages();
            this.getContacts();
        };
        this.setState({
            selectedContact: from,
            contactName: fromName,
            showMessages: false,
            gotContact: true,
        }, cb);
    }

    onChangeReply(event) {
        this.setState({
            body: event.target.value
        });
    }

    onClickSend(event) {

        var to = this.state.selectedContact;

        if (this.state.body.length > 0) {
            fetch('/sendText', {
                method: 'POST',
                body: JSON.stringify({ recipients: to, subject: this.state.subject, body: this.state.body }),
                headers: { "Content-Type": "application/json" }
            }).then(response => {
                if (response.status === 200) {
                    document.getElementById('messageBox').value = '';

                }
                else {
                    this.setState({
                        statusMsg: <div class="alert alert-danger" role="alert">Error...Message could not be sent</div>
                    });
                }
            });
        }
    }
    onClickRefresh() {

        let cb=()=> {
            this.getContacts();
            this.getMessages();
        }

        this.setState({
            statusMsg: <div class="alert alert-secondary"
                role="alert">Loading SMS Inbox...</div>
        });

        fetch("/updateInbox", {
            method: "Post"
        }).then(response => {
            console.log(response.status);
            this.setState({ showMessages: false }, cb);
        });

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

        var newPhone = '';

        if (phone.length > 0) {

            var areaCode = phone.substring(0, 3);
            var three = phone.substring(3, 6);
            var four = phone.substring(6, 11);

            newPhone = '(' + areaCode + ') ' + three + '-' + four;
        }

        return newPhone;
    }

    onChangeContactSearch(selectedContact) {
        var element = document.getElementById(selectedContact.key);
        if (element) {
            element.scrollIntoView({ block: "start", inline: "nearest" });
            element.click();
        }else{
            window.InboxComponent.setState({selectedContact:'', messages:'', contactName: 'No recent conversations found'});
        }
    }

    render() {

        if (!this.state.loggedIn) {
            this.props.setAdmin();
            return <Redirect to="/signIn" />;
        }

        else {

            return (
                <Fragment>
                    {this.state.statusMsg}
                    <button class='refresh' id='refresh' onClick={() => this.onClickRefresh()}>
                        &#10227;
                        </button>
                    <div class='inbox-container'>
                        <div class='contacts-container'>
                            <div class='search-contacts-container'>
                                <DataListInput inputClassName={'contact-search'} itemClassName={'volunteer-input'}
                                dropDownLength={'6'} placeholder={'Search Contacts...'} items={this.state.volNames}
                                dropdownClassName={/*'contact-search'*/''} onSelect={this.onChangeContactSearch} />
                            </div>
                            <div class='contacts-scroll-container'>
                                <table class='contacts-table'>
                                    {this.state.contactsList}
                                </table>
                            </div>
                        </div>
                        <div class='messages-container'>
                            <table class='number'>
                                <tr>
                                    <td class='name-left'>{this.state.contactName}</td>
                                    <td class='number-right'>{this.getPhone(this.state.selectedContact)}</td>
                                </tr>
                            </table>
                            <div class='chat-flex-container'>
                                <div class='chat-container'>
                                    {this.state.messages}
                                </div>
                            </div>
                            <div class='reply-box'>
                                <textarea id='messageBox' placeholder="Type a message..." onChange={event => this.onChangeReply(event)} />
                                <button onClick={event => this.onClickSend(event)}>Send</button>
                            </div>
                        </div>
                    </div>
                </Fragment>
            );
        }
    }
}
