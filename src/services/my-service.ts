import { injectable } from 'smart-factory';
import { ServiceModules } from './modules';
import { ServiceTypes } from './types';
import { ExtApiModules, ExtApiTypes } from '../extapis';
import { ModelModules } from '../models';

injectable(ServiceModules.My.Rooms,
  [ ExtApiModules.AuthReq.MembersByNos,
    ModelModules.RoomMember.MyRooms ],
  async (requestMembers: ExtApiTypes.AuthReq.MembersByNos,
    queryMyRooms: ModelModules.RoomMember.MyRooms): Promise<ServiceTypes.MyService.Rooms> =>
      async (memberNo: number) => {
        const rooms: ServiceTypes.Room[] = [];
        // TODO: to be implemented
        return rooms;
      });