import React from 'react';
import {Component, Fragment} from 'react';
import {Redirect} from 'react-router-dom';
import Cookies from 'js-cookie';

export default class Login extends Component{

    constructor(props){
        super(props);

        if(props.adminLoggedIn) {
            //admin wants to log out
            fetch("/logoutAdmin", {method: "POST"});
            props.logOutAdmin();
        }

        if(!props.admin && props.userLoggedIn) {
            //user wants to log out
            fetch("/logoutUser", {method: "POST"});
            props.logOutUser();
        }

         this.state= {
            userName:'', 
            password:'',
            loggedIn: false, 
            errorMsg: '',
            admin: props.admin,
        };   

        this.handleLogin = this.handleLogin.bind(this);


    }


    componentDidMount() {

        document.onclick= ()=>{
            this.setState({
                errorMsg: ''
            });
        }

        if(this.state.admin) {
            Cookies.set('headerTitle', 'Please Login for Admin Access');
            this.props.setHeaderTitle('Please Login for Admin Access');
        }else{
            Cookies.set('headerTitle','Welcome to Tomchei Shabbos of Queens');
            this.props.setHeaderTitle('Welcome to Tomchei Shabbos of Queens');
        }
    }

    handleLogin(event) {
        event.preventDefault(); 
        fetch("/login",{
            method: "POST",
            body: JSON.stringify(this.state),
            headers: {"Content-Type": "application/json"}
        }).then(response => {
            //check if response is valid
            if(response.status === 200) {
                if(this.state.admin) {
                    this.props.logInAdmin();
                }else{
                    this.props.logInUser();
                }
                this.setState({loggedIn:true});
            }else{
                this.setState({errorMsg: <div class="alert alert-danger" role="alert">Invalid Credentials</div>});
            }
        });
    }

    onChangeUserName(event){
        this.setState({ userName: event.target.value});
    } 

    onChangePass(event){
        this.setState({ password: event.target.value});
    }

    render() {

        if(this.state.loggedIn){
            if(this.props.admin) {
                this.props.resetAdmin();
                return(<Redirect to='/AdminHome'/> );
            }
            else {
                return(<Redirect to='/keyPad'/> );
            }
        }
        else{
            return( 
                <Fragment>            
                {this.state.errorMsg}
                <form onSubmit= {this.handleLogin} class='login-form'>                    
                        <label>Username:</label><br/>
                        <input type= "text" name="userName" onChange ={event=> this.onChangeUserName(event)} required/><br/><br/>
                        <label>Password:</label><br/>
                        <input type="password" name="password" onChange = {event=> this.onChangePass(event)} required/><br/><br/>
                        <input type= 'submit' value='Login' class='login-button'/>
                </form>
                </Fragment>

            );
        }
    }
}