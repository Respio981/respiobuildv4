import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000, // 5 seconds timeout
});

export const fetchListings = async () => {
  try {
    const response = await api.get('/listings');
    return response.data;
  } catch (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }
};

export const createListing = async (listing) => {
  try {
    const response = await api.post('/listings', listing);
    return response.data;
  } catch (error) {
    console.error('Error creating listing:', error);
    throw error;
  }
};

export const searchListings = async (mlsNumber) => {
  try {
    const response = await api.get('/listings/search', { params: { mlsNumber } });
    return response.data;
  } catch (error) {
    console.error('Error searching listings:', error);
    throw error;
  }
};

export const sendMessage = async (chatId, message) => {
  try {
    const response = await api.post(`/chats/${chatId}/messages`, message);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};