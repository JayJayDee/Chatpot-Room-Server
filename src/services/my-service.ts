import { injectable } from 'smart-factory';
import { ServiceModules } from './modules';
import { ServiceTypes } from './types';

injectable(ServiceModules.My.Rooms,
  [],
  async (): Promise<ServiceTypes.MyService.Rooms> =>
    async (memberNo: number) => {
      return null;
    });