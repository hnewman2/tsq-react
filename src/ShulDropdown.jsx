import React from 'react';
import { Component } from 'react';

export default class ShulDropdown extends Component {

    /*
    This component renders a dropdown of all the states in the currentRoutesView in our DB.
    It requires props:
    1.'selectedRoute' which is a function which takes the value of the
    selected route to be passed to the parent component
    */

    constructor(props) {
        super(props);
        this.state = {
            shuls: [],
        }
    }

    componentDidMount() {
        fetch('/getShuls', {
            method: 'POST'
        }).then(response => {
            response.json().then(data => {
                this.setState({ shuls: data });
            })
        });
    }

    handleChange(event) {
        this.props.selectedShul(event.target.value);
    }

    render() {
        let shulval = this.props.defaultShulVal;
        let options = this.state.shuls.map(s =>
            s.shul_ID == shulval ?
            <option selected value={s.shul_ID}>{s.name}</option>
            :<option value={s.shul_ID}>{s.name}</option>
        );

        return (
            <select class='shul-dropdown' id='shuls' onChange={event => this.handleChange(event)}>
                {options}
            </select>
        );

    }
}