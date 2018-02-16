/* This component renders a list of pages, for example News and Events.
   On-page editing is supported for block properties only, such as the NewsList
   property on the NewsPage page type. It does not support on-page editing
   for PageListBlock blocks being edited independently. */

   import React from "react";
   import editable from './editable';
   
   const ReactBlock = (props) => {
       // Create a div for each page
       var pages = props.pages.map((page, i) => {
           if (i >= props.count) {
               return null;
           }
   
           return (
               <div className={'listResult ' + page.cssClass} key={'listResult-' + props.propertyName + '-' + i}>
                   <h3><a href={page.url}>{page.name}</a></h3>
                   {props.includePublishDate ? <p className="date">{page.date}</p> : null}
                   {props.includeIntroduction ? <p>{page.description}</p> : null}
                   <hr/>
               </div >
           );
       });
   
       // Render the heading and the page list
       return <div><h2>{props.heading}</h2><hr />{pages}</div>;
   };
   
   const onValueChange = async (value, propName, props, propertyDetails) => {
       if (!propertyDetails) {
           return Object.assign(props, value);
       }
   
       // Check if property change is for the current content
       if (compareWithoutWorkId(propertyDetails.contentLink, props.contentLink)) {
   
           // Iterate updated properties
           for (let i = 0; i < propertyDetails.properties.length; i++) {
   
               const savedProperty = propertyDetails.properties[i];
   
               // Check if the updated property should be handled by this component
               if (savedProperty.name.toUpperCase() === props.propertyName.toUpperCase()) {
                   return await refreshData(savedProperty, props);
               }
           }    
       }
       return {};
   };
   export default editable(ReactBlock, onValueChange);
   
   /** Update the component state based on the property value, retrieving new data from the API when necessary */
   const refreshData = async (property, props) => {
   
       if (dataRefreshRequired(property, props)) {
   
           // Retrieve data from API (using jQuery since it's part of Alloy)
           const pages = await $.getJSON('/PageListBlock/Pages?contentLink=' + props.contentLink + "&propertyName=" + property.name);
            // Update the component state based on the new property value and the API result 
            return Object.assign({ pages }, property.value);
   
       } else {
           // No API call necessary, simply update the state based on the new property value
           return property.value;
       } 
   };
   
   /** Determines if a property update requires the component to retrieve new data from the API. */
   const dataRefreshRequired = (savedProperty, props) => {
   
       // Defines which properties should *not* trigger an API call
       const propertiesNotRequiringRefresh = ["includeIntroduction", "includePublishDate", "heading"];
   
       const value = savedProperty.value;
   
       // Compare the updated property value to the component state
       for (var prop in value) {
           if (props.hasOwnProperty(prop)) {
               if (props[prop] !== value[prop] && !propertiesNotRequiringRefresh.includes(prop)) {
                   switch (prop) {
                       case "count":
                           return value[prop] > props[prop]; // API call is only needed if the maximum number of items in the list is *increased*
                       case "categoryFilter":
                           return JSON.stringify(value[prop]) !== JSON.stringify(props[prop]); // API call is only needed if actual category selection has changed
                       default:
                           return true;
                   }
               }
           }
       }
   
       return false;
   };
   
   /** Compare content reference strings, ignoring any work IDs */
   const compareWithoutWorkId = (firstContentLink, secondContentLink) => {
       return firstContentLink.split('_')[0] === secondContentLink.split('_')[0];
   };