import React from 'react';
import { Component } from 'react';

export default class ViewAndEditVolTypes extends Component {
    constructor(props){
        super(props);
        this.state={
            vol_ID:702,
            volTypes:[]
        }
    }

componentDidMount(){
    this.getCurrentVolTypes();
}
getCurrentVolTypes() {

    fetch('/getCurrVolunteerTypes', {
        method: 'POST',
        body: this.state.vol_ID,
        headers: { "Content-Type": "text/plain" }
    }).then(response => {
        if (response.status === 200) {
            response.json().then(data => {
                let list = data.map(v =>
                    v.type_ID);
                this.setState({
                    currentVolTypes: list,
                    modifiedVolTypes: Array.from(list)
                }, this.getVolunteerTypes);
            })
        } else if (response.status === 204) {
            this.setState({
                currentVolTypes: [],
                modifiedVolTypes: [],
            }, this.getVolunteerTypes);
        }
    });
}

getVolunteerTypes() {

    fetch('/getVolunteerTypes', {
        method: 'POST'
    })
        .then(response => {
            response.json().then(data => {
                let list = data.map(v =>
                    <Fragment >
                        <label class='check-box-labels-not-bold'><input name='volTypeCheckbox' type='checkbox' defaultChecked={this.hasVolType(v.type_ID)} id={v.type_ID} onChange={(e) => this.onChangeVolTypeCheckbox(e)} />{v.typeDescription}</label>&nbsp;&nbsp;</Fragment>
                );
                this.setState({
                    volTypes: list
                });
            })
        });
}

onChangeVolTypeCheckbox(e) {
    let checked = e.target.checked;
    let temp = this.state.modifiedVolTypes;
    if (checked) {
        temp.push(e.target.id);
        this.setState({ modifiedVolTypes: temp });
    } else {
        let index = this.state.modifiedVolTypes.indexOf(e.target.id);
        temp.splice(index, 1);
        this.setState({ modifiedVolTypes: temp });
    }
}

hasVolType(type_ID) {

    if (this.state.currentVolTypes.indexOf(type_ID) >= 0) {
        return true;
    } else {
        return false;
    }
}
userModified() {

    if (this.state.modifiedVolTypes.length === this.state.currentVolTypes.length) {
        //check that all values are the same (we don't necessarily care about the order, just don't want to make the extra db call if not necessary.)
        this.state.currentVolTypes.forEach(t => {
            if (this.state.modifiedVolTypes.indexOf(t) < 0) {
                return true;
            }
        });
        return false;
    }
    return true;
}
render(){
    return(
        this.state.volTypes
    );
}
}