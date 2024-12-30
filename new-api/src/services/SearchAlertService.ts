import SearchAlert from '../models/SearchAlert';

class SearchAlertService {
  private static instance: SearchAlertService;

  private constructor() {}

  public static getInstance(): SearchAlertService {
    if (!SearchAlertService.instance) {
      SearchAlertService.instance = new SearchAlertService();
    }
    return SearchAlertService.instance;
  }

  async createSearchAlert(userId: string, searchData: {
    fromStationId: string;
    toStationId: string;
    date: string;
    cabinClass: string;
    departureTimeRange: {
      start: string;
      end: string;
    };
  }) {
    const searchAlert = new SearchAlert({
      userId,
      ...searchData,
      isActive: true
    });

    await searchAlert.save();
    return searchAlert;
  }
}

export default SearchAlertService.getInstance(); 