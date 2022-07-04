import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

export class PostgresConfig implements TypeOrmOptionsFactory{
  createTypeOrmOptions(connectionName?: string): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    const options:TypeOrmModuleOptions=
      {
        type:"postgres",
        host:"136.243.169.68",
        port:5432,
        username:"postgres",
        password:"In@FuZhZNA46uY1!",
        database:"dogecoin",
        autoLoadEntities:true,
        synchronize:true
      }
      return options
  }

}