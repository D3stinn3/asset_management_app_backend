function isAnyEmpty(arr){
    /*
        arr - arr is an array of variables of any type
        RETURNS true if any element is empty and false if all items are full
    */
   let isEmpty = false
   // Goes through all the items and returns if any is empty
   for (elem in arr){
        if (elem == null){
            isEmpty == true
        }
   }
   return isEmpty
}

module.exports = {
    isAnyEmpty
}