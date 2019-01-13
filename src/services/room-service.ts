import { find } from 'lodash';
import { injectable } from 'smart-factory';

import { ServiceModules } from './modules';
import { ServiceTypes } from './types';
import { ExtApiModules, ExtApiTypes } from '../extapis';
import { ModelModules, ModelTypes } from '../models';
import { UtilModules, UtilTypes } from '../utils';

const cvtMember = (encrypt: UtilTypes.Auth.CreateMemberToken) =>
  (fromMember: ExtApiTypes.Member): ServiceTypes.Member => ({
    member_token: encrypt(fromMember.member_no),
    region: fromMember.region,
    language: fromMember.language,
    gender: fromMember.gender,
    nick: fromMember.nick
  });

injectable(ServiceModules.Room.List,
  [ ExtApiModules.AuthReq.MembersByNos,
    ModelModules.Room.List,
    UtilModules.Auth.CreateMemberToken ],
  async (requestMembersViaApi: ExtApiTypes.AuthReq.MembersByNos,
    getRooms: ModelTypes.Room.List,
    encrypt: UtilTypes.Auth.CreateMemberToken): Promise<ServiceTypes.RoomService.List> =>

    async (param) => {
      const convert = cvtMember(encrypt);
      const roomResp = await getRooms(param);
      const memberNos: number[] = roomResp.list.map((r) => r.owner_no);
      const members = await requestMembersViaApi(memberNos);

      const rooms: ServiceTypes.Room[] = roomResp.list.map((r) => ({
        room_token: r.token,
        owner: convert(find(members, {member_no: r.owner_no})),
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


injectable(ServiceModules.Room.Create,
  [ ModelModules.Room.Create,
    ModelModules.Room.UpdateToken,
    UtilModules.Auth.CrateRoomToken ],
  async (create: ModelTypes.Room.Create,
    updateToken: ModelTypes.Room.UpdateToken,
    createRoomToken: UtilTypes.Auth.CreateRoomToken): Promise<ServiceTypes.RoomService.Create> =>

    async (param) => {
      const createdRoomNo = await create(param);
      const token = createRoomToken(createdRoomNo);
      await updateToken(createdRoomNo, token);
      return {
        room_token: token
      };
    });