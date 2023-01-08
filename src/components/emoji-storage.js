
const LS_STORAGE_KEY = 'EMOTIOME';

const emojiStorage = {
    length: Object.entries(JSON.parse(localStorage.getItem(LS_STORAGE_KEY) || '{}')).length,
    getItems() {
        return JSON.parse(localStorage.getItem(LS_STORAGE_KEY) || '{}');
    },
    addItem(date, newData) {
        const currentData = JSON.parse(localStorage.getItem(LS_STORAGE_KEY) || '{}');

        currentData[date] = newData;

        localStorage.setItem(LS_STORAGE_KEY, JSON.stringify(currentData));
        this.length += 1;
    },
    hasDate(date) {
        const currentData = JSON.parse(localStorage.getItem(LS_STORAGE_KEY) || '{}');

        return date in currentData
    }
}

export default emojiStorage;