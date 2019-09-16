import React from 'react';
import { Component, Fragment } from 'react';
import './App.css';
import Main from './Main';
import Menu from './Menu';
import Cookies from 'js-cookie';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            admin: false,
            currentVol: Cookies.get('currVol') ? Cookies.getJSON('currVol') : '',
            selectedContact: '',
            userLoggedIn: Cookies.get('authCookie') ? true : false,
            adminLoggedIn: Cookies.get('adminAuthCookie') ? true : false,
            headerTitle: Cookies.get('headerTitle'),
            unreadCount:0,
        };
        this.eventSource = new EventSource('/newMessage');
    }
    componentDidMount(){
        this.getUnreadCount();

        this.eventSource.addEventListener('message', () => {
            this.getUnreadCount();
        });

    }

    getUnreadCount=()=>{
        
        fetch("/unreadCount",{
            method:'POST'
        }).then(response=>{
            if (response.status===200){

                response.json().then(data=>
                    this.setState({unreadCount:data[0].count})
                    );
              
            }
        });
    }

    render() {

      return ( 
        <Fragment>
            <Menu userLoggedIn = { this.state.userLoggedIn }
                  adminLoggedIn = { this.state.adminLoggedIn }
                  headerTitle = { this.state.headerTitle }
                  unreadCount={this.state.unreadCount}
            />
            
            {this.state.statusMsg}
            <Main setHeaderTitle = {(title) => this.setState({ headerTitle: title })}
                  setAdmin = {() => this.setState({ admin: true })}
                  resetAdmin = {() => this.setState({ admin: false })}
                  admin = { this.state.admin }
                  setCurrentVolunteer = {(vol) => {this.setState({ currentVol: vol }); Cookies.set('currVol', vol, {expires: 1/48});}}
                  currentVolunteer = { this.state.currentVol }
                  setSelectedContact = {(SC) => this.setState({ selectedContact: SC })}
                  selectedContact = { this.state.selectedContact }
                  userLoggedIn = { this.state.userLoggedIn }
                  adminLoggedIn = { this.state.adminLoggedIn }
                  logInUser = { () => this.setState({ userLoggedIn: true })}
                  logOutUser = {() => this.setState({ userLoggedIn: false }) }
                  logInAdmin = {() => this.setState({ adminLoggedIn: true })}
                  logOutAdmin = {() => this.setState({ adminLoggedIn: false }) }
                  resetUnread={()=>{this.getUnreadCount()}}
          />
        </Fragment>
    );
    }
}

export default App;