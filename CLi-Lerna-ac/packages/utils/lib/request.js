import axios from 'axios';

const BASE_URL = 'http://yuyayong.top:5001';

const service = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
})

function onSuccess(response) {
  return response.data;
}

function onError(error) {
  return Promise.reject(error);
}

service.interceptors.response.use(onSuccess, onError);


export default service;