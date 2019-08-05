import React from 'react';
import { Component, Fragment } from 'react';
import { Redirect } from 'react-router-dom';
import Cookies from 'js-cookie';

export default class FormUpload extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loggedIn: true,
            statusMsg: ''
        };
    }

    componentDidMount() {

        document.onclick = () => {
            this.setState({
                statusMsg: ''
            });
        }

        fetch("/authorizeAdmin", {
            method: "POST",
        }).then(response => {
            if (response.status === 200) {
                this.setState({ loggedIn: true });
                Cookies.set('headerTitle', 'Import Routes');
                this.props.setHeaderTitle('Import Routes');
            }
            else {
                this.setState({ loggedIn: false });
            }
        });

        document.forms['uploadRoutesForm'].addEventListener('submit', (event) => {
            event.preventDefault();
            // TODO do something here to show user that form is being submitted
            fetch(event.target.action, {
                method: 'POST',
                body: new FormData(event.target) // event.target is the form
            }).then((response) => {
                if (response.status === 200) {
                    this.setState({ statusMsg: <div class="alert alert-success" role="alert">Routes imported successfully!</div> })
                }
                else {
                    this.setState({ statusMsg: <div class="alert alert-danger" role="alert">An error occurred while importing routes. Please check that you uploaded the correct file.</div> })
                }
            })
        });
    }

    render() {
        if (!this.state.loggedIn) {
            this.props.setAdmin();
            return <Redirect to="/signIn" />;
        }

        return (
            <Fragment>
                {this.state.statusMsg}
                <div class='upload-form'>
                    <form id='uploadRoutesForm' action="/FormUpload" method="post" encType="multipart/form-data">
                        <input type="file" name="fileImport" required/>
                        <br />
                        <br />
                        <button class='file-upload-button btn btn-info btn-lg' type="submit">Upload</button>
                    </form>
                </div>
            </Fragment>
        );
    }
}



