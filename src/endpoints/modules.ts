export namespace EndpointModules {
  export const EndpointRunner = 'Endpoint/EndpointRunner';
  export const Endpoints = 'Endpoint/Endpoints';
  export enum Utils {
    WrapAync = 'Endpoint/Utils/WrapAsync'
  }

  export enum Room {
    Create = 'Endpoint/Room/Create',
    List = 'Endpoint/Room/List',
    Featured = 'Endpoint/Room/List/Featured',
    Join = 'Endpoint/Room/Join',
    Leave = 'Endpoint/Room/Leave',
    Get = 'Endpoint/Room/Get'
  }

  export enum My {
    Rooms = 'Endpoint/My/Rooms'
  }

  export enum Internal {
    Rooms = 'Endpoint/Internal/Rooms',
    MyRooms = 'Endpoint/Internal/MyRooms'
  }

  export enum Roulette {
    Request = 'Endpoint/Roulette/Create',
    Status = 'Endpoint/Roulette/Status'
  }
}