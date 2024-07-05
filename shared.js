export function valsWithSubstring(obj, substring) {
    const matchingKeyValuePairs = [];
    for (const key in obj) {
        if (key.includes(substring)) {
            matchingKeyValuePairs.push([key, obj[key]]);
        }
    }
    matchingKeyValuePairs.sort((a, b) => a[0].localeCompare(b[0]));
    return matchingKeyValuePairs.map(pair => pair[1]);
}