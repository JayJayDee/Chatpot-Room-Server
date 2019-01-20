import { find } from 'lodash';
import { injectable } from 'smart-factory';

import { ServiceModules } from './modules';
import { ServiceTypes } from './types';
import { ExtApiModules, ExtApiTypes } from '../extapis';
import { ModelModules, ModelTypes } from '../models';
import { UtilModules, UtilTypes } from '../utils';
import { LoggerModules, LoggerTypes } from '../loggers';
import { RoomJoinError, RoomLeaveError } from './errors';

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
  [ LoggerModules.Logger,
    ModelModules.Room.Create,
    ModelModules.Room.UpdateToken,
    ModelModules.RoomMember.AddMember,
    UtilModules.Auth.CrateRoomToken ],
  async (log: LoggerTypes.Logger,
    create: ModelTypes.Room.Create,
    updateToken: ModelTypes.Room.UpdateToken,
    addMember: ModelTypes.RoomMember.AddMember,
    createRoomToken: UtilTypes.Auth.CreateRoomToken): Promise<ServiceTypes.RoomService.Create> =>

    async (param) => {
      const createdRoomNo = await create(param);
      const token = createRoomToken(createdRoomNo);
      log.debug(`[room-service] room:${createdRoomNo} created`);

      await updateToken(createdRoomNo, token);
      log.debug(`[room-service] room:${createdRoomNo}, member-token:${token} updated`);

      const addResp = await addMember({
        room_no: createdRoomNo,
        member_no: param.owner_no,
        is_owner: true
      });
      if (addResp.success === true) {
        log.debug(`[room-service] room:${createdRoomNo}, member:${param.owner_no} joined`);
      } else {
        log.error(`[room-service] room:${createdRoomNo}, member:${param.owner_no} join fail: ${addResp.cause}`);
      }
      return {
        room_token: token
      };
    });

injectable(ServiceModules.Room.Join,
  [ LoggerModules.Logger,
    ModelModules.RoomMember.AddMember ],
  async (log: LoggerTypes.Logger,
    addMemberToRoom: ModelTypes.RoomMember.AddMember): Promise<ServiceTypes.RoomService.Join> =>

    async (memberNo: number, roomNo: number) => {
      const resp = await addMemberToRoom({
        member_no: memberNo,
        room_no: roomNo,
        is_owner: false
      });
      if (resp.success === false) {
        throw new RoomJoinError(resp.cause, 'failed to join room');
      }
      log.debug(`[room-service] member:${memberNo} joined the room:${roomNo}`);
      // TODO: add push-message sending routine.
    });

injectable(ServiceModules.Room.Leave,
  [ LoggerModules.Logger,
    ModelModules.RoomMember.RemoveMember,
    ModelModules.Room.Destroy ],
  async (log: LoggerTypes.Logger,
    removeMemberFromRoom: ModelTypes.RoomMember.RemoveMember,
    destroyRoom: ModelTypes.Room.Destroy): Promise<ServiceTypes.RoomService.Leave> =>

    async (memberNo: number, roomNo: number) => {
      const resp = await removeMemberFromRoom(memberNo, roomNo);
      if (resp.success === false) {
        throw new RoomLeaveError(resp.cause, 'failed to leave room');
      }
      log.debug(`[room-service] member:${memberNo} left the room:${roomNo}`);

      if (resp.destroyRequired === true) {
        log.debug(`[room-service] room destroyed: ${roomNo}`);
        await destroyRoom(roomNo);
      }
      // TODO: add push-message sending routine.
    });