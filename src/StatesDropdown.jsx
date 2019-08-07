import React from 'react';
import { Component } from 'react';

export default class StatesDropdown extends Component {

/*
This component renders a dropdown of all the states in the currentRoutesView in our DB.
It requires props:
1.'selectedRoute' which is a function which takes the value of the
selected route to be passed to the parent component
*/

    constructor(props) {
       super(props);
        this.state = {
            states: [],
        }
    }

    componentDidMount() {
        fetch('/getStates', {
            method: 'POST'
        }).then(response => {
                response.json().then(data => {
                    this.setState({ states: data });
                })
            });
    }

    handleChange(event) {
        this.props.selectedState(event.target.value);
    }

    render() {

        let stateVal = this.props.defaultStateVal; 

        let options = this.state.states.map(s =>
            s.state_ID == stateVal?
                    <option selected id={s.state_ID}>{s.abbr}</option>:
                    <option  value={s.state_ID}>{s.abbr}</option>
            );
        return (
            <select id='state' onChange={event=>this.handleChange(event)}>
                    {options}
            </select>  
        );
    }
}