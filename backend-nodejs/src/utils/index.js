const _ = require('lodash')

const getInfoData = ({ fields = [], object = {} }) => {
    return _.pick(object, fields)
}

const getSelectData = (select = []) => {
    return Object.fromEntries(select.map(elem => [elem, 1]))
}

const getUnSelectData = (select = []) => {
    return Object.fromEntries(select.map(elem => [elem, 0]))
}

// Removed null/undefine from nested object payload
const validateNestedObjectParser = obj => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    // Create a copy of the object to avoid mutating the original
    const newObj = Array.isArray(obj) ? [] : {};

    Object.keys(obj).forEach(key => {
        const value = obj[key];

        // Recursively clean nested objects
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            newObj[key] = validateNestedObjectParser(value);
        } else if (value !== null && value !== undefined) {
            newObj[key] = value;
        }
    });

    return newObj;
}

// Flat nested object for updating
const updateNestedObjectParse = (obj, parentKey = '', updateObj = {}) => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    Object.keys(obj).forEach(key => {
        const fullKey = parentKey ? `${parentKey}.${key}` : key;
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            updateNestedObjectParse(obj[key], fullKey, updateObj);
        } else {
            updateObj[fullKey] = obj[key];
        }
    });

    return updateObj;
}

module.exports = {
    getInfoData,
    getSelectData,
    getUnSelectData,
    updateNestedObjectParse,
    validateNestedObjectParser
}