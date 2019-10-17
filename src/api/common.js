import moment from "moment";

const convertResponse = (response) => {
    let r = { 
        result: response.status >= 200 && response.status < 300,
        message: response.data.message,
        data: response.data
    };
    if(response.headers["last-modified"]){
        let time = moment.utc(response.headers["last-modified"]);
        time.local();
        r.lastModified = time.valueOf();
    }
    if(r.data.time){
        let time = moment.utc(r.data.time);
        time.local();
        r.data.time = time.valueOf();
    }
    return Promise.resolve(r);
}

const convertError = (error) => {
    return Promise.resolve({
        result: false,
        message: error.status ? error.response.data.message : error.message,
        unauthorized: error.status && error.response.status === 401
    });
}

export {convertResponse, convertError}