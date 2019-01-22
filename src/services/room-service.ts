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
    UtilModules.Auth.CrateRoomToken,
    ModelModules.History.Write ],
  async (log: LoggerTypes.Logger,
    create: ModelTypes.Room.Create,
    updateToken: ModelTypes.Room.UpdateToken,
    addMember: ModelTypes.RoomMember.AddMember,
    createRoomToken: UtilTypes.Auth.CreateRoomToken,
    history: ModelTypes.History.Write): Promise<ServiceTypes.RoomService.Create> =>

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

      history({
        action: ModelTypes.HistoryAction.CREATE,
        member_no: param.owner_no,
        room_no: createdRoomNo,
        room_title: param.title
      });

      return {
        room_token: token
      };
    });

injectable(ServiceModules.Room.Join,
  [ LoggerModules.Logger,
    ModelModules.RoomMember.AddMember,
    ModelModules.History.Write ],
  async (log: LoggerTypes.Logger,
    addMemberToRoom: ModelTypes.RoomMember.AddMember,
    history: ModelTypes.History.Write): Promise<ServiceTypes.RoomService.Join> =>

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
        history({
          action: ModelTypes.HistoryAction.JOIN,
          member_no: memberNo,
          room_no: roomNo,
        });
      });

injectable(ServiceModules.Room.Leave,
  [ LoggerModules.Logger,
    ModelModules.RoomMember.RemoveMember,
    ModelModules.Room.Destroy,
    ModelModules.History.Write ],
  async (log: LoggerTypes.Logger,
    removeMemberFromRoom: ModelTypes.RoomMember.RemoveMember,
    destroyRoom: ModelTypes.Room.Destroy,
    history: ModelTypes.History.Write): Promise<ServiceTypes.RoomService.Leave> =>

    async (memberNo: number, roomNo: number) => {
      const resp = await removeMemberFromRoom(memberNo, roomNo);
      if (resp.success === false) {
        throw new RoomLeaveError(resp.cause, 'failed to leave room');
      }
      log.debug(`[room-service] member:${memberNo} left the room:${roomNo}`);

      if (resp.newOwnerNo) {
        log.debug(`[room-service] member:${resp.newOwnerNo} elected as a new owner`);
        // TODO: send push message to new-owner
      }

      await history({
        action: ModelTypes.HistoryAction.LEAVE,
        member_no: memberNo,
        room_no: roomNo,
      });

      if (resp.destroyRequired === true) {
        log.debug(`[room-service] room destroyed: ${roomNo}`);
        history({
          action: ModelTypes.HistoryAction.DESTROY,
          member_no: memberNo,
          room_no: roomNo,
        });
        await destroyRoom(roomNo);
      }
      // TODO: add push-message sending routine.
    });

injectable(ServiceModules.Room.Get,
  [ ModelModules.Room.Get,
    ModelModules.RoomMember.Members,
    ExtApiModules.AuthReq.MembersByNos,
    UtilModules.Auth.CreateMemberToken ],
  async (getRoom: ModelTypes.Room.Get,
    getMembers: ModelTypes.RoomMember.Members,
    requestMembersViaApi: ExtApiTypes.AuthReq.MembersByNos,
    createMemberToken: UtilTypes.Auth.CreateMemberToken): Promise<ServiceTypes.RoomService.Get> =>

    async (roomNo: number) => {
      const room = await getRoom(roomNo);
      if (room === null) return null;

      const membersFromDb = await getMembers(roomNo);
      const memberNos = membersFromDb.map((m) => m.member_no);
      const membersFromApi = await requestMembersViaApi(memberNos);
      const convert = cvtMember(createMemberToken);

      const roomDetail: ServiceTypes.RoomDetail = {
        room_token: room.token,
        owner: convert(find(membersFromApi, {member_no: room.owner_no})),
        title: room.title,
        num_attendee: room.num_attendee,
        max_attendee: room.max_attendee,
        reg_date: room.reg_date,
        members: membersFromDb.map((m) => convert(find(membersFromApi, {member_no: m.member_no})))
      };
      return roomDetail;
    });