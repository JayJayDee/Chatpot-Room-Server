import { injectable } from 'smart-factory';
import { find } from 'lodash';

import { ServiceModules } from './modules';
import { ServiceTypes } from './types';
import { ExtApiModules, ExtApiTypes } from '../extapis';
import { ModelModules, ModelTypes } from '../models';
import { UtilModules, UtilTypes } from '../utils';

const convertMember = (token: UtilTypes.Auth.CreateMemberToken) =>
  (m: ExtApiTypes.Member): ServiceTypes.Member => ({
    token: token(m.member_no),
    region: m.region,
    language: m.language,
    gender: m.gender,
    nick: m.nick,
    avatar: m.avatar
  });

injectable(ServiceModules.My.Rooms,
  [ ExtApiModules.AuthReq.MembersByNos,
    ModelModules.RoomMember.MyRooms,
    UtilModules.Auth.CreateMemberToken ],
  async (requestMembers: ExtApiTypes.AuthReq.MembersByNos,
    queryMyRooms: ModelTypes.RoomMember.MyRooms,
    token: UtilTypes.Auth.CreateMemberToken): Promise<ServiceTypes.MyService.Rooms> =>

      async (memberNo: number) => {
        const convert = convertMember(token);
        const myRooms = await queryMyRooms(memberNo);
        const owners = await requestMembers(myRooms.map((r) => r.owner_no));
        const resp: ServiceTypes.Room[] = myRooms.map((r) => ({
          room_token: r.token,
          owner: convert(find(owners, {member_no: r.owner_no})),
          title: r.title,
          num_attendee: r.num_attendee,
          max_attendee: r.max_attendee,
          reg_date: r.reg_date
        }));
        return resp;
      });