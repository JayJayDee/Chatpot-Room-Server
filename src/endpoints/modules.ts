export namespace EndpointModules {
  export const EndpointRunner = 'Endpoint/EndpointRunner';
  export const Endpoints = 'Endpoint/Endpoints';
  export enum Utils {
    WrapAync = 'Endpoint/Utils/WrapAsync'
  }

  export enum Room {
    Create = 'Endpoint/Room/Create',
    List = 'Endpoint/Room/List',
    Join = 'Endpoint/Room/Join',
    Leave = 'Endpoint/Room/Leave'
  }

  export enum My {
    Rooms = 'Endpoint/My/Rooms'
  }
}