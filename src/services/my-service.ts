import { injectable } from 'smart-factory';
import { find } from 'lodash';

import { ServiceModules } from './modules';
import { ServiceTypes } from './types';
import { ExtApiModules, ExtApiTypes } from '../extapis';
import { ModelModules, ModelTypes } from '../models';
import { UtilModules, UtilTypes } from '../utils';
import { RoomJoinError } from './errors';

const convertMember = (token: UtilTypes.Auth.CreateMemberToken) =>
  (m: ExtApiTypes.Member): ServiceTypes.Member => ({
    member_token: token(m.member_no),
    region: m.region,
    language: m.language,
    gender: m.gender,
    nick: m.nick
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

injectable(ServiceModules.My.Join,
  [ ModelModules.RoomMember.AddMember ],
  async (addMemberToRoom: ModelTypes.RoomMember.AddMember): Promise<ServiceTypes.MyService.Join> =>

    async (memberNo: number, roomNo: number) => {
      const resp = await addMemberToRoom({
        member_no: memberNo,
        room_no: roomNo,
        is_owner: false
      });
      if (resp.success === false) {
        throw new RoomJoinError(resp.cause, 'failed to join room');
      }
      // TODO: add push-message sending routine.
    });

injectable(ServiceModules.My.Leave,
  [],
  async (): Promise<ServiceTypes.MyService.Leave> =>
    async (memberNo: number, roomNo: number) => {

    });