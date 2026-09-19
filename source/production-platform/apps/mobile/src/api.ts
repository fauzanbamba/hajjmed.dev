import * as SecureStore from 'expo-secure-store';
const base=process.env.EXPO_PUBLIC_API_URL??'http://localhost:4000/api/v1';
export async function api<T>(path:string,init:RequestInit={}){const token=await SecureStore.getItemAsync('accessToken');const res=await fetch(`${base}${path}`,{...init,headers:{'content-type':'application/json',...(token?{authorization:`Bearer ${token}`}:{ }),...init.headers}});const data=await res.json();if(!res.ok)throw new Error(data.error?.message??'Request failed');return data as T}
export const saveToken=(token:string)=>SecureStore.setItemAsync('accessToken',token);
