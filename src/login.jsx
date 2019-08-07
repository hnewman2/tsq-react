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
            resetPass: false,
            newPass: '',
            confirmPass: '',
        };   

        this.handleLogin = this.handleLogin.bind(this);
        this.handleResetPass = this.handleResetPass.bind(this);


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

    handleResetPass(event){
        event.preventDefault();
        if(this.state.newPass === this.state.confirmPass){
            fetch("/resetPassword",{
                method: "POST",
                body: JSON.stringify(this.state),
                headers: {"Content-Type": "application/json"}
            }).then(response => {
                //check if response is valid
                if(response.status === 200) {
                    this.setState({
                        errorMsg: <div class="alert alert-success" role="alert">Password updated successfully. Please Login to continue</div>,
                        resetPass: false,
                    });
                }else{
                    this.setState({errorMsg: <div class="alert alert-danger" role="alert">Error... Unable to reset password</div>});
                }
            });

        }else{
            this.setState({
                errorMsg: <div class="alert alert-danger" role="alert">Passwords Must Match</div>
            });
        }
    }


    onChangeUserName(event){
        this.setState({ userName: event.target.value});
    } 

    onChangePass(event){
        this.setState({ password: event.target.value});
    }

    onChangeNewPass(event){
        this.setState({ newPass: event.target.value});
    }

    onChangeConfirmPass(event){
        this.setState({ confirmPass: event.target.value});
    }

    onClickResetPass(){
        this.setState({resetPass: true});
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
        else if(this.state.resetPass){
            return(
            <Fragment>            
                {this.state.errorMsg}
                <div class='reset-pass-form'>
                <form onSubmit= {this.handleResetPass} >
                        <h3>Reset Password</h3><br/>                    
                        <label>Username:</label><br/>
                        <input type= "text" name="userName" onChange ={event=> this.onChangeUserName(event)} required/><br/><br/>
                        <label>Old Password:</label><br/>
                        <input type="password"  onChange = {event=> this.onChangePass(event)} required/><br/><br/>
                        <label>New Password:</label><br/>
                        <input type="password"  onChange = {event=> this.onChangeNewPass(event)} required/><br/><br/>
                        <label>Confirm Password:</label><br/>
                        <input type="password"  onChange = {event=> this.onChangeConfirmPass(event)} required/><br/><br/>
                        <input type= 'submit' value='Reset' class='login-button btn btn-lg btn-info'/>
                </form>
                <button onClick={()=> this.setState({resetPass:false})} class='reset-pass-button btn btn-sm btn-secondary'>Return to Login</button>
                
                </div>
                </Fragment>);
        }
        else{
            return( 
                <Fragment>            
                {this.state.errorMsg}
                <div class='login-form'>
                <form onSubmit= {this.handleLogin} >                    
                        <label>Username:</label><br/>
                        <input type= "text" name="userName" onChange ={event=> this.onChangeUserName(event)} required/><br/><br/>
                        <label>Password:</label><br/>
                        <input type="password" name="password" onChange = {event=> this.onChangePass(event)} required/><br/><br/>
                        <input type= 'submit' value='Login' class='login-button btn btn-lg btn-info'/>
                </form>
                <button onClick={()=> this.onClickResetPass()} class='reset-pass-button btn btn-sm btn-secondary'>Reset Password</button>
                </div>
                </Fragment>

            );
        }
    }
}