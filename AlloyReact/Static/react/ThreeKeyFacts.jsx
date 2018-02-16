import React from "react";
import editable from './editable';

class ThreeKeyFacts extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            currentIndex: 0
        };

        this.next = this.next.bind(this);
        this.previous = this.previous.bind(this);
    }

    render() {
        let bonusContentToDisplay = null;

        if (this.state.currentIndex === this.props.facts.length - 1) {
            bonusContentToDisplay = <p data-epi-property-name="BonusContent" data-epi-property-render="none" data-epi-property-edittype="floating">{this.props.bonusContent}</p>;

            console.log(`Reached fact ${this.state.currentIndex + 1}, bonus content will be displayed`, bonusContentToDisplay);
        }

        return(
            <div>
                <h2>Fact #{this.state.currentIndex + 1}</h2>
                <p data-epi-property-name={this.props.facts[this.state.currentIndex].propertyName} data-epi-property-render="none" data-epi-property-edittype="floating">{this.props.facts[this.state.currentIndex].fact}</p>
                <button onClick={this.previous} disabled={this.state.currentIndex < 1}>Previous</button> <button onClick={this.next} disabled={this.state.currentIndex >= this.props.facts.length - 1}>Next</button>
                {bonusContentToDisplay}
            </div>
        );
    }

    next() {
        this.setState({
            currentIndex: this.state.currentIndex + 1
        });
    }

    previous() {
        this.setState({
            currentIndex: this.state.currentIndex - 1
        });
    }

    componentDidUpdate() {
        if (window.epi && window.epi.publish) {
            // Publishing the "beta/domUpdated" event will tell episerver UI that the dom has changed 
            // and that it needs to remap its overlays.
            window.epi.publish("beta/domUpdated");
        }
    }
}

const onValueChange = (value, propName, props, propertyDetails) => {
    if (!propertyDetails) {
        return Object.assign(props, value);
    }
    let state = {};
    for (let i = 0; i < propertyDetails.properties.length; i++) {

        const savedProperty = propertyDetails.properties[i];

        for (let j = 0; j < props.facts.length; j++) {

            // Fact updated
            if (savedProperty.name.toUpperCase() === props.facts[j].propertyName.toUpperCase()) {

                var factsCopy = Object.assign({}, props.facts);

                factsCopy[j].fact = savedProperty.value;

                state = Object.assign(state, { facts: factsCopy });
            }
        }

        // Bonus content updated
        if (savedProperty.name === "bonusContent") {
            state = Object.assign(state, { bonusContent: savedProperty.value });
        }
    }
    return state;
};
export default editable(ThreeKeyFacts, onValueChange);