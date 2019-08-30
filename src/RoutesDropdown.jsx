import React from 'react';
import { Component } from 'react';

export default class RoutesDropdown extends Component {

    /*
    This component renders a dropdown of all the routes in the currentRoutesView in our DB.
    It requires props:
    1.'selectedRoute' which is a function which takes the value of the
    selected route to be passed to the parent component
    2. 'optional' which is an object with two fields: val and text, to be displayed as the first option in the drop down
    ex: <RoutesDropdown selectedRoute = {val => this.setState({currRoute: val})}/>
    */

    constructor(props) {
        super(props);
        this.state = {
            routes: [],
        }
    }

    componentDidMount() {
        var path;
        if (this.props.getOutstandingRoutes) {
            path = '/outstandingRoutes';
        }
        else {
            path = '/getRoutes'
        }

        fetch(path, {
            method: 'POST'
        }).then(response => {
            response.json().then(data => {
                this.setState({ routes: data });
                //this.setState({ gotRoutes: true });
            })
        });
    }


    handleChange(event) {
        this.props.selectedRoute(event.target.value);
    }

    render() {

        var pRID = this.props.primaryRouteID


        let options = this.state.routes.map(r =>
            r.route_ID == pRID ?
                <option selected id={r.route_ID}>{r.route_ID}{r.type == '0'?'-pu':''}</option>
                : <option >{r.route_ID}{r.type == '0'?'-pu':''}</option>
        );

        return (
            <select id={this.props.id} onChange={event => this.handleChange(event)}>
                <option value={this.props.optional.val}>{this.props.optional.text}</option>
                {options}
            </select>
        );
    }
}