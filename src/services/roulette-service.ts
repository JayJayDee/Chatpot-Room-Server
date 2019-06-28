import { injectable } from 'smart-factory';
import { ServiceModules } from './modules';
import { ServiceTypes } from './types';

injectable(ServiceModules.Roulette.MatchRequest,
  [],
  async (): Promise<ServiceTypes.Roulette.MatchRequest> =>
    async (memberNo, filter) => {

    });


injectable(ServiceModules.Roulette.GetMyRequests,
  [],
  async (): Promise<ServiceTypes.Roulette.GetMyRequests> =>
    async (memberNo) => {
      return [];
    });