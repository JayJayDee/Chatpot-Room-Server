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
    avatar: m.avatar,
    login_id: m.login_id,
    auth_type: m.auth_type
  });

injectable(ServiceModules.My.Rooms,
  [ ExtApiModules.AuthReq.MembersByNos,
    ModelModules.RoomMember.MyRooms,
    UtilModules.Auth.CreateMemberToken,
    ExtApiModules.MessageReq.LastMessages ],
  async (requestMembers: ExtApiTypes.AuthReq.MembersByNos,
    queryMyRooms: ModelTypes.RoomMember.MyRooms,
    token: UtilTypes.Auth.CreateMemberToken,
    getLastMsgs: ExtApiTypes.MessageReq.LastMessages): Promise<ServiceTypes.MyService.Rooms> =>

      async (memberNo: number) => {
        const convert = convertMember(token);
        const myRooms = await queryMyRooms(memberNo);

        const memberNos = myRooms.map((r) => r.owner_no);

        myRooms.forEach((mr) => {
          if (mr.room_type === ModelTypes.RoomType.ROULETTE) {
            if (mr.roulette_opponent_no) {
              memberNos.push(mr.roulette_opponent_no);
            }
          }
        });

        const members = await requestMembers(memberNos);

        const tokens: string[] = myRooms.map((r) => r.token);
        const lastMsgs = await getLastMsgs(tokens);

        const resp: ServiceTypes.MyRoom[] = myRooms.map((r) => ({
          room_token: r.token,
          room_type: r.room_type,
          owner: convert(find(members, {member_no: r.owner_no})),
          title: r.title,
          num_attendee: r.num_attendee,
          max_attendee: r.max_attendee,
          reg_date: r.reg_date,
          last_message: lastMsgs[r.token],
          roulette_opponent:
            r.room_type === ModelTypes.RoomType.ROULETTE ?
              convert(find(members, {member_no: r.roulette_opponent_no})) :
              null
        }));
        return resp;
      });