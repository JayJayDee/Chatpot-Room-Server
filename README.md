# Chatpot-Room-Server
chat-room-managing server for Chatpot service.

this application using [smart-factory](https://github.com/JayJayDee/SmartFactory) as a Dependency Injector.

## How to run
to run the application, you need the configuration file on your home directory. the path is ```$HOME/chatpot-room-conf.json ```.
```bash
npm install
npm run dev
```

## How to Configure application
application configuration to be injected with Environment Variables, or Configuration file.
### Configuration file format
```json
{
   "HTTP_PORT":3000,
   "MYSQL_HOST":"YOUR_MYSQL_HOST",
   "MYSQL_PORT":3306,
   "MYSQL_USER":"YOUR_MYSQL_USER",
   "MYSQL_PASSWORD":"YOUR_MYSQL_PASSWORD",
   "MYSQL_DATABASE":"YOUR_MYSQL_DBNAME",
   "MYSQL_CONNECTION_LIMIT":10,
   "CACHE_PROVIDER":"REDIS",
   "CACHE_REDIS_HOST":"YOUR_REDIS_HOST",
   "CACHE_REDIS_PORT":6379,
   "CREDENTIAL_AUTH_ENABLED":true,
   "CREDENTIAL_AUTH_SECRET":"AUTH_SERVER_SECRET_HERE",
   "CREDENTIAL_ROOM_SECRET":"ROOM_SERVER_SECRET_HERE",
   "EXTAPI_AUTH_URI":"AUTH_SERVER_BASE_URI_HERE"
}
```
### Configure with Environment Variable
```bash
$ HTTP_PORT=3000 CACHE_PROVIDER=MEMORY bin/app.js
```

## Module management using [smart-factory](https://github.com/JayJayDee/SmartFactory)
All modules in this application are being used as a ```Bean```, which instantiated in ```Container```. each module directory has a ```modules.ts``` and ```types.ts```, it has a definitions and types for modules and its dependencies.

for example, just look ```services``` directory. it has a core service-logics for application, so they needs lots of dependencies. 

```typescript
export namespace ServiceModules {
  export enum Room {
    List = 'Service/Room/List',
    Create = 'Service/Room/Create',
    Join = 'Service/My/Join',
    Leave = 'Service/My/Leave'
  }

  export enum My {
    Rooms = 'Service/My/Rooms'
  }
}
```
this is just module definitions. and look its implementations.
```typescript
injectable(ServiceModules.My.Rooms, // a module name.

  [ ExtApiModules.AuthReq.MembersByNos,
    ModelModules.RoomMember.MyRooms,
    UtilModules.Auth.CreateMemberToken ], // required dependencies.

  async (requestMembers: ExtApiTypes.AuthReq.MembersByNos,
    queryMyRooms: ModelTypes.RoomMember.MyRooms,
    token: UtilTypes.Auth.CreateMemberToken): Promise<ServiceTypes.MyService.Rooms> => // injected dependencies

      async (memberNo: number) => {
        .
        .
      }); // implementations for module.
```
looks good? :) for the detail, please visit the smart-factory [github](https://github.com/JayJayDee/SmartFactory) page or [npm repository](https://www.npmjs.com/package/smart-factory).