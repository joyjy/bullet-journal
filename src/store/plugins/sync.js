import _ from "lodash"
import moment from "moment";

const syncPlugin = (store) => {

    let debouncedSave = _.debounce((type) => {
        console.log("save after " + type);
        store.dispatch("save")
    }, 2000, { 'maxWait': 10000 });

    store.subscribe((mutation) => {
        switch(mutation.type){
            case "lastSynced":
            case "lastChanged":
            case "flattern":
            case "focus":
            case "unfocus":
            case "dragging":
            case "drawerPinned":
                break;
            default:
                store.commit("lastChanged", moment().valueOf());
                debouncedSave(mutation.type);
        }
    });
}

export default syncPlugin;