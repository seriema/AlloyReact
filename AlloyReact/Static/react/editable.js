import hoistStatics from 'hoist-non-react-statics';
import React, { Component } from 'react';

const defaultValueUpdater = (value, propName, props, propertyDetails = null) => {
    return {
        [propName]: value
    }
}

const editable = (WrappedComponent, onValueChange = defaultValueUpdater) => {
    // by default, new state will be created by setting the property value to a prop named propertyName
    // when having prop with different name, pass onValueChange as the prop name
    if (typeof onValueChange === 'string') {
        const actualPropName = onValueChange;
        onValueChange = (value, propName, props, propertyDetails) => defaultValueUpdater(value, actualPropName, props, propertyDetails)
    }
    class Connect extends Component {
        constructor(props) {
            super(props)
            this.propertyName = props.propertyName;
            this.state = onValueChange(props[toCamelCase(this.propertyName)], this.propertyName, props)
        }

        componentDidMount() {
            if (document.getElementsByTagName("HTML")[0]['dataset'].editMode !== 'True') { // We are in edit mode
                return
            }

            window.addEventListener('load', () => {
                // Subscribe to *all* property updates in on-page edit mode
                window['epi'].subscribe("beta/contentSaved", async (propertyDetails) => {
                    // Ignore update if it wasn't successful, for example if there were validation errors
                    if (!propertyDetails.successful) {
                        return;
                    }

                    const changedProperty = propertyDetails.properties.find(p => p.name.toLowerCase() === this.propertyName.toLowerCase())
                    if (!changedProperty)  {
                        return;
                    }

                    const newState = Object.assign({}, this.state, await onValueChange(changedProperty.value, this.propertyName, this.props, propertyDetails))
                    this.setState(newState);
                })
            })
        }

        render() {
            return <WrappedComponent {...this.props} {...this.state} />
        }
    }

    Connect.WrappedComponent = WrappedComponent
    Connect.displayName = `Editable(${getDisplayname(WrappedComponent)})`
    return hoistStatics(Connect, WrappedComponent)
}

const toCamelCase = str => str ? `${str.substr(0, 1).toLowerCase()}${str.substr(1)}` : str
const getDisplayname = WrappedComponent => WrappedComponent.displayName || WrappedComponent.name || 'Component'
export default editable;