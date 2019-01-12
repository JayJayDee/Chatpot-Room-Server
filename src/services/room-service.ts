import { find } from 'lodash';
import { injectable } from 'smart-factory';

import { ServiceModules } from './modules';
import { ServiceTypes } from './types';
import { ExtApiModules, ExtApiTypes } from '../extapis';
import { ModelModules, ModelTypes } from '../models';

injectable(ServiceModules.Room.List,
  [ ExtApiModules.AuthReq.MembersByNos,
    ModelModules.Room.List ],
  async (requestMembersViaApi: ExtApiTypes.AuthReq.MembersByNos,
    getRooms: ModelTypes.Room.List): Promise<ServiceTypes.RoomService.List> =>

    async (param) => {
      const roomResp = await getRooms(param);
      const memberNos: number[] = roomResp.list.map((r) => r.owner_no);
      const members = await requestMembersViaApi(memberNos);

      const rooms: ServiceTypes.Room[] = roomResp.list.map((r) => ({
        room_token: r.token,
        owner: find(members, {member_no: r.owner_no}),
        title: r.title,
        num_attendee: r.num_attendee,
        max_attendee: r.max_attendee,
        reg_date: r.reg_date
      }));

      return {
        all: roomResp.all,
        size: roomResp.size,
        list: rooms
      };
    });