import axios from 'axios';

const tcddApi = {
  searchTickets: async (params: {
    fromStationId: string;
    toStationId: string;
    date: string;
  }) => {
    return axios.get('/api/v1/tcdd/search', { params });
  },
};

export { tcddApi };
