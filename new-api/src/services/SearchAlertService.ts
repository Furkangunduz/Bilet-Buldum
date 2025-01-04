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
    fromStationName: string;
    toStationId: string;
    toStationName: string;
    date: string;
    cabinClass: string;
    cabinClassName: string;
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

  async deactivateSearchAlert(searchId: string) {
    const searchAlert = await SearchAlert.findById(searchId);
    if (!searchAlert) {
      throw new Error('Search alert not found');
    }

    searchAlert.isActive = false;
    searchAlert.status = 'FAILED';
    searchAlert.statusReason = 'User declined the alert';
    
    await searchAlert.save();
    return searchAlert;
  }
}

export default SearchAlertService.getInstance(); 