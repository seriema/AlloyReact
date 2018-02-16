import React, { Component } from "react";
import Clock from "./Clock";
import editable from './editable';

class ReactBlock extends Component {
    constructor(props) {
        super(props);

        this.state = {
            number: props.number,
            firstRender: new Date()
        };
    }

    render() {
        return (
            <div>
                This React component was rendered at <strong>{this.state.firstRender.toLocaleTimeString("sv-SE")}</strong> with a number of <strong>{this.state.number}</strong>.<br/><br/>
                The current value of the <strong>{this.props.propertyName}</strong> property is <strong>{this.props.number}</strong>, and the current time is: <strong><Clock /></strong>
            </div>
        );
    }
}

export default editable(ReactBlock, 'number');