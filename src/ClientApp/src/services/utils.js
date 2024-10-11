class Utils {
    isEmpty(obj) {
        return obj && Object.keys(obj).length === 0
            && Object.getPrototypeOf(obj) === Object.prototype;
    }

    validName(name) {
        if (!name) return false;
        let pattern = /[^a-z0-9_-]/gi;
        return !pattern.test(name);
    }
    validNameWithSpace(name){
        if (!name) return false;
        let pattern = /[^a-z0-9_-\s]/gi;
        return !pattern.test(name);
    }

    // ^([0-9]{1,})?(\.)?([0-9]{1,})?$   => This is a regex for valid number
    isValidNumber(str) {
        if (typeof str != "string" && typeof str != "number") return false // we only process strings!  
        return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
            !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
    }

    minus(arr1, arr2, maxYear) {
        return arr1.filter(val1 => {
            if(val1 > maxYear) return false;
            if(arr2.find(val2 => val2 == val1)) return false;
            return true;
        });
    }
    getFileExtension(filename){
        return filename.split('.').pop()
    }
}

export default Utils;