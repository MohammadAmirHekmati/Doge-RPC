import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
      .setTitle('Dogecoin')
      .setDescription('The Dogecoin API description')
      .setVersion('1.0')
      .addTag('Dogecoin')
      .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(9002).then(()=>
  {
    console.log(`Dogecoin Swagger Running on:  http://localhost:9002/docs`);
  })
}
bootstrap();
