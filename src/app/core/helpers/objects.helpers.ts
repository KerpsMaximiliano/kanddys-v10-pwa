export const deleteIrrelevantDataFromObject = (dataObject) => {
    if(dataObject) {
      Object.keys(dataObject).forEach(key => {
        if(typeof dataObject[key] !== 'object' && dataObject[key].length === 0) {
          delete dataObject[key];
        }
    
        if(typeof dataObject[key] === 'object' && !Array.isArray(dataObject[key])) {
          dataObject[key] = deleteIrrelevantDataFromObject(dataObject[key]);
        }
    
        if(typeof dataObject[key] === 'object' && Array.isArray(dataObject[key])) {
          dataObject[key].forEach((element, index) => {
            //Delete irrelevant content from array indexes that arent nested arrays
            if(typeof element === 'object' && !Array.isArray(element)) {
              dataObject[key][index] = deleteIrrelevantDataFromObject(element);
            }
    
            //Delete irrelevant content from array indexes that are nested arrays
            if(typeof element === 'object' && Array.isArray(element)) {
              element.forEach((innerElement, index2) => {
                if(
                  typeof innerElement === 'object' && 
                  !Array.isArray(innerElement)
                ) {
                  dataObject[key][index][index2] = deleteIrrelevantDataFromObject(innerElement);
                }
              })
            }
          })
        }
      })
    
      return dataObject;
    }
}