import axios from 'axios';
import {
  BACKEND_DEV_URL,
  BACKEND_PROD_URL,
  BARE_METAL_BACKEND_URL,
} from '../envs/urls';
import { MODE } from '../envs/vars';

export const baseURL = MODE === 'DEV' ? BACKEND_DEV_URL : BACKEND_PROD_URL;
export const httpClient = axios.create({
  baseURL,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  },
});

export const privateHttpClient = axios.create({
  baseURL,
  withCredentials: true,
});

export const httpClientBareMetal = axios.create({
  baseURL: BARE_METAL_BACKEND_URL,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  },
});
