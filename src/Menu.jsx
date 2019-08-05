import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import logo from './coloredlogo.jpg';
import { Fragment, Component } from 'react';




export default class Menu extends Component 
/*const Menu = (props) =>*/ {

    constructor(props){
        super(props);

       

    }



    logoutButton = () => {
        if (this.props.userLoggedIn || this.props.adminLoggedIn) {
            return (
                <li>
                    <Link to='/signIn' class='buttons'>Logout</Link>
                </li>);
        }
    }


    render(){
    return (
        <Fragment>
            <table class='main-page-header'>
                <tr>
                    <td class='header-menu-row'>
                        <ul class='header-menu'>
                            {this.logoutButton()}
                            <li>
                                <Link to='/keyPad' class='buttons'>Volunteers</Link>
                            </li>
                            <li>
                                <Link to='/AdminHome' class='buttons'>Admin </Link>
                                <label class='unreadCount'>{this.props.unreadCount}</label>
                            </li>

                        </ul>
                    </td>
                </tr>
                <tr>
                    <td class='header-title-row h1' id='header-title-row'>{this.props.headerTitle}</td>
                </tr>
            </table>
            <a href='/keyPad'><img class='tsq-logo' src={logo} alt='TSQ Logo' /></a>
        </Fragment>
    );
    }
}





